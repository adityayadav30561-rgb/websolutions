import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button, Footer, Nav } from "../components/Chrome";
import { EASE } from "../components/Shared";
import { ProjectVisual } from "../components/Shots";
import { agency, offerings, principles, steps } from "../content/site";
import { featured, projects } from "../content/work";

/* About the studio: what it is, what it does, how it works, what it holds to. */

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.9, ease: EASE },
};

const counts = [
  { n: projects.filter((p) => p.kind === "web").length, label: "websites built" },
  { n: projects.filter((p) => p.kind === "app").length, label: "apps shipped" },
  { n: projects.filter((p) => p.kind === "seo").length, label: "search campaigns" },
];

function Head({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
      <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)]">{title}</h2>
      {note && <p className="max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">{note}</p>}
    </div>
  );
}

export default function About() {
  const shown = [featured.leadWebsite, featured.appWithTabs, featured.search];
  const lines = ["One studio,", "start to found."];
  return (
    <div className="min-h-screen font-geist text-b-ink">
      <Nav />
      <main className="px-4 md:px-8">
        <section className="grid grid-cols-1 gap-10 pt-32 md:pt-44 lg:grid-cols-12 lg:gap-6">
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
        </section>

        <motion.dl {...reveal} className="mt-16 grid grid-cols-3 border-y border-b-line md:mt-24">
          {counts.map((c) => (
            <div key={c.label} className="border-l border-b-line py-8 pl-5 first:border-l-0 first:pl-0 md:py-12 md:pl-8">
              <dd className="text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-none tracking-[-0.05em] text-b-amber">{c.n}</dd>
              <dt className="mt-3 text-[0.9375rem] text-b-mute">{c.label}</dt>
            </div>
          ))}
        </motion.dl>

        <section className="pt-24 md:pt-36">
          <Head title="What we do." note="Four kinds of work, done by the same people." />
          <ol className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            {offerings.map((o, i) => (
              <motion.li key={o.name} {...reveal} className="flex gap-5 border-t border-b-line py-7">
                <span className="w-6 shrink-0 pt-1 text-[0.875rem] tabular-nums text-b-mute">{i + 1}</span>
                <span>
                  <span className="block text-[clamp(1.375rem,2vw,1.75rem)] font-semibold leading-tight tracking-[-0.02em]">{o.name}</span>
                  <span className="mt-3 block max-w-md text-[1rem] leading-relaxed text-b-mute">{o.text}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="pt-24 md:pt-36">
          <Head title="How a project runs." note="The same four stages every time, so you always know where things stand." />
          <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <motion.li key={s.n} {...reveal} transition={{ ...reveal.transition, delay: (s.n - 1) * 0.07 }} className="panel flex flex-col rounded-[1.75rem] p-7">
                <span className="grid size-9 place-items-center rounded-full bg-b-cobalt text-[0.9375rem] font-medium tabular-nums text-white">{s.n}</span>
                <span className="mt-8 text-[1.5rem] font-semibold tracking-[-0.02em]">{s.name}</span>
                <span className="mt-3 text-[0.9375rem] leading-relaxed text-b-mute">{s.line}</span>
                <span className="mt-auto border-t border-b-line pt-4 text-[0.875rem]">
                  <span className="mt-6 block text-b-mute">You get</span>
                  {s.output}
                </span>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="grid grid-cols-1 gap-10 pt-24 md:pt-36 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <h2 className="text-[clamp(2rem,4.2vw,3.6rem)]">What we hold to.</h2>
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">The habits that make the work easier to trust.</p>
          </div>
          <ul className="border-b border-b-line lg:col-span-7 lg:col-start-6">
            {principles.map((pr) => (
              <motion.li key={pr.name} {...reveal} className="border-t border-b-line py-7">
                <p className="text-[clamp(1.25rem,1.8vw,1.5rem)] font-semibold tracking-[-0.02em]">{pr.name}</p>
                <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-b-mute">{pr.text}</p>
              </motion.li>
            ))}
          </ul>
          {import.meta.env.DEV && <p className="text-[0.8125rem] text-b-mute lg:col-span-12">Draft wording in src/content/site.ts (offerings, principles). Correct it to match how you work. (This note only shows in development.)</p>}
        </section>

        <section className="pt-24 md:pt-36">
          <Head title="Some of the work." note="One of each: a website, an app and a search campaign." />
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3">
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
              See all {projects.length} projects
            </Button>
          </div>
        </section>

        <section className="pt-24 md:pt-36">
          <div className="panel flex flex-col items-start justify-between gap-8 rounded-[1.75rem] p-8 md:flex-row md:items-end md:p-12">
            <div>
              <h2 className="text-[clamp(2rem,4.2vw,3.6rem)]">Have something to build?</h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-b-mute">Tell us what it is. We reply within two working days, and the first conversation is free.</p>
            </div>
            <Button href="/contact">Start a project</Button>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
