import type { Meta, StoryObj } from "@storybook/react";
import { SysScope } from "./widget";

const View = SysScope.render;
const KEYS = ["weather", "alerts", "temp", "claude", "queue", "build", "stealth", "legion"];
// Old Sandbox "sysscope" sample: all eight probes, no probe answered yet (every row "–" / "no reading", warn).
const parity = { rows: KEYS.map((key) => ({ key, big: "–", small: "no reading", lines: [], level: "warn" as const })) };
const ready = { rows: [
  { key: "weather", big: "41°", small: "Cloudy, H 47 / L 33", lines: ["Tomorrow: rain 60%"], level: "ok" as const },
  { key: "alerts", big: "2", small: "new", lines: ["mail: Invoice from Harbor", "cal: Dentist 12:19"], level: "warn" as const },
  { key: "temp", big: "71°C", trend: "▲" as const, small: "CPU 71 · GPU 58", lines: [], level: "warn" as const },
  { key: "claude", big: "3.2k", small: "tokens/min", lines: [], level: "ok" as const },
  { key: "stealth", big: "38%", small: "CPU · RAM 11.2 GB free", lines: [], level: "ok" as const },
  { key: "legion", big: "92%", trend: "▲" as const, small: "CPU · RAM 1.1 GB free", lines: [], level: "bad" as const } ] };
const meta: Meta<typeof View> = { title: "Widgets/Data/SysScope", component: View, args: { options: { label: "Envy", icon: "🖥️" }, size: [3, 6] },
  decorators: [(S) => <div style={{ width: "18rem", height: "36rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 602 }}><St /></div>] };
