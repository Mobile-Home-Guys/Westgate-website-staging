import { floorPlans, type FloorPlan } from "./floor-plans";

export type ListingStatus = "available" | "pending" | "sold" | "coming-soon";
export type Sections = "single" | "double" | "triple";
export type ArchStyle =
  | "farmhouse"
  | "craftsman"
  | "modern"
  | "coastal"
  | "lodge"
  | "ranch";
export type SceneKind =
  | "exterior"
  | "living"
  | "kitchen"
  | "bedroom"
  | "bath"
  | "porch";

export type Scene = { kind: SceneKind; caption: string };

export type FeatureGroup = { group: string; items: string[] };

/**
 * A home in the catalogue.
 *
 * Required fields are the ones a listing cannot mean anything without. The
 * rest are optional because real inventory arrives incomplete: a
 * manufacturer's spec sheet may carry dimensions but no price, an imported
 * feed may carry photographs but no floor plan. Every field below that can
 * be absent is absent from the UI too — nothing is faked to fill a slot,
 * and nothing renders as a blank or a zero.
 */
export type Listing = {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  status: ListingStatus;
  scenes: Scene[];

  /** Living area in square feet. Optional for the same reason `price` is:
      a manufacturer's sheet occasionally omits it, and every place that
      shows a footprint hides the row rather than printing a zero. */
  sqft?: number;

  /** Product line, e.g. "Elite". Free text — the facet list derives from it. */
  series?: string;
  /** Manufacturer's model code. */
  model?: string;
  /** Absent means the home is priced on enquiry; the UI says so. */
  price?: number;
  /** Optional pre-discount price; renders as a strikethrough. */
  wasPrice?: number;
  sections?: Sections;
  /** Transport dimensions in feet, e.g. 28 × 60. */
  widthFt?: number;
  lengthFt?: number;
  year?: number;
  communitySlug?: string;
  style?: ArchStyle;
  tagline?: string;
  story?: string[];
  highlights?: string[];
  features?: FeatureGroup[];
  planId?: keyof typeof floorPlans;
  /** HERS index — lower is better. A new stick-built home scores ~100. */
  hers?: number;
  featured?: boolean;
  /** Days the listing has been on market, used for the "new" badge. */
  daysListed?: number;
  /** Matterport walkthrough. */
  tourUrl?: string;
  /** Where this listing was imported from, for re-checking against source. */
  sourceUrl?: string;
  /** The manufacturer's own floor-plan drawing, under `public/`.
      Separate from `planId`: that renders a plan this site draws from room
      geometry, while this is the printed sheet the plan actually ships with.
      A listing may carry either, both or neither. */
  planImage?: string;
};

const scenes = (...kinds: [SceneKind, string][]): Scene[] =>
  kinds.map(([kind, caption]) => ({ kind, caption }));

/* ------------------------------------------------------------------ *
 * The catalogue — the homes Westgate Home Center shows on its own site
 *
 * Read from westgatehomecenter.com, where every home is a page of its own
 * under "Our Homes" (Live Oak Homes) or "TownHomes"; each listing's
 * `sourceUrl` is the page it came from, `scripts/westgate-catalogue.json`
 * is the parsed scrape, and `scripts/import-westgate.mjs` regenerates the
 * photography and the plan drawings from it and from
 * `scripts/westgate-selection.json`.
 *
 * `series` is the product line the dealership files the home under — the
 * Live Oak Homes series it lists (Suwannee Valley, Signature Oak, Classic
 * Oak, Plantation, Runner, Runner SS) or, where it files a home only under a
 * finish, that finish (Deluxe Drywall, Painted Sheetrock); TownHomes are
 * their own line. `sections` is which of the dealership's Singlewide,
 * Doublewide or Triplewide categories the home appears in. Both are the
 * dealership's own classification. A TownHome sits in none of those three
 * categories, so it declares no `sections` and is sized by its footprint.
 *
 * What the source does not publish is absent rather than invented. There are
 * no prices: Westgate's own pages say "for the most current pricing and
 * specials, please contact us", so every home renders "Call for pricing" and
 * the payment calculator stays hidden. There are no build years, HERS
 * indices, feature lists, prose descriptions, transport dimensions,
 * community placements or floor-plan geometry either.
 *
 * Where a home's gallery carries the manufacturer's printed plan, it is
 * wired up as `planImage`. Homes with few or no photographs at the source
 * declare only the scenes they have (Troy has none), and their galleries
 * render as the empty plate — correct, and not to be filled with pictures
 * of a different house.
 *
 * `status` and `featured` are lot state for this site rather than
 * manufacturer data. Everything ships `available`; six homes with the
 * fullest galleries are featured on the landing page.
 * ------------------------------------------------------------------ */

export const listings: Listing[] = [
  {
    slug: "5k",
    name: "5K",
    series: "Suwannee Valley",
    beds: 5,
    baths: 3,
    sqft: 2136,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/5k/",
    planImage: "/photos/plans/5k.webp",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 5 bedrooms, 3 baths and 2,136 square feet.",
    scenes: [],
  },
  {
    slug: "ace",
    name: "Ace",
    series: "Classic Oak",
    beds: 3,
    baths: 2,
    sqft: 1130,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/ace/",
    tagline: "A Live Oak Homes Classic Oak single section home: 3 bedrooms, 2 baths and 1,130 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "annabelle",
    name: "Annabelle",
    series: "TownHomes",
    beds: 4,
    baths: 3,
    sqft: 2027,
    status: "available",
    featured: true,
    sourceUrl: "https://westgatehomecenter.com/project/annabelle/",
    tagline: "A TownHomes home: 4 bedrooms, 3 baths and 2,027 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "apache",
    name: "Apache",
    beds: 2,
    baths: 2,
    sqft: 1130,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/apache/",
    tagline: "A Live Oak Homes single section home: 2 bedrooms, 2 baths and 1,130 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "arlington",
    name: "Arlington",
    series: "Plantation",
    beds: 4,
    baths: 3,
    sqft: 2692,
    sections: "triple",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/arlington/",
    tagline: "A Live Oak Homes Plantation triple section home: 4 bedrooms, 3 baths and 2,692 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "assassin",
    name: "Assassin",
    series: "Signature Oak",
    beds: 3,
    baths: 2,
    sqft: 1352,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/assassin/",
    tagline: "A Live Oak Homes Signature Oak double section home: 3 bedrooms, 2 baths and 1,352 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "big-horn",
    name: "Big Horn",
    series: "Painted Sheetrock",
    beds: 4,
    baths: 2,
    sqft: 2017,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/big-horn/",
    tagline: "A Live Oak Homes Painted Sheetrock double section home: 4 bedrooms, 2 baths and 2,017 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "big-kahuna",
    name: "Big Kahuna",
    series: "Deluxe Drywall",
    beds: 4,
    baths: 2,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/big-kahuna/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 4 bedrooms, 2 baths and 2,254 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "big-mullet",
    name: "Big Mullet",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1941,
    status: "available",
    featured: true,
    sourceUrl: "https://westgatehomecenter.com/project/big-mullet/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,941 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "blue-ridge",
    name: "Blue Ridge",
    series: "Painted Sheetrock",
    beds: 3,
    baths: 2,
    sqft: 1720,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/blue-ridge/",
    planImage: "/photos/plans/blue-ridge.webp",
    tagline: "A Live Oak Homes Painted Sheetrock double section home: 3 bedrooms, 2 baths and 1,720 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "bolt",
    name: "Bolt",
    series: "Runner",
    beds: 3,
    baths: 2,
    sqft: 1130,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/bolt/",
    tagline: "A Live Oak Homes Runner single section home: 3 bedrooms, 2 baths and 1,130 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "brunswick",
    name: "Brunswick",
    series: "Signature Oak",
    beds: 2,
    baths: 2,
    sqft: 890,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/brunswick/",
    tagline: "A Live Oak Homes Signature Oak single section home: 2 bedrooms, 2 baths and 890 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "buckhead",
    name: "Buckhead",
    series: "Signature Oak",
    beds: 3,
    baths: 2,
    sqft: 1720,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/buckhead/",
    tagline: "A Live Oak Homes Signature Oak double section home: 3 bedrooms, 2 baths and 1,720 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "canyon",
    name: "Canyon",
    series: "Deluxe Drywall",
    beds: 3,
    baths: 2.5,
    sqft: 1795,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/canyon/",
    planImage: "/photos/plans/canyon.webp",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 3 bedrooms, 2.5 baths and 1,795 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "captiva",
    name: "Captiva",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1173,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/captiva/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,173 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "cedar-river",
    name: "Cedar River",
    series: "Classic Oak",
    beds: 2,
    baths: 1,
    sqft: 860,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/cedar-river/",
    tagline: "A Live Oak Homes Classic Oak single section home: 2 bedrooms, 1 bath and 860 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "charger",
    name: "Charger",
    series: "Deluxe Drywall",
    beds: 3,
    baths: 2,
    sqft: 1958,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/charger/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 3 bedrooms, 2 baths and 1,958 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "cobblestone",
    name: "Cobblestone",
    series: "Deluxe Drywall",
    beds: 4,
    baths: 3,
    sqft: 2314,
    sections: "triple",
    status: "available",
    featured: true,
    sourceUrl: "https://westgatehomecenter.com/project/cobblestone-4-bed-3-bath-2314-sq-ft/",
    tagline: "A Live Oak Homes Deluxe Drywall triple section home: 4 bedrooms, 3 baths and 2,314 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "costner",
    name: "Costner",
    series: "Runner SS",
    beds: 4,
    baths: 2,
    sqft: 1768,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/costner/",
    tagline: "A Live Oak Homes Runner SS double section home: 4 bedrooms, 2 baths and 1,768 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "daisy",
    name: "Daisy",
    series: "TownHomes",
    beds: 1,
    baths: 1,
    sqft: 499,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/daisy/",
    tagline: "A TownHomes home: 1 bedroom, 1 bath and 499 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "daphne",
    name: "Daphne",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1759,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/daphne/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,759 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "dart",
    name: "Dart",
    series: "Runner",
    beds: 3,
    baths: 2,
    sqft: 936,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/dart/",
    tagline: "A Live Oak Homes Runner single section home: 3 bedrooms, 2 baths and 936 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "dash",
    name: "Dash",
    series: "Runner",
    beds: 2,
    baths: 2,
    sqft: 979,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/dash-2-bed-2-bath-979-sq-ft/",
    planImage: "/photos/plans/dash.webp",
    tagline: "A Live Oak Homes Runner single section home: 2 bedrooms, 2 baths and 979 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "denali",
    name: "Denali",
    series: "Painted Sheetrock",
    beds: 3,
    baths: 2,
    sqft: 1456,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/denali-3-bed-2-bath-1456-sq-ft/",
    tagline: "A Live Oak Homes Painted Sheetrock double section home: 3 bedrooms, 2 baths and 1,456 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "dogwood",
    name: "Dogwood",
    series: "Deluxe Drywall",
    beds: 4,
    baths: 2,
    sqft: 2136,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/dogwood/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 4 bedrooms, 2 baths and 2,136 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "double-pantry",
    name: "Double Pantry",
    series: "Signature Oak",
    beds: 3,
    baths: 2,
    sqft: 1456,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/double-pantry/",
    tagline: "A Live Oak Homes Signature Oak double section home: 3 bedrooms, 2 baths and 1,456 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "driftwood",
    name: "Driftwood",
    series: "Classic Oak",
    beds: 2,
    baths: 2,
    sqft: 979,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/driftwood/",
    planImage: "/photos/plans/driftwood.webp",
    tagline: "A Live Oak Homes Classic Oak single section home: 2 bedrooms, 2 baths and 979 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "edgewater-ii",
    name: "Edgewater II",
    series: "TownHomes",
    beds: 4,
    baths: 3.5,
    sqft: 2305,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/edgewater-ii/",
    tagline: "A TownHomes home: 4 bedrooms, 3.5 baths and 2,305 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "escalade",
    name: "Escalade",
    series: "Painted Sheetrock",
    beds: 3,
    baths: 2,
    sqft: 1130,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/escalade/",
    tagline: "A Live Oak Homes Painted Sheetrock single section home: 3 bedrooms, 2 baths and 1,130 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "fancy",
    name: "Fancy",
    series: "Classic Oak",
    beds: 4,
    baths: 3,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/fancy/",
    planImage: "/photos/plans/fancy.webp",
    tagline: "A Live Oak Homes Classic Oak double section home: 4 bedrooms, 3 baths and 2,254 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "fat-boy",
    name: "Fat Boy",
    series: "Classic Oak",
    beds: 2,
    baths: 2,
    sqft: 830,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/fat-boy-2-bed-2-bath-830-sq-ft/",
    tagline: "A Live Oak Homes Classic Oak single section home: 2 bedrooms, 2 baths and 830 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "flagler",
    name: "Flagler",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1820,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/flagler/",
    planImage: "/photos/plans/flagler.webp",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,820 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "flash",
    name: "Flash",
    series: "Runner",
    beds: 3,
    baths: 2,
    sqft: 936,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/flash/",
    tagline: "A Live Oak Homes Runner double section home: 3 bedrooms, 2 baths and 936 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "gametime",
    name: "Gametime",
    series: "Suwannee Valley",
    beds: 4,
    baths: 3,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/gametime/",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 4 bedrooms, 3 baths and 2,254 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "guardian",
    name: "Guardian",
    series: "Suwannee Valley",
    beds: 4,
    baths: 2,
    sqft: 1768,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/guardian/",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 4 bedrooms, 2 baths and 1,768 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "gunner",
    name: "Gunner",
    series: "Runner",
    beds: 3,
    baths: 2,
    sqft: 1560,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/gunner/",
    tagline: "A Live Oak Homes Runner double section home: 3 bedrooms, 2 baths and 1,560 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "hamilton",
    name: "Hamilton",
    series: "Suwannee Valley",
    beds: 3,
    baths: 2,
    sqft: 1144,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/hamilton/",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 3 bedrooms, 2 baths and 1,144 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "haven",
    name: "Haven",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1456,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/haven/",
    planImage: "/photos/plans/haven.webp",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,456 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "high-country",
    name: "High Country",
    series: "Deluxe Drywall",
    beds: 4,
    baths: 2.5,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/high-country/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 4 bedrooms, 2.5 baths and 2,254 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "highlander",
    name: "Highlander",
    series: "Painted Sheetrock",
    beds: 4,
    baths: 3,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/highlander/",
    tagline: "A Live Oak Homes Painted Sheetrock double section home: 4 bedrooms, 3 baths and 2,254 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
    ),
  },
  {
    slug: "horizon",
    name: "Horizon",
    series: "Classic Oak",
    beds: 3,
    baths: 2,
    sqft: 1661,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/horizon/",
    tagline: "A Live Oak Homes Classic Oak double section home: 3 bedrooms, 2 baths and 1,661 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "jet",
    name: "Jet",
    series: "Runner",
    beds: 3,
    baths: 2,
    sqft: 1244,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/jet/",
    tagline: "A Live Oak Homes Runner double section home: 3 bedrooms, 2 baths and 1,244 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "keaton",
    name: "Keaton",
    series: "TownHomes",
    beds: 5,
    baths: 3,
    sqft: 2305,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/keaton/",
    tagline: "A TownHomes home: 5 bedrooms, 3 baths and 2,305 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "key-largo",
    name: "Key Largo",
    series: "TownHomes",
    beds: 4,
    baths: 2,
    sqft: 2612,
    status: "available",
    featured: true,
    sourceUrl: "https://westgatehomecenter.com/project/key-largo/",
    tagline: "A TownHomes home: 4 bedrooms, 2 baths and 2,612 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "kinder-lou",
    name: "Kinder Lou",
    series: "TownHomes",
    beds: 2,
    baths: 2,
    sqft: 1153,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/kinder-lou/",
    planImage: "/photos/plans/kinder-lou.webp",
    tagline: "A TownHomes home: 2 bedrooms, 2 baths and 1,153 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "lakeview",
    name: "Lakeview",
    series: "Deluxe Drywall",
    beds: 3,
    baths: 2,
    sqft: 1792,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/lakeview/",
    planImage: "/photos/plans/lakeview.webp",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 3 bedrooms, 2 baths and 1,792 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "laramie",
    name: "Laramie",
    series: "Deluxe Drywall",
    beds: 3,
    baths: 2,
    sqft: 1795,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/laramie/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 3 bedrooms, 2 baths and 1,795 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "lexi",
    name: "Lexi",
    series: "Signature Oak",
    beds: 2,
    baths: 2,
    sqft: 1130,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/lexi-2-bed-2-bath-1130-sq-ft/",
    planImage: "/photos/plans/lexi.webp",
    tagline: "A Live Oak Homes Signature Oak single section home: 2 bedrooms, 2 baths and 1,130 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "lightning",
    name: "Lightning",
    series: "Runner",
    beds: 2,
    baths: 2,
    sqft: 728,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/lightning/",
    tagline: "A Live Oak Homes Runner single section home: 2 bedrooms, 2 baths and 728 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "loki",
    name: "Loki",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1820,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/loki/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,820 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "madison",
    name: "Madison",
    series: "Suwannee Valley",
    beds: 3,
    baths: 2.5,
    sqft: 1664,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/madison/",
    planImage: "/photos/plans/madison.webp",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 3 bedrooms, 2.5 baths and 1,664 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "manning",
    name: "Manning",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1387,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/manning/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,387 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "marathon",
    name: "Marathon",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1941,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/marathon/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,941 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "marco-54",
    name: "Marco 54",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1440,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/marco-54/",
    planImage: "/photos/plans/marco-54.webp",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,440 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "marco-60",
    name: "Marco 60",
    series: "TownHomes",
    beds: 4,
    baths: 2,
    sqft: 1600,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/marco-60/",
    planImage: "/photos/plans/marco-60.webp",
    tagline: "A TownHomes home: 4 bedrooms, 2 baths and 1,600 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "merritt-island",
    name: "Merritt Island",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1941,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/merritt-island/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,941 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "monster-mansion",
    name: "Monster Mansion",
    series: "Signature Oak",
    beds: 5,
    baths: 3,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/monster-mansion/",
    tagline: "A Live Oak Homes Signature Oak double section home: 5 bedrooms, 3 baths and 2,254 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "naples",
    name: "Naples",
    series: "Signature Oak",
    beds: 3,
    baths: 2,
    sqft: 1127,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/naples/",
    tagline: "A Live Oak Homes Signature Oak single section home: 3 bedrooms, 2 baths and 1,127 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "nitro",
    name: "Nitro",
    series: "Suwannee Valley",
    beds: 3,
    baths: 2,
    sqft: 1560,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/nitro/",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 3 bedrooms, 2 baths and 1,560 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "palm-coast",
    name: "Palm Coast",
    series: "TownHomes",
    beds: 2,
    baths: 2,
    sqft: 910,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/palm-coast/",
    planImage: "/photos/plans/palm-coast.webp",
    tagline: "A TownHomes home: 2 bedrooms, 2 baths and 910 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "palmetto",
    name: "Palmetto",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1493,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/palmetto/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,493 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "paradise",
    name: "Paradise",
    series: "TownHomes",
    beds: 1,
    baths: 1,
    sqft: 499,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/paradise/",
    tagline: "A TownHomes home: 1 bedroom, 1 bath and 499 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "powerstroke",
    name: "Powerstroke",
    series: "Signature Oak",
    beds: 3,
    baths: 2,
    sqft: 1760,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/powerstroke/",
    tagline: "A Live Oak Homes Signature Oak double section home: 3 bedrooms, 2 baths and 1,760 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "predator",
    name: "Predator",
    series: "Classic Oak",
    beds: 4,
    baths: 2,
    sqft: 1820,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/predator-4-bed-2-bath-1820-sq-ft/",
    tagline: "A Live Oak Homes Classic Oak double section home: 4 bedrooms, 2 baths and 1,820 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "quail-ridge",
    name: "Quail Ridge",
    series: "Deluxe Drywall",
    beds: 4,
    baths: 3.5,
    sqft: 2254,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/quail-ridge/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 4 bedrooms, 3.5 baths and 2,254 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "raptor",
    name: "Raptor",
    series: "Signature Oak",
    beds: 4,
    baths: 2,
    sqft: 1542,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/raptor/",
    tagline: "A Live Oak Homes Signature Oak double section home: 4 bedrooms, 2 baths and 1,542 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "raven",
    name: "Raven",
    series: "Painted Sheetrock",
    beds: 3,
    baths: 2,
    sqft: 1260,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/raven/",
    tagline: "A Live Oak Homes Painted Sheetrock double section home: 3 bedrooms, 2 baths and 1,260 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
    ),
  },
  {
    slug: "riverfront",
    name: "Riverfront",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1153,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/riverfront/",
    planImage: "/photos/plans/riverfront.webp",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,153 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "rocky-mountain",
    name: "Rocky Mountain",
    series: "Deluxe Drywall",
    beds: 5,
    baths: 3,
    sqft: 2076,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/rocky-mountain/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 5 bedrooms, 3 baths and 2,076 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "santa-rosa",
    name: "Santa Rosa",
    series: "TownHomes",
    beds: 4,
    baths: 2,
    sqft: 1813,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/santa-rosa/",
    planImage: "/photos/plans/santa-rosa.webp",
    tagline: "A TownHomes home: 4 bedrooms, 2 baths and 1,813 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "serenity",
    name: "Serenity",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1413,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/serenity/",
    planImage: "/photos/plans/serenity.webp",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,413 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["porch", "Porch"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "siesta",
    name: "Siesta",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1227,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/siesta/",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,227 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "silverado",
    name: "Silverado",
    series: "Deluxe Drywall",
    beds: 3,
    baths: 2,
    sqft: 1352,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/silverado/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 3 bedrooms, 2 baths and 1,352 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "slingshot",
    name: "Slingshot",
    series: "Signature Oak",
    beds: 2,
    baths: 2,
    sqft: 830,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/slingshot/",
    tagline: "A Live Oak Homes Signature Oak single section home: 2 bedrooms, 2 baths and 830 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "slugger",
    name: "Slugger",
    series: "Classic Oak",
    beds: 3,
    baths: 2,
    sqft: 1130,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/slugger-3-bed-2-bath-1130-sq-ft/",
    tagline: "A Live Oak Homes Classic Oak single section home: 3 bedrooms, 2 baths and 1,130 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "sonic",
    name: "Sonic",
    series: "Runner",
    beds: 4,
    baths: 2,
    sqft: 1768,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/sonic/",
    tagline: "A Live Oak Homes Runner double section home: 4 bedrooms, 2 baths and 1,768 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "southern-charm",
    name: "Southern Charm",
    series: "Signature Oak",
    beds: 3,
    baths: 2,
    sqft: 1040,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/southern-charm/",
    tagline: "A Live Oak Homes Signature Oak double section home: 3 bedrooms, 2 baths and 1,040 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "spark",
    name: "Spark",
    series: "Runner",
    beds: 4,
    baths: 2,
    sqft: 1456,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/spark/",
    tagline: "A Live Oak Homes Runner double section home: 4 bedrooms, 2 baths and 1,456 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "spring-ridge",
    name: "Spring Ridge",
    series: "Suwannee Valley",
    beds: 3,
    baths: 2,
    sqft: 1352,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/spring-ridge/",
    planImage: "/photos/plans/spring-ridge.webp",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 3 bedrooms, 2 baths and 1,352 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "sprinter",
    name: "Sprinter",
    series: "Runner",
    beds: 3,
    baths: 2,
    sqft: 1456,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/sprinter/",
    tagline: "A Live Oak Homes Runner double section home: 3 bedrooms, 2 baths and 1,456 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "stoneybrook",
    name: "Stoneybrook",
    series: "TownHomes",
    beds: 2,
    baths: 2,
    sqft: 849,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/stoneybrook/",
    planImage: "/photos/plans/stoneybrook.webp",
    tagline: "A TownHomes home: 2 bedrooms, 2 baths and 849 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "tater-tot",
    name: "Tater Tot",
    series: "TownHomes",
    beds: 3,
    baths: 2,
    sqft: 1280,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/tater-tot/",
    planImage: "/photos/plans/tater-tot.webp",
    tagline: "A TownHomes home: 3 bedrooms, 2 baths and 1,280 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "telford",
    name: "Telford",
    series: "Suwannee Valley",
    beds: 4,
    baths: 2,
    sqft: 1525,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/telford/",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 4 bedrooms, 2 baths and 1,525 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "tortuga",
    name: "Tortuga",
    series: "TownHomes",
    beds: 4,
    baths: 3,
    sqft: 2305,
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/tortuga/",
    tagline: "A TownHomes home: 4 bedrooms, 3 baths and 2,305 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "tremor",
    name: "Tremor",
    series: "Deluxe Drywall",
    beds: 4,
    baths: 3,
    sqft: 1976,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/tremor/",
    tagline: "A Live Oak Homes Deluxe Drywall double section home: 4 bedrooms, 3 baths and 1,976 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "trenton",
    name: "Trenton",
    series: "Suwannee Valley",
    beds: 3,
    baths: 2,
    sqft: 1352,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/trenton/",
    tagline: "A Live Oak Homes Suwannee Valley double section home: 3 bedrooms, 2 baths and 1,352 square feet.",
    scenes: scenes(
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "troy",
    name: "Troy",
    series: "Suwannee Valley",
    beds: 3,
    baths: 2,
    sqft: 1127,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/troy/",
    tagline: "A Live Oak Homes Suwannee Valley single section home: 3 bedrooms, 2 baths and 1,127 square feet.",
    scenes: [],
  },
  {
    slug: "westchester",
    name: "Westchester",
    series: "TownHomes",
    beds: 4,
    baths: 2,
    sqft: 2305,
    status: "available",
    featured: true,
    sourceUrl: "https://westgatehomecenter.com/project/westchester/",
    planImage: "/photos/plans/westchester.webp",
    tagline: "A TownHomes home: 4 bedrooms, 2 baths and 2,305 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "windley",
    name: "Windley",
    series: "TownHomes",
    beds: 4,
    baths: 2,
    sqft: 2305,
    status: "available",
    featured: true,
    sourceUrl: "https://westgatehomecenter.com/project/windley/",
    tagline: "A TownHomes home: 4 bedrooms, 2 baths and 2,305 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "wrangler",
    name: "Wrangler",
    series: "Signature Oak",
    beds: 4,
    baths: 2,
    sqft: 1768,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/wrangler/",
    tagline: "A Live Oak Homes Signature Oak double section home: 4 bedrooms, 2 baths and 1,768 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "yellow-jacket",
    name: "Yellow Jacket",
    series: "Suwannee Valley",
    beds: 2,
    baths: 2,
    sqft: 830,
    sections: "single",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/yellow-jacket/",
    tagline: "A Live Oak Homes Suwannee Valley single section home: 2 bedrooms, 2 baths and 830 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "yellowstone",
    name: "Yellowstone",
    series: "Painted Sheetrock",
    beds: 4,
    baths: 2,
    sqft: 1958,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/yellowstone/",
    tagline: "A Live Oak Homes Painted Sheetrock double section home: 4 bedrooms, 2 baths and 1,958 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
    ),
  },
  {
    slug: "yukon",
    name: "Yukon",
    series: "Signature Oak",
    beds: 4,
    baths: 3,
    sqft: 1976,
    sections: "double",
    status: "available",
    sourceUrl: "https://westgatehomecenter.com/project/yukon/",
    tagline: "A Live Oak Homes Signature Oak double section home: 4 bedrooms, 3 baths and 1,976 square feet.",
    scenes: scenes(
      ["exterior", "Exterior"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bath", "Bath"],
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Accessors
 * ------------------------------------------------------------------ */

export function getListing(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function getPlan(listing: Listing): FloorPlan | undefined {
  return listing.planId ? floorPlans[listing.planId] : undefined;
}

export function featuredListings(): Listing[] {
  return listings.filter((l) => l.featured);
}

/** Homes that share a series or a community, minus the one being viewed. */
export function relatedListings(listing: Listing, count = 3): Listing[] {
  const scored = listings
    .filter((l) => l.slug !== listing.slug)
    .map((l) => ({
      listing: l,
      score:
        (l.series && l.series === listing.series ? 3 : 0) +
        (l.communitySlug && l.communitySlug === listing.communitySlug ? 2 : 0) +
        (l.beds === listing.beds ? 1 : 0) +
        (l.sqft !== undefined && listing.sqft !== undefined && Math.abs(l.sqft - listing.sqft) < 400
          ? 1
          : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.listing);
}

export const statusLabels: Record<ListingStatus, string> = {
  available: "Available",
  pending: "Sale pending",
  sold: "Sold",
  "coming-soon": "Coming soon",
};

export const sectionLabels: Record<Sections, string> = {
  single: "Single-section",
  double: "Double-section",
  triple: "Triple-section",
};

/**
 * A series rendered as a label. The lines on this lot are named for the
 * series alone — "Suwannee Valley", "Signature Oak" — and read as
 * "Suwannee Valley Series". A line whose own name already carries that noun
 * ("TownHomes", "... Collection") is left alone rather than doubled.
 */
export function seriesLabel(series: string): string {
  return /\b(series|collection|homes)$/i.test(series) ? series : `${series} Series`;
}

export const styleLabels: Record<ArchStyle, string> = {
  farmhouse: "Modern farmhouse",
  craftsman: "Craftsman",
  modern: "Modern",
  coastal: "Coastal cottage",
  lodge: "Mountain lodge",
  ranch: "Ranch",
};

/** Series present in the catalogue, so the facet list follows the data. */
export const seriesList: string[] = [
  ...new Set(listings.map((l) => l.series).filter((s): s is string => Boolean(s))),
].sort();

const priced = listings.filter((l): l is Listing & { price: number } => l.price !== undefined);

/** Whether any home carries a price at all — the price UI hides when none do. */
export const hasPrices = priced.length > 0;

export const priceBounds = {
  min: hasPrices ? Math.min(...priced.map((l) => l.price)) : 0,
  max: hasPrices ? Math.max(...priced.map((l) => l.price)) : 0,
};

/* ------------------------------------------------------------------ *
 * Size categories
 * ------------------------------------------------------------------ */

/**
 * The four buckets a buyer actually shops by — tiny, single, double, triple.
 *
 * A note on how these are decided, because it matters. The obvious approach
 * is to sort purely on square footage, and plenty of dealership sites do
 * exactly that. It produces a lie: a 1,000-square-foot double-section home
 * filed under "Single wide" is a claim about its width, and it is wrong.
 *
 * So width comes from `sections`, which is the field that actually records
 * it, and square footage is only used for the tiny bucket and as the
 * fallback for a home whose `sections` was never filled in. The footprint
 * ranges shown under each label are computed from the homes really in that
 * bucket rather than being printed from a table, so they cannot drift away
 * from the catalogue either.
 */
export type SizeCategory = "tiny" | "single" | "double" | "triple";

/** Anything under this is a tiny home whatever its section count. */
const TINY_MAX_SQFT = 800;

/* Only reached by a home with no `sections` value — see the note above. */
const SQFT_FALLBACK: [number, SizeCategory][] = [
  [TINY_MAX_SQFT, "tiny"],
  [1200, "single"],
  [2000, "double"],
];

export function sizeCategoryOf(listing: Listing): SizeCategory {
  /* A declared section count wins outright, square footage included. "Single
     wide" is a claim about width, and a dealership that files a 750 sq ft
     single section under its own single-wide category has told us where the
     home belongs — re-filing it as a tiny home because it is under 800 feet
     would be contradicting the source with arithmetic.
     Square footage only buckets a home that declares no sections, and the
     `tiny` cut lives there; a home that declares neither cannot be measured
     at all and falls to the smallest bucket rather than the largest. */
  if (listing.sections) return listing.sections;
  if (listing.sqft === undefined) return "single";
  const sqft = listing.sqft;
  const match = SQFT_FALLBACK.find(([ceiling]) => sqft < ceiling);
  return match ? match[1] : "triple";
}

export const sizeCategoryLabels: Record<SizeCategory, string> = {
  tiny: "Tiny home",
  single: "Single wide",
  double: "Double wide",
  triple: "Triple wide",
};

/* The glyph on each bucket's button. Emoji rather than drawn icons on
   purpose: there is no icon set with four house silhouettes that read as
   "wider than the last one" at 32 pixels, and these do. Swap them for an
   `Icon` if a deployment would rather not use emoji. */
export const sizeCategoryGlyphs: Record<SizeCategory, string> = {
  tiny: "🏠",
  single: "🏡",
  double: "🏘️",
  triple: "🏰",
};

export const sizeCategoryOrder: SizeCategory[] = ["tiny", "single", "double", "triple"];

export type SizeCategoryFacet = {
  id: SizeCategory;
  label: string;
  /** How many homes are in it. Zero means the button is not worth showing. */
  count: number;
  /** The real footprint range of the homes in it, e.g. "812–1,144 sq ft". */
  range?: string;
  /** The glyph on the button. */
  glyph: string;
};

/** The four buckets, measured against whatever catalogue is passed in. */
export function sizeCategoryFacets(from: Listing[] = listings): SizeCategoryFacet[] {
  return sizeCategoryOrder.map((id) => {
    const inBucket = from.filter((l) => sizeCategoryOf(l) === id);
    /* A bucket's range is drawn from the homes in it that publish a
       footprint; a home that publishes none is counted but does not widen
       the range it is not measured on. */
    const sizes = inBucket.flatMap((l) => (l.sqft === undefined ? [] : [l.sqft]));
    const low = Math.min(...sizes);
    const high = Math.max(...sizes);
    return {
      id,
      label: sizeCategoryLabels[id],
      glyph: sizeCategoryGlyphs[id],
      count: inBucket.length,
      range: sizes.length
        ? low === high
          ? `${low.toLocaleString()} sq ft`
          : `${low.toLocaleString()}–${high.toLocaleString()} sq ft`
        : undefined,
    };
  });
}
