import type { Meta, StoryObj } from "@storybook/react";
import { StatTile } from "./widget";

const View = StatTile.render;
const meta: Meta<typeof View> = { title: "Widgets/Data/Stat tile", component: View,
  args: { options: { label: "Legion RAM free", unit: "GB" }, size: [3, 2] } };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { value: 6.2, delta: -0.7 } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const AllStates: S = { render: (a) => (
  <div className="grid grid-cols-2 gap-4">
    <View {...a} state="ready" data={{ value: 6.2, delta: -0.7 }} />
    <View {...a} state="loading" /><View {...a} state="empty" /><View {...a} state="error" />
  </div>) };
