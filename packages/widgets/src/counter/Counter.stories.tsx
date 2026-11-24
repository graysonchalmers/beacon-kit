import type { Meta, StoryObj } from "@storybook/react";
import { Counter } from "./widget";

const View = Counter.render;
// Old Sandbox "counter" sample: Darts: Grayson: 0 / Sam: 0.
const parity = { items: [ { id: "1", text: "Grayson", n: 0 }, { id: "2", text: "Sam", n: 0 } ] };
const meta: Meta<typeof View> = { title: "Widgets/Input/Counter", component: View, args: { options: { label: "Darts" }, size: [3, 2] },
  decorators: [(S) => <div style={{ width: "18rem", height: "10rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { items: [ { id: "1", text: "Grayson", n: 3 }, { id: "2", text: "Sam", n: 5 } ] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 142 }}><St /></div>] };
