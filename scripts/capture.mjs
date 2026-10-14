// Captures screenshots of live client sites and apps into public/work/<folder>/.
// Uses the Chrome already installed on this machine (no browser download).
//   node scripts/capture.mjs             capture everything
//   node scripts/capture.mjs sitco khadi  capture only these folders
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const desktop = { width: 1440, height: 900, deviceScaleFactor: 1 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
// Apps keep their content in an inner scroller, so a tall window shows a long stretch of the screen.
const tallPhone = { width: 390, height: 2600, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

/** Full-page desktop and mobile captures. */
const page = (out = ["desktop", "mobile"]) => [
  { out: out[0], viewport: desktop, max: 9000 },
  { out: out[1], viewport: mobile, max: 7000 },
];

const targets = {
  // Websites we built
  sitco: { url: "https://sitcobusiness.vercel.app/", shots: page() },
  easywebsolns: { url: "https://easywebsolutions.vercel.app/", shots: page() },
  aarika: { url: "https://laundry-three-gamma.vercel.app/", shots: page() },
  blueorbit: { url: "https://blueorbitdigi.com/", shots: page() },
  kshipra: { url: "https://kshiprahealth.com/", shots: page() },
  hues: { url: "https://huesboutiquehotel.com/", shots: page() },
  ashville: { url: "https://www.ashvillebaga.com/", shots: page() },
  // Vana paints its scene on a fixed canvas and reveals sections as you scroll, so it is stitched.
  vana: { url: "https://vana-blond.vercel.app/", shots: page().map((s) => ({ ...s, stitch: true })) },
  // Search clients: full pages sit beside the supplied desktop/mobile stills
  khadi: { url: "https://khadiorganique.com/", shots: page(["page", "page-mobile"]) },
  badowl: { url: "https://badowl.in/", shots: page(["page", "page-mobile"]) },
  kama: { url: "https://kamahealthindia.com/", shots: page(["page", "page-mobile"]) },
  sevenseas: { url: "https://www.7seasmatrix.com/", shots: page(["page", "page-mobile"]) },
  freshlight: { url: "https://fresh-light-photography.com/", shots: page(["page", "page-mobile"]) },
  // Apps: one long view of the opening screen
  maharishi: { url: "https://maharishi-ayurveda.expo.app/", shots: [{ out: "scroll", viewport: tallPhone, fixed: true }] },
  toys: { url: "https://toyscartel.expo.app/", shots: [{ out: "scroll", viewport: tallPhone, fixed: true }] },
  // Event Intelligence India opens on a sign-in screen, so it has no long capture; its phone steps through the supplied screens instead.
};

const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
if (!chrome) throw new Error("No Chrome or Edge found");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/*
 * A page whose look depends on where it is scrolled to (a fixed WebGL scene, sections that
 * animate in) comes out half-empty in one tall screenshot. So scroll it for real, a screen at a
 * time, photograph each screen once it settles, and join them. Neighbouring screens overlap and
 * are cross-faded there, so the moving background does not leave a hard line at each join.
 * Fixed bars (the header) are hidden after the first screen, or they would repeat down the image.
 */
const OVERLAP = 140;
const MAX_PX = 16000; // WebP cannot be taller than 16383
async function stitched(tab, viewport, file) {
  const total = await tab.evaluate(() => document.documentElement.scrollHeight);
  const step = viewport.height - OVERLAP;
  const stops = [];
  for (let y = 0; y < total - viewport.height; y += step) stops.push(y);
  stops.push(Math.max(total - viewport.height, 0));
  const tiles = [];
  for (const [n, y] of stops.entries()) {
    await tab.evaluate((y) => window.scrollTo(0, y), y);
    await wait(1500);
    if (n === 1) {
      await tab.evaluate(() => {
        for (const el of document.querySelectorAll("body *")) {
          if (getComputedStyle(el).position !== "fixed" || el.tagName === "CANVAS" || el.querySelector("canvas")) continue;
          if (el.getBoundingClientRect().height < innerHeight * 0.6) el.style.setProperty("visibility", "hidden", "important");
        }
      });
      await wait(200);
    }
    tiles.push({ y: await tab.evaluate(() => Math.round(scrollY)), data: await tab.screenshot({ type: "png", encoding: "base64" }) });
  }
  // Join them on a canvas in a blank tab.
  const dpr = viewport.deviceScaleFactor;
  const scale = Math.min(1, MAX_PX / (total * dpr));
  const sheet = await tab.browser().newPage();
  try {
    const webp = await sheet.evaluate(
      async (tiles, w, h, dpr, scale, overlap) => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * dpr * scale);
        canvas.height = Math.round(h * dpr * scale);
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        let prevEnd = 0;
        for (const t of tiles) {
          const img = new Image();
          img.src = "data:image/png;base64," + t.data;
          await img.decode();
          const top = t.y * dpr;
          const fade = Math.min(overlap * dpr, Math.max(prevEnd - top, 0));
          const piece = document.createElement("canvas");
          piece.width = img.width;
          piece.height = img.height;
          const pc = piece.getContext("2d");
          pc.drawImage(img, 0, 0);
          if (fade > 0) {
            // Everything above the fade is already on the sheet from the screen before.
            const g = pc.createLinearGradient(0, prevEnd - top - fade, 0, prevEnd - top);
            g.addColorStop(0, "rgba(0,0,0,0)");
            g.addColorStop(1, "rgba(0,0,0,1)");
            pc.globalCompositeOperation = "destination-in";
            pc.fillStyle = g;
            // The mask applies to the whole piece: clear above the fade, solid below it.
            pc.fillRect(0, 0, piece.width, piece.height);
          }
          ctx.drawImage(piece, 0, top);
          prevEnd = top + img.height;
        }
        return canvas.toDataURL("image/webp", 0.76).split(",")[1];
      },
      tiles,
      viewport.width,
      total,
      dpr,
      scale,
      OVERLAP,
    );
    await writeFile(file, Buffer.from(webp, "base64"));
  } finally {
    await sheet.close();
  }
  return total;
}
const only = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });

for (const [folder, { url, shots }] of Object.entries(targets)) {
  if (only.length && !only.includes(folder)) continue;
  const dir = path.join("public", "work", folder);
  await mkdir(dir, { recursive: true });
  for (const { out, viewport, max, fixed, stitch } of shots) {
    const tab = await browser.newPage();
    tab.setDefaultTimeout(45000);
    try {
      await tab.setViewport(viewport);
      await tab.goto(url, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => {});
      await wait(fixed ? 5000 : 2500);
      let height = viewport.height;
      if (fixed) {
        // Apps open on onboarding; get past it to the home screen.
        for (let n = 0; n < 3; n++) {
          const skipped = await tab.evaluate(() => {
            const el = [...document.querySelectorAll("[role=button], button, a, div")].find((e) => e.children.length === 0 && /^(skip|skip for now|maybe later|not now|just browse)$/i.test(e.textContent.trim()));
            if (el) el.click();
            return Boolean(el);
          });
          if (!skipped) break;
          await wait(3500);
        }
      } else {
        // Walk the page once so lazy images load and scroll-triggered reveals fire.
        await tab
          .evaluate(async () => {
            const step = window.innerHeight * 0.6;
            for (let y = 0; y < Math.min(document.documentElement.scrollHeight, 16000); y += step) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 220));
            }
            window.scrollTo(0, 0);
          })
          .catch(() => wait(4000)); // page reloaded itself mid-walk; capture what settles
        await wait(1500);
        if (stitch) {
          height = await stitched(tab, viewport, path.join(dir, `${out}.webp`));
          console.log(`${folder}/${out}: ${viewport.width}x${height} (stitched)`);
          continue;
        }
        height = Math.min(await tab.evaluate(() => document.documentElement.scrollHeight), max);
      }
      // A page that never settles must not stall the whole run.
      await Promise.race([
        tab.screenshot({ path: path.join(dir, `${out}.webp`), type: "webp", quality: 74, captureBeyondViewport: true, clip: { x: 0, y: 0, width: viewport.width, height } }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("screenshot timed out")), 60000)),
      ]);
      console.log(`${folder}/${out}: ${viewport.width}x${height}`);
    } catch (e) {
      console.log(`${folder}/${out}: FAILED ${e.message}`);
    } finally {
      tab.close().catch(() => {});
    }
  }
}
await browser.close();
