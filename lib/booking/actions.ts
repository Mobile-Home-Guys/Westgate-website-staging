"use server";

import { headers } from "next/headers";
import { listings } from "@/lib/homes";
import { site } from "@/lib/site";
import { findSlot, formatSlot, toLocalIso, TOUR_SCHEDULE } from "./schedule";
import { blocksFor, getSlotStore } from "./store";
import type { TourField, TourState } from "./state";

/**
 * The inbound webhook of the GoHighLevel workflow that turns a website
 * booking into a contact and an appointment. `TOUR_WEBHOOK_URL` overrides it.
 * Only a production build uses the default, so `npm run dev` never puts test
 * bookings into the real calendar — set the variable to test against GHL.
 */
const GHL_TOUR_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/J6vfYHh1iT28s8BPIz5j/webhook-trigger/55767782-4708-4290-a0f8-75892b8ec24e";

const webhookUrl = () =>
  process.env.TOUR_WEBHOOK_URL ||
  (process.env.NODE_ENV === "production" ? GHL_TOUR_WEBHOOK : "");

/** Booking attempts one address may make in a day before being told to call. */
const ATTEMPTS_PER_IP_PER_DAY = 8;

const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** Ten US digits, or "" — a leading country code 1 is dropped. */
function usPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.length === 10 ? d : "";
}

const CALL_US = `Call or text ${site.phone} and we'll book it with you.`;

type Delivery = "ok" | "rejected" | "unknown";

/* "rejected": GHL answered 4xx — it definitely did not take the booking.
   "unknown": a 5xx, a timeout or a dropped connection — it may have. */
async function deliver(url: string, payload: object): Promise<Delivery> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (res.ok) return "ok";
    console.error(`[tour] webhook responded ${res.status}`);
    return res.status >= 400 && res.status < 500 ? "rejected" : "unknown";
  } catch (err) {
    console.error("[tour] webhook unreachable", err);
    return "unknown";
  }
}

/**
 * Books a tour.
 *
 * The order is the guarantee:
 *   1. validate everything, and re-derive the slot from the schedule — the
 *      posted time is only a key for looking it up, never trusted as a time;
 *   2. claim the slot in the ledger, atomically — this is the step that
 *      makes an overlap impossible, and nothing is sent anywhere before it;
 *   3. hand the booking to GHL;
 *   4. if GHL definitely refused it, give the slot back.
 *
 * It fails closed: with no ledger configured, or the ledger unreachable,
 * nothing is booked and the visitor is asked to call.
 */
export async function bookTour(_prev: TourState, formData: FormData): Promise<TourState> {
  // Honeypot: real people leave this hidden field empty.
  if (clean(formData.get("company"))) {
    return { status: "ok", message: "Thanks — we'll be in touch shortly." };
  }

  const values = {
    name: clean(formData.get("name"), 80),
    phone: clean(formData.get("phone"), 32),
    email: clean(formData.get("email"), 120),
    home: clean(formData.get("home"), 80),
    message: clean(formData.get("message"), 1000),
    start: clean(formData.get("start"), 20),
    callFirst: formData.get("callFirst") ? "on" : "",
  };

  const fieldErrors: Partial<Record<TourField, string>> = {};
  if (values.name.length < 2) fieldErrors.name = "Tell us what to call you.";
  const phone = usPhone(values.phone);
  if (!phone) fieldErrors.phone = "A 10-digit phone number, so we can confirm.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
    fieldErrors.email = "That email doesn't look right.";
  const home = listings.find((l) => l.slug === values.home);
  if (values.home && !home) values.home = "";

  const slot = values.start ? findSlot(Number(values.start)) : null;
  if (!values.start) fieldErrors.start = "Pick a day and a time.";
  else if (!slot) fieldErrors.start = "That time isn't available any more — pick another.";

  if (Object.keys(fieldErrors).length > 0 || !slot) {
    return {
      status: "error",
      message: "Almost — fix the highlighted fields.",
      fieldErrors,
      values,
      stale: !!values.start && !slot,
    };
  }

  const store = getSlotStore();
  if (!store) {
    console.error(
      "[tour] no slot store configured — set UPSTASH_REDIS_REST_URL/TOKEN (or KV_REST_API_URL/TOKEN). Refusing to book.",
    );
    return { status: "error", message: `Online booking is offline right now. ${CALL_US}`, values };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (await headers()).get("x-real-ip") ||
    "unknown";

  const blocks = blocksFor(slot.start, slot.end);
  /* Deterministic, so a double-click books once and the second press is
     recognised as the same booking rather than a clash with itself. */
  const holder = `${phone}|${slot.start}`;

  let claim;
  try {
    if ((await store.countAttempt(ip)) > ATTEMPTS_PER_IP_PER_DAY) {
      return { status: "error", message: `That's a lot of bookings for one day. ${CALL_US}`, values };
    }
    claim = await store.claim({
      blocks,
      phone,
      holder,
      ttlMs: slot.end - Date.now() + 86_400_000,
    });
  } catch (err) {
    console.error("[tour] slot store failed", err);
    return { status: "error", message: `Online booking is offline right now. ${CALL_US}`, values };
  }

  const label = formatSlot(slot.start);

  if (!claim.ok && claim.reason === "slot-taken") {
    return {
      status: "error",
      message: `Somebody just booked ${label}. Pick another time — the calendar is up to date now.`,
      fieldErrors: { start: "Just taken — pick another time." },
      values: { ...values, start: "" },
      stale: true,
    };
  }
  if (!claim.ok) {
    const existing = Number(claim.existing.split("|")[1]);
    const when = Number.isFinite(existing) ? ` for ${formatSlot(existing)}` : "";
    return {
      status: "error",
      message: `You already have a tour booked${when}. To move it or add another, ${CALL_US.charAt(0).toLowerCase()}${CALL_US.slice(1)}`,
      values,
    };
  }
  if (claim.repeat) {
    return {
      status: "ok",
      message: `You're booked for ${label}.`,
      booked: { start: slot.start, label },
    };
  }

  const [first, ...rest] = values.name.split(/\s+/);
  const payload = {
    event: "tour_booked",
    booking_id: holder,
    source: "website-tour-booking",
    first_name: first,
    last_name: rest.join(" "),
    full_name: values.name,
    phone: `+1${phone}`,
    email: values.email,
    appointment_start: toLocalIso(slot.start),
    appointment_end: toLocalIso(slot.end),
    appointment_start_utc: new Date(slot.start).toISOString(),
    appointment_end_utc: new Date(slot.end).toISOString(),
    appointment_date: toLocalIso(slot.start).slice(0, 10),
    appointment_time: slot.label,
    appointment_label: label,
    duration_minutes: TOUR_SCHEDULE.slotMinutes,
    timezone: TOUR_SCHEDULE.timeZone,
    home_of_interest: home ? `${home.name} — ${home.series} Series` : "",
    home_slug: home?.slug ?? "",
    message: values.message,
    call_first: values.callFirst === "on",
    location: `${site.name}, ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
    submitted_at: new Date().toISOString(),
  };

  const url = webhookUrl();
  if (!url) {
    console.info("[tour] TOUR_WEBHOOK_URL unset in development, logging instead:", payload);
    return { status: "ok", message: `You're booked for ${label}.`, booked: { start: slot.start, label } };
  }

  let result = await deliver(url, payload);
  let ambiguous = result === "unknown";
  if (result === "unknown") {
    result = await deliver(url, payload);
    ambiguous = ambiguous || result === "unknown";
  }

  if (result === "ok") {
    return { status: "ok", message: `You're booked for ${label}.`, booked: { start: slot.start, label } };
  }

  if (!ambiguous) {
    // GHL definitely has nothing: the time goes back on the calendar.
    await store.release({ blocks, phone, holder }).catch((err) =>
      console.error("[tour] release failed — slot stays held until it expires", err),
    );
    return { status: "error", message: `We couldn't finish the booking. ${CALL_US}`, values };
  }

  /* GHL may have the booking even though we never heard back. Keeping the slot
     held is the safe side: a lost hour beats two families at one door. */
  console.error("[tour] DELIVERY UNCONFIRMED — slot held, check GHL for this booking:", payload);
  return {
    status: "error",
    message: `We've held ${label} for you, but couldn't confirm it with our scheduling system. ${CALL_US}`,
    values,
  };
}
