import { useEffect, useState } from "react";
import { Board } from "./schema";
import { BoardView, CardView } from "./BoardView";
import { registry } from "../../widgets/src/registry";
import type { WidgetState } from "../../widgets/src/contract";
import type { z } from "zod";

type B = z.infer<typeof Board>;
type Live = Record<number, { data?: unknown; state?: WidgetState }>;
const SKINS = ["beacon", "ember", "paper", "terminal", "swamp"];
const btn = "rounded-[var(--bk-radius)] border border-bk-line bg-bk-card px-3 py-1.5 text-sm text-bk-fg hover:bg-bk-raise aria-pressed:bg-bk-accent aria-pressed:text-bk-on-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent";

/** The old Beacon header, as a kit shell: Arrange, Add a card, Archive (card ⋯), Focus (F, ←/→), and the skin picker.
 *  Holds board JSON in state; a host persists it through onChange. Skin only changes the surface (STANDARDS rule 11). */
export function BoardShell({ board: initial, data = {}, skin: skin0 = "beacon", onChange }: { board: B; data?: Live; skin?: string; onChange?: (b: B) => void }) {
  const [board, setBoard] = useState(initial);
  const [live, setLive] = useState<Live>(data);
  const [archived, setArchived] = useState<{ card: B["cards"][number]; live: Live[number] }[]>([]);
  const [arrange, setArrange] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [menu, setMenu] = useState<number | null>(null);
  const [skin, setSkin] = useState(skin0);
  const update = (b: B) => { setBoard(b); onChange?.(b); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,select")) return;
      if (e.key === "f" || e.key === "F") setFocus((f) => (f === null ? 0 : null));
      if (e.key === "Escape") { setFocus(null); setMenu(null); }
      if (e.key === "ArrowRight") setFocus((f) => (f === null ? f : (f + 1) % board.cards.length));
      if (e.key === "ArrowLeft") setFocus((f) => (f === null ? f : (f - 1 + board.cards.length) % board.cards.length));
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [board.cards.length]);

  const archive = (i: number) => {
    setArchived((a) => [...a, { card: board.cards[i], live: live[i] ?? {} }]);
    const nl: Live = {}; board.cards.forEach((_, j) => { if (j !== i) nl[j < i ? j : j - 1] = live[j]; }); setLive(nl);
    update({ ...board, cards: board.cards.filter((_, j) => j !== i) }); setMenu(null);
  };
  const restore = (k: number) => {
    const { card, live: l } = archived[k];
    setLive({ ...live, [board.cards.length]: l });
    update({ ...board, cards: [...board.cards, { ...card, y: 999 }] });
    setArchived((a) => a.filter((_, j) => j !== k));
  };
  const add = (type: string) => {
    const def = registry[type as keyof typeof registry];
    update({ ...board, cards: [...board.cards, { type, x: 0, y: 999, w: def.size.default[0], h: def.size.default[1], options: { label: def.title } }] });
  };

  const f = focus !== null ? board.cards[focus] : undefined;
  return (
    <div data-skin={skin} className="min-h-screen p-3">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <b className="mr-auto text-bk-fg">{board.board}</b>
        <button type="button" className={btn} aria-pressed={arrange} onClick={() => setArrange(!arrange)}>Arrange</button>
        <select aria-label="Add a card" className={btn} value="" onChange={(e) => e.target.value && add(e.target.value)}>
          <option value="">+ Add a card</option>
          {Object.values(registry).map((d) => <option key={d.type} value={d.type}>{d.title}</option>)}
        </select>
        <select aria-label={`Archive, ${archived.length} cards`} className={btn} value="" onChange={(e) => e.target.value !== "" && restore(+e.target.value)}>
          <option value="">Archive ({archived.length})</option>
          {archived.map((a, k) => <option key={k} value={k}>Restore: {String((a.card.options as { label?: string }).label ?? a.card.type)}</option>)}
        </select>
        <button type="button" className={btn} aria-pressed={focus !== null} onClick={() => setFocus(focus === null ? 0 : null)} title="Focus: one card full-screen (F). ←/→ moves.">Focus</button>
        <select aria-label="Skin" className={btn} value={skin} onChange={(e) => setSkin(e.target.value)}>
          {SKINS.map((s) => <option key={s} value={s}>Skin: {s}</option>)}
        </select>
      </header>
      {f ? (
        <div className="h-[calc(100vh-6rem)]" role="region" aria-label={`Focus, card ${focus! + 1} of ${board.cards.length}`}>
          <CardView type={f.type} options={f.options} live={live[focus!]} size={[12, 8]} />
        </div>
      ) : (
        <BoardView board={board} data={live} editable={arrange}
          onLayout={(l) => update({ ...board, cards: board.cards.map((c, i) => { const p = l.find((x) => x.i === String(i)); return p ? { ...c, x: p.x, y: p.y, w: p.w, h: p.h } : c; }) })}
          menu={(i) => (
            <div className="absolute right-2 top-2">
              <button type="button" aria-label="Card menu" aria-expanded={menu === i} onClick={() => setMenu(menu === i ? null : i)}
                className="rounded px-1.5 text-bk-muted hover:bg-bk-raise hover:text-bk-fg">⋯</button>
              {menu === i && (
                <div role="menu" className="absolute right-0 z-10 mt-1 flex w-32 flex-col rounded-[var(--bk-radius)] border border-bk-line bg-bk-card p-1 text-sm shadow">
                  <button role="menuitem" type="button" className="rounded px-2 py-1 text-left text-bk-fg hover:bg-bk-raise" onClick={() => { setFocus(i); setMenu(null); }}>Focus</button>
                  <button role="menuitem" type="button" className="rounded px-2 py-1 text-left text-bk-fg hover:bg-bk-raise" onClick={() => archive(i)}>Archive</button>
                </div>
              )}
            </div>
          )} />
      )}
    </div>
  );
}
