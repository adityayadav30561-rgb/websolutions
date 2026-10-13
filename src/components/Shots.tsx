import { useState, type CSSProperties } from "react";
import { BrowserFrame, PhoneFrame } from "./Mockups";
import { useCycle } from "../lib/hooks";
import { sitePages, type AppProject, type Project, type SeoProject, type Shot, type WebProject } from "../content/work";

/* Real screenshots, placed inside the same frames as the mockups. */

type ShotPageProps = {
  src: string;
  /** Shown instead if `src` fails to load (for example a still when the full-page capture is missing). */
  fallback?: string;
  alt?: string;
  eager?: boolean;
};

/**
 * A full-page capture that scrolls inside its frame (see .mock-pan).
 * Longer pages get proportionally more time so every page moves at the same steady pace.
 */
export function ShotPage({ src, fallback, alt = "", eager }: ShotPageProps) {
  const [pace, setPace] = useState<string>();
  const [stage, setStage] = useState<"main" | "fallback" | "failed">("main");
  if (stage === "failed") return <div className="absolute inset-0 grid place-items-center bg-b-fog font-geist text-[1.6cqw] text-b-mute">Screenshot coming soon</div>;
  return (
    <img
      src={stage === "main" ? src : fallback}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={(e) => {
        const { naturalHeight, naturalWidth } = e.currentTarget;
        setPace(`${Math.min(90, Math.max(6, Math.round((naturalHeight / naturalWidth) * 4.5)))}s`);
      }}
      onError={() => setStage(stage === "main" && fallback ? "fallback" : "failed")}
      className="mock-pan block w-full"
      style={pace ? ({ "--pan-time": pace } as CSSProperties) : undefined}
    />
  );
}

/**
 * App screens stacked in a phone; the active one fades in over the rest.
 * When `scroll` is given it replaces the first screen with a long capture that scrolls.
 */
export function PhoneShots({ shots, index, scroll }: { shots: Shot[]; index: number; scroll?: string }) {
  const layer = (on: boolean) => `absolute inset-0 transition-[opacity,transform] duration-700 ease-out-expo ${on ? "opacity-100" : "translate-x-[6%] opacity-0"}`;
  return (
    <>
      {shots.map((s, i) =>
        i === 0 && scroll ? (
          <div key={s.src} aria-hidden={index !== 0} className={`overflow-hidden bg-white ${layer(index === 0)}`}>
            <ShotPage src={scroll} fallback={s.src} alt={s.alt} eager />
          </div>
        ) : (
          <img key={s.src} src={s.src} alt={i === index ? s.alt : ""} aria-hidden={i !== index} decoding="async" draggable={false} className={`h-full w-full object-cover object-top ${layer(i === index)}`} />
        ),
      )}
    </>
  );
}

/** A phone scrolling through an app's opening screen, or stepping through its screens when there is no long capture. */
export function AppPhone({ app, eager, className = "" }: { app: AppProject; eager?: boolean; className?: string }) {
  const shots = app.screens.slice(0, 5);
  const [i] = useCycle(shots.length, 2800, Boolean(app.scroll));
  return (
    <PhoneFrame className={className}>
      {app.scroll ? <ShotPage src={app.scroll} fallback={shots[0].src} alt={shots[0].alt} eager={eager} /> : <PhoneShots shots={shots} index={i} />}
    </PhoneFrame>
  );
}

type SiteFrameProps = { p: WebProject | SeoProject; ratio?: string; still?: boolean; eager?: boolean; className?: string };

/** A website in a browser frame, scrolling itself. */
export function SiteFrame({ p, ratio, still, eager, className = "" }: SiteFrameProps) {
  const pages = sitePages(p);
  return (
    <BrowserFrame url={p.link.label} ratio={ratio} still={still} className={className}>
      <ShotPage src={pages.desktop} fallback={pages.fallback?.desktop} alt={`${p.name} homepage`} eager={eager} />
    </BrowserFrame>
  );
}

/** The same website on a phone, scrolling itself. */
export function SitePhone({ p, eager, className = "" }: { p: WebProject | SeoProject; eager?: boolean; className?: string }) {
  const pages = sitePages(p);
  return (
    <PhoneFrame className={className}>
      <ShotPage src={pages.mobile} fallback={pages.fallback?.mobile} alt={`${p.name} on a phone`} eager={eager} />
    </PhoneFrame>
  );
}

/** A project's live visual at full column width: a scrolling site, or an app on a tinted panel flanked by two more of its screens. */
export function ProjectVisual({ p, eager }: { p: Project; eager?: boolean }) {
  if (p.kind !== "app") return <SiteFrame p={p} eager={eager} className="transition-transform duration-700 ease-out-expo group-hover:-translate-y-2" />;
  return (
    <div className="keep-light relative aspect-[16/10.6] overflow-hidden rounded-[1.25rem]" style={{ background: p.tint.bg }}>
      {[p.screens[1], p.screens[2]].map((shot, i) => (
        <PhoneFrame key={shot.src} className={`absolute top-[26%] w-[22%] opacity-90 ${i === 0 ? "left-[13%]" : "right-[13%]"}`}>
          <img src={shot.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
        </PhoneFrame>
      ))}
      <AppPhone app={p} eager={eager} className="absolute left-1/2 top-[10%] w-[28%] -translate-x-1/2 transition-transform duration-700 ease-out-expo group-hover:-translate-y-2" />
    </div>
  );
}
