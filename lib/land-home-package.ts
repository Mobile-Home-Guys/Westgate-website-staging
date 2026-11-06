/**
 * How Westgate's land and home package works, in the dealership's own words —
 * the sheet the office hands a buyer who asks. Three steps, because a
 * stranger deciding whether to ring reads three and skims five.
 *
 * Two places show it: the "How it works" band on `/` and the standalone
 * `/land-home-package` page sent to leads. Edit here and both follow.
 * Every claim below is the business's; do not add to it without them.
 */
export const LAND_HOME_STEPS = [
  {
    title: "Find your land",
    body: "Look with a realtor (we can refer one who can help), browse listings online on sites like LandWatch.com, or buy from a private seller.",
  },
  {
    title: "Get prequalified",
    body: "Get prequalified with a lender approved for manufactured home construction loans. We have several options in our office to help with this.",
  },
  {
    title: "Pick out your new home",
    body: "We take your approval and the land you've chosen, and roll everything you need to move in (well, septic, power and permits) into one land and home package.",
  },
];

/** What the package rolls in beyond the home itself, from the same sheet. */
export const LAND_HOME_INCLUDED = ["Well", "Septic", "Power", "Permits"];
