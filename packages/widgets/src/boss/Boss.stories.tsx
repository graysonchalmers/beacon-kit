import type { Meta, StoryObj } from "@storybook/react";
import { Boss } from "./widget";

const View = Boss.render;
// Old Sandbox "boss" sample: nothing asked yet.
const parity = { rows: [] };
const meta: Meta<typeof View> = { title: "Widgets/Chat/Boss", component: View, args: { options: { label: "Boss" }, size: [4, 4] },
  decorators: [(S) => <div style={{ width: "28rem", height: "18rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { rows: [
  { q: "Is the Legion backup done?", src: "voice", at: "9:12 AM", answer: "Yes, it finished at 3:40 this morning." },
  { q: "Clean up old worktrees", src: "typed", at: "9:20 AM", answer: "There are 14 stale ones.", propose: "Remove the 14 stale worktrees", waiting: true } ] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 614, height: 570 }}><St /></div>] };
