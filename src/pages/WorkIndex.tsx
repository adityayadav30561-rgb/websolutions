import { useState } from "react";
import { Link } from "react-router-dom";
import { Footer, Nav } from "../components/Chrome";
import { PhoneFrame } from "../components/Mockups";
import { AppPhone, SiteFrame } from "../components/Shots";
import { kindLabel, projects, type Project } from "../content/work";
import { totalsLine } from "../content/site";
import { velRef } from "../lib/scroll";

/* Every project, filterable by kind. */

type Filter = "all" | Project["kind"];
const filters: Filter[] = ["all", "web", "app", "seo"];

function Visual({ p }: { p: Project }) {
  if (p.kind === "app") {
    const side = "absolute top-[24%] w-[24%] opacity-90";
    return (
      <>
        {[p.screens[1], p.screens[2]].map((s, i) => (
          <PhoneFrame key={s.src} className={`${side} ${i === 0 ? "left-[10%]" : "right-[10%]"}`}>
            <img src={s.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
          </PhoneFrame>
        ))}
        <AppPhone app={p} className="absolute left-1/2 top-[10%] w-[30%] -translate-x-1/2" />
      </>
    );
  }
  return <SiteFrame p={p} className="absolute left-[8%] top-[11%] w-[84%] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2" />;
}

function Card({ p }: { p: Project }) {
  return (
    <Link to={`/work/${p.slug}`} className="group block">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem]" style={{ background: p.tint.bg }}>
        <Visual p={p} />
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h3 className="text-[1.375rem] font-medium tracking-[-0.03em] decoration-1 underline-offset-4 group-hover:underline">{p.name}</h3>
          <p className="mt-1 max-w-md text-[0.9375rem] leading-relaxed text-b-mute">{p.line}</p>
        </div>
        <p className="text-[0.875rem] text-b-mute sm:shrink-0 sm:text-right">
          {p.category}
          {p.kind === "seo" && (
            <span className="font-medium text-b-amber max-sm:ml-2 sm:block">
              {p.metric} {p.metricLabel}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

export default function WorkIndex() {
  const [filter, setFilter] = useState<Filter>("all");
  const list = filter === "all" ? projects : projects.filter((p) => p.kind === filter);
  const count = (f: Filter) => (f === "all" ? projects.length : projects.filter((p) => p.kind === f).length);

  return (
    <div className="min-h-screen font-geist text-b-ink">
      <Nav />
      <main className="px-4 pt-28 md:px-8 md:pt-40">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-[clamp(2.6rem,6vw,5rem)] font-medium leading-none tracking-[-0.05em]">Work</h1>
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-b-mute">A selection from {totalsLine}. Open any one for screenshots and the detail.</p>
        </div>

        <div role="tablist" aria-label="Filter work" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors ${filter === f ? "bg-b-ink text-b-paper" : "bg-b-fog text-b-ink hover:bg-b-line"}`}
            >
              {f === "all" ? "All" : kindLabel[f]}
              <span className="tabular-nums opacity-55">{count(f)}</span>
            </button>
          ))}
        </div>

        <div ref={velRef} className="vel-lean mt-8 grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2">
          {list.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}
