import type { Meta, StoryObj } from "@storybook/react";
import { Docs } from "./widget";

const View = Docs.render;
const rows: [string, string, string][] = [["Hubs", "Project Index", "Every project on both laptops: homepage, live links, last work"], ["Hubs", "Agent Index", "Notion wiki and databases map"], ["Hubs", "Inbox", "Asks waiting on you, every project"],
  ["Hosting", "Harbor map", "Subdomains, Caddy, deploys"], ["Hosting", "SUBDOMAINS", "Live list"], ["Design kits", "Game UI style", "Framed panels, glyphs, pips"], ["Design kits", "Swamp kit", "Sprites, sounds, VFX"], ["Gremlin", "QA reports", "Confirmed bugs across projects"]];
const links = rows.map(([group, label, note]) => ({ group, label, url: "https://example.com/" + label.replace(/\W+/g, "-"), note }));
const meta: Meta<typeof View> = { title: "Widgets/List/Docs", component: View, args: { options: { label: "Docs", q: "" }, size: [2, 3] },
  decorators: [(S) => <div style={{ width: "24rem", height: "22rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { links } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
/** Old Sandbox sample (tests/fixtures.mjs "/docs"), old card box 614x570. */
export const Parity: S = { args: { state: "ready", data: { links } }, decorators: [(S) => <div style={{ width: 614, height: 570 }}><S /></div>] };
