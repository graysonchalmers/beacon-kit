import type { Meta, StoryObj } from "@storybook/react";
import { Player } from "./widget";
import { thumbs } from "../_shared/samples";

const View = Player.render;
const meta: Meta<typeof View> = { title: "Widgets/Media/Music player", component: View, args: { options: { label: "Spotify" }, size: [3, 3] },
  decorators: [(S) => <div style={{ width: "22rem", height: "16rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { track: "Weightless", artist: "Marconi Union", album: "Ambient 1", art: thumbs[0].thumb, playing: true, position: 83000, duration: 480000, device: "Office", devices: ["Office", "Kitchen", "Everywhere"] } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
