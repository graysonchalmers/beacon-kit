import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** iPad-style widget sizes on a square snap grid: S 2x2, M 4x2, L 4x4, XL 8x4 cells. */
export type Tile = "s" | "m" | "l" | "xl";
export const TILE: Record<Tile, [number, number]> = { s: [2, 2], m: [4, 2], l: [4, 4], xl: [8, 4] };

/** Old free-form w x h (12-col grid) -> nearest tile class. */
export function tileOf(w: number, h: number): Tile {
  if (w <= 3 && h <= 2) return "s";
  if (w >= 7) return "xl";
  if (h <= 3) return "m";
  return "l";
}

/** Columns for a width: phone 4, then whole pairs of ~88px cells, always even so S/M/L/XL pack with no holes. */
export function colsFor(width: number, minCell = 76, gap = 12) {
  const n = Math.floor((width + gap) / (minCell + gap));
  return Math.max(4, n - (n % 4 === 0 ? 0 : n % 2));
}

/**
 * Packs tiles with CSS grid `dense` flow: every span is even and the column count is even, so the board fills
 * row by row with no gaps and no empty tail, and reflows on resize (phone 4 cols: L is full width, XL becomes L).
 */
export function TileGrid({ items, gap = 12, minCell = 76 }: { items: { key: string; tile: Tile; node: ReactNode }[]; gap?: number; minCell?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); setW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  const cols = colsFor(w || 1024, minCell, gap), cell = w ? (w - (cols - 1) * gap) / cols : minCell;
  return (
    <div ref={ref} data-cols={cols} className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: `${cell}px`, gridAutoFlow: "row dense", gap }}>
      {items.map(({ key, tile, node }) => {
        let [cw, ch] = TILE[tile];
        if (cw > cols) { ch = Math.round(ch * (cols / cw)) || ch; cw = cols; }   // XL on a phone becomes a full-width L
        return <div key={key} data-tile={tile} className="relative min-w-0" style={{ gridColumn: `span ${cw}`, gridRow: `span ${ch}` }}>{node}</div>;
      })}
    </div>
  );
}
