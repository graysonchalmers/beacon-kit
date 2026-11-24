import type { Meta, StoryObj } from "@storybook/react";
import { Counter } from "./widget";

const View = Counter.render;
const meta: Meta<typeof View> = { title: "Widgets/Input/Counter", component: View, args: { options: { label: "Tallies" }, size: [3, 2] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { items: [ { id: "1", text: "Glasses of water", n: 3 }, { id: "2", text: "Pomodoros", n: 5 } ] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
