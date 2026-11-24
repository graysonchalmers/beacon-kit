// Score kit Parity stories against old Beacon card shots: % differing pixels at the old card's size.
// node score.mjs <storybook-static> <oldDir> <outDir> <map.json: {"<old png>": "<story id>"}>
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { readFile, mkdir, writeFile } from "node:fs/promises"; import { extname, join } from "node:path";
const req = createRequire(import.meta.url); const { chromium } = req(process.env.PW); const { PNG } = req("pngjs"); const pixelmatch = req("pixelmatch");
const [root, oldDir, out, mapF] = process.argv.slice(2); await mkdir(out, { recursive: true });
const map = JSON.parse(await readFile(mapF, "utf8"));
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = createServer(async (q, r) => { const p = join(root, decodeURIComponent(q.url.split("?")[0]).replace(/\/$/, "/index.html")); try { const b = await readFile(p); r.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(0);
const base = `http://localhost:${srv.address().port}`;
const br = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] }); const page = await br.newPage({ viewport: { width: 1600, height: 1200 } });
const rows = [];
for (const [oldF, id] of Object.entries(map)) {
  const old = PNG.sync.read(await readFile(join(oldDir, oldF)));
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=skin:beacon`);
  try { await page.waitForSelector("#storybook-root section", { timeout: 8000 }); } catch { rows.push({ oldF, id, diff: 100, note: "no render" }); continue; }
  await page.addStyleTag({ content: "*{animation:none!important;transition:none!important} #storybook-root>div{padding:0!important}" }); await page.waitForTimeout(400);
  const el = await page.$("#storybook-root section");
  const buf = await el.screenshot();
  let neu = PNG.sync.read(buf);
  const w = old.width, h = old.height, a = new PNG({ width: w, height: h }), b = new PNG({ width: w, height: h });
  PNG.bitblt(old, a, 0, 0, w, h, 0, 0); PNG.bitblt(neu, b, 0, 0, Math.min(w, neu.width), Math.min(h, neu.height), 0, 0);
  const d = new PNG({ width: w, height: h }); const n = pixelmatch(a.data, b.data, d.data, w, h, { threshold: 0.15 });
  const diff = +(100 * n / (w * h)).toFixed(1);
  const side = new PNG({ width: w * 3, height: h }); PNG.bitblt(a, side, 0, 0, w, h, 0, 0); PNG.bitblt(b, side, 0, 0, w, h, w, 0); PNG.bitblt(d, side, 0, 0, w, h, 2 * w, 0);
  await writeFile(join(out, oldF.replace(".png", "--side.png")), PNG.sync.write(side));
  rows.push({ oldF, id, diff, size: `${w}x${h} vs ${neu.width}x${neu.height}` });
}
await writeFile(join(out, "scores.json"), JSON.stringify(rows, null, 1));
for (const r of rows) console.log(`${String(r.diff).padStart(5)}%  ${r.diff <= 10 ? "PASS" : "FAIL"}  ${r.oldF}  ${r.size ?? r.note}`);
await br.close(); srv.close();
