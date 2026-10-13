import { useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Button, Footer, Nav } from "../components/Chrome";
import { PhoneFrame } from "../components/Mockups";
import { EASE } from "../components/Shared";
import { AppPhone, SiteFrame, SitePhone } from "../components/Shots";
import { appDetails, searchWork, webDetails } from "../content/details";
import { projects, sitePages, type AppProject, type Project, type SeoProject, type WebProject } from "../content/work";

/*
 * One project in depth. Websites show the live page top to bottom on desktop and phone and what
 * is on it; apps walk through every screen, flow by flow; search projects lead with the results
 * and the analytics behind them.
 */

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.9, ease: EASE },
};

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="pt-24 md:pt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
        <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)]">{title}</h2>
        {note && <p className="max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** A window onto one part of a full-page capture. */
function Crop({ src, at, alt, ratio }: { src: string; at: number; alt: string; ratio: string }) {
  return (
    <motion.div {...reveal} className={`keep-light overflow-hidden rounded-[1.25rem] bg-b-fog ${ratio}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: `50% ${at}%` }} />
    </motion.div>
  );
}

/** Desktop site with its phone view alongside, both scrolling. */
function SiteStage({ p }: { p: WebProject | SeoProject }) {
  return (
    <div className="relative mx-auto max-w-5xl pb-[4%]">
      <SiteFrame p={p} eager className="w-full sm:w-[86%]" />
      <SitePhone p={p} eager className="absolute bottom-0 right-0 hidden w-[19%] sm:block" />
    </div>
  );
}

const DESKTOP_STOPS = [0, 20, 40, 60, 80, 100];
const PHONE_STOPS = [0, 33, 66, 100];

function PageTour({ p, title = "Down the page" }: { p: WebProject | SeoProject; title?: string }) {
  const { desktop, mobile } = sitePages(p);
  return (
    <Section title={title} note="Six stops from the top of the desktop page to the bottom, then four on a phone.">
      <div className="swipe-row grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {DESKTOP_STOPS.map((at) => (
          <Crop key={at} src={desktop} at={at} alt={`${p.name} desktop page, ${at}% down`} ratio="aspect-[16/10]" />
        ))}
      </div>
      <div className="swipe-row swipe-narrow mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
        {PHONE_STOPS.map((at) => (
          <Crop key={at} src={mobile} at={at} alt={`${p.name} on a phone, ${at}% down`} ratio="aspect-[9/16]" />
        ))}
      </div>
    </Section>
  );
}

function WebSections({ p }: { p: WebProject }) {
  const d = webDetails[p.slug];
  return (
    <>
      {d && (
        <Section title="What is on the site" note="Taken from the live site as it stands today.">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <motion.div {...reveal} className="panel rounded-[1.75rem] p-7 md:p-10 lg:col-span-5">
              <p className="text-[0.875rem] text-b-mute">{d.pages.length ? "Navigation" : "One page"}</p>
              {d.pages.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {d.pages.map((name) => (
                    <li key={name} className="rounded-full bg-b-fog px-4 py-2 text-[0.9375rem]">
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-[1.0625rem] leading-relaxed">A single long page that tells the whole story in order.</p>
              )}
              {d.cta && (
                <p className="mt-8 border-t border-b-line pt-5 text-[0.9375rem]">
                  <span className="text-b-mute">The one thing it asks a visitor to do</span>
                  <span className="mt-1 block text-[1.25rem] font-medium text-b-amber">{d.cta}</span>
                </p>
              )}
            </motion.div>
            <motion.ol {...reveal} className="lg:col-span-6 lg:col-start-7">
              {d.sections.map((line, i) => (
                <li key={line} className="flex gap-5 border-t border-b-line py-4 last:border-b">
                  <span className="w-6 shrink-0 pt-0.5 text-[0.875rem] tabular-nums text-b-mute">{i + 1}</span>
                  <span className="text-[1.0625rem] leading-snug">{line}</span>
                </li>
              ))}
            </motion.ol>
          </div>
        </Section>
      )}
      <PageTour p={p} />
    </>
  );
}

function AppSections({ p }: { p: AppProject }) {
  const d = appDetails[p.slug];
  const [dark, setDark] = useState(false);
  if (!d) return null;
  const sub = d.dark && dark ? "dark" : d.sub;
  const count = d.flows.reduce((n, f) => n + f.shots.length, 0);

  return (
    <>
      <Section title="About the app">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <p className="text-[clamp(1.25rem,1.9vw,1.6rem)] font-medium leading-snug tracking-[-0.01em]">{d.about}</p>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {p.features.map((f) => (
                <li key={f} className="rounded-full bg-b-fog px-4 py-2 text-[0.9375rem]">
                  {f}
                </li>
              ))}
            </ul>
            <dl className="mt-10 text-[0.9375rem]">
              {[
                ["Runs on", p.platforms],
                ["Built with", d.stack],
                ["Screens shown here", String(count)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-8 border-t border-b-line py-3 last:border-b">
                  <dt className="shrink-0 text-b-mute">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.8125rem] text-b-mute">{d.captured}</p>
          </div>
          <motion.div {...reveal} className="keep-light overflow-hidden rounded-[1.75rem] px-10 pt-10 lg:col-span-5 lg:col-start-8" style={{ background: p.tint.bg }}>
            <AppPhone app={p} eager className="mx-auto -mb-[30%] w-[62%] max-w-[17rem]" />
          </motion.div>
        </div>
      </Section>

      <section className="pt-24 md:pt-36">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)]">Every screen, in order.</h2>
          {d.dark ? (
            <div role="tablist" aria-label="Theme" className="flex rounded-full bg-b-fog p-1 text-[0.9375rem]">
              {["Light", "Dark"].map((name, i) => (
                <button key={name} type="button" role="tab" aria-selected={dark === (i === 1)} onClick={() => setDark(i === 1)} className={`rounded-full px-5 py-2 font-medium transition-colors ${dark === (i === 1) ? "bg-b-ink text-b-paper" : "text-b-mute"}`}>
                  {name}
                </button>
              ))}
            </div>
          ) : (
            <p className="max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">{count} screens across {d.flows.length} parts of the app, in the order a person meets them.</p>
          )}
        </div>

        {d.flows.map((flow, n) => (
          <div key={flow.title} className="grid grid-cols-1 gap-8 border-t border-b-line py-10 md:py-14 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-3">
              <p className="text-[0.875rem] tabular-nums text-b-mute">
                Part {n + 1} of {d.flows.length}
              </p>
              <h3 className="mt-2 text-[clamp(1.5rem,2.2vw,2rem)] font-semibold leading-none tracking-[-0.03em]">{flow.title}</h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-b-mute lg:max-w-xs">{flow.text}</p>
            </div>
            <ul className="swipe-row swipe-narrow grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:col-span-9 lg:grid-cols-4 xl:grid-cols-5">
              {flow.shots.map((shot) => (
                <motion.li key={shot.file} {...reveal}>
                  <PhoneFrame>
                    <img key={sub} src={`/work/${d.folder}/${sub}/${shot.file}.webp`} alt={shot.caption} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
                  </PhoneFrame>
                  <p className="mt-4 text-[0.9375rem] font-medium">{shot.label}</p>
                  <p className="mt-1 text-[0.8125rem] leading-snug text-b-mute">{shot.caption}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <Section title="Side by side">
        <div className="grid grid-cols-1 gap-5">
          {d.collages.map((c) => (
            <motion.img key={c.file} {...reveal} src={`/work/${d.folder}/${c.file}.webp`} alt={c.alt} loading="lazy" decoding="async" className="block w-full rounded-[1.75rem]" />
          ))}
        </div>
      </Section>
    </>
  );
}

function SeoSections({ p }: { p: SeoProject }) {
  return (
    <>
      <Section title="The results" note={p.period}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <motion.div {...reveal} className="panel flex flex-col justify-between rounded-[1.75rem] p-8 md:p-10 lg:col-span-5">
            <p className="text-[clamp(3.4rem,8vw,6.5rem)] font-semibold leading-none tracking-[-0.05em] text-b-amber">{p.metric}</p>
            <p className="mt-4 text-[1.25rem]">{p.metricLabel}</p>
          </motion.div>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-7">
            {p.stats.map((stat) => (
              <motion.div key={stat.label} {...reveal} className="flex flex-col justify-between rounded-[1.75rem] bg-b-fog p-6">
                <dd className="text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.04em]">{stat.value}</dd>
                <dt className="mt-8 text-[0.9375rem] text-b-mute">{stat.label}</dt>
              </motion.div>
            ))}
          </dl>
        </div>
        <ul className="mt-10 grid gap-x-10 md:grid-cols-2">
          {p.findings.map((line) => (
            <li key={line} className="border-t border-b-line py-5 text-[1.0625rem] leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="From the analytics" note="Unedited screenshots from the client's own Google accounts.">
        <div className="flex flex-col gap-10">
          {p.proofs.map((proof, i) => (
            <motion.figure key={proof.src} {...reveal} className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
              <figcaption className="lg:col-span-3">
                <span className="text-[0.875rem] tabular-nums text-b-mute">
                  Screenshot {i + 1} of {p.proofs.length}
                </span>
                <span className="mt-2 block text-[1.0625rem] font-medium leading-snug">{proof.caption}</span>
              </figcaption>
              <div className="keep-light overflow-hidden rounded-[1.25rem] bg-white lg:col-span-9">
                <img src={proof.src} alt={proof.caption} loading="lazy" decoding="async" className="block w-full" />
              </div>
            </motion.figure>
          ))}
        </div>
      </Section>

      <Section title="What the work covered" note="The four parts of a search engagement.">
        <ol className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          {searchWork.map((item, i) => (
            <motion.li key={item.name} {...reveal} className="flex gap-5 border-t border-b-line py-6">
              <span className="w-6 shrink-0 pt-1 text-[0.875rem] tabular-nums text-b-mute">{i + 1}</span>
              <span>
                <span className="block text-[1.25rem] font-medium tracking-[-0.01em]">{item.name}</span>
                <span className="mt-2 block max-w-md text-[0.9375rem] leading-relaxed text-b-mute">{item.text}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </Section>

      <PageTour p={p} title="The site itself" />
    </>
  );
}

function facts(p: Project): [string, string][] {
  if (p.kind === "app") return [["Type", p.category], ["Platforms", p.platforms]];
  if (p.kind === "seo") return [["Type", p.category], ["Market", p.place], ["Period", p.period]];
  return [["Type", p.category], ["Live at", p.link.label]];
}

export default function WorkDetail() {
  const { slug } = useParams();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return <Navigate to="/work" replace />;
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const app = p.kind === "app" ? appDetails[p.slug] : undefined;

  return (
    <div className="min-h-screen font-geist text-b-ink">
      <Nav />
      <main className="px-4 pt-28 md:px-8 md:pt-36">
        <Link to="/work" className="inline-flex items-center gap-2 text-[0.875rem] text-b-mute transition-colors hover:text-b-ink">
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
            <path d="M14 8H3M7 3.5 2.5 8 7 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          All work
        </Link>

        <header className="mt-6 grid gap-8 md:grid-cols-12">
          <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }}>
            <h1 className="text-face text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.045em]">{p.name}</h1>
            <p className="mt-6 max-w-xl text-[1.125rem] leading-relaxed text-b-mute">{p.summary}</p>
            {p.kind === "seo" && (
              <p className="mt-8 flex items-baseline gap-3">
                <span className="text-[clamp(2.4rem,4.4vw,3.8rem)] font-semibold leading-none tracking-[-0.04em] text-b-amber">{p.metric}</span>
                <span className="text-[1rem] text-b-mute">{p.metricLabel}</span>
              </p>
            )}
          </motion.div>
          <div className="md:col-span-4 md:col-start-9">
            <dl className="text-[0.9375rem]">
              {facts(p).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-t border-b-line py-3">
                  <dt className="shrink-0 text-b-mute">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <Button href={p.link.href} external>
                {p.kind === "app" ? p.link.label : `Visit ${p.link.label}`}
              </Button>
            </div>
          </div>
        </header>

        <motion.div {...reveal} className="keep-light mt-10 overflow-hidden rounded-[1.75rem] p-4 md:mt-14 md:p-14" style={{ background: p.tint.bg }}>
          {p.kind === "app" ? (
            <img src={app ? `/work/${app.folder}/${app.collages[0].file}.webp` : p.banner.src} alt={app ? app.collages[0].alt : p.banner.alt} decoding="async" className="mx-auto block w-full max-w-6xl rounded-2xl" />
          ) : (
            <SiteStage p={p} />
          )}
        </motion.div>

        {p.kind === "web" && <WebSections p={p} />}
        {p.kind === "app" && <AppSections p={p} />}
        {p.kind === "seo" && <SeoSections p={p} />}

        <section className="pt-24 md:pt-36">
          <div className="panel flex flex-col items-start justify-between gap-8 rounded-[1.75rem] p-8 md:flex-row md:items-end md:p-12">
            <div>
              <h2 className="text-[clamp(2rem,4.2vw,3.6rem)]">Want something like this?</h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-b-mute">Tell us what you are building. We reply within two working days, and the first conversation is free.</p>
            </div>
            <Button href="/contact">Start a project</Button>
          </div>
        </section>

        <Link to={`/work/${next.slug}`} className="group mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-b-line pt-8 md:mt-24">
          <span>
            <span className="block text-[0.875rem] text-b-mute">Next project</span>
            <span className="mt-1 block text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-none tracking-[-0.045em] decoration-2 underline-offset-8 group-hover:underline">{next.name}</span>
          </span>
          <span className="text-[0.9375rem] text-b-mute">{next.category}</span>
        </Link>

        <Footer />
      </main>
    </div>
  );
}
