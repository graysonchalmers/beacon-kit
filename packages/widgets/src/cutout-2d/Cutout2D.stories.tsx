import type { Meta, StoryObj } from "@storybook/react";
import { Cutout2D } from "./widget";
import { cutoutSrc } from "../_shared/samples";
const View = Cutout2D.render;
const ready = { src: cutoutSrc };
const meta: Meta<typeof View> = { title: "Widgets/2D/Cutout", component: View, args: { options: { label: "Banner cutout" }, size: [3, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
