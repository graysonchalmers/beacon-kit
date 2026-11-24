// Screenshot every story at desktop and phone, and fail on any page error. Usage: node scripts/snap.mjs [outDir]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? "playwright");
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
const root = "storybook-static", out = process.argv[2] ?? "snapshots";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = createServer(async (q, r) => {
  const p = join(root, decodeURIComponent(q.url.split("?")[0]).replace(/\/$/, "/index.html"));
  try { r.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" }); r.end(await readFile(p)); }
  catch { r.writeHead(404); r.end(); }
}).listen(0);
const base = `http://localhost:${srv.address().port}`;
const { entries } = JSON.parse(await readFile(join(root, "index.json"), "utf8"));
const stories = Object.values(entries).filter((e) => e.type === "story");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
for (const [vp, size] of [["desktop", { width: 1280, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: size });
  page.on("pageerror", (e) => errors.push(`${vp} ${page.url()}: ${e.message}`));
  for (const s of stories) {
    await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story`);
    await page.waitForSelector("#storybook-root > *", { timeout: 10000 });
    await page.waitForTimeout(s.id.includes("3d") || s.id.includes("board") ? 1500 : 300);
    await page.screenshot({ path: join(out, `${vp}--${s.id}.png`), fullPage: s.id.startsWith("boards") });
  }
}
await browser.close(); srv.close();
console.log(`${stories.length} stories x 2 viewports`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
