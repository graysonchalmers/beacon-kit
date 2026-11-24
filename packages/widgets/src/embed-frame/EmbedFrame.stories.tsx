import type { Meta, StoryObj } from "@storybook/react";
import { EmbedFrame } from "./widget";

const View = EmbedFrame.render;
const meta: Meta<typeof View> = { title: "Widgets/Media/Embedded page", component: View, args: { options: { label: "Agent page" }, size: [4, 4] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { html: "<body style=\"font:14px sans-serif;margin:12px\"><h3>Hello from an agent</h3><p>Sandboxed HTML.</p></body>" } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
