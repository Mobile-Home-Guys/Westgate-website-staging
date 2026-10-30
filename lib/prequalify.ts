/**
 * The credit-application panel on `/financing`.
 *
 * Not to be confused with `pages.prequalify` in `lib/page-config.ts`, which
 * switches the standalone `/prequalify` route (its own in-house lead form)
 * on and off — this file is the content for the panel that sits on the
 * financing page itself.
 *
 * Westgate Home Center publishes a credit application package on its own
 * site (the "Credit App" link in its menu, a PDF from 21st Mortgage), and no
 * online pre-qualification widget, so the panel points there. `embedSnippet`
 * is left empty on purpose: the previous dealership's QualifyWizard dealer ID
 * is not Westgate's, and the plugin renders nothing on a mismatched domain.
 * If Westgate signs up for an embedded pre-qualification service, put its
 * own snippet in `embedSnippet` and the panel renders it in place of the
 * button.
 *
 * With `embedSnippet` empty the panel falls back to a `buttonText` link
 * pointing at `externalApplicationLink`, opening it in a new tab. Leave both
 * empty and the whole panel disappears — see `PrequalifyPanel`.
 */
export type Prequalify = {
  headline: string;
  subtext: string;
  buttonText: string;
  /** The "No SSN required" reassurance badge above the copy. */
  showNoSSNBadge: boolean;
  /** The "always selling" explainer — one paragraph per string. */
  body: string[];
  /** The dealer's own QualifyWizard (or equivalent) embed script, unmodified. */
  embedSnippet?: string;
  /** Only read when `embedSnippet` is empty. */
  externalApplicationLink?: string;
};

export const prequalify: Prequalify = {
  headline: "Start your credit application",
  subtext: "Download Westgate's credit application package.",
  buttonText: "Open the Credit App",
  showNoSSNBadge: false,
  body: [
    "Financing a home starts with a credit application. Westgate Home Center's package is a PDF you can fill in at home and bring by the sales center, or send to us.",
    "If you would rather talk it through first, call us. We will walk you through what the application asks for before you fill it in, and nothing about asking commits you to a home or a lender.",
  ],
  externalApplicationLink:
    "https://westgatehomecenter.com/wp-content/uploads/2021/09/21st-Mort-Credit-App-Package-12-1-20.pdf",
};
