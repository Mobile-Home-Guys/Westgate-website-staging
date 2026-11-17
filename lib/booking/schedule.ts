/**
 * When a tour can be booked.
 *
 * This file is the only place the tour hours live. The calendar on the page
 * draws from it and the server re-derives every slot from it before it will
 * book one, so a time that is not on this grid cannot be booked even by
 * somebody posting to the server directly.
 *
 * Pure and dependency-free: it runs in the browser and on the server, and it
 * does all its clock arithmetic in the dealership's own time zone, so a
 * visitor in California still sees — and books — Gainesville time.
 */
export const TOUR_SCHEDULE = {
  /** Every time on the calendar is this zone's wall-clock time. */
  timeZone: "America/New_York",
  /** Days staff take tours. 0 is Sunday, 6 is Saturday. Mon–Sat. */
  days: [1, 2, 3, 4, 5, 6],
  /** First tour starts at `open`; the last one *ends* by `close`. */
  open: "10:00",
  close: "16:00",
  /** Length of one tour. 60 gives 10, 11, 12, 1, 2 and 3 o'clock. */
  slotMinutes: 60,
  /** How far ahead of a tour somebody must book it. */
  minNoticeMinutes: 120,
  /** How many days ahead the calendar reaches. */
  horizonDays: 30,
  /**
   * Whole days off — holidays, a lot event — as "YYYY-MM-DD" in local time.
   * A date here shows no times at all.
   */
  closedDates: [] as string[],
};

export type TourSlot = {
  /** UTC milliseconds — the slot's identity, and what the form posts. */
  start: number;
  end: number;
  /** "10:00 AM", in the dealership's zone. */
  label: string;
};

export type TourDay = {
  /** "2026-11-18", local to the dealership. */
  date: string;
  /** 0 Sunday … 6 Saturday. */
  weekday: number;
  slots: TourSlot[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const partsFormatter = new Map<string, Intl.DateTimeFormat>();
function zonedParts(instant: number, timeZone: string) {
  let f = partsFormatter.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsFormatter.set(timeZone, f);
  }
  const out: Record<string, number> = {};
  for (const p of f.formatToParts(new Date(instant))) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return out as { year: number; month: number; day: number; hour: number; minute: number; second: number };
}

/** How far `timeZone` is ahead of UTC at `instant`, in ms (negative for Florida). */
export function zoneOffsetMs(instant: number, timeZone: string) {
  const p = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** The UTC instant of a wall-clock time in `timeZone`. DST-safe. */
export function zonedTimeToUtc(
  y: number,
  m: number,
  d: number,
  minutesIntoDay: number,
  timeZone: string,
) {
  const guess = Date.UTC(y, m - 1, d, 0, minutesIntoDay);
  // Two passes: the second corrects for an offset that changes between the
  // guess and the answer, which is what a DST boundary is.
  const first = guess - zoneOffsetMs(guess, timeZone);
  return guess - zoneOffsetMs(first, timeZone);
}

/** "2026-11-18T10:00:00-05:00" — the slot as its own local time, with offset. */
export function toLocalIso(instant: number, timeZone = TOUR_SCHEDULE.timeZone) {
  const p = zonedParts(instant, timeZone);
  const off = Math.round(zoneOffsetMs(instant, timeZone) / 60000);
  const sign = off < 0 ? "-" : "+";
  const abs = Math.abs(off);
  return (
    `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

export function formatTime(instant: number, timeZone = TOUR_SCHEDULE.timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
}

/** "Wednesday, November 18 at 10:00 AM" */
export function formatSlot(instant: number, timeZone = TOUR_SCHEDULE.timeZone) {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(instant));
  return `${day} at ${formatTime(instant, timeZone)}`;
}

/**
 * Every bookable slot from `now` to the horizon, day by day. Days the lot
 * takes no tours are included with no slots, so a calendar can draw them.
 */
export function tourDays(now = Date.now(), schedule = TOUR_SCHEDULE): TourDay[] {
  const { timeZone } = schedule;
  const today = zonedParts(now, timeZone);
  const open = toMinutes(schedule.open);
  const close = toMinutes(schedule.close);
  const earliest = now + schedule.minNoticeMinutes * 60_000;
  const days: TourDay[] = [];

  for (let i = 0; i < schedule.horizonDays; i++) {
    // Calendar arithmetic on a UTC date carries month and year correctly.
    const cal = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const y = cal.getUTCFullYear();
    const m = cal.getUTCMonth() + 1;
    const d = cal.getUTCDate();
    const weekday = cal.getUTCDay();
    const date = `${y}-${pad(m)}-${pad(d)}`;
    const slots: TourSlot[] = [];

    if (schedule.days.includes(weekday) && !schedule.closedDates.includes(date)) {
      for (let t = open; t + schedule.slotMinutes <= close; t += schedule.slotMinutes) {
        const start = zonedTimeToUtc(y, m, d, t, timeZone);
        if (start < earliest) continue;
        slots.push({
          start,
          end: start + schedule.slotMinutes * 60_000,
          label: formatTime(start, timeZone),
        });
      }
    }
    days.push({ date, weekday, slots });
  }
  return days;
}

/**
 * The slot that starts at exactly `start`, if it is on the grid and still
 * bookable now — otherwise null. The server books nothing it did not find here.
 */
export function findSlot(start: number, now = Date.now()): TourSlot | null {
  if (!Number.isSafeInteger(start)) return null;
  for (const day of tourDays(now)) {
    for (const slot of day.slots) if (slot.start === start) return slot;
  }
  return null;
}
