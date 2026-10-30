<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Westgate Home Center — where things live

This is the manufactured-home dealership site for Westgate Home Center,
4431 NW 13th St, Gainesville, Florida, built on the Hearthline template.
Almost every change is a data change; routes derive from the data and should
rarely be edited directly.

```
lib/homes.ts        The catalogue. Prices, specs, copy, features, scenes.
lib/floor-plans.ts  Room geometry in feet. Rooms must tile the footprint.
lib/communities.ts  Communities, tenure, lot rents, amenities.
lib/photos.ts       Every photograph on the site, by key. Absent key =
                    an empty plate; the site shows photographs only.
lib/site.ts         Business name, phone, address, canonical URL.
lib/page-config.ts  Which bands the landing page renders, in what order,
                    and which routes exist at all. Turning a page off
                    redirects it to `/` and removes its links everywhere.
                    Also the two pieces of phone chrome: `callBar`, the
                    strip above the header, and `floatingCall`.
lib/navigation.ts   Header, drawer and footer links, filtered through
                    page-config. Add a route here, not as a stray anchor.
lib/faq.ts          The questions. `/faq` shows all of them, the foot of
                    `/why-manufactured` shows the first six.
lib/promotions.ts   Live offers, each with an end date. Ships empty.
lib/blog.ts         Posts. Ships empty; `/blog` is switched off to match.
lib/custom-pages.ts Campaign pages at `/p/<slug>` — the landing page
                    narrowed to one series. Ships empty.
lib/legal.ts        Privacy and terms clauses. A draft to be reviewed by
                    a lawyer, not legal advice.
lib/company.ts      What the business claims about itself — founding year,
                    staff, principles, warranty, deposit terms. Every field
                    optional; an absent one hides its section rather than
                    being guessed at.
lib/market.ts       Facts true of this market only — counties, wind and
                    thermal zone, state titling, USDA notes. Also optional;
                    the copy falls back to a portable sentence.
lib/land/           Everything behind /land-deals: `areas.ts` prices each
                    county in the delivery radius, `geo.ts` holds the lot's
                    coordinates and the projection, and the generated file
                    holds the county boundaries. Market data in the sense
                    above — true of one radius and of no other. STILL THE
                    TEMPLATE'S NORTH FLORIDA DATA, and `landDeals` is off in
                    `lib/page-config.ts` because of it: this dealership
                    publishes no county-by-county land pricing. Replace these
                    with the business's own figures before turning the page on.
lib/skin.ts         Skins: the whole palette, the brand gradient, the
                    typeface pairing, the corner radii and the primary
                    button, as data. Three ship — `hearthline` (warm and
                    editorial, a serif on limestone), `nerto` (white ground,
                    slate type, a blue-to-orange gradient on every primary
                    button, system sans — the look a Mobile Home Manager
                    deployment wears), `country` (the previous dealership's
                    sage and olive) and `westgate`, which is `nerto` wearing
                    this dealership's own blue and orange, taken from its
                    live site rather than guessed at. `activeSkin` picks
                    one — it is `westgate` — and that one line restyles the
                    site.
app/globals.css     Token structure and the fallback values. A skin
                    overrides whatever it names; edit here to restyle one
                    deployment without adding a skin.
components/landing.tsx
                    The landing page, as an ordered list of switchable
                    bands. `/` and every `/p/<slug>` render it — edit the
                    band here and both follow. It ships in the short,
                    conversion-shaped order: hero, offer, one wide
                    photograph, reviews, three steps, the catalogue, the
                    closing call and form, the hours. Eight more bands are
                    written, styled and switched off — among them the whole
                    editorial argument for a manufactured home (`ticker`,
                    `numbers`, `myth`, `cutaway`) — each one `true` away.
```

The catalogue is at `/listings`; `/homes` permanently redirects there. The
data file is still `lib/homes.ts` — the route was renamed, the file was not.

It holds the homes on Westgate's own site — Live Oak Homes and TownHomes —
read from westgatehomecenter.com. `scripts/westgate-catalogue.json` is the
parsed scrape, `scripts/westgate-selection.json` says which gallery image
fills which scene (and which is the printed plan), and
`scripts/import-westgate.mjs` rebuilds the catalogue, the contact sheets and
the photography from them. Node's fetch does not read `HTTPS_PROXY` on its
own, so run it as `NODE_USE_ENV_PROXY=1 node scripts/import-westgate.mjs …`.
The dealership publishes NO prices — its pages say to call for current
pricing — so no listing has one and every home reads "Call for pricing".
Many homes have no exterior or bedroom photograph at the source; they
declare only the scenes they have.

Homes are browsed by size first — tiny, single, double, triple. The bucket
comes from `sections` where the home has one, never from square footage
alone, because "single wide" is a claim about width and filing a 1,000 sq ft
double-section home under it would be false. Buckets with no homes in them
are not rendered.

Detailed conventions and recipes are in `.claude/skills/` — `homes`,
`photos`, `brand`, `voice` and `land-deals`. Read the matching one before
editing; it is the contract for these files. `EDITING.md` is the same ground
for the human asking.

Never invent a fact about the business. If a dealership does not publish
its founding year, its staff or its warranty terms, delete the field in
`lib/company.ts` — the page shortens itself. `npm run check:placeholders`
(part of `npm run lint`) lists the template's fictional values still in
place, and fails outright once `NEXT_PUBLIC_SITE_URL` is a real domain.

Roughly 5,000 words of editorial copy in `components/landing.tsx`,
`lib/faq.ts` and on `/why-manufactured`, `/start-here`, `/land-deals` and
`/financing` are the template's own writing, and every deployment ships them identically. That is fine for one site and a problem
for the second one sold into the same market. `npm run check:boilerplate`
scores how much is still verbatim; the `voice` skill does the rewrite, which
keeps a locked list of facts intact.

Run `npm run lint` and `npm run build` before reporting a change done.
