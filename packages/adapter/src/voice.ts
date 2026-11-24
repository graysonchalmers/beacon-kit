// Live data adapter: old Beacon's voice.py (Util-VoiceServer) -> Beacon Kit board + per-card data.
// Endpoints: /state (widgets, layout, skin, iso), /agenda, /decisions, /notion, /replies, /docs. Schema notes from the Envy, 2026-11-24.
// voice.py binds to localhost: run the kit app on the same machine, or proxy these paths to it.
import type { Board } from "../../board/src/schema";
import type { WidgetState } from "../../widgets/src/contract";

type J = Record<string, any>;
export type VoiceSnapshot = { state: J; agenda?: J; decisions?: J; notion?: J; replies?: J; docs?: J[] };
export type Live = Record<number, { data?: unknown; state?: WidgetState }>;

export async function fetchVoice(base = "", f: typeof fetch = fetch): Promise<VoiceSnapshot> {
  const get = (p: string) => f(base + p, { cache: "no-store" }).then((r) => (r.ok ? r.json() : undefined)).catch(() => undefined);
  const [state, agenda, decisions, notion, replies, docs] = await Promise.all(["/state", "/agenda", "/decisions", "/notion", "/replies", "/docs"].map(get));
  if (!state) throw new Error("voice.py /state unreachable");
  return { state, agenda, decisions, notion, replies, docs };
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
      images: (r.images ?? []).map((i: J) => ({ src: `/notion-img/${i.img}`, cap: i.cap || "" })) })) } },
  decisions: { type: "decision-queue", size: [3, 6], options: (w) => ({ title: w.title || "Decisions", icon: "ask" }),
    data: (s) => s.decisions && { rows: [], asks: (s.decisions.items ?? []).filter((d: J) => d.source !== "notion").map((d: J) => ({ id: d.id, title: d.title, why: d.why || "", by: d.by || "Claude",
      status: d.status === "answered" ? "answered" : "pending", options: (d.options ?? []).map((o: J) => ({ label: o.label, hint: o.hint || "" })), links: d.links ?? [] })) } },
  docs: { type: "docs", size: [3, 4], options: (w) => ({ label: w.title || "Docs" }), data: (s) => s.docs && { links: s.docs } },
  iso: { type: "iso-scene", size: [6, 3], options: (w) => ({ label: w.title || "Agents & Machines" }),
    data: (s) => { const h = s.state.iso?.hosts; return h && { machines: Object.entries(h).map(([id, m]: [string, any]) => ({ id, name: id[0].toUpperCase() + id.slice(1),
      up: !!m && m.state !== "offline", mem: m?.mem, temp: m?.temp, jobs: (m?.jobs ?? []).map((j: J, i: number) => ({ id: `${id}${i}`, say: j.say || j.name, mood: MOOD[j.state] ?? "idle" })) })) }; } },
  tile: { type: "stat-tile", size: [2, 2], options: (w) => ({ label: w.title || "Tile" }),
    data: (_s, w) => { const v = parseFloat(String(w.value ?? "")); return Number.isFinite(v) ? { value: v } : undefined; } },
  // live data for these comes from their own endpoints later; the card shows with its options now
  sysscope: { type: "sysscope", size: [4, 3], options: (w) => ({ label: w.title || "Envy" }) },
  mesh: { type: "mesh", size: [4, 3], options: (w) => ({ label: w.title || "Mesh" }) },
  fleet: { type: "fleet", size: [4, 3], options: (w) => ({ title: w.title || "Fleet" }) },
  radar: { type: "radar", size: [4, 4], options: (w) => ({ label: w.title || "Radar" }) },
  devstream: { type: "devstream", size: [6, 4], options: (w) => ({ label: w.title || "DevStream" }) },
  projects: { type: "projects", size: [4, 4], options: (w) => ({ label: w.title || "Projects" }) },
  favorites: { type: "favorites", size: [3, 4], options: (w) => ({ label: w.title || "Favorites" }) },
  ask: { type: "ask", size: [4, 4], options: (w) => ({ label: w.title || "Ask" }) },
};
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
