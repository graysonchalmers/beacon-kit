import type { Meta, StoryObj } from "@storybook/react";
import { Checklist } from "./widget";

const View = Checklist.render;
const meta: Meta<typeof View> = { title: "Widgets/Input/Checklist", component: View, args: { options: { label: "Today" }, size: [3, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { items: [ { id: "1", text: "Merge beacon-kit parity PR", done: true }, { id: "2", text: "Restart Claude app on Legion", done: false }, { id: "3", text: "Review OneDrive dry run", done: false } ] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
