import type { Meta, StoryObj } from "@storybook/react";
import { Spotify } from "./widget";
import { photoSrc } from "../_shared/samples";

const View = Spotify.render;
const base = { playing: false, progress: 0, duration: 0, devices: [], groups: [], canVolume: true };
// Old Sandbox "spotify" sample: Spotify not set up (GET /spotify-now -> {error}), so the card shows the message and "Try again".
const parity = { ...base, error: "Spotify isn't set up yet." };
const ready = { ...base, track: "Teardrop", artist: "Massive Attack", album: "Mezzanine", art: photoSrc, playing: true, progress: 83000, duration: 330000,
  device: "Kitchen", devices: ["Whole house", "Kitchen", "Office"], groups: ["Whole house"], volume: 42 };
const meta: Meta<typeof View> = { title: "Widgets/Media/Spotify", component: View, args: { options: { label: "Spotify" }, size: [2, 2] },
  decorators: [(S) => <div style={{ width: "22rem", height: "22rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: ready } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
export const Parity: S = { args: { state: "ready", data: parity },
  decorators: [(St) => <div data-skin="beacon" style={{ width: 299, height: 89 }}><St /></div>] };
