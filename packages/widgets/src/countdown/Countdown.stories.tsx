import type { Meta, StoryObj } from "@storybook/react";
import { Countdown } from "./widget";

const View = Countdown.render;
const meta: Meta<typeof View> = { title: "Widgets/Data/Countdown", component: View, args: { options: { label: "Tea timer" }, size: [2, 2] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { endsAt: 1764000000000 + 754000, now: 1764000000000 } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
