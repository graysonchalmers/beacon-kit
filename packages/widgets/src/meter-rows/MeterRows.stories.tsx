import type { Meta, StoryObj } from "@storybook/react";
import { MeterRows } from "./widget";

const View = MeterRows.render;
const meta: Meta<typeof View> = { title: "Widgets/Data/Meter rows", component: View, args: { options: { label: "Legion health" }, size: [4, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { rows: [ { id: "cpu", label: "CPU", value: 42, max: 100, unit: "%", warn: 60, danger: 85 }, { id: "mem", label: "MEM", value: 88, max: 100, unit: "%", warn: 70, danger: 90, note: "0.7 GB free" }, { id: "disk", label: "DISK", value: 93, max: 100, unit: "%", warn: 80, danger: 90 }, { id: "temp", label: "TEMP", value: 58, max: 100, unit: "°C", warn: 65, danger: 80 } ] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
