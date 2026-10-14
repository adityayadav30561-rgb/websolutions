/** Agency identity and copy. */

export const agency = {
  name: "Northlight",
  descriptor: "Digital studio",
  email: "hello@northlight.studio",
  location: "Lisbon, working worldwide",
  footerLine: "Websites and apps, designed and engineered by one studio, then grown in search.",
  intro: "Northlight is a studio of designers and engineers. We design and build websites, web applications and brands for companies that care how things are made.",
};

export const mailto = `mailto:${agency.email}?subject=${encodeURIComponent("New project")}`;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

/** Add { label, href } entries when real profiles exist. While empty, the footer shows no social links. */
export const socials: { label: string; href: string }[] = [];

export type Service = { id: string; name: string; short: string; line: string };

export const services: Service[] = [
  { id: "web", name: "Website design and development", short: "Websites", line: "Marketing sites and editorial platforms, designed and built under one roof." },
  { id: "apps", name: "Web application development", short: "Web apps", line: "Tools your team and customers open every day, built to stay fast." },
  { id: "commerce", name: "E-commerce", short: "E-commerce", line: "Storefronts where the product leads and the checkout gets out of the way." },
  { id: "uiux", name: "UI/UX design", short: "UI/UX", line: "Research, flows and interface systems, tested with the people who will use them." },
  { id: "brand", name: "Branding", short: "Branding", line: "Names, marks and a visual language that holds up on every screen." },
  { id: "product", name: "Digital product engineering", short: "Engineering", line: "Architecture, performance and release pipelines for products that keep growing." },
];

export type Step = { n: number; name: string; line: string; output: string };

export const steps: Step[] = [
  { n: 1, name: "Discover", line: "We learn the business, the audience and the constraints before we draw anything.", output: "Brief, sitemap, success measures" },
  { n: 2, name: "Design", line: "Art direction and interface design, shown in the browser from the first week.", output: "Design system, prototype" },
  { n: 3, name: "Develop", line: "Production code, reviewed with you every week on a live staging link.", output: "Tested, accessible build" },
  { n: 4, name: "Launch", line: "We ship, measure, and stay on for the first ninety days.", output: "Release, analytics, handover" },
];

export type ProjectId = "alder" | "ledgerly" | "harbor" | "tidewatch" | "kindred";

export type Project = { id: ProjectId; name: string; category: string; line: string; url: string };

/** Illustrative concept projects, not client engagements. */
export const projects: Project[] = [
  { id: "alder", name: "Maison Alder", category: "E-commerce", line: "A furniture store that sells by the room, not the SKU.", url: "maisonalder.com" },
  { id: "ledgerly", name: "Ledgerly", category: "SaaS platform", line: "Invoicing and cash flow for studios of five to fifty.", url: "app.ledgerly.io" },
  { id: "harbor", name: "Harbor & Vale", category: "Corporate website", line: "An architecture practice, presented building by building.", url: "harborvale.com" },
  { id: "tidewatch", name: "Tidewatch", category: "Digital dashboard", line: "Live output from forty offshore wind sites on one screen.", url: "tidewatch.energy" },
  { id: "kindred", name: "Kindred", category: "Web application", line: "Book a quiet house for the week in three taps.", url: "kindred.stay" },
];

export const conceptNote = "Concept projects shown for illustration.";

/**
 * How much work the studio has done in total. The site shows only a selection of it,
 * so these are the studio's own figures, not counts of the projects listed here.
 */
export const totals = [
  { n: 20, label: "websites built" },
  { n: 10, label: "apps developed" },
  { n: 50, label: "SEO, AEO and GEO projects" },
];
/** The same figures in a sentence: "20+ websites, 10+ apps and 50+ SEO, AEO and GEO projects". */
export const totalsLine = `${totals[0].n}+ websites, ${totals[1].n}+ apps and ${totals[2].n}+ SEO, AEO and GEO projects`;

export type Testimonial = { quote: string; name: string; role: string };

/** Clients in their own words. */
export const testimonials: Testimonial[] = [
  {
    quote: "Working with the team has been a great experience. They handled our website development and SEO with a clear understanding of our goals. We’ve continued working with them because of their consistent support, attention to detail, and commitment to delivering results.",
    name: "KamaHealth",
    role: "Website development and SEO",
  },
  {
    quote: "We’ve partnered with the team across SEO, AEO, and GEO, and the experience has been consistently positive. They understand how search is evolving and take a thoughtful approach to improving our online visibility. It’s why we keep coming back for more.",
    name: "Badowl",
    role: "SEO, AEO and GEO",
  },
  {
    quote: "The team did an excellent job developing our e-commerce store, creating a smooth and user-friendly shopping experience. Their understanding of our requirements and willingness to support us beyond the initial project made the collaboration worthwhile. We’re happy to continue working with them.",
    name: "Kshipra",
    role: "E-commerce store",
  },
];

export type Faq = { q: string; a: string };

/** DRAFT answers. They describe a typical studio arrangement; correct each one to match how you actually work. */
export const faqs: Faq[] = [
  {
    q: "How much does a project cost?",
    a: "It depends on what is being built. After a first call we send a written quote that lists what is included, so you know the figure before any work starts and it only changes if the scope does.",
  },
  {
    q: "How long does it take?",
    a: "A focused website usually takes a few weeks from the first call to launch; an app or a larger store takes longer. You get a dated plan with the quote, and a working link early so you can see progress for yourself.",
  },
  {
    q: "Who actually does the work?",
    a: "The people you speak to on the first call. Design and development happen in the same team, so nothing is handed between agencies or lost on the way.",
  },
  {
    q: "What happens after launch?",
    a: "We stay on to watch how the site or app behaves with real visitors and fix what comes up. After that you can keep us on a monthly plan for updates and search work, or take it over yourself.",
  },
  {
    q: "Do we own the code and the design?",
    a: "Yes. Once the project is paid for, the code, the design files and the accounts are yours, and we hand them over with notes on how everything is set up.",
  },
  {
    q: "Can you improve a site we already have?",
    a: "Often, yes. We start by looking at what you have and tell you plainly whether it is worth improving or cheaper to rebuild. Search work can usually begin on an existing site straight away.",
  },
];

/** The four kinds of work the studio takes on. Used on the About page. */
export const offerings = [
  { name: "Websites and online stores", text: "Designed around your business and the one action you want a visitor to take, then built to load fast on real phones." },
  { name: "Web and mobile apps", text: "One codebase for iOS, Android and the web. You get a working link early, so you test the real thing rather than a slideshow." },
  { name: "Search and organic growth", text: "Technical fixes, content and structure, measured in your own Google Analytics and Search Console, including the AI answers that now sit above the results." },
  { name: "Care after launch", text: "Monitoring, backups, updates and small changes every month, so the thing we built keeps working without becoming your job." },
];

/** DRAFT. How the studio says it works; correct to match reality. Used on the About page. */
export const principles = [
  { name: "A working link in the first weeks", text: "You see the real thing in a browser or on your phone early, while changing course is still cheap. No big reveal at the end." },
  { name: "Your numbers, not ours", text: "Results are read from your own analytics accounts. You can open them and check any figure we quote." },
  { name: "The people you meet do the work", text: "Design, code and search sit in one team, so nothing is lost between a salesperson and whoever builds it." },
  { name: "It is yours when it is done", text: "Code, design files and accounts are handed over with notes on how everything is set up." },
];

/** DRAFT. What happens after someone writes in. Used on the Contact page. */
export const nextSteps = [
  { name: "We read it", text: "A person reads your message and replies within two working days, usually with a couple of questions." },
  { name: "A first call", text: "Half an hour, free, about what you need and what would make it a success. No pitch deck." },
  { name: "A written quote", text: "What is included, what it costs and a dated plan. You decide from there." },
];
