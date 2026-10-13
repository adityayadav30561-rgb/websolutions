// Captures screenshots of live client sites and apps into public/work/<folder>/.
// Uses the Chrome already installed on this machine (no browser download).
//   node scripts/capture.mjs             capture everything
//   node scripts/capture.mjs sitco khadi  capture only these folders
import { mkdir } from "node:fs/promises";
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
const only = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });

for (const [folder, { url, shots }] of Object.entries(targets)) {
  if (only.length && !only.includes(folder)) continue;
  const dir = path.join("public", "work", folder);
  await mkdir(dir, { recursive: true });
  for (const { out, viewport, max, fixed } of shots) {
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
