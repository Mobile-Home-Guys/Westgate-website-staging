import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { PaymentCalculator } from "@/components/payment-calculator";
import { PrequalifyPanel } from "@/components/prequalify-panel";
import { Reveal } from "@/components/reveal";
import { Container, Section, SectionHeading } from "@/components/ui";
import { hasPrices, priceBounds } from "@/lib/homes";
import { money } from "@/lib/format";
import { pages } from "@/lib/page-config";
import { prequalify } from "@/lib/prequalify";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "What a manufactured home purchase costs to finance in Gainesville and North Florida, how to start a credit application, and the paperwork order that keeps a purchase from going sideways.",
};

const ORDER = [
  {
    n: "01",
    title: "Land first, always",
    body: "Before a lender, before a floor plan. Whether you own or lease decides which financing you are even eligible for, and it changes the monthly figure by hundreds of dollars. If you do not own land yet, the buyer's guide at /start-here walks through the three ways onto ground.",
  },
  {
    n: "02",
    title: "Pre-approval, not pre-qualification",
    body: "A pre-qualification is a lender being polite. A pre-approval is underwriting having actually looked. Ask for the second one; it costs nothing and takes about four days.",
  },
  {
    n: "03",
    title: "Site check and cost-to-set",
    body: "Access, utilities, setbacks, soil, permits. We produce a written number. This is the line item that surprises people, and it is the one nobody else will quote you up front.",
  },
  {
    n: "04",
    title: "Order and lock",
    body: "Deposit holds a build slot. Colour and finish selections stay open until the build lock date, typically three weeks before the plant run.",
  },
  {
    n: "05",
    title: "Close at set, not at order",
    body: "You do not start paying a mortgage on a home that is still a stack of lumber. Funding happens when the home is on its piers and the foundation certification is signed.",
  },
];

export default function FinancingPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.financing) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/financing"
        index="01"
        eyebrow="Financing"
        title={
          <>
            Know your number
            <br />
            before you pick a home.
          </>
        }
        lede={
          hasPrices
            ? `Homes here run ${money(priceBounds.min)} to ${money(priceBounds.max)}. What that costs you every month depends far more on how you finance it than on which one you pick.`
            : "What a home costs you every month depends far more on how you finance it than on which one you pick. Here is how the two paths differ, and how to work out your own number."
        }
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/financing", label: "Financing" },
        ]}
      />

      {/* Prequalify */}
      <section className="border-b border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              index="02"
              eyebrow="The fast path"
              title={prequalify.headline}
              lede={prequalify.subtext}
            />
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <PrequalifyPanel />
          </Reveal>
        </Container>
      </section>

      {/* Calculator */}
      <section id="calculator" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-y border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Run it yourself"
              title="Move the sliders. Watch the gap."
              lede="Put in the price you are working with, then switch between the two loan types with everything else held constant. That difference is the whole argument for buying the land."
            />
          </Reveal>
          <Reveal className="mt-12">
            <div className="mx-auto max-w-3xl">
              {/* No listing here to take a price from, so the visitor sets
                  one. Seeded at a round number, not a home's sticker. */}
              <PaymentCalculator price={150000} editablePrice />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Order of operations */}
      <Section>
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Order of operations"
            title="Do these in this order and nothing goes wrong."
            lede="Almost every purchase that falls apart falls apart because somebody did step four before step one."
          />
        </Reveal>

        <ol className="mt-14 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
          {ORDER.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 70}
              as="li"
              className="grid gap-4 bg-paper p-7 sm:grid-cols-[6rem_minmax(0,20rem)_1fr] sm:items-baseline sm:gap-8 sm:p-9"
            >
              <span className="font-mono text-sm text-ember">{s.n}</span>
              <h3 className="font-display text-2xl leading-snug tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="leading-relaxed text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>
    </>
  );
}
