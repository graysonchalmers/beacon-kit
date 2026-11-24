import type { Meta, StoryObj } from "@storybook/react";
import { Projects } from "./widget";

const View = Projects.render;
const projects = [
  { name: "util-voiceserver", nick: "🎙️ Beacon", say: "Voice server and the dashboard", url: "https://example.com/beacon", last: "2026-11-23", sessions: 210 },
  { name: "beacon-kit", emoji: "🧩", say: "Widget kit for boards", last: "2026-11-24", sessions: 40 },
  { name: "swamp-game", nick: "Swamp", emoji: "🐸", say: "Swamp kit sprites and VFX", last: "2026-11-10", sessions: 88 },
];
const meta: Meta<typeof View> = { title: "Widgets/List/Projects", component: View, args: { options: { label: "Projects", q: "", sort: "recent", home: "https://example.com/projects" }, size: [2, 2] },
  decorators: [(S) => <div style={{ width: "20rem", height: "20rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { projects } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
/** Old Sandbox sample: search "voice", no project list loaded, so "No project matches."; old card box 299x185. */
export const Parity: S = { args: { state: "ready", options: { label: "Projects", q: "voice", sort: "recent", home: "https://claude.ai/artifact/54PPMkLyQ5JE1FfY98xwJ2" }, data: { projects: [] } },
  decorators: [(S) => <div style={{ width: 299, height: 185 }}><S /></div>] };
