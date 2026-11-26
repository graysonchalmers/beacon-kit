// Live data adapter: old Beacon's voice.py (Util-VoiceServer) -> Beacon Kit board + per-card data.
// Endpoints: /state (widgets, layout, skin, iso), /agenda, /decisions, /notion, /replies, /docs. Schema notes from the Envy, 2026-11-24.
// voice.py binds to localhost: run the kit app on the same machine, or proxy these paths to it.
import type { Board } from "../../board/src/schema";
import type { WidgetState } from "../../widgets/src/contract";

type J = Record<string, any>;
export type VoiceSnapshot = { state: J; agenda?: J; decisions?: J; notion?: J; replies?: J; docs?: J[];
  sysscope?: J; mesh?: J; fleet?: J; projects?: J[]; favorites?: J; devstream?: J; quotas?: J; stealthModels?: unknown[];
  /** Prefix for voice.py-served images (devstream thumbs, notion images); "" when the page is served by voice.py or proxied. */ base?: string };
export type Live = Record<number, { data?: unknown; state?: WidgetState }>;

export async function fetchVoice(base = "", f: typeof fetch = fetch): Promise<VoiceSnapshot> {
  const get = (p: string) => f(base + p, { cache: "no-store" }).then((r) => (r.ok ? r.json() : undefined)).catch(() => undefined);
  const P = ["/state", "/agenda", "/decisions", "/notion", "/replies", "/docs", "/sysscope", "/mesh", "/fleet", "/projects", "/favorites", "/devstream", "/quotas", "/stealth-models"];
  const [state, agenda, decisions, notion, replies, docs, sysscope, mesh, fleet, projects, favorites, devstream, quotas, stealthModels] = await Promise.all(P.map(get));
  if (!state) throw new Error("voice.py /state unreachable");
  return { state, agenda, decisions, notion, replies, docs, sysscope, mesh, fleet, projects, favorites, devstream, quotas, stealthModels, base };
}

// ---- formatting, as the old cards print it
const ago = (t: number, now: number) => { const m = Math.max(0, Math.round((now - t) / 60)); return m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };
const clock = (t: number) => new Date(t * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace("AM", "a.m.").replace("PM", "p.m.");
const dayName = (t: number, now: number) => { const d = new Date(t * 1000), n = new Date(now * 1000), k = Math.round((new Date(d.toDateString()).getTime() - new Date(n.toDateString()).getTime()) / 864e5);
  return k === 0 ? "Today" : k === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" }); };
const url = (u?: string) => (u && /^https?:\/\//.test(u) ? u : undefined);
const MOOD: Record<string, string> = { working: "work", reading: "read", thinking: "think", sleeping: "sleep", idle: "idle", error: "sad", blocked: "sad" };

// ---- old type -> kit widget, options, data (MIGRATION.md)
type Map = { type: string; size: [number, number]; options: (w: J) => J; data?: (s: VoiceSnapshot, w: J, now: number) => unknown };
export const MAP: Record<string, Map> = {
  calendar: { type: "agenda", size: [3, 4], options: (w) => ({ label: w.title || "Calendar" }),
    data: (s, _w, now) => s.agenda && { events: (s.agenda.events ?? []).map((e: J, i: number) => ({ id: String(i), title: e.title, where: e.where || undefined,
      day: dayName(e.t, now), time: e.allday ? "All day" : clock(e.t), soon: !e.allday && e.t > now && e.t - now < 1800, link: url(e.link) })) } },
  mail: { type: "inbox", size: [3, 4], options: (w) => ({ label: w.title || "Inbox" }),
    data: (s, _w, now) => s.agenda && { mail: (s.agenda.mail ?? []).map((m: J, i: number) => ({ id: String(i), from: m.from, subject: m.subject, age: ago(m.t, now), link: url(m.link) })) } },
  replies: { type: "reply-queue", size: [3, 4], options: (w) => ({ label: w.title || "Proposed replies" }),
    data: (s, _w, now) => s.replies && { total: s.replies.total, items: (s.replies.items ?? []).map((r: J) => ({ id: String(r.id), name: r.name, channel: r.channel,
      preview: r.ask || r.body || "", age: ago(r.t, now), draft: r.draft === "ready" || r.draft === "approved" ? r.draft : undefined, link: url(r.link) })) } },
  notion: { type: "decision-queue", size: [3, 6], options: (w) => ({ title: w.title || "Notion Inbox", icon: "db" }),
    data: (s) => s.notion && { asks: [], rows: (s.notion.rows ?? []).map((r: J) => ({ id: r.id, group: ["you", "claude", "done"].includes(r.group) ? r.group : "you",
      kind: r.kind || "Do", status: r.status || "", title: r.title, url: r.url || "", why: r.why || "", groomer: r.groomer || "",
      options: (r.options ?? []).map((o: J) => ({ label: o.label, hint: o.hint || "", done: !!o.done })),
      images: (r.images ?? []).map((i: J) => ({ src: `${s.base ?? ""}/notion-img/${i.img}`, cap: i.cap || "" })) })) } },
  decisions: { type: "decision-queue", size: [3, 6], options: (w) => ({ title: w.title || "Decisions", icon: "ask" }),
    data: (s) => s.decisions && { rows: [], asks: (s.decisions.items ?? []).filter((d: J) => d.source !== "notion").map((d: J) => ({ id: d.id, title: d.title, why: d.why || "", by: d.by || "Claude",
      status: d.status === "answered" ? "answered" : "pending", options: (d.options ?? []).map((o: J) => ({ label: o.label, hint: o.hint || "" })), links: d.links ?? [] })) } },
  docs: { type: "docs", size: [3, 4], options: (w) => ({ label: w.title || "Docs" }), data: (s) => s.docs && { links: s.docs } },
  iso: { type: "iso-scene", size: [6, 3], options: (w) => ({ label: w.title || "Agents & Machines" }),
    data: (s) => { const h = s.state.iso?.hosts; return h && { machines: Object.entries(h).map(([id, m]: [string, any]) => ({ id, name: id[0].toUpperCase() + id.slice(1),
      up: !!m && m.state !== "offline", mem: m?.mem, temp: m?.temp, jobs: (m?.jobs ?? []).map((j: J, i: number) => ({ id: `${id}${i}`, say: j.say || j.name, mood: MOOD[j.state] ?? "idle" })) })) }; } },
  tile: { type: "stat-tile", size: [2, 2], options: (w) => ({ label: w.title || "Tile" }),
    data: (_s, w) => { const v = parseFloat(String(w.value ?? "")); return Number.isFinite(v) ? { value: v } : undefined; } },
  sysscope: { type: "sysscope", size: [4, 3], options: (w) => ({ label: w.title || "Envy" }),
    data: (s, w) => s.sysscope && { rows: ((w.rows as string[] | undefined) ?? Object.keys(s.sysscope)).filter((k) => s.sysscope![k]).map((k) => { const p = s.sysscope![k];
      return { key: k, big: String(p.big ?? ""), small: p.small || undefined, lines: Array.isArray(p.lines) ? p.lines.map(String) : [], level: lvl3(p.level),
        trend: p.trend === "▲" || p.trend === "▼" ? p.trend : p.trend === "up" ? "▲" : p.trend === "down" ? "▼" : undefined }; }) } },
  mesh: { type: "mesh", size: [4, 3], options: (w) => ({ label: w.title || "Mesh" }),
    data: (s) => s.mesh && { machines: (s.mesh.machines ?? []).map((m: J) => ({ name: m.name, level: lvl(m.level), down: (m.down ?? []).map(String), checks: m.checks ?? 1, recovered: m.recovered || undefined })),
      harbor: s.mesh.harbor?.at != null ? { at: String(s.mesh.harbor.at), down: String(s.mesh.harbor.down ?? "") } : undefined,
      load: Object.fromEntries(Object.entries(s.mesh.load ?? {}).filter(([, v]: [string, any]) => typeof v?.load1 === "number" && typeof v?.free_mb === "number")
        .map(([k, v]: [string, any]) => [k, Object.fromEntries(Object.entries(v).filter(([, x]) => x !== null))])),   // voice.py sends null for "no GPU lease"
      overnight: s.mesh.overnight, alerts: (s.mesh.alerts ?? []).map((a: J) => ({ at: String(a.at ?? ""), source: String(a.source ?? ""), text: String(a.text ?? ""), action: a.action || undefined })) } },
  fleet: { type: "fleet", size: [4, 3], options: (w) => ({ title: w.title || "Fleet" }),
    data: (s) => s.fleet && { machines: (s.fleet.machines ?? []).map((m: J) => ({ id: m.id, state: ["up", "down", "stale"].includes(m.state) ? m.state : "unknown", level: lvl(m.level),
        age_s: m.age_s ?? null, cpu: m.cpu ?? null, mem: m.mem ?? null, checks_down: (m.checks_down ?? []).map(String),
        disk: typeof m.disk?.free_gb === "number" && typeof m.disk?.pct === "number" ? { mount: String(m.disk.mount ?? "/"), free_gb: m.disk.free_gb, pct: m.disk.pct } : undefined })),
      lease: s.fleet.lease && { known: !!s.fleet.lease.known, free: s.fleet.lease.free ?? undefined, holder: s.fleet.lease.holder ?? undefined, queue: s.fleet.lease.queue ?? undefined,
        mins: typeof s.fleet.lease.age_s === "number" ? Math.round(s.fleet.lease.age_s / 60) : undefined },
      power: s.fleet.power?.ready && { ready: s.fleet.power.ready, why: s.fleet.power.why ?? undefined, idle: s.fleet.power.idle ?? [] } } },
  radar: { type: "radar", size: [4, 4], options: (w) => ({ label: w.title || "Radar", zoom: Math.min(9, Math.max(5, w.style?.zoom ?? 7)) }),
    data: (_s, w, now) => radarLayers(w, now) },
  devstream: { type: "devstream", size: [6, 4], options: (w) => ({ label: w.title || "DevStream" }),
    data: (s) => s.devstream && { ok: s.devstream.ok !== false && !s.devstream.stale, items: (s.devstream.items ?? []).map((i: J) => ({ id: String(i.id), title: i.title || "", folder: i.folder || "", t: i.t,
      thumb: `${s.base ?? ""}/devstream-thumb/${encodeURIComponent(i.id)}` })) } },
  projects: { type: "projects", size: [4, 4], options: (w) => ({ label: w.title || "Projects", q: w.q || "" }),
    data: (s) => Array.isArray(s.projects) && { projects: s.projects.map((p: J) => ({ ...p, sessions: p.sessions ?? 0, last: p.last ?? "" })) } },
  favorites: { type: "favorites", size: [3, 4], options: (w) => ({ label: w.title || "Favorites" }),
    data: (s) => s.favorites && { live: s.favorites.live ?? [], items: s.favorites.items ?? [] } },
  quotas: { type: "quotas", size: [4, 4], options: (w) => ({ label: w.title || "Tokens and quotas" }),
    data: (s) => s.quotas && { deck: !!s.quotas.deck, levels: s.quotas.levels ?? [], auto: s.quotas.auto ?? null,
      plans: (s.quotas.plans ?? []).map((p: J) => ({ ...p, level: lvl(p.level) })), opencode: s.quotas.opencode,
      gemini: s.quotas.gemini ?? { free_used: null, free_cap: 0, paid_usd: null, daily_usd: 0 },
      backends: (s.quotas.backends ?? []).map((b: J) => ({ name: b.name, enabled: b.enabled !== false, tps: b.tps ?? null, tok24: b.tok24 ?? null, tok: b.tok ?? [], ok: b.ok ?? 0, fail: b.fail ?? 0 })),
      gpu: { lease: s.quotas.gpu?.lease ?? null }, ollama: Array.isArray(s.quotas.ollama) ? s.quotas.ollama.filter((o: J) => typeof o?.gb === "number") : null } },
  ask: { type: "ask", size: [4, 4], options: (w) => ({ label: w.title || "Ask", model: w.model || "auto" }),
    data: (s, w) => ({ prompt: w.prompt || "", models: Array.isArray(s.stealthModels) ? s.stealthModels.map(String) : [] }) },
};
// level words: old cards use "", "ok", "warn", "bad" (and sometimes "err")
const lvl = (l: unknown) => (l === "warn" ? "warn" : l === "bad" || l === "err" || l === "error" ? "bad" : "");
const lvl3 = (l: unknown) => (lvl(l) || "ok") as "ok" | "warn" | "bad";

// Radar: the old card draws public tiles straight from the browser (no voice.py route). One tile at the card's centre and zoom.
const tile = (lat: number, lon: number, z: number) => { const n = 2 ** z, r = (lat * Math.PI) / 180;
  return { x: Math.floor(((lon + 180) / 360) * n), y: Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n) }; };
const stamp = (t: number) => new Date(t * 1000).toISOString().replace(/[-:T]/g, "").slice(0, 12);
export function radarLayers(w: J, now: number) {
  const [lat, lon] = Array.isArray(w.at) && w.at.length === 2 ? w.at : [41.88, -87.63], z = Math.min(9, Math.max(5, w.style?.zoom ?? 7)), { x, y } = tile(lat, lon, z);
  const dark = !/light/i.test(w.style?.map ?? ""), shade = dark ? "Dark_Gray" : "Light_Gray", hours = Math.min(2, Math.max(1, w.style?.hours ?? 1));
  const last = Math.floor(now / 600) * 600 - 600, frames = [];
  for (let t = last - hours * 3600 + 600; t <= last; t += 600)
    frames.push({ t: new Date(t * 1000).toISOString(), rain: w.style?.rain === 0 ? undefined : `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${stamp(t)}/${z}/${x}/${y}.png` });
  const ct = new Date((Math.floor(now / 600) * 600 - 1800) * 1000).toISOString().slice(0, 16);
  return { base: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${shade}_Base/MapServer/tile/${z}/${y}/${x}`,
    labels: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${shade}_Reference/MapServer/tile/${z}/${y}/${x}`,
    clouds: w.style?.clouds === 0 ? undefined : `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/${ct}:00Z/GoogleMapsCompatible_Level7/${Math.min(z, 7)}/${y >> Math.max(0, z - 7)}/${x >> Math.max(0, z - 7)}.png`,
    frames };
}
const SKINS = new Set(["beacon", "swamp"]);

/** /state -> board JSON (cards in the old layout order, packed 12 columns wide) + per-card data + skin. Unknown old types are skipped and listed. */
export function toBoard(s: VoiceSnapshot, now = Date.now() / 1000): { board: Board; data: Live; skin: string; skipped: string[] } {
  const ws: J[] = s.state.widgets ?? [], order: string[] = s.state.layout?.slots?.widgets?.map((x: any) => (typeof x === "string" ? x : x?.id)) ?? [];
  const rank = (w: J) => { const i = order.indexOf(w.id); return i < 0 ? 1e6 + (w.front ?? 0) : i; };
  const cards: Board["cards"] = [], data: Live = {}, skipped: string[] = [];
  let x = 0, y = 0, rowH = 0;
  for (const w of [...ws].sort((a, b) => rank(a) - rank(b))) {
    const m = MAP[w.type]; if (!m) { skipped.push(w.type); continue; }
    const [cw, ch] = m.size; if (x + cw > 12) { x = 0; y += rowH; rowH = 0; }
    data[cards.length] = (() => { if (!m.data) return {}; try { const d = m.data(s, w, now); return d === undefined ? { state: "loading" as const } : { data: d }; } catch { return { state: "error" as const }; } })();
    cards.push({ type: m.type, x, y, w: cw, h: ch, options: m.options(w) }); x += cw; rowH = Math.max(rowH, ch);
  }
  const skin = SKINS.has(s.state.skin?.name) ? s.state.skin.name : "beacon";
  return { board: { board: s.state.layout?.name || "Beacon", cards }, data, skin, skipped };
}
