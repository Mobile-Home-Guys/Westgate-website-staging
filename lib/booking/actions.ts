"use server";

import { headers } from "next/headers";
import { listings } from "@/lib/homes";
import { site } from "@/lib/site";
import { findSlot, formatSlot, toLocalIso } from "./schedule";
import { blocksFor, getSlotStore } from "./store";
import { ghlView, invalidateAvailability, isOpen } from "./availability";
import {
  addContactNote,
  busyIntervals,
  cancelAppointment,
  createAppointment,
  ghlConfigured,
  GhlRejected,
  overlaps,
  upsertContact,
} from "./ghl";
import type { TourField, TourState } from "./state";

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
const OFFLINE = `Online booking is offline right now. ${CALL_US}`;

/**
 * Books a tour straight onto the GHL "Lot Appointment" calendar.
 *
 * The order is the guarantee:
 *   1. validate everything, and re-derive the slot from the schedule — the
 *      posted time is only a key for looking it up, never trusted as a time;
 *   2. claim the slot in the website's ledger, atomically. Two visitors
 *      pressing Book at the same instant cannot both pass this line;
 *   3. ask GHL, live, whether the time is still free — this catches
 *      appointments staff made inside GHL, and blocked-off time;
 *   4. create the contact and the appointment, with GHL's own free-slot
 *      validation left on as a further check;
 *   5. read the calendar back. If another appointment overlaps after all
 *      (one made in GHL in the same second), the newer one is cancelled.
 *
 * It fails closed: no ledger, no GHL token, or GHL not answering means
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
  if (!store || !ghlConfigured()) {
    console.error(
      `[tour] refusing to book: ${!store ? "no slot store (set UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN)" : "GHL_API_TOKEN not set"}`,
    );
    return { status: "error", message: OFFLINE, values };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  const blocks = blocksFor(slot.start, slot.end);
  /* Deterministic, so a double-click books once and the second press is
     recognised as the same booking rather than a clash with itself. */
  const holder = `${phone}|${slot.start}`;
  const label = formatSlot(slot.start);
  const release = () =>
    store
      .release({ blocks, phone, holder })
      .catch((err) => console.error("[tour] release failed — slot stays held until it expires", err));
  const taken = (): TourState => ({
    status: "error",
    message: `Somebody just booked ${label}. Pick another time — the calendar is up to date now.`,
    fieldErrors: { start: "Just taken — pick another time." },
    values: { ...values, start: "" },
    stale: true,
  });

  // ---- 2. the ledger ---------------------------------------------------
  let claim;
  try {
    if ((await store.countAttempt(ip)) > ATTEMPTS_PER_IP_PER_DAY) {
      return { status: "error", message: `That's a lot of bookings for one day. ${CALL_US}`, values };
    }
    claim = await store.claim({ blocks, phone, holder, ttlMs: slot.end - Date.now() + 86_400_000 });
  } catch (err) {
    console.error("[tour] slot store failed", err);
    return { status: "error", message: OFFLINE, values };
  }

  if (!claim.ok && claim.reason === "slot-taken") return taken();
  if (!claim.ok) {
    const existing = Number(claim.existing.split("|")[1]);
    const when = Number.isFinite(existing) ? ` for ${formatSlot(existing)}` : "";
    return {
      status: "error",
      message: `You already have a tour booked${when}. To move it or add another, call or text ${site.phone}.`,
      values,
    };
  }
  if (claim.repeat) {
    return { status: "ok", message: `You're booked for ${label}.`, booked: { start: slot.start, label } };
  }

  // ---- 3. GHL, live ----------------------------------------------------
  try {
    const view = await ghlView(slot.start, slot.end);
    if (!isOpen(slot, new Set(), view)) {
      await release();
      invalidateAvailability();
      return taken();
    }
  } catch (err) {
    console.error("[tour] GHL availability check failed", err);
    await release();
    return { status: "error", message: OFFLINE, values };
  }

  // ---- 4. contact + appointment ---------------------------------------
  const [first, ...rest] = values.name.split(/\s+/);
  let contactId: string;
  try {
    contactId = await upsertContact({
      firstName: first,
      lastName: rest.join(" "),
      name: values.name,
      phone: `+1${phone}`,
      email: values.email,
    });
  } catch (err) {
    // No appointment exists yet, so the time can safely go back.
    console.error("[tour] GHL contact upsert failed", err);
    await release();
    return { status: "error", message: `We couldn't finish the booking. ${CALL_US}`, values };
  }

  let appointmentId: string | null = null;
  try {
    appointmentId = await createAppointment({
      contactId,
      startIso: toLocalIso(slot.start),
      endIso: toLocalIso(slot.end),
      title: `Lot tour — ${values.name}${home ? ` (${home.name})` : ""}`,
      address: `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
    });
  } catch (err) {
    if (err instanceof GhlRejected) {
      /* GHL answered no — usually its own free-slot check (a staff member's
         synced calendar, say). Nothing was created: free the time. */
      console.error("[tour] GHL refused the appointment", err);
      await release();
      invalidateAvailability();
      return /slot|available|availability/i.test(err.body)
        ? taken()
        : { status: "error", message: `We couldn't finish the booking. ${CALL_US}`, values };
    }
    // No answer. It may exist — look before deciding anything.
    console.error("[tour] GHL appointment create unconfirmed", err);
    try {
      const mine = (await busyIntervals(slot.start, slot.end)).find(
        (b) => b.contactId === contactId && b.start === slot.start,
      );
      appointmentId = mine?.id ?? null;
    } catch {
      // Unknown either way; treated as unconfirmed below.
    }
    if (!appointmentId) {
      /* Still unknown: keep the slot held. A lost hour beats two families
         at one door. Staff can find the contact in GHL by this phone. */
      console.error(`[tour] DELIVERY UNCONFIRMED — slot held. Check GHL for +1${phone} at ${label}`);
      return {
        status: "error",
        message: `We've held ${label} for you, but couldn't confirm it with our scheduling system. ${CALL_US}`,
        values,
      };
    }
  }

  // ---- 5. read back ----------------------------------------------------
  try {
    /* The ledger already keeps website bookings apart, so anything that
       overlaps now was made inside GHL in the seconds since step 3 — and
       the website booking is the one that yields. */
    const clash = (await busyIntervals(slot.start - 86_400_000, slot.end + 86_400_000)).filter(
      (b) => b.id !== appointmentId && overlaps(slot, b),
    );
    if (clash.length > 0 && appointmentId) {
      console.error(`[tour] overlap found after create — cancelling ${appointmentId}`, clash);
      await cancelAppointment(appointmentId).catch((e) =>
        console.error(`[tour] CANCEL FAILED for ${appointmentId} — cancel it in GHL by hand`, e),
      );
      await release();
      invalidateAvailability();
      return taken();
    }
  } catch (err) {
    // The appointment exists; a failed read-back is logged, not undone.
    console.error("[tour] read-back after booking failed", err);
  }

  invalidateAvailability();

  const note = [
    `Booked on the website for ${label}.`,
    home ? `Wants to see: ${home.name} — ${home.series} Series.` : "Home: not sure yet.",
    values.callFirst ? "Asked for a call before they drive out." : "",
    values.message ? `Their note: ${values.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  await addContactNote(contactId, note).catch((e) => console.error("[tour] contact note failed", e));

  return { status: "ok", message: `You're booked for ${label}.`, booked: { start: slot.start, label } };
}
