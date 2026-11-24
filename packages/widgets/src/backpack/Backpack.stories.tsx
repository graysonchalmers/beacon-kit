import type { Meta, StoryObj } from "@storybook/react";
import { Backpack } from "./widget";

const View = Backpack.render;
// Old Sandbox "kit" sample: {"screen": "inventory", "items": [{"id": "rock", "n": 3}, "sprout", "frog", "Lantern"]}.
const parity = { items: [{ id: "rock", n: 3 }, "sprout", "frog", "Lantern"] };
const meta: Meta<typeof View> = { title: "Widgets/2D/Backpack", component: View, args: { options: { label: "Backpack", title: "Inventory" }, size: [4, 4] },
  decorators: [(S) => <div style={{ width: "28rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: parity } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 614, height: 570 }}><St /></div>] };
