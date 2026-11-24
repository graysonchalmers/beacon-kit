import type { Meta, StoryObj } from "@storybook/react";
import { BoardView } from "./BoardView";
import board from "./parity.board.json";
import { BoardShell } from "./BoardShell";
import { thumbs, mapSrc, rainSrc } from "../../widgets/src/_shared/samples";

/** The old Beacon Main board rebuilt from kit widgets. Same data, any skin. */
const T0 = 1764000000000;
const data = {
  0: { data: { rows: [
    { id: "cpu", label: "CPU", value: 42, unit: "%", warn: 60, danger: 85 },
    { id: "mem", label: "MEM", value: 88, unit: "%", warn: 70, danger: 90, note: "0.7 GB free" },
    { id: "disk", label: "DISK", value: 93, unit: "%", warn: 80, danger: 90 },
    { id: "temp", label: "TEMP", value: 58, unit: "°C", warn: 65, danger: 80 } ] } },
  1: { data: { value: 76 } },
  2: { data: { items: [
    { id: "envy", label: "Envy", meta: "primary", status: "ok" }, { id: "legion", label: "Legion", meta: "RAM tight", status: "warn" },
    { id: "stealth", label: "Stealth", meta: "hub", status: "ok" }, { id: "moby", label: "Moby", meta: "offline", status: "fail" } ] } },
  3: { data: { items: [
    { id: "1", label: "Merge Skills-Private #175", meta: "PR", status: "warn" }, { id: "2", label: "OneDrive uninstall", meta: "hold", status: "fail" },
    { id: "3", label: "Pick DC vs One Commander", meta: "open" } ] } },
  4: { data: { value: 12, delta: 3 } },
  5: { data: { points: [3.1, 4.2, 3.8, 5.5, 5.1, 6.8, 6.2, 7.4, 7.1, 8.3] } },
  6: { data: { endsAt: T0 + 754000, now: T0 } },
  7: { data: { items: [{ id: "1", text: "Glasses of water", n: 3 }, { id: "2", text: "Pomodoros", n: 5 }] } },
  8: { data: { items: [{ id: "1", text: "Port old cards", done: true }, { id: "2", text: "Wire voice.py feed", done: false }, { id: "3", text: "Pick a 4th skin", done: false }] } },
  9: { data: { text: "# Parity\n- 19 kit widgets cover **all 30** old card types\n- Same data, 4 skins" } },
  10: { data: { messages: [{ id: "1", from: "user", text: "What's up?" }, { id: "2", from: "agent", text: "Legion RAM is tight; 2 decisions wait on you." }] } },
  11: { data: { html: "<body style='font:14px sans-serif;margin:12px'><b>Agent-made page</b><p>Sandboxed: scripts on, no same-origin.</p></body>" } },
  12: { data: { machines: [
    { id: "envy", name: "Envy", jobs: [{ id: "a", mood: "work", say: "Editing" }, { id: "b", mood: "think" }, { id: "c", mood: "idle" }] },
    { id: "legion", name: "Legion", jobs: [{ id: "d", mood: "sad", say: "RAM tight" }] },
    { id: "stealth", name: "Stealth", jobs: [{ id: "e", mood: "sleep" }] }, { id: "moby", name: "Moby", up: false }] } },
  13: { data: { track: "Weightless", artist: "Marconi Union", playing: true, position: 83000, duration: 480000, device: "Office", devices: ["Office", "Kitchen"] } },
  14: { data: { base: mapSrc, overlay: rainSrc, place: "Chicago", at: "3:05 AM" } },
  15: { data: { items: thumbs } },
};

const meta: Meta<typeof BoardView> = { title: "Boards/Parity", component: BoardView, parameters: { layout: "fullscreen" },
  decorators: [(S) => <div style={{ padding: "1rem", minHeight: "100vh" }}><S /></div>] };
export default meta;
export const Main: StoryObj<typeof BoardView> = { args: { board, data } };
export const Skins: StoryObj<typeof BoardView> = {
  render: () => (
    <div className="flex flex-col gap-6">
      {["ember", "paper", "terminal", "swamp"].map((s) => (
        <div key={s} data-skin={s} className="rounded-[var(--bk-radius)] p-3">
          <p className="px-3 text-xs uppercase tracking-widest text-bk-muted">skin: {s}</p>
          <BoardView board={board} data={data} />
        </div>
      ))}
    </div>
  ),
};

/** The full shell: Arrange, Add, Archive (card ⋯), Focus (F, ←/→) and the skin picker. */
export const Shell: StoryObj<typeof BoardShell> = { render: () => <BoardShell board={board as never} data={data} /> };
export const ShellSwamp: StoryObj<typeof BoardShell> = { render: () => <BoardShell board={board as never} data={data} skin="swamp" /> };
