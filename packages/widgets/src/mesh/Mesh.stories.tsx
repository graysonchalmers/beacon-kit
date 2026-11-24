import type { Meta, StoryObj } from "@storybook/react";
import { Mesh } from "./widget";

const View = Mesh.render;
// Old Sandbox "mesh" sample: six machines up, no load table, no overnight run ("Digest ?"), no alerts.
const parity = { machines: ["envy", "legion", "stealth", "moby", "harbor", "cinema"].map((name) => ({ name, level: "" as const, down: [], checks: 3 })),
  load: {}, overnight: {}, alerts: [] };
const ready = { machines: [{ name: "envy", level: "" as const, down: [], checks: 3 }, { name: "legion", level: "warn" as const, down: ["ssh"], checks: 3, recovered: "03:12" },
    { name: "stealth", level: "bad" as const, down: ["ping", "ssh", "ollama"], checks: 3 }],
  harbor: { at: "09:30", down: "none" },
  load: { envy: { load1: 2.1, cpus: 8, free_mb: 9200 }, stealth: { load1: 9.4, cpus: 6, free_mb: 1200, vram_free_mb: 800, gpu_lease: "ollama", gpu_waiting: 1 } },
  overnight: { state: "inactive", result: "success", start: "02:00", end: "02:41", sync: ["Notion sync ok"] },
  alerts: [{ at: "08:12", source: "mesh", text: "🔴 Stealth DOWN" }, { at: "07:50", source: "mail", text: "Quota at 80%", action: "muted" }] };
const meta: Meta<typeof View> = { title: "Widgets/Data/Mesh", component: View, args: { options: { label: "Mesh", icon: "🖥️" }, size: [3, 4] },
  decorators: [(S) => <div style={{ width: "19rem", height: "26rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Wide: S = { args: { state: "ready", data: ready, size: [6, 4] }, decorators: [(St) => <div style={{ width: "40rem", height: "26rem" }}><St /></div>] };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 361 }}><St /></div>] };
