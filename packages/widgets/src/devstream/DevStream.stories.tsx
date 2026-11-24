import type { Meta, StoryObj } from "@storybook/react";
import { DevStream } from "./widget";
import { thumbs } from "../_shared/samples";

const View = DevStream.render;
// Old Sandbox "devstream" sample: no DevStream library on the test box (GET /devstream -> {ok: false, items: []}).
const parity = { ok: false, items: [] };
const ready = { ok: true, items: thumbs.map((x, i) => ({ id: x.id, title: x.title, folder: "Shop", t: 1764000000 - i * 600, thumb: x.thumb })) };
const meta: Meta<typeof View> = { title: "Widgets/Media/DevStream", component: View, args: { options: { label: "DevStream" }, size: [4, 2] },
  decorators: [(S) => <div style={{ width: "38rem", height: "24rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 614, height: 380 }}><St /></div>] };
