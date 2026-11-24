// Made-up voice.py snapshot (shapes from the Envy schema survey, values invented, like Util-VoiceServer tests/fixtures.mjs). No real data.
import type { VoiceSnapshot } from "./voice";
export function fakeSnapshot(now: number): VoiceSnapshot {
  const m = (n: number) => now - n * 60, h = (n: number) => now + n * 3600;
  const w = (id: string, type: string, title: string, extra = {}) => ({ id, type, title, made: now, keep: true, front: 0, actions: [], ...extra });
  return {
    state: { skin: { name: "swamp", v: 1, saved: [] }, layout: { name: "Main", show: [], names: [], boards: [], slots: { size: {}, widgets: ["c1", "m1", "n1", "iso1", "r1", "d1"] } },
      widgets: [w("c1", "calendar", "Calendar"), w("m1", "mail", "Inbox"), w("n1", "notion", "Notion Inbox"), w("iso1", "iso", "Agents & Machines"), w("r1", "replies", "Proposed replies"), w("d1", "docs", "Docs")],
      iso: { hosts: { legion: { state: "working", mem: 84, temp: 71, jobs: [{ name: "ssh session", state: "working", say: "Claude session" }, { name: "HardwareWatch", state: "reading" }] },
        envy: { state: "idle", mem: 40, temp: 52, jobs: [{ name: "voice.py", state: "thinking" }, { name: "skills-sync", state: "sleeping" }] },
        stealth: { state: "idle", mem: 43, temp: 45, jobs: [] }, moby: { state: "offline" } } } },
    agenda: { ok: true, events: [{ t: h(.3), end: h(1), allday: false, title: "Design sync", where: "Zoom", link: "" }, { t: h(3), end: h(4), allday: false, title: "Dentist", where: "Main St", link: "" },
      { t: h(26), end: null, allday: true, title: "Sam's birthday", where: "", link: "" }],
      mail: [{ t: m(8), from: "Alex Rivera", subject: "Re: build 42 is green", link: "" }, { t: m(95), from: "Studio Ops", subject: "Invoice ready", link: "" }] },
    replies: { ok: true, total: 3, items: [{ id: 1, t: m(12), name: "Matt R.", channel: "LinkedIn", cls: "warm", draft: "ready", ask: "Thanks again for passing my resume along.", body: "", link: "" },
      { id: 2, t: m(180), name: "Dana O.", channel: "Gmail", cls: "work", draft: "", ask: "Following up on the contract questions.", body: "", link: "" }] },
    notion: { ok: true, rows: [{ id: "d1", group: "you", owner: "You", kind: "Decide", status: "New", title: "Retire the merged worktrees?", url: "", options: [{ label: "Trust your pick", hint: "", done: false }, { label: "Not an issue", hint: "", done: false }], images: [], why: "", groomer: "" },
      { id: "c1", group: "claude", owner: "Claude", kind: "Do", status: "In progress", title: "Port the swamp skin", url: "", options: [], images: [], why: "", groomer: "" }] },
    decisions: { items: [] },
    docs: [{ group: "Hubs", label: "Project Index", url: "https://example.com/p", note: "Every project" }, { group: "Design kits", label: "Swamp kit", url: "https://example.com/s", note: "Sprites, sounds, VFX" }],
  };
}
