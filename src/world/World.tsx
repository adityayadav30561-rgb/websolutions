import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { createInk, type Stir } from "./fluid";

/*
 * The site has two worlds.
 *   colour ("night", the default) a moving blue smoke field behind the page, everything in full colour.
 *   mono   ("canvas") paper with soft pastel washes; page colours are muted and the pointer paints
 *          in colours that shift along each stroke, bringing full colour back where it lands.
 *
 * Two fixed canvases do the work (see fluid.ts):
 *   - the smoke canvas sits behind the content (negative z-index, so page content needs no
 *     stacking context of its own). It runs the fluid simulation and draws both worlds.
 *   - the veil canvas sits above everything with `mix-blend-mode: saturation` and mutes the
 *     page except where there is paint.
 * Switching worlds grows the night from the toggle until it covers the screen.
 */

export type WorldMode = "mono" | "color";
type Ctx = { mode: WorldMode; toggle: (origin?: { x: number; y: number }) => void };
const WorldContext = createContext<Ctx>({ mode: "mono", toggle: () => {} });
export const useWorld = () => useContext(WorldContext);

// Bumped when the default world changed, so an old saved choice does not override the new default.
const STORAGE_KEY = "northlight-world-2";

/** Paint colours. The brush runs through them as it travels, so one stroke shifts from each to the next. */
const PALETTE: [number, number, number][] = [
  [0.16, 0.28, 0.98], // cobalt
  [1.0, 0.36, 0.3], // coral
  [1.0, 0.72, 0.12], // amber
  [0.05, 0.74, 0.62], // teal
  [0.58, 0.32, 0.96], // violet
];

function InkCanvases({ mode, origin }: { mode: WorldMode; origin: { x: number; y: number } }) {
  const smokeRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  // Read inside the frame loop without restarting it.
  const live = useRef({ mode, origin });
  live.current = { mode, origin };
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    const smoke = smokeRef.current;
    const veil = veilRef.current;
    const ink = smoke && veil ? createInk(smoke, veil) : null;
    if (!ink || !veil) {
      document.documentElement.classList.add("no-webgl");
      return;
    }

    const stirs: Stir[] = [];
    let last: { x: number; y: number } | null = null;
    let travelled = 0;
    const stirAt = (cx: number, cy: number) => {
      const x = cx / window.innerWidth;
      const y = 1 - cy / window.innerHeight;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        // A jump (pointer left and came back) starts a new stroke instead of a streak across the page.
        if (dist > 0.0008 && dist < 0.35) {
          // The colour depends on how far the brush has travelled: every sixth of the screen it has
          // blended fully into the next colour, so a single sweep runs through several.
          travelled += dist;
          const along = travelled / 0.16;
          const from = PALETTE[Math.floor(along) % PALETTE.length];
          const to = PALETTE[(Math.floor(along) + 1) % PALETTE.length];
          const k = along % 1;
          const blend = k * k * (3 - 2 * k);
          // Paint belongs to the canvas world; in the night world the cursor only stirs the smoke.
          const color: [number, number, number] = live.current.mode === "mono" ? [from[0] + (to[0] - from[0]) * blend, from[1] + (to[1] - from[1]) * blend, from[2] + (to[2] - from[2]) * blend] : [0, 0, 0];
          // Fill long gaps so a fast stroke is a ribbon, not a row of dots.
          const steps = Math.min(6, Math.max(1, Math.ceil(dist / 0.018)));
          for (let i = 1; i <= steps; i++) stirs.push({ x: last.x + (dx * i) / steps, y: last.y + (dy * i) / steps, dx: dx / steps, dy: dy / steps, color });
          wake.current();
        }
      }
      last = { x, y };
    };
    const onPointer = (e: PointerEvent) => stirAt(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) stirAt(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
      last = null;
    };

    let reveal = live.current.mode === "color" ? 1 : 0;
    const start = performance.now();
    let prev = start;
    let raf = 0;
    let running = false;

    const draw = (now: number) => {
      const elapsed = (now - prev) / 1000;
      prev = now;
      const target = live.current.mode === "color" ? 1 : 0;
      reveal = reduce ? target : reveal + Math.sign(target - reveal) * Math.min(Math.abs(target - reveal), elapsed / 1.15);
      veil.style.visibility = "hidden"; // nothing mutes the page any more; kept for a future effect
      const { origin: o } = live.current;
      ink.frame(stirs, { time: (now - start) / 1000, dt: Math.min(0.033, Math.max(0.008, elapsed)), reveal, originX: o.x, originY: o.y, scroll: window.scrollY, veil: false });
      stirs.length = 0;

      // Both worlds drift on their own (smoke, washes), so the loop only stops when the tab is hidden.
      if (reduce || document.hidden) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(draw);
    };
    const run = () => {
      if (running && !reduce) return;
      running = true;
      prev = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wake.current = run;

    const onResize = () => {
      ink.resize();
      run();
    };
    window.addEventListener("resize", onResize);
    if (!reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    document.addEventListener("visibilitychange", run);
    run();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", run);
    };
  }, [reduce]);

  useEffect(() => {
    wake.current();
  }, [mode]);

  return (
    <>
      <canvas ref={smokeRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      <canvas ref={veilRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" style={{ mixBlendMode: "saturation" }} />
      {/* Film grain over both worlds, then scanlines: faint in colour, loud for a moment while switching */}
      <div aria-hidden className="film-grain pointer-events-none fixed inset-0 z-[71]" />
      <div aria-hidden className="tv-lines pointer-events-none fixed inset-0 z-[72]" />
    </>
  );
}

export function WorldProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WorldMode>(() => {
    // The night world is the site people land on; the canvas is the alternative.
    let saved: WorldMode = "color";
    try {
      if (localStorage.getItem(STORAGE_KEY) === "mono") saved = "mono";
    } catch {
      /* storage blocked: start in the night world */
    }
    // Set before first paint so the page never flashes the wrong ink colour.
    document.documentElement.dataset.world = saved;
    return saved;
  });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode: the choice just lasts for this visit */
    }
  }, [mode]);

  const toggle = useCallback((from?: { x: number; y: number }) => {
    setOrigin(from ?? { x: window.innerWidth - 80, y: 48 });
    const html = document.documentElement;
    const next: WorldMode = html.dataset.world === "color" ? "mono" : "color";
    setMode(next);
    // Ink colours follow the smoke: wait for it to cover half the screen on the way in, flip at once on the way out.
    window.setTimeout(() => (html.dataset.world = next), next === "color" ? 520 : 0);
    html.classList.add("world-switching");
    window.setTimeout(() => html.classList.remove("world-switching"), 800);
  }, []);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);
  return (
    <WorldContext.Provider value={value}>
      <InkCanvases mode={mode} origin={origin} />
      {children}
    </WorldContext.Provider>
  );
}

/** Moon button: switches between the duotone page and the colour world. */
export function WorldToggle({ className = "" }: { className?: string }) {
  const { mode, toggle } = useWorld();
  return (
    <button
      type="button"
      aria-pressed={mode === "color"}
      aria-label={mode === "color" ? "Switch to the canvas" : "Switch to the night sky"}
      title={mode === "color" ? "Canvas" : "Night sky"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300 hover:bg-b-ink/10 ${className}`}
    >
      <svg viewBox="0 0 20 20" className={`size-5 transition-transform duration-700 ease-out-expo ${mode === "color" ? "rotate-[200deg]" : ""}`} aria-hidden>
        <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7z" fill="currentColor" />
      </svg>
    </button>
  );
}
