import type { Meta, StoryObj } from "@storybook/react";
import { Ask } from "./widget";

const View = Ask.render;
// Old Sandbox "ask" sample: `<widget type="ask">What is in this photo?</widget>`, model auto.
const parity = { prompt: "What is in this photo?", models: ["auto"] };
const meta: Meta<typeof View> = { title: "Widgets/Chat/Ask", component: View, args: { options: { label: "Ask Stealth", model: "auto" }, size: [3, 2] },
  decorators: [(S) => <div style={{ width: "18rem", height: "13rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { prompt: "", models: ["auto", "llava:13b", "qwen2.5:7b"] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 199 }}><St /></div>] };
