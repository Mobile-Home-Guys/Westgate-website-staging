import { tourDays, TOUR_SCHEDULE } from "@/lib/booking/schedule";
import { blocksFor, getSlotStore } from "@/lib/booking/store";
import type { AvailabilityResponse } from "@/lib/booking/state";

/* Availability is live data: never prerender it, never cache it. */
export const dynamic = "force-dynamic";

const noStore = { "cache-control": "no-store, max-age=0" };

/**
 * Which tour times are still open. The calendar reads this; it is advisory
 * only — `bookTour` re-checks atomically at the moment of booking, so a
 * stale page can never produce a double booking, only a polite "just taken".
 */
export async function GET() {
  const days = tourDays();
  const store = getSlotStore();

  if (!store) {
    const body: AvailabilityResponse = { timeZone: TOUR_SCHEDULE.timeZone, online: false, days: [] };
    return Response.json(body, { headers: noStore });
  }

  const all = days.flatMap((d) => d.slots.flatMap((s) => blocksFor(s.start, s.end)));
  let held: Set<number>;
  try {
    held = await store.heldBlocks(all);
  } catch (err) {
    console.error("[tour] availability lookup failed", err);
    const body: AvailabilityResponse = { timeZone: TOUR_SCHEDULE.timeZone, online: false, days: [] };
    return Response.json(body, { status: 503, headers: noStore });
  }

  const body: AvailabilityResponse = {
    timeZone: TOUR_SCHEDULE.timeZone,
    online: true,
    days: days.map((d) => ({
      date: d.date,
      weekday: d.weekday,
      slots: d.slots.map((s) => ({
        start: s.start,
        label: s.label,
        open: blocksFor(s.start, s.end).every((b) => !held.has(b)),
      })),
    })),
  };
  return Response.json(body, { headers: noStore });
}
