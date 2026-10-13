/**
 * Depth for the project pages.
 *
 * Apps: every screen from the supplied screenshot set, grouped into the flows a user goes
 *   through, with captions taken from the set's README. Files live in public/work/<folder>/,
 *   converted by scripts/import-app-shots.mjs.
 * Websites: the navigation and section headings as they stand on the live site (read from the
 *   pages themselves), so the page describes what is really there.
 */

export type ScreenShot = { file: string; label: string; caption: string };
export type Flow = { title: string; text: string; shots: ScreenShot[] };
export type AppDetail = {
  /** Folder under public/work and the subfolder holding the screens. */
  folder: string;
  sub: string;
  /** Present when the same screens also exist in a dark theme (in <folder>/dark). */
  dark?: boolean;
  about: string;
  stack: string;
  captured: string;
  collages: { file: string; alt: string }[];
  flows: Flow[];
};

const s = (file: string, label: string, caption: string): ScreenShot => ({ file, label, caption });

export const appDetails: Record<string, AppDetail> = {
  "maharishi-ayurveda": {
    folder: "maharishi",
    sub: "screens",
    about: "An Ayurvedic wellness shopping app. It builds a personal wellness profile and Dosha, suggests daily rituals, and puts the product catalogue, order tracking and paid consultations with a Vaidya (Ayurvedic doctor) in one place.",
    stack: "Expo web app, one codebase for iOS, Android and the browser",
    captured: "Shown with the app's built-in demo account, a returning customer.",
    collages: [
      { file: "collage-main", alt: "Home, product detail, Consult and My Wellness screens side by side" },
      { file: "collage-2", alt: "Onboarding, Explore, order tracking and search screens side by side" },
    ],
    flows: [
      {
        title: "First run",
        text: "Three short slides, one question about what brought you here, then sign-in by mobile number and a one-time code.",
        shots: [
          s("01-onboarding-1", "Intro 1", "First of three intro slides"),
          s("02-onboarding-2", "Intro 2", "Second intro slide"),
          s("03-onboarding-3", "Intro 3", "Third intro slide"),
          s("04-onboarding-interests", "Goals", "“What brings you here today?” goal picker"),
          s("05-login", "Sign in", "Sign in with a mobile number"),
          s("06-otp", "Code", "One-time code verification"),
        ],
      },
      {
        title: "Home",
        text: "Home starts with the person, not the catalogue: a greeting, the order that is on its way, and a grid of wellness needs. Further down sit the Ayurvedic profile, today's ritual and what to shop next.",
        shots: [
          s("07-home", "Home", "Greeting, active order banner and the wellness-need grid"),
          s("08-home-profile-ritual", "Profile and ritual", "Ayurvedic profile (Vata-Pitta) and today's ritual tracker"),
          s("09-home-recommended", "Recommended", "Shop by wellness need, bestsellers and offers"),
        ],
      },
      {
        title: "Finding a product",
        text: "Browse by need, benefit or ingredient, or search. A search for an ingredient returns a guide and articles alongside the products. The product page covers pack choice, how to use it and ratings before the add-to-cart bar.",
        shots: [
          s("11-explore", "Explore", "Explore by wellness need"),
          s("12-explore-more", "Explore, further", "Explore by benefits and ingredients"),
          s("19-search", "Search", "Search for “ashwagandha”: ingredient guide, articles, products"),
          s("13-product-detail", "Product", "Product page with pack choice and price"),
          s("14-product-detail-more", "Product, further", "How to use, ratings and add to cart"),
        ],
      },
      {
        title: "Orders and consultations",
        text: "An order shows its timeline, courier and items. Consultations with a Vaidya are booked from their own tab.",
        shots: [
          s("10-order-tracking", "Order tracking", "Tracking timeline, courier and items"),
          s("15-consult", "Consult", "Book a consultation with a Vaidya"),
        ],
      },
      {
        title: "My wellness and account",
        text: "The wellness tab holds the profile, a daily routine checklist and recommendations. Account gathers orders, wishlist, consultations and preferences.",
        shots: [
          s("16-my-wellness", "My wellness", "Wellness profile and goals"),
          s("17-my-wellness-more", "Daily routine", "Routine checklist and recommendations"),
          s("18-account", "Account", "Orders, wishlist, consultations, preferences"),
        ],
      },
    ],
  },

  "toys-cartel": {
    folder: "toys",
    sub: "screens",
    about: "A toy shop for India, built for parents in a hurry: shop by age and category, see the deals, keep a wishlist, and check out with a cart that applies offers by itself.",
    stack: "Expo web app, one codebase for iOS, Android and the browser",
    captured: "Shown as a guest shopper with two items in the cart. No order was placed.",
    collages: [
      { file: "collage-main", alt: "Home, Categories, product detail and Cart screens side by side" },
      { file: "collage-2", alt: "Onboarding, search results, home sections and Account screens side by side" },
    ],
    flows: [
      {
        title: "First run",
        text: "Two intro slides and straight into the shop. No account is needed to browse or buy.",
        shots: [s("01-onboarding-1", "Intro 1", "First intro slide"), s("02-onboarding-2", "Intro 2", "Second intro slide")],
      },
      {
        title: "Home",
        text: "A deal carousel, then shopping by age and by category, then bestsellers, new arrivals and what is trending, closing on the shop's promises.",
        shots: [
          s("04-home", "Home", "Deal carousel, shop by age, categories"),
          s("05-home-bestsellers", "Bestsellers", "Bestsellers and new arrivals"),
          s("06-home-more", "Further down", "Trending toys and trust badges"),
        ],
      },
      {
        title: "Search and browse",
        text: "Search remembers recent terms and suggests trending ones; results can be sorted and filtered. Browse starts from age chips and category tiles.",
        shots: [
          s("07-search", "Search", "Recent and trending searches"),
          s("08-search-results", "Results", "Results for “dinosaur” with sort and filter"),
          s("09-categories", "Categories", "Age chips and category tiles"),
          s("10-category-listing", "Listing", "The Remote Control category"),
        ],
      },
      {
        title: "A product",
        text: "The page answers a parent's questions in order: what it looks like, what it costs and which offers apply, whether it delivers to them, then highlights and reviews.",
        shots: [s("11-product-detail", "Product", "Gallery, price, offers and delivery check"), s("12-product-detail-more", "Further down", "Highlights and reviews")],
      },
      {
        title: "Wishlist, cart and account",
        text: "The cart shows how far the order is from free delivery and the next offer, with a full price breakdown before checkout.",
        shots: [
          s("13-wishlist", "Wishlist", "Saved toys and “You might also like”"),
          s("14-cart", "Cart", "Items, offer progress, price breakdown, checkout"),
          s("15-account", "Account", "Account as a guest"),
        ],
      },
    ],
  },

  "event-intelligence-india": {
    folder: "eii",
    sub: "light",
    dark: true,
    about: "An internal tool for a small team that travels to professional events. It gathers conferences, expos and summits from across India, judges how relevant each is to the team, and helps them track events and plan visits.",
    stack: "Expo and React Native Web as an installable web app, with a Node and Express API on PostgreSQL",
    captured: "Shown with the app's bundled sample data. Every screen exists in light and dark.",
    collages: [
      { file: "collage-light", alt: "Home, Explore, event detail and Calendar screens in the light theme" },
      { file: "collage-light-dark", alt: "The Home screen in light and dark side by side" },
    ],
    flows: [
      {
        title: "Getting in",
        text: "Accounts are set up by an admin. A first-time user sees one intro slide and picks the technologies and topics they care about.",
        shots: [
          s("00a-sign-in", "Sign in", "Sign in with the account an admin set up"),
          s("00b-onboarding-welcome", "Welcome", "Onboarding intro slide"),
          s("00c-onboarding-interests", "Interests", "Pick technologies and topics"),
        ],
      },
      {
        title: "Home",
        text: "What is coming up, then a feed built from the user's interests: For You, This Week and Newly Discovered.",
        shots: [s("01-home", "Home", "“Coming Up” carousel and search"), s("02-home-for-you", "For you", "For You, This Week, Newly Discovered")],
      },
      {
        title: "Explore",
        text: "A filterable list with a relevance badge on every event. Search understands plain English, turning “SAP events in Delhi next month” into filters. The same events can be seen on a map of India.",
        shots: [
          s("03-explore", "Explore", "List with filters and relevance badges"),
          s("04-explore-natural-search", "Plain-English search", "A sentence parsed into filter chips"),
          s("04b-explore-map", "Map", "Map of India with clustered event counts"),
        ],
      },
      {
        title: "An event",
        text: "Dates, venue, organiser and price with the actions up top. Below, the tracking state and a plain explanation of why this event matches the user.",
        shots: [s("05-event-detail", "Event", "Actions, dates, venue, organiser, price"), s("05b-event-detail-why", "Why it matches", "Tracking panel and “Why It Matches You”")],
      },
      {
        title: "Planning and the day itself",
        text: "Tracked events sit in five lists and on a calendar. On the day, Event Day mode shows the next session, directions, a checklist, notes and the agenda.",
        shots: [
          s("06-my-events", "My events", "Saved, Following, Planned, Visited, Past"),
          s("07-calendar", "Calendar", "Month view with the day's tracked events"),
          s("08-event-day", "Event Day", "Next session, directions, checklist, notes, agenda"),
          s("09-more", "More", "Profile, settings and admin entry points"),
        ],
      },
    ],
  },
};

export type WebDetail = { pages: string[]; sections: string[]; cta?: string };

/** Navigation and section headings as they stand on each live site. */
export const webDetails: Record<string, WebDetail> = {
  "sitco-india": {
    pages: ["Home", "About", "Products", "Certifications", "Blog", "Contact"],
    cta: "Send Inquiry",
    sections: ["Indian craft, shipped to world ports.", "Rooted in India. Trusted worldwide.", "Three disciplines, one export atelier.", "Curated for buyers with taste.", "Operations in the field.", "Built for buyers who demand precision.", "Recognised across India's export ecosystem."],
  },
  "ashville-homes": {
    pages: [],
    sections: ["Luxury living, in the heart of North Goa.", "Four villas. Each with a character of its own."],
  },
  "hues-boutique-hotel": {
    pages: ["Home", "Gallery", "Services", "Rooms", "About Us", "Contact Us"],
    cta: "Book now",
    sections: ["Relish every moment of your stay", "Reserve your stay", "A boutique experience like no other", "Signature rooms and suites"],
  },
  "kshipra-health": {
    pages: ["Home", "About", "Cleansers", "Moisturisers", "Serums", "Shampoos", "Body Wash", "Sun Care"],
    sections: ["Our bestsellers", "Latest launches", "Our trusted brands", "Skin concern solutions", "Product reviews"],
  },
  "aarika-fabric-care": {
    pages: ["Home", "About", "Services", "Packages", "Contact"],
    cta: "Book a pickup",
    sections: ["Soft, fresh and folded — back in 24–48 hours.", "Laundry done the way you would do it at home", "Eight services, one shop", "Four steps, no waiting at a counter", "Packages worth starting on", "What people in Daliganj say", "The shop in Daliganj"],
  },
  "blue-orbit-digi": {
    pages: ["Services", "Pricing", "About", "Contact"],
    cta: "Get a quote",
    sections: ["Marketing you can afford to keep.", "Everything a local business needs online", "Monthly retainers", "Pick a tier. Change it whenever.", "Why clients stay without a contract", "What clients actually say", "Tell us the outcome. We'll send a fixed price."],
  },
  easywebsolns: {
    pages: ["Websites", "Care Plans", "Work", "About", "Contact"],
    cta: "Start a project",
    sections: ["Websites and apps that work for you.", "Everything your business needs online. Nothing it doesn't.", "Selected work.", "From first call to launch day.", "Clear prices. No surprises.", "Launching isn't the end.", "Built around your business. Not a template."],
  },
};

/** What search work covers, in the studio's own words. Shown on every search project page. */
export const searchWork = [
  { name: "Technical fixes", text: "Speed, crawlability, structured data and the errors that keep pages out of the index." },
  { name: "Content and structure", text: "Pages built around what people actually search for, organised so both visitors and Google can follow them." },
  { name: "AI search visibility", text: "Getting the site cited in the AI answers that now sit above the results." },
  { name: "Reporting you can audit", text: "Every figure comes from your own Google Analytics and Search Console, not from a slide we made." },
];
