import type { Meta, StoryObj } from "@storybook/react";
import { ChatPane } from "./widget";

const View = ChatPane.render;
const ready = { messages: [
  { id: "1", from: "agent" as const, text: "Board is up. Want the 3D card bigger?" },
  { id: "2", from: "user" as const, text: "Yes, 6 wide." },
  { id: "3", from: "agent" as const, text: "Done. Resized to 6x4." } ] };
const meta: Meta<typeof View> = { title: "Widgets/Chat/Chat pane", component: View, args: { options: { label: "Beacon agent" }, size: [3, 4] },
  decorators: [(S) => <div style={{ width: "18rem", height: "20rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
