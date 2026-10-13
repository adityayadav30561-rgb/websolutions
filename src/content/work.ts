/**
 * Real client work: websites, apps and search campaigns.
 * Screenshots live in public/work/<folder>/. Website pages are captured with
 * `node scripts/capture.mjs`; app screens and analytics proofs are supplied files.
 */

export type Shot = { src: string; alt: string; label?: string };

type Base = {
  slug: string;
  name: string;
  category: string;
  /** One line for tiles and cards. */
  line: string;
  /** Longer description for the project page. */
  summary: string;
  /** Tile background and the text colour that sits on it. */
  tint: { bg: string; fg: "dark" | "light" };
  link: { href: string; label: string };
};

export type WebProject = Base & {
  kind: "web";
  /** Full-page captures; they scroll inside their frames. */
  desktop: string;
  mobile: string;
};

export type AppProject = Base & {
  kind: "app";
  platforms: string;
  features: string[];
  banner: Shot;
  screens: Shot[];
  /** One long capture of the opening screen; it scrolls inside the phone. Without it the phone steps through `screens`. */
  scroll?: string;
};

export type SeoProject = Base & {
  kind: "seo";
  place: string;
  metric: string;
  metricLabel: string;
  period: string;
  stats: { value: string; label: string }[];
  findings: string[];
  /** Single-screen stills, used if a full-page capture is missing. */
  desktop: string;
  mobile: string;
  /** Full-page captures of the live site; they scroll inside their frames. */
  page: string;
  pageMobile: string;
  proofs: { src: string; caption: string }[];
};

export type Project = WebProject | AppProject | SeoProject;

export const kindLabel: Record<Project["kind"], string> = { web: "Websites", app: "Apps", seo: "Search" };

const w = (folder: string, file: string) => `/work/${folder}/${file}.webp`;

const web = (p: Omit<WebProject, "kind" | "desktop" | "mobile"> & { folder: string }): WebProject => {
  const { folder, ...rest } = p;
  return { kind: "web", desktop: w(folder, "desktop"), mobile: w(folder, "mobile"), ...rest };
};

const screen = (folder: string, file: string, label: string, alt: string): Shot => ({ src: w(folder, file), label, alt });

const proofs = (folder: string, ga: string | null, gsc: string) => [
  ...(ga ? [{ src: w(folder, "proof-ga"), caption: ga }] : []),
  { src: w(folder, "proof-gsc"), caption: gsc },
  { src: w(folder, "proof-ai"), caption: "Google Search Console, generative AI features report" },
];

export const projects: Project[] = [
  /* ───────────── Websites ───────────── */
  web({
    folder: "sitco",
    slug: "sitco-india",
    name: "SITCO India",
    category: "Export house website",
    line: "Handcrafted and natural exports from Uttar Pradesh, presented for global buyers.",
    summary: "A website for an Uttar Pradesh export house selling handcrafted, organic, GI-tag and natural fibre collections to design-led buyers abroad.",
    tint: { bg: "#ece4d6", fg: "dark" },
    link: { href: "https://sitcobusiness.vercel.app/", label: "sitcobusiness.vercel.app" },
  }),
  web({
    folder: "ashville",
    slug: "ashville-homes",
    name: "AshVille Homes",
    category: "Real estate website",
    line: "Luxury homes in North Goa.",
    summary: "A website for AshVille Homes, presenting luxury living in North Goa.",
    tint: { bg: "#dfe6e2", fg: "dark" },
    link: { href: "https://www.ashvillebaga.com/", label: "ashvillebaga.com" },
  }),
  web({
    folder: "hues",
    slug: "hues-boutique-hotel",
    name: "Hues Boutique Hotel",
    category: "Hotel website",
    line: "The website for a boutique hotel.",
    summary: "A website for Hues Boutique Hotel.",
    tint: { bg: "#ebe3da", fg: "dark" },
    link: { href: "https://huesboutiquehotel.com/", label: "huesboutiquehotel.com" },
  }),
  web({
    folder: "kshipra",
    slug: "kshipra-health",
    name: "Kshipra Health",
    category: "Dermo-cosmetic brand website",
    line: "Beauty and health products from a dermo-cosmetic brand.",
    summary: "A website for Kshipra Health Solutions, a dermo-cosmetic brand selling beauty and health products.",
    tint: { bg: "#e4ecef", fg: "dark" },
    link: { href: "https://kshiprahealth.com/", label: "kshiprahealth.com" },
  }),
  web({
    folder: "aarika",
    slug: "aarika-fabric-care",
    name: "Aarika Fabric Care",
    category: "Local service website",
    line: "Laundry and dry cleaning in Daliganj, Lucknow, with home pickup.",
    summary: "A website for a laundry, dry cleaning and steam ironing service in Daliganj, Lucknow, built around free home pickup and a 24 to 48 hour turnaround.",
    tint: { bg: "#dfeaf3", fg: "dark" },
    link: { href: "https://laundry-three-gamma.vercel.app/", label: "laundry-three-gamma.vercel.app" },
  }),
  web({
    folder: "blueorbit",
    slug: "blue-orbit-digi",
    name: "Blue Orbit Digi",
    category: "Marketing agency website",
    line: "Small business marketing, priced in the open.",
    summary: "A website for a small business marketing agency that publishes its prices: websites, Google Business, SEO and social, with no lock-in contracts.",
    tint: { bg: "#dde4f6", fg: "dark" },
    link: { href: "https://blueorbitdigi.com/", label: "blueorbitdigi.com" },
  }),
  web({
    folder: "easywebsolns",
    slug: "easywebsolns",
    name: "EasyWebSolns",
    category: "Agency website",
    line: "Websites and apps that work for you.",
    summary: "A website for EasyWebSolns: website design and development, mobile apps for iOS, Android and the web, SEO and ongoing care for growing businesses.",
    tint: { bg: "#e8e6f4", fg: "dark" },
    link: { href: "https://easywebsolutions.vercel.app/", label: "easywebsolutions.vercel.app" },
  }),

  /* ───────────── Apps ───────────── */
  {
    kind: "app",
    slug: "maharishi-ayurveda",
    name: "Maharishi Ayurveda",
    category: "Wellness store app",
    platforms: "iOS, Android and web",
    line: "A shopping app that starts with the customer, not the catalogue.",
    summary: "A shopping app that starts with the customer rather than the catalogue. It learns their goals and constitution, suggests a daily routine, and books consultations with an Ayurvedic doctor.",
    features: ["Wellness profile", "Daily rituals", "Shop by how you feel", "Doctor consultations"],
    tint: { bg: "#2b1a10", fg: "light" },
    link: { href: "https://maharishi-ayurveda.expo.app/", label: "Open the live demo" },
    scroll: w("maharishi", "scroll"),
    banner: { src: w("maharishi", "hero"), alt: "Four Maharishi Ayurveda screens: home, product, consultation and wellness profile" },
    screens: [
      screen("maharishi", "home", "Home", "Home screen with a greeting, the active order and wellness needs"),
      screen("maharishi", "product", "Product", "Product page with pack choice, price and ratings"),
      screen("maharishi", "consult", "Consult", "Screen for booking a consultation with an Ayurvedic doctor"),
      screen("maharishi", "ritual", "Ritual", "Profile with constitution and today's ritual tracker"),
      screen("maharishi", "explore", "Explore", "Explore screen"),
      screen("maharishi", "onboarding", "Onboarding", "Onboarding screen"),
    ],
  },
  {
    kind: "app",
    slug: "toys-cartel",
    name: "Toys Cartel",
    category: "Toy store app",
    platforms: "iOS, Android and web",
    line: "A toy shop for busy parents, organised by age.",
    summary: "A toy shop for busy parents. Toys are organised by age, offers apply themselves in the cart, and every product page answers the real questions up front.",
    features: ["Shop by age", "Offers that apply themselves", "Guest checkout"],
    tint: { bg: "#fbe3c6", fg: "dark" },
    link: { href: "https://toyscartel.expo.app/", label: "Open the live demo" },
    scroll: w("toys", "scroll"),
    banner: { src: w("toys", "hero"), alt: "Toys Cartel app screens" },
    screens: [
      screen("toys", "home", "Home", "Home screen with deals, shop by age and categories"),
      screen("toys", "categories", "Browse", "Browse screen with age chips and category tiles"),
      screen("toys", "product", "Product", "Product page"),
      screen("toys", "cart", "Cart", "Cart with offer progress and a price breakdown"),
      screen("toys", "results", "Results", "Search results screen"),
      screen("toys", "onboarding", "Onboarding", "Onboarding screen"),
    ],
  },
  {
    kind: "app",
    slug: "event-intelligence-india",
    name: "Event Intelligence India",
    category: "Events planner app",
    platforms: "iOS, Android and installable web app",
    line: "Conferences and expos across India, scored against a team's interests.",
    summary: "An internal tool for a team that travels to professional events. It gathers conferences and expos from across India, scores each against the team's interests, and carries them through to the day itself.",
    features: ["Plain-English search", "Relevance scoring", "Map of India", "Event Day mode"],
    tint: { bg: "#131f6b", fg: "light" },
    link: { href: "https://event-intelligence-india.expo.app/", label: "Open the live demo" },
    banner: { src: w("eii", "hero"), alt: "Event Intelligence India app screens" },
    screens: [
      screen("eii", "home", "Home", "Home screen with upcoming events and search"),
      screen("eii", "map", "Map", "Map of India with clustered event counts"),
      screen("eii", "detail", "Event", "Event detail with register, website and directions"),
      screen("eii", "calendar", "Calendar", "Calendar with the day's events"),
      screen("eii", "day", "Event Day", "Event Day screen with next session and checklist"),
      screen("eii", "explore", "Explore", "Explore screen"),
    ],
  },

  /* ───────────── Search campaigns ───────────── */
  {
    kind: "seo",
    slug: "khadi-organique",
    name: "Khadi Organique",
    category: "Search, natural beauty store",
    place: "India",
    line: "Natural skincare and hair care, sold in India and abroad.",
    summary: "Natural skincare, hair care and aromatherapy, sold in India and abroad.",
    metric: "+9,517%",
    metricLabel: "conversions",
    period: "March to July 2026, against the previous period",
    stats: [
      { value: "1.19M", label: "search impressions" },
      { value: "59.4K", label: "appearances in AI results" },
      { value: "10.3K", label: "clicks from Google" },
    ],
    findings: [
      "Conversions rose 9,517% while page views grew 46%: the right visitors, doing the right things.",
      "Engagement rate moved from about 40% to about 95% in May and stayed there.",
    ],
    tint: { bg: "#f1e6d4", fg: "dark" },
    link: { href: "https://khadiorganique.com/", label: "khadiorganique.com" },
    desktop: w("khadi", "desktop"),
    mobile: w("khadi", "mobile"),
    page: w("khadi", "page"),
    pageMobile: w("khadi", "page-mobile"),
    proofs: proofs("khadi", "Google Analytics 4, 1 Mar to 31 Jul 2026", "Google Search Console, performance over 6 months"),
  },
  {
    kind: "seo",
    slug: "badowl",
    name: "Badowl",
    category: "Search, riding gear store",
    place: "India",
    line: "An online store for riding and sports protection gear.",
    summary: "An online store for riding and sports protection gear.",
    metric: "+7,245%",
    metricLabel: "active users",
    period: "February to September 2026, against the previous period",
    stats: [
      { value: "311K", label: "active users" },
      { value: "6.2K", label: "purchases" },
      { value: "8.7%", label: "click-through rate" },
    ],
    findings: [
      "Purchases grew alongside traffic: 6.2K orders, up 6,537% on the previous period.",
      "An 8.7% click-through rate at an average position of 7.5. When Badowl appears, people click.",
    ],
    tint: { bg: "#e6e0fb", fg: "dark" },
    link: { href: "https://badowl.in/", label: "badowl.in" },
    desktop: w("badowl", "desktop"),
    mobile: w("badowl", "mobile"),
    page: w("badowl", "page"),
    pageMobile: w("badowl", "page-mobile"),
    proofs: proofs("badowl", "Google Analytics 4, 1 Feb to 25 Sep 2026", "Google Search Console, performance"),
  },
  {
    kind: "seo",
    slug: "kama-health-india",
    name: "Kama Health India",
    category: "Search, online therapy practice",
    place: "India",
    line: "An online therapy practice led by a clinical psychologist.",
    summary: "An online sex and relationship therapy practice led by a clinical psychologist.",
    metric: "+1,484%",
    metricLabel: "active users",
    period: "March to September 2026, against the previous period",
    stats: [
      { value: "66.9K", label: "search impressions" },
      { value: "10.3K", label: "appearances in AI results" },
      { value: "3.87K", label: "clicks from Google" },
    ],
    findings: [
      "104K people reached on a subject most hesitate to search for.",
      "Engaged sessions grew fastest of all, up 1,983%: visitors stayed to read.",
      "An average position of 7.8 puts the practice on the first page of Google.",
    ],
    tint: { bg: "#fbe1e1", fg: "dark" },
    link: { href: "https://kamahealthindia.com/", label: "kamahealthindia.com" },
    desktop: w("kama", "desktop"),
    mobile: w("kama", "mobile"),
    page: w("kama", "page"),
    pageMobile: w("kama", "page-mobile"),
    proofs: proofs("kama", "Google Analytics 4, 1 Mar to 25 Sep 2026", "Google Search Console, performance"),
  },
  {
    kind: "seo",
    slug: "7-seas-matrix",
    name: "7 Seas Matrix Logistics",
    category: "Search, freight and logistics",
    place: "Dubai, UAE",
    line: "Air and ocean freight, warehousing and customs from Dubai.",
    summary: "Air and ocean freight, warehousing and customs brokerage from Dubai and JAFZA.",
    metric: "+418%",
    metricLabel: "active users",
    period: "January to September 2026, against the previous period",
    stats: [
      { value: "161K", label: "search impressions" },
      { value: "7.37K", label: "appearances in AI results" },
      { value: "2.38K", label: "clicks from Google" },
    ],
    findings: [
      "New users up 414% in a competitive business-to-business market.",
      "Daily impressions grew from near zero in late 2025 to 500–750 by August 2026.",
    ],
    tint: { bg: "#d9e9ec", fg: "dark" },
    link: { href: "https://www.7seasmatrix.com/", label: "7seasmatrix.com" },
    desktop: w("sevenseas", "desktop"),
    mobile: w("sevenseas", "mobile"),
    page: w("sevenseas", "page"),
    pageMobile: w("sevenseas", "page-mobile"),
    proofs: proofs("sevenseas", "Google Analytics 4, 1 Jan to 25 Sep 2026", "Google Search Console, performance"),
  },
  {
    kind: "seo",
    slug: "fresh-light-photography",
    name: "Fresh Light Photography",
    category: "Search, newborn photography studio",
    place: "Houston, USA",
    line: "A newborn and maternity photography studio in Houston Heights.",
    summary: "A newborn and maternity photography studio in Houston Heights, Texas.",
    metric: "503K",
    metricLabel: "search impressions",
    period: "September 2025 to September 2026",
    stats: [
      { value: "19.3K", label: "appearances in AI results" },
      { value: "1.76K", label: "clicks from Google" },
      { value: "14.3", label: "average position" },
    ],
    findings: [
      "Over half a million appearances in Google Search in a year for one local studio.",
      "Steady visibility all year, at 1,000–1,500 impressions a day.",
    ],
    tint: { bg: "#ece6e2", fg: "dark" },
    link: { href: "https://fresh-light-photography.com/", label: "fresh-light-photography.com" },
    desktop: w("freshlight", "desktop"),
    mobile: w("freshlight", "mobile"),
    page: w("freshlight", "page"),
    pageMobile: w("freshlight", "page-mobile"),
    proofs: proofs("freshlight", null, "Google Search Console, last 12 months"),
  },
];

/** The scrolling desktop and phone captures for a website or search project. */
export const sitePages = (p: WebProject | SeoProject) => (p.kind === "seo" ? { desktop: p.page, mobile: p.pageMobile, fallback: { desktop: p.desktop, mobile: p.mobile } } : { desktop: p.desktop, mobile: p.mobile, fallback: undefined });

export function find<K extends Project["kind"]>(slug: string, kind: K) {
  const p = projects.find((x) => x.slug === slug && x.kind === kind);
  if (!p) throw new Error(`Unknown ${kind} project: ${slug}`);
  return p as Extract<Project, { kind: K }>;
}

/**
 * The homepage shows only these, one per slot. Swap slugs to change what is featured;
 * each slot needs a project of the kind named.
 */
export const featured = {
  leadWebsite: find("sitco-india", "web"),
  search: find("khadi-organique", "seo"),
  appWithTabs: find("maharishi-ayurveda", "app"),
  app: find("toys-cartel", "app"),
  website: find("ashville-homes", "web"),
};

/** The column of work in the hero, top to bottom. */
export const heroWorks: Project[] = [find("sitco-india", "web"), find("khadi-organique", "seo"), find("toys-cartel", "app"), find("ashville-homes", "web")];

/**
 * Phones. The hero shows one piece at a time, one of each kind of work; the work row below it
 * then shows different projects, so nothing appears twice on the way down the page.
 */
export const phoneHero: Project[] = [find("sitco-india", "web"), find("toys-cartel", "app"), find("khadi-organique", "seo")];
export const phoneWork: Project[] = [find("maharishi-ayurveda", "app"), find("ashville-homes", "web"), find("badowl", "seo"), find("hues-boutique-hotel", "web"), find("event-intelligence-india", "app")];
