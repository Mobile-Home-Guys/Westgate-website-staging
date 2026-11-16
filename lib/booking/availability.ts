import "server-only";

import { tourDays, TOUR_SCHEDULE, type TourDay, type TourSlot } from "./schedule";
import { blocksFor, getSlotStore, type SlotStore } from "./store";
import { busyIntervals, freeSlotStarts, ghlConfigured, overlaps, type Busy } from "./ghl";

/**
 * A slot is open only when all four agree:
 *   1. it is on the website's schedule (Mon–Sat, 10–4)      — schedule.ts
 *   2. the website's ledger has no claim on it               — store.ts
 *   3. GHL lists it as a free slot (staff hours, their own
 *      synced calendars, GHL's own limits)                   — free-slots
 *   4. nothing on the GHL tour calendar overlaps it — any
 *      appointment with any staff member, or blocked time    — events
 *
 * (4) is what makes it "one tour at a time": the calendar is round robin
 * across three people, so GHL alone would happily book three at 10 o'clock.
 */

type GhlView = { free: Set<number>; busy: Busy[] };

export function isOpen(slot: TourSlot, held: Set<number>, ghl: GhlView) {
  return (
    blocksFor(slot.start, slot.end).every((b) => !held.has(b)) &&
    ghl.free.has(slot.start) &&
    !ghl.busy.some((b) => overlaps(slot, b))
  );
}

export async function ghlView(start: number, end: number): Promise<GhlView> {
  const [free, busy] = await Promise.all([
    freeSlotStarts(start, end, TOUR_SCHEDULE.timeZone),
    busyIntervals(start, end),
  ]);
  return { free, busy };
}

/* The calendar is polled by every open page. A few seconds of reuse per
   server keeps that well inside GHL's rate limit; booking never reads it. */
let cached: { at: number; key: string; view: GhlView } | null = null;
const CACHE_MS = 15_000;

export type Availability =
  | { online: false; reason: string }
  | { online: true; days: (TourDay & { open: Set<number> })[] };

export async function availability(now = Date.now()): Promise<Availability> {
  const store: SlotStore | null = getSlotStore();
  if (!store) return { online: false, reason: "no slot store configured" };
  if (!ghlConfigured()) return { online: false, reason: "GHL_API_TOKEN not set" };

  const days = tourDays(now);
  const slots = days.flatMap((d) => d.slots);
  if (slots.length === 0) return { online: true, days: days.map((d) => ({ ...d, open: new Set() })) };

  const start = slots[0].start;
  const end = slots[slots.length - 1].end;
  const key = `${start}-${end}`;

  const [held, view] = await Promise.all([
    store.heldBlocks(slots.flatMap((s) => blocksFor(s.start, s.end))),
    cached && cached.key === key && now - cached.at < CACHE_MS
      ? Promise.resolve(cached.view)
      : ghlView(start, end).then((v) => {
          cached = { at: now, key, view: v };
          return v;
        }),
  ]);

  return {
    online: true,
    days: days.map((d) => ({
      ...d,
      open: new Set(d.slots.filter((s) => isOpen(s, held, view)).map((s) => s.start)),
    })),
  };
}

/** Drop the cached GHL view — after a booking, so the next poll is fresh. */
export function invalidateAvailability() {
  cached = null;
}
