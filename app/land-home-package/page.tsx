import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ContactBand } from "@/components/contact-band";
import { ListingCard } from "@/components/listing-card";
import { LocationHours } from "@/components/location-hours";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { featuredListings, listings } from "@/lib/homes";
import { LAND_HOME_INCLUDED, LAND_HOME_STEPS } from "@/lib/land-home-package";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";
import heroPhoto from "@/public/photos/hero-home.jpg";

const description = `How the ${site.name} land and home package works: find your land, get prequalified, pick out your home. Well, septic, power and permits rolled into one package.`;

export const metadata: Metadata = {
  title: "Land and home packages",
  description,
  alternates: { canonical: "/land-home-package" },
  openGraph: {
    title: `Land and home packages | ${site.name}`,
    description,
    url: "/land-home-package",
  },
};

/* Why bother with land at all, in three lines a buyer can repeat to their
   family. Each is true by definition of owning the ground or is the
   dealership's own sheet — no figures, nothing to check. */
const WHY = [
  {
    icon: Icon.Pin,
    title: "Your land, your rules",
    body: "No lot rent. The ground under your home is yours, not a landlord's.",
  },
  {
    icon: Icon.Wrench,
    title: "Move-in ready",
    body: "Well, septic, power and permits rolled into the package, not left for you to chase.",
  },
  {
    icon: Icon.House,
    title: `${listings.length} homes to choose from`,
    body: "Single, double and triple section Live Oak Homes and TownHomes.",
  },
];

/* The three routes onto land from the dealership's sheet. */
const LAND_WAYS: {
  icon: (typeof Icon)[keyof typeof Icon];
  title: string;
  body: string;
  href?: string;
  cta?: string;
}[] = [
  {
    icon: Icon.Chat,
    title: "Work with a realtor",
    body: "Don't have one? We can refer a realtor who can help you find the right piece of land.",
  },
  {
    icon: Icon.Grid,
    title: "Search online",
    body: "Browse land for sale on sites like LandWatch.com, from your couch.",
    href: "https://www.landwatch.com/",
    cta: "Browse LandWatch.com",
  },
  {
    icon: Icon.Tag,
    title: "Buy from a private seller",
    body: "Spotted a for-sale-by-owner sign? A private seller works too.",
  },
];

/**
 * A page made to be sent: a text, an email, an ad. One idea — the land and
 * home package in three steps — then homes, then the form and the phone.
 * The steps are `lib/land-home-package.ts`, shared with the band on `/`.
 */
export default function LandHomePackagePage() {
  if (!pages.landHomePackage) redirect("/");
  const homes = featuredListings().slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroPhoto}
            alt="A manufactured home with a covered front porch and white railings, standing on the lot in Gainesville, Florida."
            fill
            preload
            quality={90}
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.72)_100%)]" />
        </div>

        <Container className="py-16 text-center md:py-24">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Icon.Pin className="size-4 shrink-0" />
            {site.name} &middot; {site.address.city}, {site.address.region}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Your own land. Your new home. <span className="text-[#fdba74]">One package.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85 md:text-xl">
            No land yet? That&apos;s step one, not a dealbreaker. We&apos;ll help
            you find it, then roll the well, septic, power and permits in with
            your new home.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#get-started"
              className="group/btn flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient)] px-8 py-4 text-lg font-semibold text-white shadow-[var(--button-shadow)] transition-all duration-300 hover:scale-105 hover:bg-[image:var(--gradient-hover)]"
            >
              Get started
              <Icon.Arrow className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
            <a
              href={site.phoneHref}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-ink"
              aria-label={`Call ${site.name} on ${site.phone}`}
            >
              <Icon.Phone className="size-5 shrink-0" />
              {site.phone}
            </a>
          </div>
        </Container>
      </section>

      <section id="why" className="bg-paper">
        <Container className="pt-14 md:pt-20">
          <ul className="grid gap-4 sm:grid-cols-3">
            {WHY.map((w, i) => (
              <Reveal
                key={w.title}
                delay={i * 90}
                as="li"
                className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ember-wash text-ember">
                  <w.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{w.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section id="find-land" className="bg-paper">
        <Container className="py-14 md:py-20">
          <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-[image:var(--gradient)] p-8 text-white shadow-[var(--button-shadow)] sm:p-12">
            {/* The dark theme lightens the gradient for buttons; under a whole
                panel of white text that is too pale, so pull it back down. */}
            <div className="absolute inset-0 -z-10 hidden bg-black/45 dark:block" aria-hidden />
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/80">
                  The hard part, made easier
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                  Finding land is the hard part. You don&apos;t have to do it alone.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-white/90">
                  Three ways to find your spot. Pick whichever suits you, and call
                  us the moment you find one you like.
                </p>
                <a
                  href={site.phoneHref}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#0f172a] transition-transform duration-300 hover:scale-105"
                >
                  <Icon.Phone className="size-5" />
                  Ask for a realtor referral
                </a>
              </div>
              <ul className="grid gap-3">
                {LAND_WAYS.map((way) => (
                  <li key={way.title} className="flex gap-4 rounded-2xl bg-white/12 p-5 backdrop-blur-sm">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
                      <way.icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{way.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/85">{way.body}</p>
                      {way.href && (
                        <a
                          href={way.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                        >
                          {way.cta}
                          <Icon.External className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="bg-paper">
        <Container className="pb-14 md:pb-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-ink md:text-4xl">
              How the land and home package works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted">
              From finding your land to moving into your new home.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {LAND_HOME_STEPS.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 90}
                as="li"
                className="flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center md:p-8"
              >
                <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient)] text-lg font-bold text-white shadow-[var(--button-shadow)]">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="text-[0.95rem] leading-relaxed text-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-12 rounded-2xl bg-surface p-6 text-center md:p-8">
            <p className="text-lg font-semibold text-ink">Rolled into your package</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {LAND_HOME_INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2 text-ink-soft">
                  <Icon.Check className="size-5 shrink-0 text-moss" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {pages.listings && homes.length > 0 && (
        <section className="bg-surface">
          <Container className="py-14 md:py-20">
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-3xl font-bold text-ink md:text-4xl">Pick out your new home</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted">
                A few of our homes. Call {site.phone} for current pricing.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {homes.map((listing, i) => (
                <Reveal key={listing.slug} delay={i * 90}>
                  <ListingCard listing={listing} className="h-full" />
                </Reveal>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/listings" variant="outline">
                See all {listings.length} homes
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <section id="get-started" className="scroll-mt-24 bg-paper">
        <Container className="py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-ink md:text-4xl">
                Ready to{" "}
                <span className="bg-[image:var(--gradient)] bg-clip-text text-transparent">
                  get started?
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Whether you have land picked out or are still looking, tell us
                where you are and we will walk you through the next step, from a
                realtor referral to prequalifying with a lender.
              </p>
              <a
                href={site.phoneHref}
                className="mt-8 flex items-center gap-4 text-ink transition-opacity hover:opacity-80"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ember-wash text-ember">
                  <Icon.Phone className="size-5" />
                </span>
                <span>
                  <span className="block text-sm text-muted">Call us directly</span>
                  <span className="block text-xl font-bold">{site.phone}</span>
                </span>
              </a>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] md:p-8">
              <ContactBand source="land-home-package" />
            </div>
          </div>
        </Container>
      </section>

      <LocationHours />
    </>
  );
}
