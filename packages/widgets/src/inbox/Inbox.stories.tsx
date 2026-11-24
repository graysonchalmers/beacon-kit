import type { Meta, StoryObj } from "@storybook/react";
import { Inbox } from "./widget";

const View = Inbox.render;
// Old Sandbox "mail" sample.
const parity = { mail: [
  { id: "1", age: "8 min", from: "Alex Rivera", subject: "Re: build 42 is green", channel: "gmail" as const },
  { id: "2", age: "2 h", from: "Studio Ops", subject: "Invoice ready for October", channel: "gmail" as const },
  { id: "3", age: "4 h", from: "Priya N.", subject: "Lunch on Thursday?", channel: "gmail" as const },
  { id: "4", age: "8 h", from: "GitHub", subject: "[Util-VoiceServer] PR merged", channel: "gmail" as const } ] };
const meta: Meta<typeof View> = { title: "Widgets/List/Inbox", component: View, args: { options: { label: "Inbox", linkedin: true }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "24rem", height: "18rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: parity } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 614, height: 380 }}><St /></div>] };
