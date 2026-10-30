export type Community = {
  slug: string;
  name: string;
  city: string;
  state: string;
  blurb: string;
  /** Whether homesites here are owned or leased. */
  tenure: "Land-lease" | "Resident-owned" | "Fee-simple lots";

  /* Everything below is optional, because these are real communities run by
     someone else and only some of it is published. An absent figure is
     hidden from the UI rather than guessed at — see the note above the
     array. */

  /** Who runs the community, where it is a managed property. */
  operator?: string;
  /** The community's own page, so a buyer can check us against the source. */
  url?: string;
  /** Monthly lot rent, where the operator publishes one. */
  lotRent?: number;
  /** Approximate homesites in the community. */
  sites?: number;
  available?: number;
  established?: number;
  amenities?: string[];
};

/* ------------------------------------------------------------------ *
 * The communities
 *
 * Empty, on purpose.
 *
 * Westgate Home Center offers land and home packages and names no
 * manufactured-home community it places into or has an arrangement with.
 * Listing one anyway would be a claim about somebody else's property as
 * well as about this business, so there is nothing here and
 * `communities` is switched off in `lib/page-config.ts` to match.
 *
 * If the dealership does start placing homes into named communities, add
 * them here from the operator's own pages, fill in only the figures those
 * pages publish, point each listing's `communitySlug` at one, and turn the
 * page back on. Lot rents, homesite counts and vacancy change constantly:
 * an absent figure hides itself, an out-of-date one gets quoted at you.
 * ------------------------------------------------------------------ */

export const communities: Community[] = [];

export function getCommunity(slug: string): Community | undefined {
  return communities.find((c) => c.slug === slug);
}
