import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from "./widget";

const View = Sparkline.render;
const ready = { points: [3.1, 4.2, 3.8, 5.5, 5.1, 6.8, 6.2, 7.4, 7.1, 8.3] };
const meta: Meta<typeof View> = { title: "Widgets/Data/Sparkline", component: View, args: { options: { label: "Offload tokens / hr", unit: "k" }, size: [4, 2] },
  decorators: [(S) => <div style={{ width: "18rem", height: "10rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
