import type { Meta, StoryObj } from "@storybook/react";
import { MediaViewer } from "./widget";
import { photoSrc } from "../_shared/samples";
const View = MediaViewer.render;
const ready = { kind: "image" as const, src: photoSrc, alt: "Mountain sunset placeholder", caption: "Latest render" };
const meta: Meta<typeof View> = { title: "Widgets/Media/Media viewer", component: View, args: { options: { label: "Render" }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "20rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
