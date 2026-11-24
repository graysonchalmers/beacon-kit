import type { Meta, StoryObj } from "@storybook/react";
import { Gauge } from "./widget";

const View = Gauge.render;
const meta: Meta<typeof View> = { title: "Widgets/Data/Gauge", component: View, args: { options: { label: "Legion CPU", unit: "%", min: 0, max: 100, warn: 70, danger: 90 }, size: [3, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { value: 76 } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
