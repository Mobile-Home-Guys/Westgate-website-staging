import Link from "next/link";
import { Container, Icon } from "./ui";
import { legalNav } from "@/lib/navigation";
import { site } from "@/lib/site";

/* A business name that already ends in a full stop must not get a second one
   from a sentence that ends with it. */
const nameSentence = site.name.replace(/\.$/, "");

/* The one service-area line the dealership publishes, in its own words. */
const SERVICE_AREA =
  "Westgate Home Center proudly serves North Florida with quality manufactured and " +
  "modular homes, offering modern floor plans, customizable options, and affordable " +
  "solutions backed by dependable service and financing support. We pledge to the " +
  "letter and the spirit of the United States policy for the achievement of equal " +
  "housing opportunity throughout the Nation.";

const mapQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
);

/**
 * The legal footer: the business, its address, its number, the copyright and
 * the two legal links. Nothing else.
 *
 * The sitemap-in-columns footer this replaced was the right shape for a site
 * you read. On a site you act on, the deep links are noise at the one point a
 * visitor has either called or gone — and the address and hours a visitor
 * actually wants are already directly above, in `components/location-hours.tsx`.
 * Everything reachable only from here was already reachable from the header
 * and the drawer.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-6 text-xs text-muted">
      <Container className="!px-0">
        <div className="mx-auto mb-5 grid gap-6 sm:max-w-md">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-ink">{site.name}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-start justify-center gap-1.5 hover:underline sm:justify-start"
            >
              <Icon.Pin className="mt-px size-3.5 shrink-0" />
              <span>
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postalCode}
              </span>
            </a>
            <a
              href={site.phoneHref}
              className="mt-1 flex items-center justify-center gap-1.5 hover:underline sm:justify-start"
            >
              <Icon.Phone className="size-3.5 shrink-0" />
              <span>{site.phone}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4">
          <span>
            © {new Date().getFullYear()} {nameSentence}. All rights reserved.
          </span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <div className="flex items-center gap-4">
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} className="underline hover:no-underline">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Two things this footer has to say. The service-area line is the
            dealership's own, from its site. The pricing and imagery note
            says the dealership publishes no prices here and that the
            photographs may show options that are not standard. */}
        <p className="mx-auto mt-6 max-w-3xl text-center leading-relaxed text-muted/80">
          {SERVICE_AREA}
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-center leading-relaxed text-muted/80">
          For the most current pricing and specials, call {site.phone}. Images are the
          manufacturer&rsquo;s and may show options not included in the base price.
          Specifications and availability change; nothing here is an offer to sell.
        </p>
      </Container>
    </footer>
  );
}
