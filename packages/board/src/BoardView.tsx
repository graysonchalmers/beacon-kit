import { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Board } from "./schema";
import { TileGrid, tileOf, TILE } from "./TileGrid";
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
/** One card through the registry, with validation. Used by the grid and by Focus mode. */
export function CardView({ type, options, live = {}, size }: { type: string; options: unknown; live?: { data?: unknown; state?: WidgetState }; size: [number, number] }) {
  const def = registry[type as keyof typeof registry];
  if (!def) return <ErrorCard msg={`Unknown widget "${type}"`} />;
  const opts = def.options.safeParse(options);
  if (!opts.success) return <ErrorCard msg={`Bad options for ${type}: ${opts.error.issues[0]?.message}`} />;
  const parsed = live.data === undefined ? undefined : def.data.safeParse(live.data);   // parsed, so Zod defaults apply
  const dataOk = !parsed || parsed.success;
  const View = def.render as unknown as React.ComponentType<Card & { size: [number, number] }>;
  return <View options={opts.data} data={parsed?.success ? parsed.data : undefined} state={!dataOk ? "error" : live.state ?? (live.data ? "ready" : "empty")} size={size} />;
}

export function BoardView({ board, data = {}, cols = 12, rowHeight = 64, editable = false, onLayout, menu }: {
  board: unknown; data?: Record<number, { data?: unknown; state?: WidgetState }>; cols?: number; rowHeight?: number;
  /** Arrange mode: drag by title, resize from the corner. Off = a calm, fixed board. */
  editable?: boolean; onLayout?: (l: { i: string; x: number; y: number; w: number; h: number }[]) => void;
  /** Optional per-card overlay (the card ⋯ menu), keyed by card index. */
  menu?: (i: number) => React.ReactNode;
}) {
  const parsed = useMemo(() => Board.safeParse(board), [board]);
  if (!parsed.success) return <ErrorCard msg={`Invalid board: ${parsed.error.issues[0]?.message}`} />;
  const cards = parsed.data.cards;
  if (!editable) {   // calm board: iPad-style tiles that always pack (Arrange mode keeps the free grid below)
    return <TileGrid items={cards.map((c, i) => { const t = c.size ?? tileOf(c.w, c.h);
      return { key: String(i), tile: t, node: <><CardView type={c.type} options={c.options} live={data[i]} size={TILE[t]} />{menu?.(i)}</> }; })} />;
  }
  return (
    <Grid className="layout" breakpoints={{ lg: 768, xs: 0 }} cols={{ lg: cols, xs: 1 }} rowHeight={rowHeight} margin={[12, 12]} draggableHandle="h3" isDraggable={editable} isResizable={editable}
      onDragStop={(l) => onLayout?.(l)} onResizeStop={(l) => onLayout?.(l)}
      layouts={{ xs: stacked(cards), lg: cards.map((c, i) => {
        const def = registry[c.type as keyof typeof registry];
        return { i: String(i), x: c.x, y: c.y, w: c.w, h: c.h, minW: def?.size.min[0], minH: def?.size.min[1], maxW: def?.size.max[0], maxH: def?.size.max[1] };
      }) }}>
      {cards.map((c, i) => (
        <div key={i} className="relative h-full">
          <CardView type={c.type} options={c.options} live={data[i]} size={[c.w, c.h]} />
          {menu?.(i)}
        </div>
      ))}
    </Grid>
  );
}
