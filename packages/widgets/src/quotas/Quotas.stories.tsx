import type { Meta, StoryObj } from "@storybook/react";
import { Quotas } from "./widget";

const View = Quotas.render;
// Old Sandbox "quotas" sample: deck down, no level, no plans, Gemini unknown, no backends, GPU lease unknown, Ollama silent.
const parity = { deck: false, levels: ["OFF", "STEADY", "BOOST", "MAX"], auto: null, plans: [],
  gemini: { free_used: null, free_cap: 250, paid_usd: null, daily_usd: 1 }, backends: [], gpu: {}, ollama: null };
const hours = (k: number) => Array.from({ length: 24 }, (_, i) => Math.round(Math.max(0, Math.sin(i / 3 + k) * 4000 + 2000)));
const ready = { deck: true, levels: ["OFF", "STEADY", "BOOST", "MAX"], auto: "STEADY",
  plans: [{ label: "Claude 5 h", pct: 42, text: "42%", left: "2 h 10 m left", level: "" as const },
    { label: "Claude week", pct: 71, text: "71%", left: "3 d left", resets: "Mon", level: "warn" as const },
    { label: "Codex", pct: 91, text: "91%", left: "40 m left", level: "bad" as const }],
  opencode: { paused: false, fails: 3, note: "OpenCode free tier" },
  gemini: { free_used: 120, free_cap: 250, paid_usd: 0.31, daily_usd: 1 },
  backends: [{ name: "Gemini", enabled: true, tps: 88, tok24: 412000, tok: hours(0), ok: 120, fail: 2 },
    { name: "Ollama", enabled: false, tps: 21, tok24: 38000, tok: hours(2), ok: 14, fail: 0 }],
  gpu: { lease: "ollama" }, ollama: [{ name: "qwen3:14b", gb: 9.3, vram_gb: 9.1 }] };
const meta: Meta<typeof View> = { title: "Widgets/Data/Quotas", component: View, args: { options: { label: "Tokens and quotas", icon: "🎛️" }, size: [3, 4] },
  decorators: [(S) => <div style={{ width: "19rem", height: "30rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 364 }}><St /></div>] };
