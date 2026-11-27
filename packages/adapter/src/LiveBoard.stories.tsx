import type { Meta, StoryObj } from "@storybook/react";
import { BoardView } from "../../board/src/BoardView";
import { fakeSnapshot } from "./fixture";
import { toBoard, toTopBar } from "./voice";
import { TopBar } from "../../board/src/TopBar";

/** voice.py snapshot -> board through the live adapter (made-up data; the real one runs against :8791 on the Envy). */
function Live({ now }: { now: number }) {
  const snap = fakeSnapshot(now), { board, data, skin, skipped } = toBoard(snap, now);
  return <div data-skin={skin} className="min-h-screen p-4">{skipped.length > 0 && <p className="text-bk-danger">Skipped: {skipped.join(", ")}</p>}<TopBar {...toTopBar(snap.state)} /><BoardView board={board} data={data} /></div>;
}
const meta: Meta<typeof Live> = { title: "Boards/Live adapter", component: Live, parameters: { layout: "fullscreen" } };
export default meta;
export const FromVoiceSnapshot: StoryObj<typeof Live> = { args: { now: Date.parse("2026-11-24T15:00:00Z") / 1000 } };
