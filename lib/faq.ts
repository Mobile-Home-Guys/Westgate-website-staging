/**
 * The questions buyers actually ask, and the answers this dealership stands
 * behind.
 *
 * These are written for Westgate Home Center in Gainesville and make no
 * claim that holds only for one county: wind zone, snow load and titling
 * are state and county business, so the answers send the buyer to the
 * home's data plate and to us rather than quoting a zone this dealership
 * has not published. Prices are not published on this site — call for
 * current pricing and specials.
 *
 * They live here rather than in a page because two routes render them: the
 * `/faq` page in full, and the FAQ band at the foot of `/why-manufactured`.
 * One list, one set of answers, no chance of the two drifting apart.
 *
 * Answers are paragraphs of plain text — no markup — so this file stays free
 * of components, the same rule `lib/company.ts` follows. Add, cut and reorder
 * freely; an empty list hides the section and, with `pages.faq` off in
 * `lib/page-config.ts`, the route with it.
 *
 * Everything below is a claim about how these homes are built, financed and
 * titled. Check it against your own market before you ship it.
 */

export type FaqItem = {
  question: string;
  /** One string per paragraph. */
  answer: string[];
};

export const faq: FaqItem[] = [
  {
    question: "Is a manufactured home the same as a mobile home?",
    answer: [
      "Legally, no. “Mobile home” refers to anything built before 15 June 1976, when the federal HUD Code took effect. Everything built after that date is a manufactured home, and the two are governed by completely different rules.",
      "In conversation people use the terms interchangeably, and we are not going to be precious about it. But if you are reading a loan document, an insurance policy or a zoning ordinance, that date is the line that matters.",
    ],
  },
  {
    question: "Can I get a normal mortgage?",
    answer: [
      "On land you own, with the home on a permanent foundation and titled as real property: yes. Conventional, FHA Title II, VA and USDA all lend on manufactured homes that meet those conditions. On a leased pad you are in chattel lending, which is a real loan with real underwriting — just more expensive. Which situation you are in is a decision you make, and we would rather you made it on purpose.",
    ],
  },
  {
    question: "How long do they actually last?",
    answer: [
      "The same as any other house: as long as the roof and the envelope are maintained. HUD-code homes from the early 1980s are still in service across the country. The structural failures people remember are almost entirely pre-1976 units, or post-1976 homes that were never properly anchored — which is a set-crew problem, not a construction problem.",
    ],
  },
  {
    question: "What about wind, snow and earthquakes?",
    answer: [
      "Every home is certified to a wind zone, a roof-load zone and a thermal zone, all printed on the data plate inside the kitchen cabinet. Which zone applies depends on where the home is going to stand, so ask us which zones a particular home is certified to before you commit it to a parcel — a home built for one zone is not automatically right for another.",
      "Anchoring is engineered and torque-tested, and it matters more than any of the above. A properly anchored home on engineered piers performs comparably to a site-built house on a stem wall; the failures people remember are almost always homes that were never tied down correctly.",
    ],
  },
  {
    question: "Can I put one on my own land?",
    answer: [
      "Usually — and we offer land and home packages for exactly that: if you have found the perfect piece of land, we can package it into the home deal. The constraints are zoning (each county handles manufactured housing differently by district), any minimum square footage or roof-pitch covenant on the parcel, physical access for the load, and utilities. Call us with the parcel and we will go through it with you before you spend anything.",
    ],
  },
  {
    question: "Will my neighbours be able to tell?",
    answer: [
      "With a permanent foundation, a continuous perimeter, a site-built porch and a conventional roof pitch — generally not, from the street. The TownHomes and the upgraded Live Oak plans are built for exactly that, and the difference between one of those and the same plan set on blocks with vinyl skirting is mostly what you spend on the ground under it. Whether it matters to you is a personal question, and a completely reasonable one.",
    ],
  },
  {
    question: "What does the price on a listing actually include?",
    answer: [
      "We do not print prices on this site, because the right number depends on the model, the options and the ground it is going on. Call (352) 378-2453 for the current pricing and specials on any home, and we will tell you what the number covers.",
      "Delivery, the set, site work — pad, drive, well, septic, power run — and anything added at the order desk are separate lines, and we quote them against your actual ground rather than quoting an average.",
    ],
  },
  {
    question: "How long from signing to keys?",
    answer: [
      "It depends on whether the home has to be built. A home already in stock is a matter of weeks once the ground is ready, while one ordered from the factory runs to a factory schedule we will give you in writing before you sign. Site work and trim-out sit either side of whichever it is. Ask for the dates on the specific home rather than a rule of thumb.",
    ],
  },
];
