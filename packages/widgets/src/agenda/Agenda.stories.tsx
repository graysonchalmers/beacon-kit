import type { Meta, StoryObj } from "@storybook/react";
import { Agenda } from "./widget";

const View = Agenda.render;
// Old Sandbox "calendar" sample.
const parity = { events: [
  { id: "1", day: "Today", time: "9:49 a.m.", title: "Design sync: Hey Server cards", where: "Zoom", soon: true },
  { id: "2", day: "Today", time: "12:19 p.m.", title: "Dentist", where: "Main St Dental" },
  { id: "3", day: "Today", time: "3:19 p.m.", title: "Render review: tavern props", where: "Studio" },
  { id: "4", day: "Tomorrow", time: "All day", title: "Sam's birthday" } ] };
const meta: Meta<typeof View> = { title: "Widgets/List/Agenda", component: View, args: { options: { label: "Calendar" }, size: [3, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "17rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: parity } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 279 }}><St /></div>] };
