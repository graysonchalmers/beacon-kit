import type { Meta, StoryObj } from "@storybook/react";
import { Fleet } from "./widget";

const View = Fleet.render;
const unk = (id: string) => ({ id, state: "unknown" as const, age_s: null });
// Old Sandbox sample: Envy up, the rest without a reading, Moby not controllable, GPU lease unknown.
const parity = {
  machines: [{ id: "envy", state: "up" as const, level: "" as const, age_s: 3, cpu: 17, mem: 6, disk: { mount: "/", free_gb: 242, pct: 6 } },
    unk("legion"), unk("stealth"), unk("moby"), unk("harbor"), unk("cinema")],
  lease: { known: false },
  power: { ready: { envy: true, legion: true, stealth: true, moby: false, harbor: true, cinema: true }, why: { moby: "Not available from here" }, idle: ["stealth"] },
};
const meta: Meta<typeof View> = { title: "Widgets/Data/Fleet", component: View, args: { options: { title: "Fleet" }, size: [3, 2] },
  decorators: [(S) => <div style={{ width: "58rem", height: "24rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { ...parity, machines: [parity.machines[0],
  { id: "stealth", state: "up", level: "warn", age_s: 10, cpu: 72, mem: 81, gpu: { util: 64, vram_used_gb: 9, vram_total_gb: 16, temp: 66 }, disk: { mount: "C:", free_gb: 88, pct: 83 } },
  { id: "legion", state: "down", age_s: 900 }], lease: { known: true, free: false, holder: "whisper", mins: 4, queue: 1 } } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(S) => <div style={{ width: 930, height: 380 }}><S /></div>] };
