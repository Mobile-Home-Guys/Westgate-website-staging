/**
 * Business identity.
 *
 * Westgate Home Center is a manufactured- and modular-home dealership at
 * 4431 NW 13th Street in Gainesville, Florida, trading since 1961. Every
 * value below was read from what the business publishes on its own site,
 * westgatehomecenter.com — nothing here is inferred. The telephone number
 * dials and the address is the lot.
 */
export const site = {
  name: "Westgate Home Center",
  short: "Westgate",
  tagline: "Discover the Westgate Difference",
  description:
    "Manufactured and modular homes in Gainesville, Florida, serving North Florida since 1961. Live Oak Homes and TownHomes at factory-direct prices — walk them, price them, and we handle financing, delivery and setup.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://westgatehomecenter.com",
  phone: "(352) 378-2453",
  phoneHref: "tel:+13523782453",
  email: "matt.westgatehomes@gmail.com",
  address: {
    street: "4431 NW 13th St",
    city: "Gainesville",
    region: "FL",
    postalCode: "32609",
    country: "US",
  },
  hours: "Mon–Fri, 9am–6pm · Sat, 9am–5pm · Sunday closed",
  /**
   * The same opening hours, day by day, for the table on `/address` and the
   * landing page's location band. It has to agree with `hours` above — the
   * two are the same fact written twice, and a visitor who finds them
   * disagreeing will believe neither.
   */
  hoursByDay: [
    { day: "Monday", hours: "9:00 AM – 6:00 PM" },
    { day: "Tuesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Wednesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Thursday", hours: "9:00 AM – 6:00 PM" },
    { day: "Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 5:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ] as { day: string; hours: string }[] | undefined,
} as const;
