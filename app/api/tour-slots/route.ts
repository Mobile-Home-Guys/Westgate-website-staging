import { TOUR_SCHEDULE } from "@/lib/booking/schedule";
import { availability } from "@/lib/booking/availability";
import type { AvailabilityResponse } from "@/lib/booking/state";

/* Availability is live data: never prerender it, never cache it. */
export const dynamic = "force-dynamic";

const noStore = { "cache-control": "no-store, max-age=0" };
const offline: AvailabilityResponse = { timeZone: TOUR_SCHEDULE.timeZone, online: false, days: [] };

/**
 * Which tour times are still open — the website's ledger and the GHL tour
 * calendar together (`lib/booking/availability.ts`). The calendar reads
 * this; it is advisory only. `bookTour` re-checks both, live, at the moment
 * of booking, so a stale page can never double-book — only be told "taken".
 */
export async function GET() {
  try {
    const a = await availability();
    if (!a.online) {
      console.error(`[tour] booking offline: ${a.reason}`);
      return Response.json(offline, { headers: noStore });
    }
    const body: AvailabilityResponse = {
      timeZone: TOUR_SCHEDULE.timeZone,
      online: true,
      days: a.days.map((d) => ({
        date: d.date,
        weekday: d.weekday,
        slots: d.slots.map((s) => ({ start: s.start, label: s.label, open: d.open.has(s.start) })),
      })),
    };
    return Response.json(body, { headers: noStore });
  } catch (err) {
    console.error("[tour] availability lookup failed", err);
    return Response.json(offline, { status: 503, headers: noStore });
  }
}
