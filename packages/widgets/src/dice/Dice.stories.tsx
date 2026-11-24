import type { Meta, StoryObj } from "@storybook/react";
import { Dice } from "./widget";

const View = Dice.render;
const meta: Meta<typeof View> = { title: "Widgets/Input/Dice", component: View, args: { options: { label: "Dice", sides: 6 }, size: [3, 2] },
  decorators: [(S) => <div style={{ width: "18rem", height: "10rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { value: 4 } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
// Old Sandbox html "Dice" sample: <div id="n" style="font-size:40px">-</div><button data-on="roll">Roll</button>.
export const Parity: S = { args: { state: "ready", data: { value: "-" } },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 151 }}><St /></div>] };
