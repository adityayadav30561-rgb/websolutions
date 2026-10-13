// Converts a folder of app screenshots (PNG) into web-sized WebP files under public/work/<folder>/.
// Uses the installed Chrome to do the resizing, so no image library is needed.
//   node scripts/import-app-shots.mjs "<path to portfolio-screenshots>"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const source = process.argv[2];
if (!source || !existsSync(source)) throw new Error("Pass the path to the extracted portfolio-screenshots folder");

// source subfolder -> [public/work folder, output subfolder]
const sets = [
  ["01-event-intelligence-india/light", "eii", "light"],
  ["01-event-intelligence-india/dark", "eii", "dark"],
  ["01-event-intelligence-india", "eii", ""],
  ["02-maharishi-ayurveda", "maharishi", "screens"],
  ["03-toys-cartel", "toys", "screens"],
];
const PHONE_WIDTH = 780; // 2x of a 390px phone
const COLLAGE_WIDTH = 2000;

const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
if (!chrome) throw new Error("No Chrome or Edge found");
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.goto("about:blank");

let count = 0;
for (const [from, folder, sub] of sets) {
  const dir = path.join(source, from);
  const out = path.join("public", "work", folder, sub);
  await mkdir(out, { recursive: true });
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".png"))) {
    const collage = file.startsWith("hero");
    // Collages keep their own names at the folder root; screens go into the subfolder.
    const target = collage ? path.join("public", "work", folder, `collage-${file.replace(/^hero-?/, "").replace(".png", "") || "main"}.webp`) : path.join(out, file.replace(".png", ".webp"));
    const data = (await readFile(path.join(dir, file))).toString("base64");
    const webp = await page.evaluate(
      async (b64, width) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const w = Math.min(width, img.naturalWidth);
        const canvas = Object.assign(document.createElement("canvas"), { width: w, height: Math.round((img.naturalHeight * w) / img.naturalWidth) });
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/webp", 0.82).split(",")[1];
      },
      data,
      collage ? COLLAGE_WIDTH : PHONE_WIDTH,
    );
    await writeFile(target, Buffer.from(webp, "base64"));
    count++;
  }
}
await browser.close();
console.log(`converted ${count} images`);
