import type { Meta, StoryObj } from "@storybook/react";
import { IsoScene } from "./widget";

const View = IsoScene.render;
const meta: Meta<typeof View> = { title: "Widgets/2D/Agents and machines", component: View, args: { options: { label: "Agents & Machines" }, size: [6, 3] },
  decorators: [(S) => <div style={{ width: "22rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { machines: [ { id: "envy", name: "Envy", up: true, jobs: [ { id: "a", mood: "work", say: "Editing" }, { id: "b", mood: "think" }, { id: "c", mood: "idle" } ] }, { id: "legion", name: "Legion", up: true, jobs: [ { id: "d", mood: "sad", say: "RAM tight" } ] }, { id: "stealth", name: "Stealth", up: true, jobs: [ { id: "e", mood: "sleep" } ] }, { id: "moby", name: "Moby", up: false, jobs: [] } ] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
