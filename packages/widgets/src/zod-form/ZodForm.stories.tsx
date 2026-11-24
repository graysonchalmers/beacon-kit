import type { Meta, StoryObj } from "@storybook/react";
import { ZodForm } from "./widget";

const View = ZodForm.render;
const ready = { fields: [
  { name: "title", label: "Job title", kind: "text" as const, required: true },
  { name: "email", label: "Notify email", kind: "email" as const, required: true },
  { name: "minutes", label: "Timeout (min)", kind: "number" as const, required: false, min: 1, max: 120 },
  { name: "machine", label: "Machine", kind: "select" as const, required: true, choices: ["Envy", "Legion", "Stealth"] } ] };
const meta: Meta<typeof View> = { title: "Widgets/Input/Zod form", component: View, args: { options: { label: "New job", submitLabel: "Queue" }, size: [3, 4] },
  decorators: [(S) => <div style={{ width: "18rem", height: "24rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
