// Shoot every old Beacon card type from the Sandbox board, element by element, at a fixed card size.
import { createRequire } from "module"; import path from "path"; import fs from "fs";
const ROOT = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const { pageServer } = await import(path.join(ROOT, "tests/pageserver.mjs"));
const { chromium } = createRequire(import.meta.url)(process.env.PW);
const { BASE } = await pageServer(ROOT);
const br = await chromium.launch(), page = await (await br.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();
await page.route("**/stealth-ask", r => r.fulfill({ body: "{}" }));
const { fakeData } = await import(path.join(ROOT, "tests/fixtures.mjs")); const FD = fakeData(Date.now() / 1000);
for (const k of Object.keys(FD)) await page.route(u => new URL(u).pathname === k, r => r.fulfill({ contentType: "application/json", body: JSON.stringify(FD[k]) }));
await page.goto(`${BASE}/view`); await page.waitForTimeout(2000);
await page.click('[data-pagetab="sandbox"]'); await page.waitForTimeout(7000); await page.addStyleTag({ content: "*{animation:none!important;transition:none!important}" });
const ids = await page.$$eval("#widgets > li[data-id]", l => l.map(x => [x.dataset.id, x.dataset.type]));
const meta = {};
for (const [id, type] of ids) {
  const el = await page.$(`#widgets > li[data-id="${id}"]`); if (!el) continue;
  const f = `${type}--${id.replace(/[^\w-]/g, "")}.png`; await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: path.join(OUT, f) }).catch(() => {});
  meta[f] = await el.evaluate(e => ({ w: e.offsetWidth, h: e.offsetHeight, text: e.innerText.slice(0, 400) }));
}
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 1));
await page.screenshot({ path: path.join(OUT, "_board.png"), fullPage: true });
console.log(ids.length, "cards", [...new Set(ids.map(i => i[1]))].join(","));
await br.close(); process.exit(0);
