import type { Meta, StoryObj } from "@storybook/react";
import { Scene3D } from "./widget";

const View = Scene3D.render;
const ready = { shape: "torus" as const, color: "#ffb020" };
const meta: Meta<typeof View> = { title: "Widgets/3D/Scene", component: View, args: { options: { label: "Mesh preview" }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "20rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
