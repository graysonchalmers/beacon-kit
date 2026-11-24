import type { Meta, StoryObj } from "@storybook/react";
import { YouTube } from "./widget";
import { thumbs } from "../_shared/samples";

const View = YouTube.render;
const yt = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const v = (id: string, title: string, channel: string) => ({ id, title, channel, thumb: yt(id) });
// Old Sandbox "ytplaylists" sample: ytplaylists.py MOCK (unsigned-in card), first video's thumb per playlist.
const parity = { ok: true, mock: true, playlists: [
  { id: "PLmock-films", title: "Open movies", count: 2, thumb: yt("aqz-KE-bpKQ"), videos: [v("aqz-KE-bpKQ", "Big Buck Bunny", "Blender"), v("eRsGyueVLvQ", "Sintel", "Blender")] },
  { id: "PLmock-talks", title: "Talks to rewatch", count: 3, thumb: yt("jNQXAC9IVRw"), videos: [v("jNQXAC9IVRw", "Me at the zoo", "jawed"), v("aqz-KE-bpKQ", "Big Buck Bunny (again)", "Blender"), v("eRsGyueVLvQ", "Sintel (again)", "Blender")] },
  { id: "PLmock-shop", title: "Shop projects", count: 2, thumb: yt("jNQXAC9IVRw"), videos: [v("jNQXAC9IVRw", "Me at the zoo", "jawed"), v("eRsGyueVLvQ", "Sintel", "Blender")] } ] };
const ready = { ok: true, playlists: thumbs.slice(0, 4).map((t, i) => ({ id: `PL${i}`, title: t.title, count: i + 1, thumb: t.thumb,
  videos: thumbs.slice(0, i + 1).map((x) => ({ id: `v${x.id}`, title: x.title, channel: "Studio", thumb: x.thumb })) })) };
const meta: Meta<typeof View> = { title: "Widgets/Media/YouTube", component: View, args: { options: { label: "YouTube" }, size: [2, 3] },
  decorators: [(S) => <div style={{ width: "20rem", height: "24rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 357 }}><St /></div>] };
