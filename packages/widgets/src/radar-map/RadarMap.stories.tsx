import type { Meta, StoryObj } from "@storybook/react";
import { RadarMap } from "./widget";
import { mapSrc, rainSrc } from "../_shared/samples";

const View = RadarMap.render;
const meta: Meta<typeof View> = { title: "Widgets/2D/Radar map", component: View, args: { options: { label: "Radar", showLegend: true }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "22rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { base: mapSrc, overlay: rainSrc, place: "Chicago", at: "3:05 AM" } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
