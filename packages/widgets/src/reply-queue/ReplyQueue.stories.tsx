import type { Meta, StoryObj } from "@storybook/react";
import { ReplyQueue } from "./widget";

const View = ReplyQueue.render;
// Old Sandbox "replies" sample (4 shown of 9).
const parity = { total: 9, items: [
  { id: "1", age: "12 min", name: "Matt Regnier", channel: "linkedin", preview: "Hey Matt, it's been too long! Thanks again for passing my resume along." },
  { id: "2", age: "1 h", name: "Jason Harris", channel: "linkedin", preview: "Would love to catch up about the studio pipeline." },
  { id: "3", age: "3 h", name: "Dana Okafor", channel: "gmail", preview: "Following up on the contract questions from Monday." },
  { id: "4", age: "7 h", name: "Lee Park", channel: "gmail", preview: "Thanks for the intro! Happy to share the portfolio." } ] };
const meta: Meta<typeof View> = { title: "Widgets/List/Reply queue", component: View, args: { options: { label: "Proposed replies" }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "24rem", height: "18rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: parity } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 614, height: 380 }}><St /></div>] };
