import Lenis from "lenis";
import "lenis/dist/lenis.css";

/*
 * Inertial scrolling (Lenis) plus a smoothed scroll speed that elements can react to.
 *
 * Elements registered with `velRef` get a `--vel` custom property in -1..1 (negative while
 * scrolling up). CSS uses it to lean and split work frames as the page moves; see `.vel-lean`.
 */

const listeners = new Set<HTMLElement>();

/** React ref callback: `<ul ref={velRef}>`. Children can read `var(--vel)`. */
export const velRef = (el: HTMLElement | null) => {
  if (!el) return;
  listeners.add(el);
  el.style.setProperty("--vel", "0");
  return () => {
    listeners.delete(el);
  };
};

export function startSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, anchors: true });
  let vel = 0;
  let written = 0;
  let raf = 0;
  const tick = (time: number) => {
    lenis.raf(time);
    // Lenis reports px per frame; ~70 px/frame is a hard flick.
    const target = Math.max(-1, Math.min(1, lenis.velocity / 70));
    vel += (target - vel) * 0.14;
    if (Math.abs(vel) < 0.002) vel = 0;
    if (Math.abs(vel - written) > 0.002) {
      written = vel;
      const value = vel.toFixed(3);
      listeners.forEach((el) => el.style.setProperty("--vel", value));
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    lenis.destroy();
  };
}
