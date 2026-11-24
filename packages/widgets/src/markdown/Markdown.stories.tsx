import type { Meta, StoryObj } from "@storybook/react";
import { Markdown } from "./widget";

const View = Markdown.render;
const meta: Meta<typeof View> = { title: "Widgets/Media/Markdown note", component: View, args: { options: { label: "Handoff" }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { text: "# Next up\n- Port **spotify** card\n- Wire `voice.py` feed\n\nSee [STANDARDS](https://github.com/graysonchalmers/beacon-kit)." } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
