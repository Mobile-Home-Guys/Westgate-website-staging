/**
 * Shape of the tour form's action state. Outside the `"use server"` module
 * because that may only export async functions.
 */
export const TOUR_FIELDS = ["name", "phone", "email", "home", "message", "start"] as const;
export type TourField = (typeof TOUR_FIELDS)[number];

export type TourState = {
  status: "idle" | "ok" | "error";
  message: string;
  fieldErrors?: Partial<Record<TourField, string>>;
  /** Echoed back so a rejected submission does not wipe what was typed. */
  values?: Partial<Record<TourField | "callFirst", string>>;
  /** The chosen time went to somebody else — reload the calendar. */
  stale?: boolean;
  /** Set on success: the booked slot, for the confirmation. */
  booked?: { start: number; label: string };
};

export const EMPTY_TOUR_STATE: TourState = { status: "idle", message: "" };

export type AvailabilityResponse = {
  timeZone: string;
  /** False when no slot store is configured: the form says "call us". */
  online: boolean;
  days: { date: string; weekday: number; slots: { start: number; label: string; open: boolean }[] }[];
};
