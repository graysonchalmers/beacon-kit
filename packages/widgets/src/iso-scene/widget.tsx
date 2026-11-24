import { useEffect, useRef } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";
import windowPng from "./assets/window.png";
import windowJson from "./assets/window.json";
import idlePng from "./assets/frog_idle.png";
import workPng from "./assets/frog_work.png";
import thinkPng from "./assets/frog_think.png";
import sadPng from "./assets/frog_sad.png";
import sleepPng from "./assets/frog_sleep.png";
import readPng from "./assets/frog_read.png";

// Old Beacon "iso" (Agents & Machines): one 4x4 GameKit island per machine, one animated frog per job.
// Ported from Util-VoiceServer view.html (terrain columns, mud share = memory used, lantern tint = temperature)
// with the old pxl atlases (assets/, GameKit iso-window build). Not yet ported: campfire (CPU), rain/puddles (disk), Stealth dock + boat.
const Job = z.object({ id: z.string(), say: z.string().optional(), mood: z.enum(["idle", "work", "think", "sad", "sleep", "read"]).default("idle") });
const Machine = z.object({ id: z.string(), name: z.string(), up: z.boolean().default(true), jobs: z.array(Job).default([]),
  mem: z.number().optional(), temp: z.number().optional() });
type M = z.infer<typeof Machine>;

const STRIPS: Record<string, string> = { idle: idlePng, work: workPng, think: thinkPng, sad: sadPng, sleep: sleepPng, read: readPng };
const FW = 26, SIDE = 4, OY = 16, T = 7, CW = 128, CH = 120, MOST = 8;
const TILES: Record<string, string> = { G: "t_grass", M: "t_mud", W: "t_water", P: "t_plank" };
const MUD_ORDER = [5, 10, 2, 13, 7, 0, 15, 8, 3, 12, 6, 9, 1, 14, 11, 4];
const SLOTS = [[1, 1], [2, 2], [2, 0], [0, 2], [3, 2], [2, 3], [0, 3], [3, 1]];
const iso = (cx: number, cy: number) => [(SIDE - 1) * 16 + (cx - cy) * 16, 30 + OY + (cx + cy) * 8];
const lift = (cx: number, cy: number) => (cx + cy <= 1 ? 12 : cx + cy <= 3 ? 6 : 0);
const lampColor = (t?: number) => t == null ? "#ffd27a" : t < 50 ? "#7ab8ff" : t < 65 ? "#ffd27a" : t < 80 ? "#ff9a3a" : "#ff4a3a";
export const groundMap = (mem: number | undefined, id: string) => { const n = mem == null ? 4 : Math.round(16 * mem / 100), off = id.length * 3;
  return Array.from({ length: SIDE }, (_, y) => Array.from({ length: SIDE }, (_, x) => MUD_ORDER.indexOf((y * SIDE + x + off) % 16) < n ? "M" : "G").join("")); };

const img = (src: string) => { const i = new Image(); i.src = src; return i; };
let sheets: { atlas: HTMLImageElement; frogs: Record<string, HTMLImageElement> } | undefined;
const load = () => (sheets ??= { atlas: img(windowPng), frogs: Object.fromEntries(Object.entries(STRIPS).map(([k, v]) => [k, img(v)])) });
const ready = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;
const FR = windowJson.frames as Record<string, { frame: { x: number; y: number; w: number; h: number } }>;

function draw(c: CanvasRenderingContext2D, m: M, t: number) {
  const { atlas, frogs } = load(); c.imageSmoothingEnabled = false; c.clearRect(0, 0, CW, CH);
  if (!ready(atlas)) return;
  const map = groundMap(m.mem, m.id), cells: [number, number, string][] = [];
  map.forEach((r, cy) => [...r].forEach((tt, cx) => cells.push([cx, cy, tt]))); cells.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
  const face = (pts: number[][], col: string) => { c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.fill(); };
  if (!m.up) c.globalAlpha = .45;
  for (const [cx, cy, tt] of cells) {
    const [x, y0] = iso(cx, cy), y = y0 - lift(cx, cy);
    face([[x, y + 8], [x + 16, y + 16], [x + 16, y0 + 16 + T], [x, y0 + 8 + T]], "#4a3524");
    face([[x + 16, y + 16], [x + 32, y + 8], [x + 32, y0 + 8 + T], [x + 16, y0 + 16 + T]], "#33241a");
    const f = FR[TILES[tt]].frame; c.drawImage(atlas, f.x, f.y, f.w, f.h, x, y, f.w, f.h);
  }
  const prop = (name: string, cx: number, cy: number, lit?: string) => { const f = FR[name].frame, [x, y0] = iso(cx, cy), px = x + 16 - Math.round(f.w / 2), py = y0 - lift(cx, cy) + 10 - f.h;
    c.drawImage(atlas, f.x, f.y, f.w, f.h, px, py, f.w, f.h); if (lit) { c.fillStyle = lit; c.fillRect(px + 6, py + 7, 2, 3); } };
  prop("p_lantern_post", 0, 0, m.up ? lampColor(m.temp) : "#555"); prop("p_stump", 3, 0);
  // frogs, back to front
  m.jobs.slice(0, MOST).map((j, i) => ({ j, s: SLOTS[i] })).sort((a, b) => a.s[0] + a.s[1] - b.s[0] - b.s[1]).forEach(({ j, s }, k) => {
    const sh = frogs[j.mood] ?? frogs.idle; if (!ready(sh)) return;
    const n = Math.max(1, Math.round(sh.naturalWidth / FW)), fi = m.up ? Math.floor((t / 167 + k * 3) % n) : 0;
    const [x, y0] = iso(s[0], s[1]), py = y0 - lift(s[0], s[1]) + 12 - FW;
    c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(x + 16, py + FW - 2, 8, 3, 0, 0, 7); c.fill();
    c.drawImage(sh, fi * FW, 0, FW, FW, x + 3, py, FW, FW);
  });
  c.globalAlpha = 1;
}

function Island({ m }: { m: M }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return; const c = cv.getContext("2d"); if (!c) return;
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = -1e9;
    const tick = (t: number) => { if (!still) raf = requestAnimationFrame(tick); if (document.hidden || t - last < 80) return; last = t; draw(c, m, t); };
    raf = requestAnimationFrame(tick);
    const { atlas, frogs } = load(); const redraw = () => draw(c, m, performance.now());
    [atlas, ...Object.values(frogs)].forEach((i) => i.addEventListener("load", redraw));
    return () => { cancelAnimationFrame(raf); [atlas, ...Object.values(frogs)].forEach((i) => i.removeEventListener("load", redraw)); };
  }, [m]);
  const extra = m.jobs.length - MOST;
  return (
    <figure className="relative flex flex-col items-center gap-1" aria-label={`${m.name}: ${m.up ? `${m.jobs.length} jobs` : "offline"}`}
      title={m.jobs.map((j) => j.say ?? j.mood).join("\n") || undefined}>
      <canvas ref={ref} width={CW} height={CH} className="w-full max-w-64" style={{ imageRendering: "pixelated", aspectRatio: `${CW}/${CH}`, filter: "drop-shadow(6px 10px 6px rgba(0,0,0,.45))" }} />
      {extra > 0 && <span className="absolute right-2 top-2 bg-[#6b4a2a] px-1.5 text-xs font-bold text-[#f4e6c0]">+{extra}</span>}
      <figcaption className={`text-xs ${m.up ? "text-bk-fg" : "text-bk-muted line-through"}`}>{m.name}</figcaption>
    </figure>
  );
}

export const IsoScene = defineWidget({
  type: "iso-scene", family: "2d", title: "Agents & machines",
  options: z.object({ label: z.string() }),
  data: z.object({ machines: z.array(Machine) }),
  size: { min: [3, 2], default: [6, 3], max: [12, 6] },
  render: ({ options, data, state }) => {
    const ms = data?.machines ?? [];
    return <Frame title={options.label} state={state === "ready" && !ms.length ? "empty" : state} empty="No machines">
      <div className="grid h-full grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] items-center gap-2 overflow-auto">{ms.map((m) => <Island key={m.id} m={m} />)}</div></Frame>;
  },
});
