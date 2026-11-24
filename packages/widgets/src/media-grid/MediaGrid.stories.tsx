import type { Meta, StoryObj } from "@storybook/react";
import { MediaGrid } from "./widget";
import { thumbs } from "../_shared/samples";

const View = MediaGrid.render;
const meta: Meta<typeof View> = { title: "Widgets/Media/Media grid", component: View, args: { options: { label: "DevStream", search: true }, size: [4, 4] },
  decorators: [(S) => <div style={{ width: "22rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { items: thumbs } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
