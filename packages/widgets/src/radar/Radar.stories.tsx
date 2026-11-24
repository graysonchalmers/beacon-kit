import type { Meta, StoryObj } from "@storybook/react";
import { Radar } from "./widget";

const View = Radar.render;
const meta: Meta<typeof View> = { title: "Widgets/2D/Radar", component: View, args: { options: { label: "Radar", zoom: 7, stepMs: 450 }, size: [3, 4] },
  decorators: [(S) => <div style={{ width: 299, height: 320 }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
const now = Date.now(), t = (k: number) => new Date(now - k * 600e3).toISOString();
export const Ready: S = { args: { state: "ready", data: { frames: [3, 2, 1, 0].map((k) => ({ t: t(k) })) } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
/** Old Sandbox radar card (299 x 320): no tiles loaded, no rain frames -> caption "No rain on the radar", slider at "now". */
export const Parity: S = { args: { state: "ready", data: { frames: [] } } };
