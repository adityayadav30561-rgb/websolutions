import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Button, Footer, Nav } from "../components/Chrome";
import { Img } from "../components/Media";
import { BrowserFrame, StoreMock } from "../components/Mockups";
import { EASE, Wordmark } from "../components/Shared";
import { AppPhone, ProjectVisual, SiteFrame } from "../components/Shots";
import { photos } from "../content/media";
import { agency, faqs, mailto, services, steps, testimonials } from "../content/site";
import { featured, heroWorks, phoneHero, phoneWork, projects, sitePages, type Project } from "../content/work";
import { useCycle, useMediaQuery, usePointerParallax } from "../lib/hooks";

/* Northlight homepage. White, fog and cobalt; the work is the imagery. */

export default function Home() {
  return (
    <div className="font-geist text-b-ink">
      <Nav />
      <main>
        <Hero />
        <Work />
        <Services />
        <Process />
        <ClientWords />
        <Questions />
        <Contact />
      </main>
    </div>
  );
}

/** One layer of a stage: enters in sequence, then drifts with the pointer by `depth`. */
function Layer({ px, py, depth, delay, className, children }: { px: MotionValue<number>; py: MotionValue<number>; depth: number; delay: number; className: string; children: ReactNode }) {
  const x = useTransform(px, (v) => v * depth);
  const y = useTransform(py, (v) => v * depth * 0.6);
  return (
    <motion.div className={`absolute ${className}`} style={{ x, y }}>
      <motion.div initial={{ opacity: 0, y: 60, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, duration: 1.2, ease: EASE }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

const counts = (["web", "app", "seo"] as const).map((k) => ({ n: projects.filter((p) => p.kind === k).length, label: { web: "websites built", app: "apps shipped", seo: "search campaigns" }[k] }));

/** One piece of work in the hero column: a site scrolling in its browser, or an app in its phone. */
function HeroWork({ p, eager }: { p: Project; eager?: boolean }) {
  return (
    <Link to={`/work/${p.slug}`} className="group block">
      {p.kind === "app" ? (
        <div className="relative aspect-[16/10.6] overflow-hidden rounded-[0.625rem]" style={{ background: p.tint.bg }}>
          <AppPhone app={p} eager={eager} className="absolute left-1/2 top-[9%] w-[34%] -translate-x-1/2" />
        </div>
      ) : (
        <SiteFrame p={p} eager={eager} />
      )}
      <span className="mt-3 flex items-baseline justify-between gap-4 text-[0.9375rem]">
        <span className="font-medium decoration-1 underline-offset-4 group-hover:underline">{p.name}</span>
        <span className="text-[0.8125rem] text-b-mute">{p.category}</span>
      </span>
    </Link>
  );
}

/**
 * The hero's work on a phone: one piece at a time, changing by itself, with dots to pick one.
 * All pieces are stacked in a box of fixed shape, so the page does not jump as they change.
 */
function HeroReel() {
  const [i, setI] = useCycle(phoneHero.length, 4200);
  const current = phoneHero[i];
  return (
    <div>
      <div className="relative aspect-[16/10.7]">
        {phoneHero.map((p, n) => (
          <Link
            key={p.slug}
            to={`/work/${p.slug}`}
            aria-label={p.name}
            aria-hidden={n !== i}
            tabIndex={n === i ? 0 : -1}
            className={`absolute inset-0 block transition-[opacity,transform] duration-700 ease-out-expo ${n === i ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
          >
            {p.kind === "app" ? (
              <div className="relative h-full overflow-hidden rounded-[0.625rem]" style={{ background: p.tint.bg }}>
                <AppPhone app={p} eager className="absolute left-1/2 top-[9%] w-[34%] -translate-x-1/2" />
              </div>
            ) : (
              <SiteFrame p={p} eager />
            )}
          </Link>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <Link to={`/work/${current.slug}`} className="min-w-0">
          <span className="block truncate text-[1.0625rem] font-medium">{current.name}</span>
          <span className="block truncate text-[0.8125rem] text-b-mute">{current.category}</span>
        </Link>
        <div role="tablist" aria-label="Featured work" className="flex shrink-0 items-center gap-1">
          {phoneHero.map((p, n) => (
            <button key={p.slug} type="button" role="tab" aria-selected={n === i} aria-label={`Show ${p.name}`} onClick={() => setI(n)} className="grid h-8 place-items-center px-1">
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-6 bg-b-amber" : "w-1.5 bg-b-ink/30"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Type on the left, a wheel of live work in the middle, an index at the edge.
 *
 * The wheel is endless. Each piece has a slot relative to the active one (-1 above, 0 centred,
 * 1 below, 2 waiting out of sight); when a piece leaves the top it reappears at the bottom,
 * moved there instantly while it is hidden. The centred piece faces the viewer and its
 * neighbours roll away and fade (see .hero-wheel in index.css). It turns on its own, and the
 * index picks a piece directly. Below the desktop breakpoint HeroReel takes its place.
 */
function Hero() {
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();
  const n = heroWorks.length;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [step, setStep] = useState({ item: 0, pitch: 0 });
  const listRef = useRef<HTMLUListElement>(null);
  const lastSlots = useRef<number[]>([]);
  const lines = ["Built to", "be found."];

  useEffect(() => {
    if (!wide || reduce || held) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % n), 4200);
    return () => clearInterval(timer);
  }, [wide, reduce, held, n]);

  // Distance from one piece to the next: a piece's height plus the gap between them.
  useEffect(() => {
    const first = listRef.current?.children[0] as HTMLElement | undefined;
    if (!first) return;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2;
      setStep({ item: first.offsetHeight, pitch: first.offsetHeight + gap });
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(first);
    return () => watch.disconnect();
  }, [wide]);

  // Every frame, tell each piece how far it is from the middle (--d, -1 above .. 1 below); CSS turns that into its roll.
  useEffect(() => {
    const list = listRef.current;
    if (!wide || !list) return;
    let raf = 0;
    const tick = () => {
      const b = list.getBoundingClientRect();
      const half = b.height / 2;
      for (const item of list.children as HTMLCollectionOf<HTMLElement>) {
        const r = item.getBoundingClientRect();
        const d = (r.top + r.height / 2 - (b.top + half)) / (half * 1.25);
        item.style.setProperty("--d", Math.max(-1.6, Math.min(1.6, d)).toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [wide]);

  const slots = heroWorks.map((_, i) => {
    const s = (((i - active) % n) + n) % n;
    return s > n - 2 ? s - n : s;
  });
  useEffect(() => {
    lastSlots.current = slots;
  });

  const current = heroWorks[active];
  const thumb = current.kind === "app" ? current.screens[0].src : (sitePages(current).fallback?.desktop ?? current.desktop);
  const hold = { onPointerEnter: () => setHeld(true), onPointerLeave: () => setHeld(false) };

  return (
    <section id="top" className="grid grid-cols-1 gap-12 px-4 pb-12 pt-28 md:px-8 lg:h-svh lg:min-h-[42.5rem] lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)] lg:gap-6 lg:pb-8 lg:pt-32">
      <div className="flex flex-col justify-between gap-12 lg:col-span-6">
        <div>
          <h1 className="text-[clamp(3.4rem,16vw,7.6rem)] leading-[0.84]">
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.12em]">
                <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.1 }}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}>
            <p className="mt-6 max-w-md text-[1.0625rem] font-medium leading-snug">Websites and apps, designed and engineered by one studio, then grown in search until the right people find them.</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Button href="/contact">Start a project</Button>
              <Button href="/work" kind="ghost">
                See all work
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.dl className="flex gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.9 }}>
          {counts.map((c) => (
            <div key={c.label}>
              <dt className="text-[0.8125rem] text-b-mute">{c.label}</dt>
              <dd className="mt-1 text-[1.0625rem] font-medium tabular-nums text-b-amber">{c.n}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {!wide && <HeroReel />}
      {wide && (
      <div {...hold} className="min-h-0 lg:col-span-4 lg:col-start-7 lg:[overflow-y:clip]">
        <motion.ul
          ref={listRef}
          className="hero-wheel relative lg:mx-auto lg:block lg:h-full lg:w-[min(100%,calc((100svh-10rem)*0.66))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.35 }}
        >
          {heroWorks.map((p, i) => {
            // A piece that wraps round (top to bottom) must not be seen flying across the wheel.
            const wraps = Math.abs(slots[i] - (lastSlots.current[i] ?? slots[i])) > 1;
            return (
              <motion.li
                key={p.slug}
                aria-current={i === active || undefined}
                className="absolute inset-x-0 top-1/2"
                initial={false}
                animate={{ y: slots[i] * step.pitch - step.item / 2 }}
                transition={wraps || !step.item ? { duration: 0 } : { duration: 1.3, ease: EASE }}
              >
                <HeroWork p={p} eager />
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
      )}

      <nav aria-label="Featured work" {...hold} className="hidden text-right text-[0.9375rem] lg:col-span-2 lg:col-start-11 lg:flex lg:flex-col lg:justify-center">
        <span className="mb-2 text-[0.8125rem] text-b-mute">Index</span>
        {heroWorks.map((p, i) => (
          <Link key={p.slug} to={`/work/${p.slug}`} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} className={`py-0.5 font-medium transition-opacity duration-500 ${i === active ? "" : "opacity-30 hover:opacity-70"}`}>
            {p.name}
          </Link>
        ))}
        <Link to="/work" className="mt-3 py-0.5 text-b-amber decoration-1 underline-offset-4 hover:underline">
          All {projects.length} projects
        </Link>
        {/* A small still of the active piece, as a contact sheet would show it */}
        <Link to={`/work/${current.slug}`} aria-label={current.name} className="keep-light mt-8 block aspect-[16/10] overflow-hidden bg-b-fog">
          <img key={thumb} src={thumb} alt="" className="h-full w-full object-cover object-top" />
        </Link>
      </nav>
    </section>
  );
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
      <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)] font-medium leading-[1.03] tracking-[-0.04em]">{title}</h2>
      <p className="max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">{note}</p>
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.9, ease: EASE },
};

/** The one fact worth a line under each kind of project. */
const fact = (p: Project): [string, string] => (p.kind === "app" ? ["Runs on", p.platforms] : p.kind === "seo" ? ["Measured", p.period] : ["Live at", p.link.label]);

/**
 * One project: its live visual on one side, what it is on the other. Sides alternate down the list.
 * On a phone these sit in a swipe row, so every card is built to the same shape: one-line name,
 * two-line description, one fact, and the button pinned to the bottom.
 */
function WorkRow({ p, flip }: { p: Project; flip: boolean }) {
  const [label, value] = fact(p);
  const seo = p.kind === "seo";
  return (
    <motion.article {...reveal} className="flex flex-col gap-6 border-b-line md:grid md:grid-cols-12 md:items-center md:gap-6 md:border-t md:py-14">
      <Link to={`/work/${p.slug}`} aria-label={p.name} className={`group block md:col-span-7 md:row-start-1 ${flip ? "md:col-start-6" : "md:col-start-1"}`}>
        <ProjectVisual p={p} />
      </Link>
      <div className={`flex flex-1 flex-col md:block md:col-span-4 md:row-start-1 ${flip ? "md:col-start-1" : "md:col-start-9"}`}>
        <p className="truncate text-[0.875rem] text-b-mute">{p.category}</p>
        <h3 className="mt-3 text-[clamp(1.375rem,2.8vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.035em] max-md:truncate md:leading-none">
          <Link to={`/work/${p.slug}`} className="decoration-2 underline-offset-4 hover:underline">
            {p.name}
          </Link>
        </h3>
        <p className="mt-4 max-w-sm text-[1rem] leading-relaxed text-b-mute max-md:line-clamp-2 max-md:min-h-[2lh]">{p.line}</p>
        {seo && (
          <p className="mt-6 hidden items-baseline gap-3 md:flex">
            <span className="text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-none tracking-[-0.04em] text-b-amber">{p.metric}</span>
            <span className="text-[0.9375rem] text-b-mute">{p.metricLabel}</span>
          </p>
        )}
        <dl className="mt-6 flex max-w-sm justify-between gap-6 border-t border-b-line pt-3 text-[0.875rem] max-md:min-h-[calc(2lh+0.75rem)]">
          {/* A phone has no room for the big figure, so a search project's fact becomes its result. */}
          <dt className={`shrink-0 text-b-mute ${seo ? "max-md:hidden" : ""}`}>{label}</dt>
          <dd className={`text-right ${seo ? "max-md:hidden" : ""}`}>{value}</dd>
          {seo && (
            <>
              <dt className="shrink-0 text-b-mute md:hidden">Result</dt>
              <dd className="text-right font-medium text-b-amber md:hidden">
                {p.metric} {p.metricLabel}
              </dd>
            </>
          )}
        </dl>
        <div className="mt-6 max-md:mt-auto max-md:pt-6">
          <Button href={`/work/${p.slug}`} kind="ghost">
            View project
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

/** A handful of projects; the full list lives at /work. Rows are filled from `featured`. */
function Work() {
  // A phone's hero already shows three of these, so its row carries other projects.
  const wide = useMediaQuery("(min-width: 768px)");
  const rows = wide ? [featured.leadWebsite, featured.search, featured.appWithTabs, featured.website, featured.app] : phoneWork;
  return (
    <section id="work" className="px-4 pt-12 md:px-8 md:pt-28">
      <SectionHead title="Websites, apps and search results we have shipped." note="A few recent projects. Every site and app here scrolls the way a visitor would." />
      <div className="swipe-row border-b-line md:border-b">
        {rows.map((p, i) => (
          <WorkRow key={p.slug} p={p} flip={i % 2 === 1} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Button href="/work" kind="ghost">
          See all {projects.length} projects
        </Button>
      </div>
    </section>
  );
}

/** What clients say. One long quote leads, two shorter ones sit beside it. */
function ClientWords() {
  const [lead, ...rest] = testimonials;
  const by = (t: (typeof testimonials)[number]) => (
    <footer className="mt-8 flex items-center gap-3 border-t border-b-line pt-5 text-[0.9375rem]">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-b-cobalt text-[0.9375rem] font-medium text-white">
        {t.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      </span>
      <span>
        <span className="block font-medium">{t.name}</span>
        <span className="text-b-mute">{t.role}</span>
      </span>
    </footer>
  );
  return (
    <section id="clients" className="px-4 pt-24 md:px-8 lg:pt-24">
      <SectionHead title="What clients say after we ship." note="The people who hired us, in their own words." />
      <div className="swipe-row grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
        <motion.figure {...reveal} className="flex flex-col justify-between rounded-[1.75rem] bg-b-fog p-7 md:col-span-7 md:p-12">
          <blockquote className="text-[clamp(1.4rem,2.4vw,2.2rem)] font-medium leading-[1.25] tracking-[-0.02em]">“{lead.quote}”</blockquote>
          {by(lead)}
        </motion.figure>
        <div className="grid grid-cols-1 gap-4 max-md:contents md:col-span-5 md:gap-5">
          {rest.map((t, i) => (
            <motion.figure key={t.name} {...reveal} transition={{ ...reveal.transition, delay: 0.08 * (i + 1) }} className="flex flex-col justify-between rounded-[1.75rem] bg-b-fog p-7">
              <blockquote className="text-[1.0625rem] leading-relaxed">“{t.quote}”</blockquote>
              {by(t)}
            </motion.figure>
          ))}
        </div>
      </div>
      {import.meta.env.DEV && <p className="mt-4 text-[0.8125rem] text-b-mute">Placeholder quotes and names. Replace in src/content/site.ts before launch. (This note only shows in development.)</p>}
    </section>
  );
}

/** Common questions. One answer open at a time. */
function Questions() {
  const [open, setOpen] = useState(0);
  return (
    <section id="questions" className="grid grid-cols-1 gap-10 px-4 pt-24 md:grid-cols-12 md:gap-6 md:px-8 md:pt-36">
      <div className="md:col-span-4">
        <h2 className="text-[clamp(2rem,4.2vw,3.6rem)]">Questions people ask first.</h2>
        <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">Not answered here? Write to us and a person replies within two working days.</p>
        <div className="mt-6">
          <Button href={mailto} kind="ghost">
            {agency.email}
          </Button>
        </div>
      </div>
      <ul className="border-b border-b-line md:col-span-7 md:col-start-6">
        {faqs.map((f, i) => {
          const on = i === open;
          return (
            <li key={f.q} className="border-t border-b-line">
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                <span className="text-[clamp(1.125rem,1.6vw,1.375rem)] font-medium tracking-[-0.01em]">{f.q}</span>
                <span aria-hidden className={`relative grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-b-cobalt text-white" : "bg-b-fog"}`}>
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span className={`absolute h-3.5 w-px bg-current transition-transform duration-300 ${on ? "scale-y-0" : ""}`} />
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="max-w-2xl pb-7 text-[1rem] leading-relaxed text-b-mute">{f.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────── Service demos ───────────────────────── */

function DemoResponsive() {
  return (
    <div className="flex h-full items-start justify-center px-5 pt-5">
      <div className="@container h-full overflow-hidden rounded-t-xl bg-white shadow-[0_20px_40px_-20px_rgb(22_24_29/0.3)] ring-1 ring-black/5" style={{ animation: "viewport-cycle 8s cubic-bezier(0.65,0,0.35,1) infinite", width: "100%" }}>
        <div className="flex h-7 items-center gap-1.5 border-b border-black/5 bg-[#f5f5f3] px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-black/15" />
          ))}
        </div>
        <div className="grid gap-3 p-3 @sm:grid-cols-[1.2fr_1fr] @sm:gap-5 @sm:p-5">
          <div className="aspect-[16/10] overflow-hidden rounded-lg bg-b-fog @sm:order-2">
            <Img photo={photos.roomLight} sizes="320px" decorative />
          </div>
          <div>
            <p className="font-serif text-xl leading-tight @sm:text-3xl">Rooms that hold the light</p>
            <p className="mt-2 text-[0.6875rem] leading-relaxed text-b-mute @sm:text-xs">One layout, every screen. Type, grid and imagery adapt without a second design.</p>
            <span className="mt-3 inline-block rounded-full bg-b-ink px-3 py-1.5 text-[0.6875rem] text-white">View the collection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoKanban() {
  const col = "flex flex-1 flex-col gap-2 rounded-xl bg-white/70 p-2 ring-1 ring-black/5";
  const card = "rounded-lg bg-white p-2.5 text-[0.6875rem] leading-snug shadow-sm ring-1 ring-black/5";
  const Tag = ({ c, children }: { c: string; children: ReactNode }) => <span className={`mb-1.5 block w-fit rounded-full px-1.5 text-[0.625rem] ${c}`}>{children}</span>;
  return (
    <div className="flex h-full gap-2 p-5 text-b-ink">
      <div className={col}>
        <span className="px-1 text-[0.6875rem] font-medium text-b-mute">To do</span>
        <div className={card}>
          <Tag c="bg-amber-100 text-amber-800">Research</Tag>Interview five store managers
        </div>
        <div className={`relative z-10 ${card}`} style={{ animation: "card-move 6s cubic-bezier(0.65,0,0.35,1) infinite" }}>
          <Tag c="bg-blue-100 text-blue-800">Build</Tag>Stock sync with warehouse API
          <svg viewBox="0 0 16 16" className="absolute -bottom-2 right-3 size-4 drop-shadow" aria-hidden>
            <path d="M2 1l11 6-5 1.5L6 14z" fill="#16181d" stroke="#fff" strokeWidth="1" />
          </svg>
        </div>
      </div>
      <div className={col}>
        <span className="px-1 text-[0.6875rem] font-medium text-b-mute">In progress</span>
        <div className={card}>
          <Tag c="bg-violet-100 text-violet-800">Design</Tag>Returns flow, mobile
        </div>
      </div>
      <div className={`${col} max-sm:hidden`}>
        <span className="px-1 text-[0.6875rem] font-medium text-b-mute">Shipped</span>
        <div className={card}>
          <Tag c="bg-emerald-100 text-emerald-800">Live</Tag>Role-based access
        </div>
        <div className={card}>
          <Tag c="bg-emerald-100 text-emerald-800">Live</Tag>Audit log export
        </div>
      </div>
    </div>
  );
}

function DemoCart() {
  return (
    <div className="flex h-full items-center justify-center p-5">
      <div className="relative w-full max-w-[14.375rem] rounded-2xl bg-white p-3 shadow-[0_20px_40px_-20px_rgb(22_24_29/0.3)] ring-1 ring-black/5">
        <span className="absolute -right-2 -top-2 z-10 grid size-8 place-items-center rounded-full bg-b-ink text-[0.75rem] font-medium text-white">
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M3 5h10l-1 9H4zM5.5 5V4a2.5 2.5 0 0 1 5 0v1" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-b-cobalt text-[0.625rem]" style={{ animation: "pop 4.5s ease-in-out infinite" }}>
            1
          </span>
        </span>
        <div className="aspect-[5/4] overflow-hidden rounded-xl bg-b-fog">
          <Img photo={photos.stool} sizes="230px" decorative />
        </div>
        <div className="mt-3 flex justify-between text-[0.8125rem]">
          <span className="font-medium">Alba stool</span>
          <span className="text-b-mute">€180</span>
        </div>
        <span className="mt-2.5 block rounded-full bg-b-cobalt py-2 text-center text-[0.75rem] font-medium text-white">Add to bag</span>
      </div>
    </div>
  );
}

function DemoSystem() {
  return (
    <div className="grid h-full grid-cols-2 gap-3 p-5 text-[0.6875rem] text-b-mute">
      <div className="flex flex-col justify-between rounded-xl bg-white p-3 ring-1 ring-black/5">
        <span className="text-[3.5rem] font-medium leading-none tracking-[-0.05em] text-b-ink">Ag</span>
        <span>
          Geist 500
          <span className="block text-b-ink">48 / 32 / 20 / 15</span>
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-1 overflow-hidden rounded-xl ring-1 ring-black/5">
          {["#16181d", "#2740f5", "#9aa7ff", "#f2f2ef", "#ffffff"].map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <div className="flex flex-1 items-center justify-between rounded-xl bg-white px-3 ring-1 ring-black/5">
          <span className="rounded-full bg-b-cobalt px-3 py-1.5 font-medium text-white">Confirm</span>
          <span className="flex h-5 w-9 items-center justify-end rounded-full bg-b-cobalt p-0.5">
            <span className="size-4 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </div>
  );
}

function DemoBrand() {
  const tile = "grid place-items-center rounded-xl text-lg font-semibold tracking-tight";
  return (
    <div className="grid h-full grid-cols-[1.4fr_1fr] grid-rows-2 gap-3 p-5">
      <div className={`${tile} row-span-2 bg-b-cobalt text-2xl text-white`}>
        <Wordmark />
      </div>
      <div className={`${tile} bg-b-ink text-white`}>
        <svg viewBox="0 0 20 20" className="size-8" aria-hidden>
          <path d="M2 18V8a8 8 0 0 1 16 0v10z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 1v17M2 10.5h16" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <div className={`${tile} bg-white font-serif text-2xl font-light text-b-ink ring-1 ring-black/5`}>Nl</div>
    </div>
  );
}

function DemoEngineering() {
  const code: [string, string][] = [
    ["text-violet-600", "export async function"],
    ["text-b-ink", " getProduct(slug: string) {"],
    ["text-b-mute", "  // cached at the edge for 60 s"],
    ["text-b-ink", "  const res = await cms.fetch(slug, { revalidate: 60 });"],
    ["text-b-ink", "  return ProductSchema.parse(res);"],
    ["text-b-ink", "}"],
  ];
  const checks = ["Types checked", "212 tests passed", "Accessibility audit clean", "Deployed in 41 s"];
  return (
    <div className="grid h-full grid-cols-1 gap-3 p-5 md:grid-cols-[1.5fr_1fr_auto]">
      <pre className="overflow-hidden rounded-xl bg-white p-4 font-mono text-[0.7188rem] leading-[1.75] ring-1 ring-black/5">
        {code.map(([c, t], i) => (
          <span key={i} className={i === 1 ? c : `${c} ${i > 1 ? "block" : ""}`}>
            {t}
          </span>
        ))}
        <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-b-cobalt" style={{ animation: "caret 1.1s steps(1) infinite" }} />
      </pre>
      <ul className="flex flex-col justify-center gap-2.5 rounded-xl bg-white p-4 text-[0.7813rem] ring-1 ring-black/5">
        {checks.map((c, i) => (
          <motion.li key={c} className="flex items-center gap-2.5" initial={{ opacity: 0.2 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.45 }}>
            <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
              <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
                <path d="M2.5 6.5l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            {c}
          </motion.li>
        ))}
      </ul>
      <div className="flex items-center justify-around gap-4 rounded-xl bg-white p-4 ring-1 ring-black/5 md:flex-col md:justify-center">
        {[
          ["100", "Performance"],
          ["100", "Accessibility"],
        ].map(([n, l]) => (
          <span key={l} className="flex items-center gap-2.5 text-[0.75rem] text-b-mute">
            <span className="relative grid size-11 place-items-center text-[0.8125rem] font-semibold text-b-ink">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="20" cy="20" r="17" fill="none" stroke="#10b981" strokeOpacity="0.15" strokeWidth="3" />
                <motion.circle cx="20" cy="20" r="17" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.4 }} />
              </svg>
              {n}
            </span>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

const demos: Record<string, { span: string; height: string; node: ReactNode }> = {
  web: { span: "md:col-span-7", height: "h-72", node: <DemoResponsive /> },
  apps: { span: "md:col-span-5", height: "h-72", node: <DemoKanban /> },
  commerce: { span: "md:col-span-4", height: "h-72", node: <DemoCart /> },
  uiux: { span: "md:col-span-4", height: "h-72", node: <DemoSystem /> },
  brand: { span: "md:col-span-4", height: "h-72", node: <DemoBrand /> },
  product: { span: "md:col-span-12", height: "md:h-52", node: <DemoEngineering /> },
};

function Services() {
  return (
    <section id="services" className="px-4 pt-24 md:px-8 md:pt-36">
      <SectionHead title="Six things we do, shown rather than described." note="Each panel is a small working piece of the service, not an icon." />
      <div className="swipe-row grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
        {services.map((s, i) => {
          const d = demos[s.id];
          return (
            <motion.article key={s.id} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.07 }} className={`panel flex flex-col overflow-hidden rounded-[1.5rem] ${d.span}`}>
              {/* The demo is a little interface of its own, so it keeps its light surface inside the panel. */}
              <div className={`keep-light overflow-hidden text-b-ink ${d.height}`}>{d.node}</div>
              <div className="flex flex-1 flex-wrap content-start items-baseline justify-between gap-x-6 gap-y-1 border-t border-b-line/70 bg-b-white px-5 py-4">
                <h3 className="text-[1.0625rem] font-medium tracking-[-0.02em]">{s.name}</h3>
                <p className="max-w-md text-[0.875rem] text-b-mute">{s.line}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── Process: one product, four states ───────────────────────── */

function DiscoverBoard() {
  const note = "absolute w-[19cqw] rounded-[0.6cqw] p-[1.2cqw] text-[1.15cqw] leading-[1.35] shadow-[0_1cqw_2cqw_-1cqw_rgb(0_0_0/0.25)]";
  const node = "rounded-[0.6cqw] bg-white px-[1.4cqw] py-[0.8cqw] text-[1.1cqw] ring-1 ring-black/10";
  return (
    <div className="absolute inset-0 bg-[#f7f7f4] font-geist text-b-ink" style={{ backgroundImage: "radial-gradient(circle, rgb(22 24 29 / 0.1) 1px, transparent 1.4px)", backgroundSize: "2.4cqw 2.4cqw" }}>
      <span className={`${note} left-[5cqw] top-[5cqw] -rotate-2 bg-[#fff3b8]`}>“I never know if it fits my room until it arrives.”</span>
      <span className={`${note} left-[8cqw] top-[21cqw] rotate-1 bg-[#d9e6ff]`}>68% browse on a phone, buy on a laptop</span>
      <span className={`${note} left-[4cqw] top-[37cqw] -rotate-1 bg-[#ffdcd2]`}>Returns cost €41 per order. Reduce doubt before checkout.</span>
      <div className="absolute left-[36cqw] top-[7cqw] w-[58cqw]">
        <span className="text-[1.1cqw] text-b-mute">Sitemap, v3</span>
        <div className="mt-[1.4cqw] flex flex-col items-center gap-[2.6cqw]">
          <span className={`${node} bg-b-ink! text-white`}>Home</span>
          <svg viewBox="0 0 580 30" className="-my-[2.2cqw] w-full" aria-hidden>
            <path d="M290 0v14M60 30V14h460v16M215 14v16M365 14v16" fill="none" stroke="#16181d" strokeOpacity="0.3" />
          </svg>
          <div className="grid w-full grid-cols-4 gap-[1.4cqw] text-center">
            {["Rooms", "Products", "Journal", "Showrooms"].map((n) => (
              <span key={n} className={node}>
                {n}
              </span>
            ))}
          </div>
          <div className="grid w-full grid-cols-4 gap-[1.4cqw] text-center text-b-mute">
            {["Shop the room", "Product page", "Article", "Book a visit"].map((n) => (
              <span key={n} className={`${node} border border-dashed border-black/20 bg-transparent ring-0`}>
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-[3.4cqw] grid grid-cols-3 gap-[1.4cqw] text-[1.1cqw] text-b-mute">
          {[
            ["12", "customer interviews"],
            ["3", "competitor teardowns"],
            ["1", "measure: return rate"],
          ].map(([n, l]) => (
            <span key={l} className="rounded-[0.6cqw] bg-white p-[1.2cqw] ring-1 ring-black/10">
              <span className="block text-[2.6cqw] font-medium leading-none text-b-ink">{n}</span>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessStage({ step }: { step: number }) {
  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.5 } };
  return (
    <BrowserFrame still url={step === 0 ? "board.northlight.studio" : step === 3 ? "maisonalder.com" : "staging.maisonalder.com"} className="w-full">
      <div className="transition-[filter] duration-700" style={{ filter: step === 1 ? "grayscale(1) contrast(0.92)" : "none" }}>
        <StoreMock />
      </div>
      <AnimatePresence>
        {step === 0 && (
          <motion.div key="discover" className="absolute inset-0" {...fade}>
            <DiscoverBoard />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="design" className="absolute inset-0 font-geist" {...fade}>
            <span className="absolute left-[2.6cqw] top-[9.4cqw] h-[13cqw] w-[38cqw] border-[0.2cqw] border-b-cobalt">
              {["-left-[0.6cqw] -top-[0.6cqw]", "-right-[0.6cqw] -top-[0.6cqw]", "-left-[0.6cqw] -bottom-[0.6cqw]", "-right-[0.6cqw] -bottom-[0.6cqw]"].map((p) => (
                <span key={p} className={`absolute size-[1cqw] border-[0.2cqw] border-b-cobalt bg-white ${p}`} />
              ))}
              <span className="absolute -bottom-[2.6cqw] left-1/2 -translate-x-1/2 rounded-[0.4cqw] bg-b-cobalt px-[0.8cqw] text-[1.05cqw] text-white">Display / 86 · Fraunces Light</span>
            </span>
            <span className="absolute bottom-[2.4cqw] left-1/2 flex -translate-x-1/2 items-center gap-[1.2cqw] rounded-[1cqw] bg-b-ink px-[1.6cqw] py-[1cqw] text-[1.1cqw] text-white shadow-xl">
              {["Frame", "Type", "Grid", "Prototype"].map((t, i) => (
                <span key={t} className={i === 1 ? "rounded-[0.5cqw] bg-b-cobalt px-[0.9cqw] py-[0.3cqw]" : "opacity-60"}>
                  {t}
                </span>
              ))}
            </span>
            <span className="absolute right-[2.4cqw] top-[3cqw] flex flex-col gap-[0.6cqw] rounded-[0.8cqw] bg-white p-[1.2cqw] text-[1cqw] text-b-mute shadow-xl ring-1 ring-black/10">
              Palette
              <span className="flex gap-[0.5cqw]">
                {["#27241f", "#2f5d50", "#c9b79c", "#f6f2ea"].map((c) => (
                  <span key={c} className="size-[2.2cqw] rounded-full ring-1 ring-black/10" style={{ background: c }} />
                ))}
              </span>
            </span>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="develop" className="absolute inset-y-0 left-0 w-[52%] overflow-hidden border-r border-black/10 bg-white/95 p-[2.2cqw] font-mono text-[1.12cqw] leading-[1.8] backdrop-blur-md" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.7, ease: EASE }}>
            <span className="mb-[1.2cqw] flex gap-[1.6cqw] font-geist text-[1.05cqw] text-b-mute">
              <span className="border-b border-b-cobalt pb-[0.4cqw] text-b-ink">Hero.tsx</span>
              <span>product.ts</span>
              <span>checkout.test.ts</span>
            </span>
            {[
              ["text-violet-600", "export function ", "text-b-ink", "Hero({ product }) {"],
              ["text-b-ink", "  return (", "", ""],
              ["text-b-cobalt", "    <section ", "text-emerald-700", 'className="hero">'],
              ["text-b-cobalt", "      <h1>", "text-b-ink", "{product.collection}"],
              ["text-b-cobalt", "      </h1>", "", ""],
              ["text-b-cobalt", "      <Picture ", "text-emerald-700", "src={product.image}"],
              ["text-emerald-700", '        sizes="(min-width: 60em) 55vw, 100vw"', "", ""],
              ["text-emerald-700", "        priority ", "text-b-cobalt", "/>"],
              ["text-b-cobalt", "      <AddToBag ", "text-emerald-700", "sku={product.sku} />"],
              ["text-b-cobalt", "    </section>", "", ""],
              ["text-b-ink", "  );", "", ""],
              ["text-b-ink", "}", "", ""],
            ].map(([c1, t1, c2, t2], i) => (
              <span key={i} className="block whitespace-pre">
                <span className="mr-[1.4cqw] inline-block w-[1.6cqw] text-right text-black/25">{i + 1}</span>
                <span className={c1}>{t1}</span>
                <span className={c2}>{t2}</span>
              </span>
            ))}
            <span className="absolute inset-x-[2.2cqw] bottom-[2cqw] flex items-center gap-[0.8cqw] rounded-[0.6cqw] bg-emerald-50 px-[1.2cqw] py-[0.8cqw] font-geist text-[1.05cqw] text-emerald-800">
              <span className="size-[0.8cqw] rounded-full bg-emerald-500" />
              212 tests passed · preview deployed
            </span>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="launch" className="absolute inset-0 font-geist" {...fade}>
            <motion.span className="absolute right-[2.4cqw] top-[6cqw] flex items-center gap-[1.4cqw] rounded-[1.2cqw] border border-white/80 bg-white/75 px-[1.6cqw] py-[1.2cqw] text-[1.15cqw] shadow-2xl backdrop-blur-md" initial={{ y: "-2cqw" }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
              <span className="grid size-[3.4cqw] place-items-center rounded-full bg-emerald-500 text-[1.2cqw] font-semibold text-white">100</span>
              <span>
                <span className="block font-medium">Live at maisonalder.com</span>
                <span className="text-b-mute">Largest paint 0.9 s · no layout shift</span>
              </span>
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserFrame>
  );
}

function Process() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const pinned = wide && !reduce;
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (pinned) setStep(Math.min(3, Math.floor(v * 4)));
  });

  const go = (i: number) => {
    const el = ref.current;
    if (!pinned || !el) return setStep(i);
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + span * ((i + 0.5) / 4) });
  };

  return (
    <section id="process" ref={ref} className={pinned ? "h-[360vh]" : "mt-24 md:mt-36"}>
      <div className={`grid grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-12 ${pinned ? "sticky top-0 h-svh content-start items-start pt-36" : "items-center"}`}>
        <div className="lg:col-span-4">
          <h2 className="text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.03] tracking-[-0.04em]">One product, four states.</h2>
          <ol className="no-scrollbar mt-8 flex gap-2 overflow-x-auto lg:flex-col lg:gap-0">
            {steps.map((s, i) => {
              const on = i === step;
              return (
                <li key={s.n} className="shrink-0 lg:border-t lg:border-b-line lg:last:border-b">
                  <button type="button" onClick={() => go(i)} aria-current={on ? "step" : undefined} className={`flex w-full items-start gap-4 rounded-full px-4 py-2 text-left transition-colors max-lg:ring-1 max-lg:ring-b-line lg:rounded-none lg:px-0 lg:py-5 ${on ? "max-lg:bg-b-ink max-lg:text-b-paper" : "text-b-mute"}`}>
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[0.75rem] font-medium tabular-nums transition-colors max-lg:hidden ${on ? "bg-b-cobalt text-white" : "bg-b-fog"}`}>{s.n}</span>
                    <span>
                      <span className={`block text-[1.0625rem] font-medium tracking-[-0.02em] transition-colors ${on ? "lg:text-b-ink" : ""}`}>{s.name}</span>
                      <span className={`hidden transition-[grid-template-rows,opacity] duration-500 lg:grid ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <span className="overflow-hidden">
                          <span className="block max-w-xs pt-1.5 text-[0.875rem] leading-relaxed text-b-mute">{s.line}</span>
                          <span className="mt-2 block text-[0.8125rem] text-b-ink">{s.output}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-5 text-[0.875rem] leading-relaxed text-b-mute lg:hidden">{steps[step].line}</p>
        </div>
        <div className="panel rounded-[1.75rem] p-4 md:p-8 lg:col-span-8">
          <ProcessStage step={step} />
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { x, y, bind } = usePointerParallax();
  const [left, right] = [featured.website, featured.leadWebsite];
  return (
    <section id="contact" className="px-4 pt-24 md:px-8 md:pt-36">
      <div {...bind} className="panel relative overflow-hidden rounded-[1.75rem] px-6 pt-14 text-center md:pt-24">
        <motion.h2 {...reveal} className="mx-auto max-w-4xl text-[clamp(2.4rem,6.4vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.05em]">
          The next one could be yours.
        </motion.h2>
        <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-b-mute">Tell us what you are building. We reply within two working days, and the first conversation is free.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Button href="/contact">Start a project</Button>
          <Button href={mailto} kind="ghost">
            {agency.email}
          </Button>
        </div>
        <div className="relative mx-auto mt-12 aspect-[16/5.2] max-w-5xl md:mt-16">
          <Layer px={x} py={y} depth={10} delay={0} className="left-0 top-[18%] w-[40%]">
            <SiteFrame still p={left} />
          </Layer>
          <Layer px={x} py={y} depth={10} delay={0} className="right-0 top-[18%] w-[40%]">
            <SiteFrame still p={right} />
          </Layer>
          <Layer px={x} py={y} depth={22} delay={0} className="left-[21%] top-0 w-[58%]">
            <BrowserFrame url="yourproduct.com">
              <div className="absolute inset-0 grid place-items-center bg-white" style={{ backgroundImage: "radial-gradient(circle, rgb(22 24 29 / 0.1) 1px, transparent 1.4px)", backgroundSize: "2.4cqw 2.4cqw" }}>
                <span className="flex items-center gap-[1cqw] rounded-full bg-b-cobalt px-[2.4cqw] py-[1.2cqw] font-geist text-[1.6cqw] font-medium text-white">
                  Your product here
                  <span className="h-[1.8cqw] w-[0.2cqw] bg-white" style={{ animation: "caret 1.1s steps(1) infinite" }} />
                </span>
              </div>
            </BrowserFrame>
          </Layer>
        </div>
      </div>
      <Footer />
    </section>
  );
}
