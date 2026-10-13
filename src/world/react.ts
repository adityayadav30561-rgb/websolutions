/*
 * Content that reacts to the cursor.
 *
 * Whatever display type or work frame is under the pointer is run through an SVG filter that
 * pushes its pixels away from the cursor in the direction of travel, by a different amount
 * per colour channel. The result is a local warp with red and blue fringes that follows the
 * hand and relaxes when it stops, the way the reference site's fluid distorts its images.
 *
 * How the filter localises the effect: a point light over a flat surface gives a soft spot
 * centred on the cursor. That spot scales a direction colour around mid-grey, which is the
 * neutral value for feDisplacementMap, so pixels far from the cursor do not move.
 */

const SVG = `
<svg width="0" height="0" aria-hidden="true" style="position:absolute;pointer-events:none">
  <filter id="react" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
    <feFlood flood-color="#fff" result="flat"/>
    <feDiffuseLighting in="flat" surfaceScale="0" diffuseConstant="1" lighting-color="#fff" result="spot">
      <fePointLight x="0" y="0" z="90"/>
    </feDiffuseLighting>
    <feComponentTransfer in="spot" result="core">
      <feFuncR type="gamma" exponent="6"/><feFuncG type="gamma" exponent="6"/><feFuncB type="gamma" exponent="6"/>
    </feComponentTransfer>
    <feFlood flood-color="rgb(128,128,128)" result="dir"/>
    <feComposite in="core" in2="dir" operator="arithmetic" k1="1" k2="-0.5" k3="0" k4="0.5" result="map"/>
    <feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
    <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
    <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
    <feDisplacementMap in="r" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dr"/>
    <feDisplacementMap in="g" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dg"/>
    <feDisplacementMap in="b" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="db"/>
    <feBlend in="dr" in2="dg" mode="screen" result="rg"/>
    <feBlend in="rg" in2="db" mode="screen"/>
  </filter>
</svg>`;

/** What can react: display type and anything marked `.react` (work frames). */
const TARGETS = "h1, h2, .react";

export function startReactiveContent() {
  const host = document.createElement("div");
  host.innerHTML = SVG;
  document.body.appendChild(host);
  const light = host.querySelector("fePointLight")!;
  const dir = host.querySelectorAll("feFlood")[1];
  const [dr, dg, db] = [...host.querySelectorAll("feDisplacementMap")];

  let el: HTMLElement | null = null;
  let last: { x: number; y: number } | null = null;
  let pos = { x: 0, y: 0 };
  let vx = 0;
  let vy = 0;
  let raf = 0;

  const release = () => {
    if (el) el.style.filter = "";
    el = null;
  };

  const tick = () => {
    raf = 0;
    const speed = Math.hypot(vx, vy);
    if (!el || speed < 0.4) {
      release();
      return;
    }
    const box = el.getBoundingClientRect();
    light.setAttribute("x", (pos.x - box.left).toFixed(1));
    light.setAttribute("y", (pos.y - box.top).toFixed(1));
    // Direction of travel, encoded around mid-grey.
    const nx = Math.max(-1, Math.min(1, vx / 40));
    const ny = Math.max(-1, Math.min(1, vy / 40));
    dir.setAttribute("flood-color", `rgb(${Math.round(128 - nx * 127)},${Math.round(128 - ny * 127)},128)`);
    const amount = Math.min(95, speed * 3.4);
    dr.setAttribute("scale", (amount * 1.45).toFixed(1));
    dg.setAttribute("scale", amount.toFixed(1));
    db.setAttribute("scale", (amount * 0.55).toFixed(1));
    vx *= 0.9;
    vy *= 0.9;
    raf = requestAnimationFrame(tick);
  };

  const onMove = (e: PointerEvent) => {
    // The glitch belongs to the night world only.
    if (e.pointerType !== "mouse" || document.documentElement.dataset.world !== "color") {
      release();
      return;
    }
    if (last) {
      vx += (e.clientX - last.x - vx) * 0.5;
      vy += (e.clientY - last.y - vy) * 0.5;
    }
    last = pos = { x: e.clientX, y: e.clientY };
    const hit = e.target instanceof Element ? e.target.closest<HTMLElement>(TARGETS) : null;
    if (hit !== el) {
      release();
      el = hit;
      if (el) el.style.filter = "url(#react)";
    }
    if (el && !raf) raf = requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onMove);
    cancelAnimationFrame(raf);
    release();
    host.remove();
  };
}
