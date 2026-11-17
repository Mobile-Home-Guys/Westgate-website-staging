import "server-only";

/**
 * GoHighLevel (LeadConnector) Calendar API — the tour calendar's system of
 * record. Website bookings become real appointments on the "Lot Appointment"
 * calendar, and appointments staff make inside GHL block the website's times.
 *
 * Configuration (server-side only, never in the browser):
 *   GHL_API_TOKEN     Private Integration token ("pit-…"). REQUIRED. Scopes:
 *                       calendars.readonly          free slots
 *                       calendars/events.readonly   existing appointments
 *                       calendars/events.write      create the appointment
 *                       contacts.write              create/update the lead
 *   GHL_LOCATION_ID   Defaults to Westgate's sub-account.
 *   GHL_CALENDAR_ID   Defaults to "Lot Appointment".
 *
 * The IDs are not secrets — they appear in GHL's own booking widgets — so
 * they default here. The token is a secret and has no default.
 */

/* Overridable only so the flow can be tested against a stand-in API. */
const BASE = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
export const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || "J6vfYHh1iT28s8BPIz5j";
export const GHL_CALENDAR_ID = process.env.GHL_CALENDAR_ID || "i7NEltkHi9JiNsTQRKaH";

export const ghlConfigured = () => !!process.env.GHL_API_TOKEN;

/** A failure GHL answered (4xx): it definitely did not do the thing. */
export class GhlRejected extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`GHL rejected the request: ${status} ${body.slice(0, 300)}`);
  }
}
/** A failure with no answer (timeout, network, 5xx): it may have. */
export class GhlUnreachable extends Error {}

async function call<T>(
  path: string,
  { method = "GET", version = "2021-04-15", body }: { method?: string; version?: string; body?: unknown } = {},
): Promise<T> {
  const token = process.env.GHL_API_TOKEN;
  if (!token) throw new GhlUnreachable("GHL_API_TOKEN is not set");
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        version,
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    throw new GhlUnreachable(`GHL ${method} ${path.split("?")[0]} unreachable: ${String(err)}`);
  }
  const text = await res.text();
  if (res.status >= 400 && res.status < 500) throw new GhlRejected(res.status, text);
  if (!res.ok) throw new GhlUnreachable(`GHL ${method} ${path.split("?")[0]} → ${res.status} ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GhlUnreachable(`GHL ${method} ${path.split("?")[0]} returned non-JSON`);
  }
}

/** GHL accepts ISO strings or epoch ms in different places; read both. */
const instant = (v: unknown) =>
  typeof v === "number" ? v : typeof v === "string" ? (/^\d+$/.test(v) ? Number(v) : Date.parse(v)) : NaN;

/** Start instants GHL itself considers bookable, from `start` to `end`. */
export async function freeSlotStarts(start: number, end: number, timeZone: string) {
  const q = new URLSearchParams({
    startDate: String(start),
    endDate: String(end),
    timezone: timeZone,
  });
  const res = await call<Record<string, { slots?: string[] } | string>>(
    `/calendars/${GHL_CALENDAR_ID}/free-slots?${q}`,
  );
  const out = new Set<number>();
  for (const [key, day] of Object.entries(res)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || typeof day !== "object") continue;
    for (const s of day.slots ?? []) {
      const t = Date.parse(s);
      if (Number.isFinite(t)) out.add(t);
    }
  }
  return out;
}

/** Every appointment the website makes is titled with this, so the
    read-back can tell website bookings from ones made inside GHL. */
export const WEBSITE_TITLE_PREFIX = "Lot tour — ";

export type Busy = {
  id: string;
  start: number;
  end: number;
  contactId?: string;
  /** When GHL created it, or NaN if it didn't say. */
  added: number;
  /** Made by this website (as opposed to by staff, or blocked time). */
  website: boolean;
};

/* Cancelled and invalid appointments free their time; every other status
   — new, confirmed, showed, even no-show — means somebody had the slot. */
const FREE_STATUSES = new Set(["cancelled", "invalid"]);

/**
 * Everything on the tour calendar between `start` and `end` that occupies
 * time: appointments (any staff member) and blocked-off time.
 */
export async function busyIntervals(start: number, end: number): Promise<Busy[]> {
  const q = new URLSearchParams({
    locationId: GHL_LOCATION_ID,
    calendarId: GHL_CALENDAR_ID,
    startTime: String(start),
    endTime: String(end),
  });
  type Ev = {
    id: string;
    startTime: unknown;
    endTime: unknown;
    appointmentStatus?: string;
    contactId?: string;
    dateAdded?: unknown;
    title?: string;
    deleted?: boolean;
  };
  const [events, blocked] = await Promise.all([
    call<{ events?: Ev[] }>(`/calendars/events?${q}`),
    call<{ events?: Ev[] }>(`/calendars/blocked-slots?${q}`),
  ]);
  const toBusy = (e: Ev): Busy => ({
    id: e.id,
    start: instant(e.startTime),
    end: instant(e.endTime),
    contactId: e.contactId,
    added: instant(e.dateAdded),
    website: typeof e.title === "string" && e.title.startsWith(WEBSITE_TITLE_PREFIX),
  });
  return [
    ...(events.events ?? []).filter(
      (e) => !e.deleted && !FREE_STATUSES.has(String(e.appointmentStatus ?? "").toLowerCase()),
    ),
    ...(blocked.events ?? []).filter((e) => !e.deleted),
  ]
    .map(toBusy)
    .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end));
}

export const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }) =>
  a.start < b.end && b.start < a.end;

/**
 * Added to the contact only once their appointment exists and has survived
 * the overlap check — never at contact creation, because a booking can still
 * fail after that. A GHL workflow can therefore trigger on this tag and
 * trust that a real, confirmed tour is behind it.
 */
export const TOUR_BOOKED_TAG = "website tour booking";

/** Creates or updates the lead (GHL de-duplicates on phone/email). */
export async function upsertContact(c: {
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  email?: string;
}) {
  const res = await call<{ contact?: { id?: string } }>(`/contacts/upsert`, {
    method: "POST",
    version: "2021-07-28",
    body: {
      locationId: GHL_LOCATION_ID,
      firstName: c.firstName,
      lastName: c.lastName || undefined,
      name: c.name,
      phone: c.phone,
      email: c.email || undefined,
      source: "Website tour booking",
      // No tag here — see TOUR_BOOKED_TAG.
    },
  });
  const id = res.contact?.id;
  if (!id) throw new GhlUnreachable("GHL contact upsert returned no contact id");
  return id;
}

export async function createAppointment(a: {
  contactId: string;
  startIso: string;
  endIso: string;
  title: string;
  address: string;
}) {
  const res = await call<{ id?: string; event?: { id?: string } }>(`/calendars/events/appointments`, {
    method: "POST",
    body: {
      calendarId: GHL_CALENDAR_ID,
      locationId: GHL_LOCATION_ID,
      contactId: a.contactId,
      startTime: a.startIso,
      endTime: a.endIso,
      title: a.title,
      address: a.address,
      appointmentStatus: "confirmed",
      /* GHL re-checks the time against its own availability and staff
         calendars, and refuses if nobody is free. Never turned off. */
      ignoreFreeSlotValidation: false,
      toNotify: true,
    },
  });
  const id = res.id ?? res.event?.id;
  if (!id) throw new GhlUnreachable("GHL appointment create returned no id");
  return id;
}

/** Marks an appointment cancelled (kept, not deleted, so there is a record). */
export async function cancelAppointment(id: string) {
  await call(`/calendars/events/appointments/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { appointmentStatus: "cancelled" },
  });
}

export async function tagContact(contactId: string, tags: string[]) {
  await call(`/contacts/${encodeURIComponent(contactId)}/tags`, {
    method: "POST",
    version: "2021-07-28",
    body: { tags },
  });
}

/** Puts the visitor's notes on the contact. Best effort. */
export async function addContactNote(contactId: string, body: string) {
  await call(`/contacts/${encodeURIComponent(contactId)}/notes`, {
    method: "POST",
    version: "2021-07-28",
    body: { body },
  });
}
