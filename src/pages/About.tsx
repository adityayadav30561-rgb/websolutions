import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, animate, motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import { Button, Footer, Nav } from "../components/Chrome";
import { EASE } from "../components/Shared";
import { AppPhone, ProjectVisual, SiteFrame } from "../components/Shots";
import { agency, offerings, principles, steps, totals } from "../content/site";
import { featured, find, projects } from "../content/work";
import { useMediaQuery } from "../lib/hooks";
import { useWorld } from "../world/World";

/*
 * About the studio. Each section makes its point with something that moves or responds:
 * a reel of the work, a statement that lights up as it is read, disciplines that show a real
 * project, a process line that draws itself, principles that stack, and the site's own two sides.
 */

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.9, ease: EASE },
};


const sites = projects.filter((p) => p.kind === "web");
const two = (n: number) => String(n).padStart(2, "0");

function Head({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
      <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)]">{title}</h2>
      {note && <p className="max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">{note}</p>}
    </div>
  );
}

/** The websites, drifting past in one endless row. The row is laid out twice so the loop has no seam. */
function Reel() {
  return (
    <div className="edge-fade -mx-4 mt-14 overflow-hidden md:-mx-8 md:mt-20">
      <div className="marquee">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-5 pr-5">
            {sites.map((p) => (
              <Link key={p.slug} to={`/work/${p.slug}`} tabIndex={copy === 1 ? -1 : 0} aria-label={p.name} className="block w-[min(72vw,26rem)] shrink-0">
                <SiteFrame p={p} still eager />
                <span className="mt-3 flex items-baseline justify-between gap-4 text-[0.875rem]">
                  <span className="font-medium">{p.name}</span>
                  <span className="truncate text-b-mute">{p.category}</span>
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Word({ text, progress, range }: { text: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.24em] inline-block">
      {text}
    </motion.span>
  );
}

/** A statement that lights up word by word as it crosses the screen. */
function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.5"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="text-[clamp(1.75rem,4.1vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
      {words.map((word, i) => (
        <Word key={i} text={word} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  );
}

/** A figure that counts up the first time it is seen. The real number is always in the text for screen readers and search engines. */
function Count({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const run = animate(0, n, { duration: 1.4, ease: EASE, onUpdate: (v) => setValue(Math.round(v)) });
    return () => run.stop();
  }, [seen, n]);
  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{n}</span>
      <span aria-hidden>{value}</span>
    </span>
  );
}

/* ───────────── What we do ───────────── */

const site = find("sitco-india", "web");
const app = find("toys-cartel", "app");
const search = find("khadi-organique", "seo");
const care = ["Monitoring", "Backups", "Updates", "Small changes"];

/** What each discipline looks like in practice: a real project, or for care, what a month covers. */
function DisciplineVisual({ index }: { index: number }) {
  if (index === 0) return <SiteFrame p={site} />;
  if (index === 1)
    return (
      <div className="relative h-full overflow-hidden rounded-[0.625rem]" style={{ background: app.tint.bg }}>
        <AppPhone app={app} className="absolute left-1/2 top-[9%] w-[34%] -translate-x-1/2" />
      </div>
    );
  if (index === 2)
    return (
      <div className="relative">
        <SiteFrame p={search} />
        <p className="keep-light absolute bottom-[6%] left-[4%] flex items-baseline gap-2 rounded-full bg-b-white px-4 py-2 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)]">
          <span className="text-[1.25rem] font-semibold tracking-[-0.03em] text-b-amber">{search.metric}</span>
          <span className="text-[0.8125rem] text-b-mute">{search.metricLabel}</span>
        </p>
      </div>
    );
  return (
    <div className="panel flex h-full flex-col justify-center rounded-[0.625rem] p-6 md:p-10">
      <ul>
        {care.map((item) => (
          <li key={item} className="flex items-center gap-4 border-t border-b-line py-4 last:border-b">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-b-cobalt text-white">
              <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <span className="text-[1.125rem] font-medium">{item}</span>
            <span className="ml-auto text-[0.8125rem] text-b-mute">every month</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const visualLink = [`/work/${site.slug}`, `/work/${app.slug}`, `/work/${search.slug}`, "/contact"];
const visualNote = [site.name, app.name, search.name, "Ask about a care plan"];

function Disciplines() {
  const [active, setActive] = useState(0);
  const wide = useMediaQuery("(min-width: 1024px)");
  return (
    <section className="pt-24 md:pt-36">
      <Head title="What we do." note="Four kinds of work, done by the same people. Pick one to see it." />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <ol className="border-b border-b-line lg:col-span-5">
          {offerings.map((o, i) => {
            const on = i === active;
            return (
              <li key={o.name} className="border-t border-b-line" onMouseEnter={() => wide && setActive(i)}>
                <button type="button" aria-expanded={on} onClick={() => setActive(i)} className="flex w-full items-baseline gap-5 py-6 text-left">
                  <span className={`w-7 shrink-0 text-[0.875rem] tabular-nums transition-colors duration-500 ${on ? "text-b-amber" : "text-b-mute"}`}>{two(i + 1)}</span>
                  <span className={`flex-1 text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] transition-opacity duration-500 ${on ? "" : "opacity-45"}`}>{o.name}</span>
                  <span aria-hidden className={`relative size-4 shrink-0 self-center transition-transform duration-500 ease-out-expo ${on ? "rotate-45" : ""}`}>
                    <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-px bg-current" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="overflow-hidden">
                      <p className="max-w-md pb-7 pl-12 text-[1rem] leading-relaxed text-b-mute">{o.text}</p>
                      {!wide && (
                        <div className="pb-7">
                          <DisciplineVisual index={i} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>

        {wide && (
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="sticky top-28">
              <div className="relative aspect-[16/10.7]">
                {offerings.map((o, i) => (
                  <div key={o.name} aria-hidden={i !== active} className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out-expo ${i === active ? "" : "pointer-events-none translate-y-4 opacity-0"}`}>
                    <DisciplineVisual index={i} />
                  </div>
                ))}
              </div>
              <Link to={visualLink[active]} className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] text-b-mute decoration-1 underline-offset-4 hover:text-b-ink hover:underline">
                {visualNote[active]}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── How a project runs ───────────── */

function Stage({ step, index, progress }: { step: (typeof steps)[number]; index: number; progress: MotionValue<number> }) {
  const at = index / steps.length;
  const lit = useTransform(progress, [at - 0.04, at + 0.02], [0, 1]);
  return (
    <li className="relative pl-10 lg:pl-0 lg:pr-6 lg:pt-14">
      <span className="absolute left-0 top-1 grid size-[1.0625rem] place-items-center rounded-full border border-b-line bg-b-paper lg:top-0">
        <motion.span style={{ opacity: lit }} className="size-[0.5625rem] rounded-full bg-b-amber" />
      </span>
      <span aria-hidden className="block text-[clamp(3.5rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.06em] text-b-ink/15">
        {two(step.n)}
      </span>
      <h3 className="mt-4 text-[1.75rem] font-semibold tracking-[-0.03em]">{step.name}</h3>
      <p className="mt-3 max-w-sm text-[1rem] leading-relaxed text-b-mute">{step.line}</p>
      <p className="mt-6 text-[0.8125rem] text-b-mute">You get</p>
      <p className="mt-1 text-[0.9375rem] font-medium">{step.output}</p>
    </li>
  );
}

/** Four stages on one line. The line fills as the section is scrolled: down the side on a phone, across the top on a desktop. */
function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.78", "end 0.7"] });
  const rail = "absolute bottom-2 left-2 top-2 w-px lg:bottom-auto lg:left-0 lg:right-0 lg:top-2 lg:h-px lg:w-auto";
  return (
    <section className="pt-24 md:pt-36">
      <Head title="How a project runs." note="The same four stages every time, so you always know where things stand." />
      <ol ref={ref} className="relative grid grid-cols-1 gap-y-14 lg:grid-cols-4">
        <span aria-hidden className={`${rail} bg-b-line`} />
        <motion.span aria-hidden style={{ scaleY: scrollYProgress }} className={`${rail} origin-top bg-b-amber lg:hidden`} />
        <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className={`${rail} hidden origin-left bg-b-amber lg:block`} />
        {steps.map((s, i) => (
          <Stage key={s.n} step={s} index={i} progress={scrollYProgress} />
        ))}
      </ol>
    </section>
  );
}

/* ───────────── What we hold to ───────────── */

/** Each principle is a card that sticks a little lower than the last, so they pile up as you read. */
function Principles() {
  return (
    <section className="pt-24 md:pt-36">
      <Head title="What we hold to." note="The habits that make the work easier to trust." />
      <ol>
        {principles.map((pr, i) => (
          <li key={pr.name} className="panel panel-solid sticky mb-5 grid min-h-[17rem] grid-cols-1 content-between gap-8 rounded-[1.75rem] p-7 md:min-h-[21rem] md:grid-cols-12 md:gap-6 md:p-12" style={{ top: `calc(6.5rem + ${i * 1.125}rem)` }}>
            <div className="md:col-span-7">
              <span className="text-[0.9375rem] tabular-nums text-b-amber">
                {two(i + 1)} / {two(principles.length)}
              </span>
              <p className="mt-5 text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">{pr.name}</p>
            </div>
            <p className="max-w-md text-[1.0625rem] leading-relaxed text-b-mute md:col-span-4 md:col-start-9 md:self-end">{pr.text}</p>
          </li>
        ))}
      </ol>
      {import.meta.env.DEV && <p className="text-[0.8125rem] text-b-mute">Draft wording in src/content/site.ts (offerings, principles). Correct it to match how you work. (This note only shows in development.)</p>}
    </section>
  );
}

/* ───────────── Two sides ───────────── */

const sides = [
  {
    mode: "mono" as const,
    name: "Canvas",
    title: "Where it gets designed.",
    text: "Layout, type, colour and words. Move a pointer across this side of the site and it paints.",
    className: "keep-light text-b-ink",
    background: "radial-gradient(42% 52% at 18% 28%, rgb(255 153 143 / 0.6), transparent 70%), radial-gradient(40% 50% at 82% 22%, rgb(255 204 87 / 0.55), transparent 70%), radial-gradient(46% 56% at 70% 86%, rgb(107 168 255 / 0.5), transparent 70%), radial-gradient(40% 50% at 24% 90%, rgb(97 219 179 / 0.5), transparent 70%), #fdfdfc",
  },
  {
    mode: "color" as const,
    name: "Night",
    title: "Where it gets engineered.",
    text: "Speed, structure, tests and search. The half of the work you measure, not the half you look at.",
    className: "text-white",
    background: "radial-gradient(90% 70% at 72% 128%, #2f6bff 0%, #12348f 34%, transparent 62%), radial-gradient(60% 50% at 10% 0%, rgb(36 76 190 / 0.5), transparent 70%), #030a26",
  },
];

/** The site's own two worlds, as the two halves of the job. Choosing one switches the whole site to it. */
function Sides() {
  const { mode, toggle } = useWorld();
  const choose = (target: (typeof sides)[number]["mode"]) => (e: MouseEvent) => {
    if (mode !== target) toggle({ x: e.clientX, y: e.clientY });
  };
  return (
    <section className="pt-24 md:pt-36">
      <Head title="Two sides, one studio." note="This site has both. Choose one and the whole of it changes." />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sides.map((s) => {
          const here = mode === s.mode;
          return (
            <motion.button key={s.mode} {...reveal} type="button" aria-pressed={here} onClick={choose(s.mode)} style={{ background: s.background }} className={`group relative flex min-h-[21rem] flex-col justify-between overflow-hidden rounded-[1.75rem] p-7 text-left md:min-h-[26rem] md:p-10 ${s.className}`}>
              <span className="flex items-center justify-between gap-4 text-[0.875rem]">
                <span className="font-medium">{s.name}</span>
                <span className={`rounded-full px-3 py-1 ${here ? "bg-b-amber text-white" : "border border-current/30 transition-colors group-hover:bg-current/10"}`}>{here ? "You are here" : "Switch to this side"}</span>
              </span>
              <span>
                <span className="block font-display text-[clamp(2rem,3.6vw,3.25rem)] font-bold uppercase leading-[0.9]">{s.title}</span>
                <span className="mt-4 block max-w-sm text-[1rem] leading-relaxed opacity-80">{s.text}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export default function About() {
  const shown = [featured.leadWebsite, featured.appWithTabs, featured.search];
  const lines = ["One studio,", "start to found."];
  return (
    <div className="min-h-screen font-geist text-b-ink">
      <Nav />
      <main className="px-4 md:px-8">
        <section className="pt-32 md:pt-44">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
            <h1 className="text-[clamp(3rem,13vw,7.6rem)] leading-[0.86] lg:col-span-8">
              {lines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.12em]">
                  <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.1 + i * 0.1 }}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div className="lg:col-span-4 lg:self-end" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}>
              <p className="text-[1.125rem] font-medium leading-snug">{agency.intro}</p>
              <p className="mt-4 text-[0.9375rem] text-b-mute">{agency.location}</p>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.6 }}>
            <Reel />
          </motion.div>
        </section>

        <section className="grid grid-cols-1 gap-8 pt-24 md:pt-36 lg:grid-cols-12 lg:gap-6">
          <p className="text-[0.9375rem] text-b-mute lg:col-span-2 lg:pt-3">Why one studio</p>
          <div className="lg:col-span-10">
            <Statement text="Most projects pass through three companies: one designs it, one builds it, one tries to get it found. Things get lost at every handover. We keep all three in one room, so what was promised at the start is what goes live, and what goes live is what people find." />
          </div>
        </section>

        <motion.dl {...reveal} className="mt-20 grid grid-cols-3 border-y border-b-line md:mt-28">
          {totals.map((c) => (
            <div key={c.label} className="border-l border-b-line py-8 pl-4 first:border-l-0 first:pl-0 md:py-12 md:pl-8">
              <dd className="text-[clamp(3rem,7vw,6rem)] font-semibold leading-none tracking-[-0.05em] text-b-amber">
                <Count n={c.n} />+
              </dd>
              <dt className="mt-3 text-[0.9375rem] text-b-mute">{c.label}</dt>
            </div>
          ))}
        </motion.dl>

        <Disciplines />
        <Process />
        <Principles />
        <Sides />

        <section className="pt-24 md:pt-36">
          <Head title="Some of the work." note="One of each: a website, an app and a search campaign." />
          <div className="swipe-row grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3">
            {shown.map((p) => (
              <motion.div key={p.slug} {...reveal}>
                <Link to={`/work/${p.slug}`} className="group block">
                  <ProjectVisual p={p} />
                  <span className="mt-4 flex items-baseline justify-between gap-4">
                    <span className="text-[1.25rem] font-semibold tracking-[-0.02em] decoration-1 underline-offset-4 group-hover:underline">{p.name}</span>
                    <span className="text-[0.875rem] text-b-mute">{p.category}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="/work" kind="ghost">
              See all selected work
            </Button>
          </div>
        </section>

        <section className="pt-24 md:pt-36">
          <div className="panel grid grid-cols-1 gap-10 rounded-[1.75rem] p-8 md:p-14 lg:grid-cols-12 lg:items-end lg:gap-6">
            <div className="lg:col-span-8">
              <h2 className="text-[clamp(2.4rem,6.4vw,5.6rem)] leading-[0.9]">Have something to build?</h2>
              <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-b-mute">Tell us what it is. We reply within two working days, and the first conversation is free.</p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
              <Button href="/contact">Start a project</Button>
              <a href={`mailto:${agency.email}`} className="text-[0.9375rem] text-b-amber decoration-1 underline-offset-4 hover:underline">
                {agency.email}
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
