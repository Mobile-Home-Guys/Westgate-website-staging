"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { listings } from "@/lib/homes";
import { site } from "@/lib/site";
import { bookTour } from "@/lib/booking/actions";
import { EMPTY_TOUR_STATE, type AvailabilityResponse } from "@/lib/booking/state";
import { buttonStyles, cx, Icon } from "./ui";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const REFRESH_MS = 60_000;

/**
 * The tour booking calendar — on `/contact` and every listing page.
 *
 * The calendar shows only times that are still open, and refreshes itself
 * while it sits on screen. It is a convenience, not the safeguard: the
 * `bookTour` Server Action re-checks and claims the slot atomically when the
 * visitor presses "Book", so two people on two stale pages still cannot both
 * have 10 o'clock. The loser is told so and the calendar reloads.
 *
 * Hours, tour length and closed days are `lib/booking/schedule.ts`.
 */
export function InquiryForm(props: {
  defaultHome?: string;
  title?: string;
  lede?: string;
  compact?: boolean;
}) {
  /* A fresh key gives a fresh action state — that is "book another". */
  const [round, setRound] = useState(0);
  return <TourForm key={round} {...props} onReset={() => setRound((r) => r + 1)} />;
}

function TourForm({
  defaultHome,
  title = "Book a tour",
  lede = "Pick an open time and it's yours — nobody else can take it once you've booked. Tours run Monday to Saturday, 10am to 4pm.",
  compact = false,
  onReset,
}: {
  defaultHome?: string;
  title?: string;
  lede?: string;
  compact?: boolean;
  onReset: () => void;
}) {
  const [state, action, pending] = useActionState(bookTour, EMPTY_TOUR_STATE);
  const [avail, setAvail] = useState<AvailabilityResponse | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedStart, setPickedStart] = useState<number | null>(null);

  const load = useCallback(() => {
    fetch("/api/tour-slots", { cache: "no-store" })
      .then((r) => r.json() as Promise<AvailabilityResponse>)
      .then((data) => {
        setAvail(data);
        setLoadFailed(false);
      })
      .catch(() => setLoadFailed(true));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  /* The slot just went to somebody else: show the calendar as it is now. */
  useEffect(() => {
    if (state.stale) load();
  }, [state, load]);

  const days = useMemo(() => avail?.days ?? [], [avail]);
  const bookable = (d: (typeof days)[number]) => d.slots.some((s) => s.open);

  /* Derived, not stored: a pick that is no longer open simply stops being
     picked when fresh availability arrives. */
  const day =
    days.find((d) => d.date === pickedDay && bookable(d)) ?? days.find(bookable) ?? null;
  const chosen =
    day?.slots.find((s) => s.start === pickedStart && s.open) ?? null;

  const err = state.fieldErrors ?? {};
  const was = state.values ?? {};

  const field =
    "w-full rounded-xl border border-line-strong bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none";
  const shell = cx("rounded-card border border-line bg-surface", compact ? "p-6" : "p-6 sm:p-9");

  if (state.status === "ok") {
    return (
      <div className={cx(shell, "flex flex-col items-start gap-5")}>
        <span className="grid size-12 place-items-center rounded-full bg-moss text-paper dark:text-ink">
          <Icon.Check className="size-6" />
        </span>
        <div>
          <h3 className="font-display text-2xl tracking-tight text-ink">
            {state.booked ? "You're booked." : "Thanks."}
          </h3>
          {state.booked && (
            <p className="mt-3 text-lg font-medium text-ink">{state.booked.label}</p>
          )}
          <p className="mt-3 max-w-md leading-relaxed text-muted">
            {state.booked
              ? `That time is held for you at ${site.address.street}, ${site.address.city}. We'll be in touch to confirm. Need to change it? Call ${site.phone}.`
              : state.message}
          </p>
        </div>
        <button type="button" onClick={onReset} className={buttonStyles.small}>
          Book another
        </button>
      </div>
    );
  }

  const offline = avail && !avail.online;
  const openCount = days.reduce((n, d) => n + d.slots.filter((s) => s.open).length, 0);

  /* Pad the first week so dates sit under their weekday. */
  const lead = days.length ? days[0].weekday : 0;
  const monthLabel = (() => {
    if (!days.length) return "";
    const fmt = (iso: string, withYear: boolean) =>
      new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
        month: "long",
        year: withYear ? "numeric" : undefined,
        timeZone: "UTC",
      });
    const a = fmt(days[0].date, false);
    const b = fmt(days[days.length - 1].date, true);
    return a === b.split(" ")[0] ? b : `${a} – ${b}`;
  })();

  return (
    <form action={action} noValidate className={shell}>
      <h3 className="font-display text-2xl tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{lede}</p>

      {/* Honeypot: real people leave this empty. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <input type="hidden" name="start" value={chosen?.start ?? ""} />

      {/* ---- Calendar ---------------------------------------------- */}
      <fieldset className="mt-7" aria-describedby={err.start ? "err-start" : undefined}>
        <legend className="eyebrow">Pick a day</legend>

        {offline || loadFailed ? (
          <p className="mt-3 rounded-xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink">
            Online booking is unavailable right now. Call or text{" "}
            <a href={site.phoneHref} className="font-semibold underline underline-offset-2">
              {site.phone}
            </a>{" "}
            and we&apos;ll find you a time.
          </p>
        ) : !avail ? (
          <div className="mt-3 h-56 animate-pulse rounded-xl bg-surface-2" aria-label="Loading open times" />
        ) : openCount === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Every tour time is taken for now. Call{" "}
            <a href={site.phoneHref} className="font-semibold text-ink underline underline-offset-2">
              {site.phone}
            </a>
            .
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm font-medium text-ink">{monthLabel}</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
              {WEEKDAYS.map((w, i) => (
                <span key={i} className="pb-1 text-[0.7rem] font-semibold uppercase text-muted">
                  {w}
                </span>
              ))}
              {Array.from({ length: lead }, (_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {days.map((d) => {
                const open = bookable(d);
                const isPicked = day?.date === d.date;
                const n = Number(d.date.slice(8));
                return (
                  <button
                    key={d.date}
                    type="button"
                    disabled={!open}
                    aria-pressed={isPicked}
                    aria-label={new Date(`${d.date}T12:00:00Z`).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    }) + (open ? "" : ", no times available")}
                    onClick={() => {
                      setPickedDay(d.date);
                      setPickedStart(null);
                    }}
                    className={cx(
                      "aspect-square rounded-lg text-sm tabular-nums transition-colors",
                      isPicked
                        ? "bg-ink font-semibold text-paper"
                        : open
                          ? "border border-line-strong bg-paper text-ink hover:border-ink"
                          : "cursor-not-allowed text-muted/50 line-through",
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            {day && (
              <div className="mt-6">
                <p className="eyebrow">
                  Times on{" "}
                  {new Date(`${day.date}T12:00:00Z`).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}{" "}
                  <span className="normal-case tracking-normal text-muted">(Eastern)</span>
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {day.slots.map((s) => {
                    const isPicked = chosen?.start === s.start;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        disabled={!s.open}
                        aria-pressed={isPicked}
                        aria-label={s.open ? s.label : `${s.label}, booked`}
                        title={s.open ? undefined : "Already booked"}
                        onClick={() => setPickedStart(s.start)}
                        className={cx(
                          "rounded-lg px-2 py-2.5 text-sm font-medium tabular-nums transition-colors",
                          isPicked
                            ? "bg-[var(--ember)] text-white"
                            : s.open
                              ? "border border-line-strong bg-paper text-ink hover:border-ink"
                              : "cursor-not-allowed border border-line text-muted/60 line-through",
                        )}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        {err.start && (
          <span id="err-start" className="mt-2 block text-xs text-ember" role="alert">
            {err.start}
          </span>
        )}
      </fieldset>

      {/* ---- Who's coming ------------------------------------------ */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="eyebrow">Your name</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Alex Whitfield"
            defaultValue={was.name}
            aria-invalid={!!err.name}
            aria-describedby={err.name ? "err-name" : undefined}
            className={cx(field, "mt-2.5", err.name && "border-ember")}
          />
          {err.name && (
            <span id="err-name" className="mt-2 block text-xs text-ember">
              {err.name}
            </span>
          )}
        </label>

        <label className="block">
          <span className="eyebrow">Phone</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(352) 555-0100"
            defaultValue={was.phone}
            aria-invalid={!!err.phone}
            aria-describedby={err.phone ? "err-phone" : undefined}
            className={cx(field, "mt-2.5", err.phone && "border-ember")}
          />
          {err.phone && (
            <span id="err-phone" className="mt-2 block text-xs text-ember">
              {err.phone}
            </span>
          )}
        </label>

        <label className="block">
          <span className="eyebrow">Email (optional)</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="alex@example.com"
            defaultValue={was.email}
            aria-invalid={!!err.email}
            aria-describedby={err.email ? "err-email" : undefined}
            className={cx(field, "mt-2.5", err.email && "border-ember")}
          />
          {err.email && (
            <span id="err-email" className="mt-2 block text-xs text-ember">
              {err.email}
            </span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="eyebrow">Home you want to see</span>
          <select
            name="home"
            defaultValue={was.home ?? defaultHome ?? ""}
            className={cx(field, "mt-2.5 cursor-pointer")}
          >
            <option value="">Not sure yet — show me a few</option>
            {listings.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name} — {l.series} Series
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="eyebrow">Anything we should know</span>
          <textarea
            name="message"
            rows={3}
            defaultValue={was.message}
            placeholder="We have half an acre out past Edgewood and no idea whether it will perc."
            className={cx(field, "mt-2.5 resize-y")}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
          <input
            name="callFirst"
            type="checkbox"
            defaultChecked={was.callFirst === "on"}
            className="mt-0.5 size-4 shrink-0 accent-[var(--ember)]"
          />
          <span className="text-[0.88rem] leading-relaxed text-muted">
            Call me before I drive out — I have questions that will save us both a trip.
          </span>
        </label>
      </div>

      {state.status === "error" && (
        <p className="mt-6 rounded-xl border border-ember/40 bg-paper p-4 text-sm leading-relaxed text-ink" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !!offline || loadFailed}
        className={cx(buttonStyles.primary, "mt-7 w-full !py-4 text-base disabled:opacity-60")}
      >
        {pending
          ? "Booking…"
          : chosen
            ? `Book ${day ? new Date(`${day.date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }) : ""} at ${chosen.label}`
            : "Book the tour"}
        {!pending && (
          <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        )}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Times are Eastern. Prefer to talk?{" "}
        <a href={site.phoneHref} className="underline underline-offset-2">
          {site.phone}
        </a>
      </p>
    </form>
  );
}
