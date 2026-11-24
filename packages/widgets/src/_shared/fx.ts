// Ported from Util-VoiceServer fx.js (pxl swamp VFX): pixel-canvas particle bursts over an element (1 particle px = 4 screen px,
// 4-colour ramps) plus the kit's UI sounds. Sounds wait for the first tap or key (autoplay rules). Reduced motion: sound only.
import confirmWav from "./sfx/ui_confirm.wav";
import cancelWav from "./sfx/ui_cancel.wav";
import sparkleWav from "./sfx/fx_sparkle.wav";
import fireworkWav from "./sfx/fx_firework.wav";

const SOUNDS: Record<string, string> = { ui_confirm: confirmWav, ui_cancel: cancelWav, fx_sparkle: sparkleWav, fx_firework: fireworkWav };
let armed = false;
if (typeof window !== "undefined") for (const ev of ["pointerdown", "keydown"]) addEventListener(ev, () => { armed = true; }, { capture: true, once: true });
export function sfx(name: string, vol = .7) {
  if (!armed || !SOUNDS[name]) return;
  const a = new Audio(SOUNDS[name]); a.volume = vol; a.play().catch(() => {});
}

const PX = 4, R = (a: number, b: number) => a + Math.random() * (b - a);
const RAMPS = { yel: ["#6b4a1a", "#b8862a", "#e8d24a", "#fff6c0"], fw: ["#b83a3a", "#e8862a", "#f2c14e", "#fff6e0"] };
type P = { x: number; y: number; vx: number; vy: number; t: number; life: number; drag: number; g: number; size: number };
type F = { ps: P[]; w: number; h: number; k: number };
function burst(f: F, x: number, y: number, n: number, o: { sp: [number, number]; life: [number, number]; drag: number; g: number; size: number }) {
  for (let i = 0; i < n; i++) { const a = R(0, Math.PI * 2), s = R(...o.sp) * f.k;
    f.ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: R(...o.life), drag: o.drag, g: o.g * f.k, size: o.size }); }
}
const TYPES = {
  sparkle: { ramp: RAMPS.yel, spawn: (f: F, n: number) => burst(f, f.w / 2, f.h / 2, n, { sp: [40, 90], life: [.5, .9], drag: 3, g: 0, size: 2 }) },
  firework: { ramp: RAMPS.fw, spawn: (f: F, n: number) => { for (let i = 0; i < 5; i++) burst(f, f.w * (.15 + .175 * i) + R(-4, 4), f.h * R(.25, .6), Math.ceil(n / 3), { sp: [14, 58], life: [.8, 1.5], drag: 1.4, g: 34, size: 2 }); } },
};
export type Celebrate = "off" | "flash" | "sparkle" | "fireworks";

/** Old Beacon celebrate(): sparkles or fireworks over the card (and its sound). */
export function play(type: keyof typeof TYPES, el: Element, count = type === "sparkle" ? 40 : 105) {
  sfx(`fx_${type}`, .8);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const T = TYPES[type], b = el.getBoundingClientRect(), c = document.createElement("canvas");
  c.dataset.fx = type; c.width = Math.max(8, Math.round(b.width / PX)); c.height = Math.max(8, Math.round(b.height / PX));
  Object.assign(c.style, { position: "fixed", left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px", pointerEvents: "none", imageRendering: "pixelated", zIndex: "50" });
  document.body.append(c);
  const f: F = { ps: [], w: c.width, h: c.height, k: Math.max(1, Math.min(3, Math.min(c.width, c.height) / 60)) };
  T.spawn(f, count);
  const ctx = c.getContext("2d")!; let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    for (const p of f.ps) { p.t += dt; p.vx *= 1 - p.drag * dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    f.ps = f.ps.filter((p) => p.t < p.life && p.y < f.h + 4 && p.y > -10);
    ctx.clearRect(0, 0, f.w, f.h);
    for (const p of f.ps) { const ki = Math.min(3, Math.floor((1 - p.t / p.life) * 4)), x = Math.round(p.x - p.size / 2), y = Math.round(p.y - p.size / 2);
      ctx.fillStyle = T.ramp[ki];
      if (type === "sparkle" && p.t < p.life * .35) { ctx.fillRect(x - 1, y, p.size + 2, 1); ctx.fillRect(x, y - 1, 1, p.size + 2); } else ctx.fillRect(x, y, p.size, p.size); }
    if (f.ps.length) requestAnimationFrame(frame); else c.remove();
  };
  requestAnimationFrame(frame);
  setTimeout(() => c.remove(), 7000);
}
export function celebrate(el: Element | null, mode: Celebrate = "fireworks") {
  if (!el || mode === "off") return;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setTimeout(() => el.isConnected && el.animate([{ filter: "brightness(1)" }, { filter: "brightness(2.2)" }, { filter: "brightness(1)" }], { duration: 280 }), 420);
  if (mode !== "flash") play(mode === "sparkle" ? "sparkle" : "firework", el.closest(".bk-card") ?? el);
}
