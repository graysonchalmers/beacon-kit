import type { Meta, StoryObj } from "@storybook/react";
import { ItemList } from "./widget";

const View = ItemList.render;
const ready = { items: [
  { id: "1", label: "Envy fleet-backup", meta: "1:34 AM", status: "ok" as const },
  { id: "2", label: "Legion RAM pressure", meta: "0.7 GB free", status: "warn" as const },
  { id: "3", label: "Stealth Syncthing", meta: "synced", status: "ok" as const },
  { id: "4", label: "OneDrive unhook", meta: "blocked", status: "fail" as const } ] };
const meta: Meta<typeof View> = { title: "Widgets/List/Item list", component: View, args: { options: { label: "Fleet jobs", max: 8 }, size: [3, 3] },
  decorators: [(S) => <div style={{ width: "18rem", height: "14rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
