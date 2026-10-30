/**
 * Claims the dealership makes about itself.
 *
 * Everything in here is a statement a *specific* business makes — how long
 * it has traded, who works there, what the price includes, what it warrants.
 * None of it is true of whoever deploys this template next, which is why it
 * lives in one file instead of being written into the pages.
 *
 * The rule is the same one `lib/communities.ts` and `lib/photos.ts` follow:
 * an absent value is hidden, never guessed at. Every field below is
 * optional, and every section that consumes one disappears when it is
 * missing — delete `team` and the About page has no team section; delete
 * `founded` and nothing anywhere claims a founding year. A shorter page is
 * always the correct outcome. Inventing a plausible-sounding number is not.
 *
 * What is filled in below was read off what Westgate Home Center already
 * publishes about itself — its home, About, Specials and Contact pages at
 * westgatehomecenter.com. Everything the business does not publish has been
 * deleted rather than carried over from the template, which is why there is
 * no dealer licence number, no warranty term, no transport radius, no
 * deposit schedule and no named staff with titles here. Those are all real
 * claims, and this dealership has not made them in public. If it makes one,
 * add it.
 */

/** Icon keys from `components/ui.tsx`, referenced by name so this file stays free of components. */
export type PrincipleIcon = "Shield" | "Wrench" | "Truck" | "Bolt" | "Leaf" | "Plan" | "Pin";

export type TeamMember = {
  name: string;
  role: string;
  /** Year they joined. Omit if you don't know it — the card drops the line. */
  since?: string;
  /** Their published biography. Omit where the business publishes none and
      the card shows the name and the role alone. */
  body?: string;
};

export type Principle = {
  icon: PrincipleIcon;
  title: string;
  body: string;
};

export type Company = {
  /** Year the business started trading. Drives the About hero, the story and the "Years" stat. */
  founded?: number;
  /** Homes sold or set to date, written out for prose, e.g. "four thousand".
      Becomes the first line of the About headline. */
  homesSoldWords?: string;
  /** Headcount, for the team section heading. Omit and the heading loses the count. */
  teamSize?: number;
  /** Homes standing open on the lot for walkthroughs. */
  homesOpenOnLot?: number;

  /** The founding story. Both halves are required together or the section is dropped. */
  story?: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
  };

  /** Operating rules the business will stand behind. Shipped empty is fine. */
  principles?: Principle[];

  /** Named staff. Portraits are wired through `page/about-team-N` in `lib/photos.ts`. */
  team?: TeamMember[];
  /** One-line note under the team grid, e.g. about how nobody works on commission. */
  teamNote?: string;

  /** Dealer licence number, where the state issues one and the business
      publishes it. Shown in the trust row under the hero and nowhere else.
      Omit it rather than inventing one — an unverifiable licence number is
      the single worst field on this list to guess at. */
  licenseId?: string;
  /** Short claims for the trust row under the hero, three or four at most.
      Every one is a promise the business has to keep, so write them from what
      it already advertises and delete the rest. */
  badges?: string[];
  /** Where the business's public reviews live — a Google Business Profile, a
      Facebook page, a Better Business Bureau listing. The testimonials band
      links to it so a sceptic can check the quotes against a source we do not
      control. Omit it and the band simply does not offer the link; do not
      point it at a profile with no reviews on it. */
  reviewsUrl?: string;
  /** What to call that source in the link — "Google", "Facebook". */
  reviewsLabel?: string;
  /** The Google Place ID for this location, from the Google Business Profile.
      `lib/reviews.ts` uses it to pull live reviews through the Places API —
      see that file for the API key it needs. Omit it and the testimonials
      band shows video testimonials only, with no Google reviews mixed in. */
  googlePlaceId?: string;

  /** Structural warranty on a new home, in months. Omit to make no warranty claim. */
  warrantyMonths?: number;
  /** Transport included in the listed price, in miles from the lot. */
  transportIncludedMiles?: number;
  /** Deposit schedule for a cash purchase, as a sentence. */
  cashDepositSchedule?: string;
};

export const company: Company = {
  /* Facts the dealership states on its own pages: it opened in 1961, says it
     has sold over 20,000 homes, and is a debt-free company. */
  founded: 1961,
  homesSoldWords: "over twenty thousand",

  /* The short claims the dealership's own home page leads with. */
  badges: ["Serving North Florida since 1961", "Debt-free company", "Factory-direct prices"],

  /* Where its reviews are collected. Linked so a visitor can check the
     quotes against a source this site does not control. */
  reviewsUrl: "https://www.giveratings.com/gene-jim-roys-westgate-home",
  reviewsLabel: "GiveRatings",

  story: {
    eyebrow: "About Westgate Home Center",
    heading: "Four generations, one lot on NW 13th Street, and a name Gainesville knows.",
    paragraphs: [
      "Westgate Home Center was founded in 1961 in Gainesville, Florida, with a simple goal: to provide hardworking families with affordable, dependable housing. What began as a small local operation has grown into one of the most established mobile home dealers in North Florida — Gene, Jim and Roy's Westgate, in business for more than four generations.",
      "We say we have sold over twenty thousand homes to generations of families, and we are a debt-free company, so the people who sold you the home are the people who will still be here to honour the warranty and the commitments that came with it.",
      "We are the dealer that offers both TownHomes and Live Oak Homes at factory-direct prices — singlewides, doublewides and triplewides in stock, plus land and home packages if you have found the piece of land. Come to the sales center in Gainesville and we will work around your schedule.",
    ],
  },

  /* What the dealership tells buyers about itself on its home page, in the
     six points under "Discover the Westgate Difference". These are claims
     about price, selection, stability and hours — nothing here claims a
     warranty term, an inspection regime or an in-house set crew, because the
     business publishes none of those. */
  principles: [
    {
      icon: "Shield",
      title: "Factory-direct prices",
      body: "Factory-direct pricing on new manufactured homes, modular homes, and pre-owned and repo homes, with singlewides, doublewides and triplewides in stock.",
    },
    {
      icon: "Plan",
      title: "Two manufacturers, competing",
      body: "Unlike dealers who sell one manufacturer, we offer both TownHomes and Live Oak Homes, so the builders compete for your business and you get the better-built home.",
    },
    {
      icon: "Pin",
      title: "Land and home packages",
      body: "Found the perfect piece of land? We can package it into the home deal.",
    },
    {
      icon: "Truck",
      title: "Here when you need us",
      body: "No banker's hours: we are on NW 13th Street in Gainesville and open six days a week.",
    },
  ],
};

const SMALL_NUMBERS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

/**
 * Small counts read better spelled out in display type — "Nine people", not
 * "9 people". Anything past twelve stays a numeral, which is also the house
 * style for the catalogue.
 */
export function spellCount(n: number): string {
  return SMALL_NUMBERS[n] ?? String(n);
}

/** Years trading, or undefined when no founding year is on record. */
export function yearsTrading(now = new Date().getFullYear()): number | undefined {
  return company.founded ? now - company.founded : undefined;
}
