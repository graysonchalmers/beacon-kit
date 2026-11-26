// Made-up voice.py snapshot (shapes from the Envy schema survey, values invented, like Util-VoiceServer tests/fixtures.mjs). No real data.
import type { VoiceSnapshot } from "./voice";
export function fakeSnapshot(now: number): VoiceSnapshot {
  const m = (n: number) => now - n * 60, h = (n: number) => now + n * 3600;
  const w = (id: string, type: string, title: string, extra = {}) => ({ id, type, title, made: now, keep: true, front: 0, actions: [], ...extra });
  return {
    state: { skin: { name: "swamp", v: 1, saved: [] }, layout: { name: "Main", show: [], names: [], boards: [], slots: { size: {}, widgets: ["c1", "m1", "n1", "iso1", "r1", "d1", "ss1", "fl1", "me1", "q1", "rd1", "pr1", "fv1", "ds1", "ak1"] } },
      widgets: [w("c1", "calendar", "Calendar"), w("m1", "mail", "Inbox"), w("n1", "notion", "Notion Inbox"), w("iso1", "iso", "Agents & Machines"), w("r1", "replies", "Proposed replies"), w("d1", "docs", "Docs"),
        w("ss1", "sysscope", "Envy", { rows: ["weather", "temp", "claude", "queue"] }), w("fl1", "fleet", "Fleet"), w("me1", "mesh", "Mesh"), w("q1", "quotas", "Tokens and quotas"),
        w("rd1", "radar", "Radar", { at: [41.88, -87.63], style: { map: "dark", zoom: 7, hours: 1, rain: 1, clouds: 1 } }), w("pr1", "projects", "Projects", { q: "" }),
        w("fv1", "favorites", "Favorites"), w("ds1", "devstream", "DevStream"), w("ak1", "ask", "Ask Stealth", { prompt: "", model: "auto" }),
        w("t1", "tile", "Weather", { value: "41°F", caption: "Cloudy, high 44°", hist: [38, 39, 41, 43, 44, 42, 41] })],
      iso: { hosts: { legion: { state: "working", cpu: 38, disk: 61, mem: 84, temp: 71, jobs: [{ name: "ssh session", state: "working", say: "Claude session" }, { name: "HardwareWatch", state: "reading" }] },
        envy: { state: "idle", cpu: 12, disk: 48, mem: 40, temp: 52, jobs: [{ name: "voice.py", state: "thinking" }, { name: "skills-sync", state: "sleeping" }] },
        stealth: { state: "idle", mem: 43, temp: 45, jobs: [] }, moby: { state: "offline" } } } },
    agenda: { ok: true, events: [{ t: h(.3), end: h(1), allday: false, title: "Design sync", where: "Zoom", link: "" }, { t: h(3), end: h(4), allday: false, title: "Dentist", where: "Main St", link: "" },
      { t: h(26), end: null, allday: true, title: "Sam's birthday", where: "", link: "" }],
      mail: [{ t: m(8), from: "Alex Rivera", subject: "Re: build 42 is green", link: "" }, { t: m(95), from: "Studio Ops", subject: "Invoice ready", link: "" }] },
    replies: { ok: true, total: 3, items: [{ id: 1, t: m(12), name: "Matt R.", channel: "LinkedIn", cls: "warm", draft: "ready", ask: "Thanks again for passing my resume along.", body: "", link: "" },
      { id: 2, t: m(180), name: "Dana O.", channel: "Gmail", cls: "work", draft: "", ask: "Following up on the contract questions.", body: "", link: "" }] },
    notion: { ok: true, rows: [{ id: "d1", group: "you", owner: "You", kind: "Decide", status: "New", title: "Retire the merged worktrees?", url: "", options: [{ label: "Trust your pick", hint: "", done: false }, { label: "Not an issue", hint: "", done: false }], images: [], why: "", groomer: "" },
      { id: "c1", group: "claude", owner: "Claude", kind: "Do", status: "In progress", title: "Port the swamp skin", url: "", options: [], images: [], why: "", groomer: "" }] },
    decisions: { items: [] },
    sysscope: { weather: { big: "41°", small: "Cloudy", level: "ok", lines: ["High 44°"] }, temp: { big: "58°C", small: "CPU", level: "ok", cpu: 58, gpu: null, trend: "▲" },
      claude: { big: "3", small: "sessions", level: "warn", trend: "", sessions: 3, calls: 41 }, queue: { big: "2", small: "waiting", level: "ok", wait: 2, busy: 1, lines: [], last: "", exit: 0, running: [], trend: "" } },
    fleet: { at: now, machines: [{ id: "envy", state: "up", age_s: 4, cpu: 22, mem: 51, disk: { mount: "/", free_gb: 120, pct: 61 }, checks_down: [], level: "" },
      { id: "moby", state: "down", age_s: 9000, cpu: null, mem: null, disk: {}, checks_down: ["ssh"], level: "bad" }],
      lease: { known: true, free: false, holder: null, queue: 1, age_s: 420 }, voice: { served: {}, events: [] }, power: { ready: { envy: true }, why: {}, idle: null } },
    mesh: { machines: [{ name: "envy", checks: 5, down: [], recovered: "", level: "" }, { name: "moby", checks: 5, down: ["ssh"], recovered: "", level: "bad" }],
      harbor: { at: "12:01", down: "" }, load: { envy: { load1: 0.6, cpus: 8, free_mb: 6000 }, stealth: {} }, overnight: { state: "done", result: "ok", start: "01:34", end: "02:10", fails: [], sync: [] }, alerts: [] },
    quotas: { at: now, deck: true, auto: "nudge", base: "", levels: ["off", "nudge", "auto", "boost", "max"],
      plans: [{ label: "Claude Max", pct: 42, text: "42% used", left: "3 h left", resets: "8 p.m.", level: "" }], opencode: { paused: false, note: "", fails: 0 },
      gemini: { free_used: 12, free_cap: 100, paid_usd: 0, daily_usd: 0, source: "" },
      backends: [{ id: "ollama", name: "Ollama", tps: 31.5, tok: [1, 4, 2], tok24: 9000, calls: 20, used: 1, ok: 19, fail: 1, enabled: true, note: "" }], total24: 9000, gpu: { lease: "", users: [] }, ollama: [] },
    projects: [{ name: "Beacon Kit", emoji: "🧰", nick: "bk", say: "", tags: "ui", description: "React kitbash UI kit", url: "", last: "2026-11-24", sessions: 12 }],
    favorites: { items: [{ id: "f1", label: "Restart voice", note: "Envy", text: "", cmds: [{ label: "restart", shell: "bash", cmd: "systemctl --user restart voice" }] }], live: [{ label: "voice", value: "up", level: "" }] },
    devstream: { ok: true, stale: false, items: [] }, stealthModels: [],
    docs: [{ group: "Hubs", label: "Project Index", url: "https://example.com/p", note: "Every project" }, { group: "Design kits", label: "Swamp kit", url: "https://example.com/s", note: "Sprites, sounds, VFX" }],
  };
}
