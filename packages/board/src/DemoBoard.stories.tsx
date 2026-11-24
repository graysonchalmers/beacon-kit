import type { Meta, StoryObj } from "@storybook/react";
import { BoardView } from "./BoardView";
import board from "./demo.board.json";
import { cutoutSrc, photoSrc } from "../../widgets/src/_shared/samples";

const data = {
  0: { data: { value: 6.2, delta: -0.7 } },
  1: { data: { points: [3.1, 4.2, 3.8, 5.5, 5.1, 6.8, 6.2, 7.4, 7.1, 8.3] } },
  2: { data: { items: [
    { id: "1", label: "Envy fleet-backup", meta: "1:34 AM", status: "ok" },
    { id: "2", label: "Legion RAM pressure", meta: "0.7 GB", status: "warn" },
    { id: "3", label: "Stealth Syncthing", meta: "synced", status: "ok" },
    { id: "4", label: "OneDrive unhook", meta: "blocked", status: "fail" } ] } },
  3: { data: { shape: "torus" } },
  4: { data: { src: cutoutSrc } },
  5: { data: { kind: "image", src: photoSrc, alt: "Mountain sunset placeholder", caption: "Latest render" } },
  6: { data: { fields: [
    { name: "title", label: "Job title", kind: "text", required: true },
    { name: "email", label: "Notify email", kind: "email", required: true },
    { name: "minutes", label: "Timeout (min)", kind: "number", min: 1, max: 120 },
    { name: "machine", label: "Machine", kind: "select", required: true, choices: ["Envy", "Legion", "Stealth"] } ] } },
  7: { data: { messages: [
    { id: "1", from: "agent", text: "Board is up. Want the 3D card bigger?" },
    { id: "2", from: "user", text: "Yes, 6 wide." } ] } },
};

const meta: Meta<typeof BoardView> = { title: "Boards/Demo", component: BoardView, parameters: { layout: "fullscreen" },
  decorators: [(S) => <div style={{ padding: "1rem", minHeight: "100vh" }}><S /></div>] };
export default meta;
export const Demo: StoryObj<typeof BoardView> = { args: { board, data } };
export const Loading: StoryObj<typeof BoardView> = { args: { board, data: Object.fromEntries(board.cards.map((_, i) => [i, { state: "loading" as const }])) } };
export const BadCards: StoryObj<typeof BoardView> = { args: { board: { board: "broken", cards: [
  { type: "nope", x: 0, y: 0, w: 3, h: 2 }, { type: "stat-tile", x: 3, y: 0, w: 3, h: 2, options: { label: 42 } } ] } } };

/** Same board JSON + same data, three skins. Only the look changes. */
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
export const Paper: StoryObj<typeof BoardView> = { args: { board, data }, parameters: { skin: "paper" } };
export const Terminal: StoryObj<typeof BoardView> = { args: { board, data }, parameters: { skin: "terminal" } };
