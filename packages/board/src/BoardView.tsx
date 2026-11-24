import { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Board } from "./schema";
import { registry } from "../../widgets/src/registry";
import type { WidgetState } from "../../widgets/src/contract";

const Grid = WidthProvider(Responsive);
type Card = { options: Record<string, unknown>; data?: unknown; state?: WidgetState };

function ErrorCard({ msg }: { msg: string }) {
  return <div role="alert" className="h-full rounded-[var(--bk-radius)] border border-bk-danger bg-bk-card p-4 text-sm text-bk-danger">{msg}</div>;
}

// Phone: one column, cards in reading order (top-to-bottom, left-to-right).
const stacked = (cards: { x: number; y: number; h: number }[]) => {
  let y = 0;
  return cards.map((c, i) => ({ c, i })).sort((a, b) => a.c.y - b.c.y || a.c.x - b.c.x)
    .map(({ c, i }) => { const l = { i: String(i), x: 0, y, w: 1, h: c.h }; y += c.h; return l; });
};

/** Validates board JSON, then renders each card through the registry. Bad cards become error cards, never a crash. */
export function BoardView({ board, data = {}, cols = 12, rowHeight = 64 }: {
  board: unknown; data?: Record<number, { data?: unknown; state?: WidgetState }>; cols?: number; rowHeight?: number;
}) {
  const parsed = useMemo(() => Board.safeParse(board), [board]);
  if (!parsed.success) return <ErrorCard msg={`Invalid board: ${parsed.error.issues[0]?.message}`} />;
  const cards = parsed.data.cards;
  return (
    <Grid className="layout" breakpoints={{ lg: 768, xs: 0 }} cols={{ lg: cols, xs: 1 }} rowHeight={rowHeight} margin={[12, 12]} draggableHandle="h3"
      layouts={{ xs: stacked(cards), lg: cards.map((c, i) => {
        const def = registry[c.type as keyof typeof registry];
        return { i: String(i), x: c.x, y: c.y, w: c.w, h: c.h, minW: def?.size.min[0], minH: def?.size.min[1], maxW: def?.size.max[0], maxH: def?.size.max[1] };
      }) }}>
      {cards.map((c, i) => {
        const def = registry[c.type as keyof typeof registry];
        const live = data[i] ?? {};
        if (!def) return <div key={i}><ErrorCard msg={`Unknown widget "${c.type}"`} /></div>;
        const opts = def.options.safeParse(c.options);
        const dataOk = live.data === undefined || def.data.safeParse(live.data).success;
        const View = def.render as unknown as React.ComponentType<Card & { size: [number, number] }>;
        return (
          <div key={i}>
            {opts.success
              ? <View options={opts.data} data={dataOk ? live.data : undefined} state={!dataOk ? "error" : live.state ?? (live.data ? "ready" : "empty")} size={[c.w, c.h]} />
              : <ErrorCard msg={`Bad options for ${c.type}: ${opts.error.issues[0]?.message}`} />}
          </div>
        );
      })}
    </Grid>
  );
}
