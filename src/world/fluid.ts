/*
 * GPU ink.
 *
 * A stable-fluids simulation (advect, vorticity, pressure projection) runs in the smoke
 * canvas's WebGL context. The pointer stirs the velocity field and drops dye; the dye is
 * the ink. The same context then draws the colour world's smoke wherever there is ink,
 * and the fluid's velocity pushes that smoke around.
 *
 * A second, much simpler context (the veil) copies the smoke canvas each frame and uses
 * its alpha as the ink mask: where there is no ink it lays a navy "colour" blend over the
 * page, which is what turns everything duotone.
 */

const VERT = `
attribute vec2 a;
uniform vec2 uTexel;
varying vec2 vUv, vL, vR, vT, vB;
void main(){
  vUv = a * .5 + .5;
  vL = vUv - vec2(uTexel.x, 0.); vR = vUv + vec2(uTexel.x, 0.);
  vT = vUv + vec2(0., uTexel.y); vB = vUv - vec2(0., uTexel.y);
  gl_Position = vec4(a, 0., 1.);
}`;

const HEAD = `precision highp float; varying vec2 vUv, vL, vR, vT, vB;`;

const SPLAT = `${HEAD}
uniform sampler2D uTarget; uniform float uAspect, uRadius; uniform vec2 uPoint; uniform vec3 uColor;
void main(){
  vec2 p = vUv - uPoint; p.x *= uAspect;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / uRadius) * uColor, 1.);
}`;

const ADVECT = `${HEAD}
uniform sampler2D uVelocity, uSource; uniform vec2 uVelTexel; uniform float uDt, uDecay;
void main(){
  vec2 from = vUv - uDt * texture2D(uVelocity, vUv).xy * uVelTexel;
  gl_FragColor = vec4(uDecay * texture2D(uSource, from).xyz, 1.);
}`;

const DIVERGENCE = `${HEAD}
uniform sampler2D uVelocity;
void main(){
  float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x; if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
  gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.);
}`;

const CURL = `${HEAD}
uniform sampler2D uVelocity;
void main(){
  float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y, T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(.5 * (R - L - T + B), 0., 0., 1.);
}`;

const VORTICITY = `${HEAD}
uniform sampler2D uVelocity, uCurl; uniform float uCurlStrength, uDt;
void main(){
  float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x, T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x, C = texture2D(uCurl, vUv).x;
  vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f = f / (length(f) + .0001) * uCurlStrength * C; f.y *= -1.;
  gl_FragColor = vec4(texture2D(uVelocity, vUv).xy + f * uDt, 0., 1.);
}`;

const PRESSURE = `${HEAD}
uniform sampler2D uPressure, uDivergence;
void main(){
  float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
  gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * .25, 0., 0., 1.);
}`;

const GRADIENT = `${HEAD}
uniform sampler2D uPressure, uVelocity;
void main(){
  float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
  gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(R - L, T - B), 0., 1.);
}`;

const SCALE = `${HEAD}
uniform sampler2D uSource; uniform float uValue;
void main(){ gl_FragColor = uValue * texture2D(uSource, vUv); }`;

/**
 * Final pass. Two looks share one canvas:
 *   canvas world (uReveal 0): soft pastel washes on paper, and the pointer's ink as wet paint
 *     in whatever colour was loaded on the brush.
 *   night world (uReveal 1): blue smoke, stars and a planet's limb, with the paint glowing in it.
 * Output is premultiplied. Alpha doubles as a signal to the veil: washes stay under 0.6,
 * paint and night sit above 0.8, so the veil can tell "ink here" from "just a wash".
 */
const DISPLAY = `${HEAD}
uniform sampler2D uDye, uVelocity;
uniform vec2 uRes;      // viewport in css px
uniform float uTime, uReveal, uScroll;
uniform vec2 uOrigin;   // where the night world grows from, css px

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= .5; } return s; }

/* Where the sun is. */
const vec3 SUN = vec3(-.72, -.38, .58);

/** One meteor: a white-hot head, an orange tail cooling to red, and a soft glow around it. */
vec3 streak(vec2 rel, vec2 dir, float len, float size, out float glow){
  float along = dot(rel, -dir);
  float perp = dot(rel, vec2(-dir.y, dir.x));
  float k = clamp(along / len, 0., 1.);
  float behind = step(0., along);
  float width = mix(.0026, .0007, k) * size;
  float tail = behind * (1. - k) * (1. - k) * exp(-perp * perp / (width * width));
  float hd = length(rel);
  float core = exp(-hd * hd / (.000012 * size * size));
  glow = exp(-hd * 26. / size) * .5 + behind * (1. - k) * exp(-abs(perp) * 90. / size) * .22;
  return mix(vec3(1., .78, .42), vec3(1., .26, .03), k) * tail * 1.5 + vec3(1., .94, .8) * core * 1.6 + vec3(1., .42, .08) * glow;
}

/**
 * Meteors: a few slots, each firing one streak per cycle, falling down and to the left.
 * The far ones start along the top of the sky and end up behind the planet. The near ones are
 * larger, start anywhere on screen and pass in front of it, so there is always something to see
 * however far the page has scrolled. w is the glow alone, for lighting the smoke.
 */
vec3 meteors(vec2 q, float aspect, float t, float near, out float w){
  vec3 sum = vec3(0.); w = 0.;
  for (int i = 0; i < 5; i++) {
    float fi = float(i), id = fi + near * 20.;
    float period = mix(5., 6., near) + fi * mix(2.4, 3., near);
    float clock = t / period + fi * .37 + near * .19;
    float cycle = floor(clock);
    float life = fract(clock) * period / (1.1 + hash(vec2(cycle, id + 3.)) * .6);
    if (life > 1.) continue;
    float r1 = hash(vec2(cycle, id)), r2 = hash(vec2(id + 7., cycle)), r3 = hash(vec2(cycle + 2., id + 5.));
    vec2 dir = normalize(vec2(-1., .34 + r3 * .36));
    vec2 start = near > .5 ? vec2((.2 + r1 * 1.15) * aspect, -.1 + r2 * .8) : vec2((.22 + r1 * .62) * aspect, -.1 + r2 * .22);
    float size = near > .5 ? 1.4 + r3 * .7 : 1.;
    vec2 head = start + dir * life * (.75 + r3 * .5) * mix(1., 1.25, near);
    float env = smoothstep(0., .12, life) * (1. - smoothstep(.6, 1., life));
    float g;
    sum += env * streak(q - head, dir, (.22 + r2 * .2) * size, size, g);
    w += env * g;
  }
  return sum;
}

void main(){
  vec2 p = vec2(vUv.x, 1. - vUv.y) * uRes;
  vec2 q = p / uRes.y;
  float t = uTime;
  vec2 vel = texture2D(uVelocity, vUv).xy;

  // Paint: the dye carries colour. Its strength makes the shape, its hue is the pigment.
  vec3 dye = texture2D(uDye, vUv).xyz;
  float amount = max(dye.x, max(dye.y, dye.z));
  vec3 pigment = dye / max(amount, .001);
  float swell = fbm(q * 2.4 + vec2(t * .04, -t * .03));
  float ink = smoothstep(.1, .26, amount * (.8 + swell * .5));

  float n = fbm(q * 3.2 + vec2(t * .07, -t * .05));
  float reach = uReveal * length(uRes) * 1.15;
  float dist = length(p - uOrigin) + (n - .5) * 240.;
  float world = uReveal >= .999 ? 1. : (uReveal <= .001 ? 0. : 1. - smoothstep(reach - 110., reach, dist));

  // ── Canvas world ──
  vec4 light = vec4(0.);
  if (world < .999) {
    // Five pastel washes drifting very slowly, each its own patch of the sheet.
    vec2 w = q * 1.15 + vec2(0., uScroll * .00018);
    vec3 wash = vec3(0.); float wa = 0.;
    float b;
    b = smoothstep(.50, .80, fbm(w + vec2(t * .010, 3.1)));            wash += vec3(1., .60, .56) * b; wa += b;
    b = smoothstep(.52, .80, fbm(w * 1.2 + vec2(8.4, -t * .012)));     wash += vec3(1., .80, .34) * b; wa += b;
    b = smoothstep(.52, .82, fbm(w * .9 + vec2(-5.7 + t * .008, 9.9))); wash += vec3(.38, .86, .70) * b; wa += b;
    b = smoothstep(.50, .80, fbm(w * 1.1 + vec2(14.2, 4.4 + t * .009))); wash += vec3(.42, .66, 1.) * b; wa += b;
    b = smoothstep(.54, .82, fbm(w * 1.3 + vec2(-11.3, -7.6 - t * .011))); wash += vec3(.72, .56, 1.) * b; wa += b;
    wash /= max(wa, .001);
    // Canvas weave: the wash sits a little heavier in the valleys of the cloth.
    float weave = .5 + .5 * sin(p.x * 1.9) * sin(p.y * 1.9);
    float washA = clamp(wa, 0., 1.) * (.44 + .12 * weave);

    // Wet paint: pigment pools darker toward the edge of a stroke, as watercolour does.
    float pool = smoothstep(.1, .5, amount) * (1. - smoothstep(.5, 1.4, amount));
    vec3 paint = pigment * (.92 - .22 * pool) * (.94 + .06 * weave);
    vec3 col = mix(wash, paint, ink);
    float a = mix(washA, .92, ink);
    light = vec4(col * a, a);
  }

  // ── Night world ──
  vec4 night = vec4(0.);
  if (world > .001) {
    // Space and stars
    vec3 col = vec3(.008, .02, .07);
    vec2 g = floor(p / 3.);
    float star = step(.9972, hash(g)) * (.5 + .5 * sin(t * 2. + hash(g + 1.) * 6.28));

    // The planet: a sphere lit from the upper left. Its edge is not a clean circle; the
    // atmosphere boils a little, so the radius is nudged by noise taken around the rim.
    vec2 pc = vec2(uRes.x / uRes.y * .66, .86);
    float R = .80;
    vec2 d = q - pc + vec2(0., uScroll * .00012);
    float r = length(d) - (fbm(normalize(d) * 2.4 + vec2(t * .03, -t * .02)) - .5) * .05;
    float k = clamp(r / R, 0., 1.);
    float z = sqrt(1. - k * k);
    vec3 N = vec3(d / R, z);
    vec3 L = normalize(SUN);
    float lit = max(dot(N, L), 0.);
    // Cloud bands wrapped onto the sphere (they compress toward the limb).
    float clouds = fbm(d / R * 1.8 / (.55 + z) + vec2(t * .012, 0.));
    vec3 body = mix(vec3(.01, .04, .16), vec3(.05, .20, .58), smoothstep(.3, .8, clouds));
    body *= .22 + 1.05 * lit;
    body += vec3(.16, .52, 1.) * pow(1. - z, 2.6) * (.25 + lit);
    float disc = smoothstep(R + .006, R - .006, r);
    // Atmosphere: a glow that falls off outward, strongest on the lit side, plus a thin bright limb.
    float side = .25 + .75 * max(dot(normalize(d), normalize(L.xy)), 0.);
    float halo = exp(-max(r - R, 0.) * 11.) * (1. - disc);
    col += star * (1. - disc) * .8;
    // Far meteors pass behind the planet, and flare where they cross its atmosphere.
    float aspect = uRes.x / uRes.y;
    float mGlow, nearGlow;
    vec3 met = meteors(q + vec2(0., uScroll * .00006), aspect, t, 0., mGlow);
    col += met * (1. - disc) * (1. + halo * 2.2);
    col = mix(col, body, disc);
    col += vec3(.14, .44, 1.) * halo * side * .95;
    col += vec3(.5, .85, 1.) * smoothstep(.012, 0., abs(r - R)) * side * .55;

    // Smoke drifting in front of it all, dragged by the cursor.
    vec2 uv = q + vec2(0., uScroll * .00025) - vec2(vel.x, -vel.y) * .00022;
    float n1 = fbm(uv * 1.4 + vec2(t * .025, -t * .018));
    float n2 = fbm(uv * 2.6 + n1 * 1.7 + vec2(-t * .04, t * .03));
    col = mix(col, vec3(.10, .30, .78), smoothstep(.38, .9, n2) * .5);
    col += vec3(.10, .22, .5) * smoothstep(.55, .95, n1) * .35;
    // The smoke nearest a meteor picks up its orange.
    col += vec3(1., .4, .08) * mGlow * (1. - disc) * smoothstep(.3, .9, n2) * .6;

    // In front of the planet and the smoke: the near meteors. These keep to the screen,
    // not the page, so they are there at any scroll position.
    col += meteors(q, aspect, t, 1., nearGlow);
    col += vec3(1., .4, .08) * nearGlow * smoothstep(.3, .9, n2) * .5;
    night = vec4(col, 1.);
  }

  gl_FragColor = mix(light, night, world);
}`;

/**
 * Veil: neutral grey, blended as "saturation" in CSS, so it mutes the page's colours.
 * It lifts completely wherever there is paint (or night), reading that from the alpha band.
 */
const VEIL = `precision mediump float;
varying vec2 vUv; uniform sampler2D uMask;
void main(){
  float m = smoothstep(.64, .8, texture2D(uMask, vUv).a);
  float a = (1. - m) * .38;
  gl_FragColor = vec4(vec3(.5) * a, a);
}`;

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Pair = { read: Target; write: Target };
type Program = { use: () => void; set: (name: string, ...v: number[]) => void; tex: (name: string, t: WebGLTexture, unit: number) => void };

function program(gl: GL, vert: string, frag: string): Program | null {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, vert);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "a");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  const locs = new Map<string, WebGLUniformLocation | null>();
  const loc = (n: string) => {
    if (!locs.has(n)) locs.set(n, gl.getUniformLocation(p, n));
    return locs.get(n)!;
  };
  return {
    use: () => gl.useProgram(p),
    set: (n, ...v) => {
      if (v.length === 1) gl.uniform1f(loc(n), v[0]);
      else if (v.length === 2) gl.uniform2f(loc(n), v[0], v[1]);
      else gl.uniform3f(loc(n), v[0], v[1], v[2]);
    },
    tex: (n, t, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(loc(n), unit);
    },
  };
}

function quad(gl: GL) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

/** A pointer movement in 0..1 screen units (y up), with the paint colour loaded on the brush. */
export type Stir = { x: number; y: number; dx: number; dy: number; color: [number, number, number] };
export type Frame = { time: number; dt: number; reveal: number; originX: number; originY: number; scroll: number; veil: boolean };
export type Ink = { resize: () => void; frame: (stirs: Stir[], f: Frame) => void };

/** Returns null when the GPU cannot run the simulation (no float render targets). */
export function createInk(smokeCanvas: HTMLCanvasElement, veilCanvas: HTMLCanvasElement): Ink | null {
  const opts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false };
  const gl2 = smokeCanvas.getContext("webgl2", opts) as WebGL2RenderingContext | null;
  const gl = (gl2 ?? smokeCanvas.getContext("webgl", opts)) as GL | null;
  const vg = veilCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) as WebGLRenderingContext | null;
  if (!gl || !vg) return null;

  // Half-float render targets with linear filtering.
  let type: number;
  let internal: number;
  if (gl2) {
    if (!gl2.getExtension("EXT_color_buffer_float") && !gl2.getExtension("EXT_color_buffer_half_float")) return null;
    type = gl2.HALF_FLOAT;
    internal = gl2.RGBA16F;
  } else {
    const hf = gl.getExtension("OES_texture_half_float");
    if (!hf || !gl.getExtension("OES_texture_half_float_linear")) return null;
    type = hf.HALF_FLOAT_OES;
    internal = gl.RGBA;
  }

  const target = (w: number, h: number): Target | null => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return null;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  };

  const P = {
    splat: program(gl, VERT, SPLAT),
    advect: program(gl, VERT, ADVECT),
    divergence: program(gl, VERT, DIVERGENCE),
    curl: program(gl, VERT, CURL),
    vorticity: program(gl, VERT, VORTICITY),
    pressure: program(gl, VERT, PRESSURE),
    gradient: program(gl, VERT, GRADIENT),
    scale: program(gl, VERT, SCALE),
    display: program(gl, VERT, DISPLAY),
  };
  const veilProgram = program(vg, VERT, VEIL);
  if (Object.values(P).some((p) => !p) || !veilProgram) return null;
  const { splat, advect, divergence, curl, vorticity, pressure, gradient, scale, display } = P as Record<keyof typeof P, Program>;
  quad(gl);
  quad(vg);
  gl.disable(gl.BLEND);

  const mask = vg.createTexture()!;
  vg.bindTexture(vg.TEXTURE_2D, mask);
  vg.texParameteri(vg.TEXTURE_2D, vg.TEXTURE_MIN_FILTER, vg.LINEAR);
  vg.texParameteri(vg.TEXTURE_2D, vg.TEXTURE_MAG_FILTER, vg.LINEAR);
  vg.texParameteri(vg.TEXTURE_2D, vg.TEXTURE_WRAP_S, vg.CLAMP_TO_EDGE);
  vg.texParameteri(vg.TEXTURE_2D, vg.TEXTURE_WRAP_T, vg.CLAMP_TO_EDGE);
  vg.pixelStorei(vg.UNPACK_FLIP_Y_WEBGL, true);

  let w = 1;
  let h = 1;
  let vel!: Pair;
  let dye!: Pair;
  let press!: Pair;
  let div!: Target;
  let crl!: Target;
  let ok = false;

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    // Near full resolution: the ink's edge is the whole effect, so it must not look upscaled.
    const px = Math.min(window.devicePixelRatio || 1, 1.25) * 0.85;
    smokeCanvas.width = Math.round(w * px);
    smokeCanvas.height = Math.round(h * px);
    veilCanvas.width = Math.round(w * px);
    veilCanvas.height = Math.round(h * px);
    const aspect = w / h;
    const grid = (short: number) => (aspect >= 1 ? [Math.round(short * aspect), short] : [short, Math.round(short / aspect)]) as [number, number];
    const [sw, sh] = grid(128);
    const [dw, dh] = grid(560);
    const made = [target(sw, sh), target(sw, sh), target(dw, dh), target(dw, dh), target(sw, sh), target(sw, sh), target(sw, sh), target(sw, sh)];
    ok = made.every(Boolean);
    if (!ok) return;
    const [v0, v1, d0, d1, p0, p1, dv, cu] = made as Target[];
    vel = { read: v0, write: v1 };
    dye = { read: d0, write: d1 };
    press = { read: p0, write: p1 };
    div = dv;
    crl = cu;
  };
  resize();
  if (!ok) return null;

  const swap = (p: Pair) => {
    const r = p.read;
    p.read = p.write;
    p.write = r;
  };
  const draw = (prog: Program, to: Target | null) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, to ? to.fbo : null);
    gl.viewport(0, 0, to ? to.w : smokeCanvas.width, to ? to.h : smokeCanvas.height);
    prog.set("uTexel", 1 / (to ? to.w : smokeCanvas.width), 1 / (to ? to.h : smokeCanvas.height));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const stir = (s: Stir) => {
    splat.use();
    splat.set("uAspect", w / h);
    splat.set("uPoint", s.x, s.y);
    splat.tex("uTarget", vel.read.tex, 0);
    splat.set("uColor", s.dx * 5600, s.dy * 5600, 0);
    splat.set("uRadius", 0.0017);
    draw(splat, vel.write);
    swap(vel);
    // Paint is laid down per distance travelled, so a slow drag and a fast flick leave the same
    // density of stroke and holding still adds nothing. A black brush (the night world) only stirs.
    if (s.color[0] + s.color[1] + s.color[2] === 0) return;
    const amount = Math.min(0.55, Math.hypot(s.dx, s.dy) * 30);
    splat.tex("uTarget", dye.read.tex, 0);
    splat.set("uColor", s.color[0] * amount, s.color[1] * amount, s.color[2] * amount);
    splat.set("uRadius", 0.0013);
    draw(splat, dye.write);
    swap(dye);
  };

  const frame: Ink["frame"] = (stirs, f) => {
    if (!ok) return;
    for (const s of stirs) stir(s);
    const dt = f.dt;

    curl.use();
    curl.tex("uVelocity", vel.read.tex, 0);
    draw(curl, crl);

    vorticity.use();
    vorticity.tex("uVelocity", vel.read.tex, 0);
    vorticity.tex("uCurl", crl.tex, 1);
    vorticity.set("uCurlStrength", 14);
    vorticity.set("uDt", dt);
    draw(vorticity, vel.write);
    swap(vel);

    divergence.use();
    divergence.tex("uVelocity", vel.read.tex, 0);
    draw(divergence, div);

    scale.use();
    scale.tex("uSource", press.read.tex, 0);
    scale.set("uValue", 0.8);
    draw(scale, press.write);
    swap(press);

    pressure.use();
    pressure.tex("uDivergence", div.tex, 1);
    for (let i = 0; i < 14; i++) {
      pressure.tex("uPressure", press.read.tex, 0);
      draw(pressure, press.write);
      swap(press);
    }

    gradient.use();
    gradient.tex("uPressure", press.read.tex, 0);
    gradient.tex("uVelocity", vel.read.tex, 1);
    draw(gradient, vel.write);
    swap(vel);

    advect.use();
    advect.set("uVelTexel", 1 / vel.read.w, 1 / vel.read.h);
    advect.set("uDt", dt);
    advect.tex("uVelocity", vel.read.tex, 0);
    advect.tex("uSource", vel.read.tex, 1);
    advect.set("uDecay", 1 / (1 + 0.7 * dt));
    draw(advect, vel.write);
    swap(vel);
    advect.tex("uVelocity", vel.read.tex, 0);
    advect.tex("uSource", dye.read.tex, 1);
    advect.set("uDecay", 1 / (1 + 0.95 * dt));
    draw(advect, dye.write);
    swap(dye);

    display.use();
    display.tex("uDye", dye.read.tex, 0);
    display.tex("uVelocity", vel.read.tex, 1);
    display.set("uRes", w, h);
    display.set("uTime", f.time);
    display.set("uReveal", f.reveal);
    display.set("uScroll", f.scroll);
    display.set("uOrigin", f.originX, f.originY);
    draw(display, null);

    if (!f.veil) return;
    // The smoke canvas's alpha is the ink mask; hand it to the veil.
    vg.viewport(0, 0, veilCanvas.width, veilCanvas.height);
    veilProgram.use();
    vg.activeTexture(vg.TEXTURE0);
    vg.bindTexture(vg.TEXTURE_2D, mask);
    vg.texImage2D(vg.TEXTURE_2D, 0, vg.RGBA, vg.RGBA, vg.UNSIGNED_BYTE, smokeCanvas);
    veilProgram.tex("uMask", mask, 0);
    vg.drawArrays(vg.TRIANGLE_STRIP, 0, 4);
  };

  return { resize, frame };
}
