import type { Meta, StoryObj } from "@storybook/react";
import { Favorites } from "./widget";

const View = Favorites.render;
const L = "Legion (PowerShell)", E = "Envy (bash)";
const items = [
  { id: "antigravity-autopilot", label: "Antigravity and Autopilot Control", note: "Universal autopilot daemon controls and Antigravity workspace hub", cmds: [
    { label: "Autopilot status", shell: L, cmd: "autopilot status" }, { label: "Autopilot on (arm)", shell: L, cmd: "autopilot on" },
    { label: "Autopilot off (disarm)", shell: L, cmd: "autopilot off" }, { label: "Autopilot run once", shell: L, cmd: "autopilot once" },
    { label: "Open Antigravity Hub", shell: L, cmd: "cmd /c C:\\Projects-local\\_agent-commons\\tools\\antigravity-hub\\open-hub.cmd" }] },
  { id: "legion-disk", label: "Legion disk cleanup", note: "Playbook for when the Legion's C: runs low", cmds: [
    { label: "Purge retired worktrees (dry run)", shell: L, cmd: "& C:\\Projects-local\\_agent-commons\\tools\\Purge-RetiredWorktrees.ps1" },
    { label: "Low-disk check (forced)", shell: L, cmd: "& C:\\Projects-local\\_agent-commons\\tools\\Check-LowDisk.ps1 -ThresholdGB 200 -Force" }] },
  { id: "legion-hidden", label: "Legion hidden console windows", note: "Why scheduled tasks pop windows, and how they run headless now", cmds: [] },
  { id: "fleet-jobs", label: "Fleet jobs and routing", note: "Live page: sessions routing, tmux, timers, services, cleanup candidates per machine (refreshes every 30 min)", cmds: [
    { label: "Refresh now", shell: E, cmd: "~/Projects-local/_agent-commons/tools/fleet-jobs" },
    { label: "Live page URL", shell: E, cmd: "echo http://envy.tail3245f5.ts.net:8790/fleet-jobs/" }] },
];
const meta: Meta<typeof View> = { title: "Widgets/List/Favorites", component: View, args: { options: { label: "Favorites" }, size: [2, 3] },
  decorators: [(S) => <div style={{ width: "24rem", height: "22rem" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: { live: [], items } } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
/** Old Sandbox sample (docs/favorites.json), old card box 614x570. */
export const Parity: S = { args: { state: "ready", data: { live: [], items } }, decorators: [(S) => <div style={{ width: 614, height: 570 }}><S /></div>] };
