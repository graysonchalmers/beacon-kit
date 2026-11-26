import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** iPad-style widget sizes on a square snap grid: S 2x2, M 4x2, L 4x4, XL 8x4, TALL 8x6 cells (TALL = XL for lists that need more rows). */
export type Tile = "s" | "m" | "l" | "xl" | "tall" | "wide";
export const TILE: Record<Tile, [number, number]> = { s: [2, 2], m: [4, 2], l: [4, 4], xl: [8, 4], tall: [8, 6], wide: [8, 2] };

/** Old free-form w x h (12-col grid) -> nearest tile class. */
export function tileOf(w: number, h: number): Tile {
  if (w <= 3 && h <= 2) return "s";
  if (w >= 7) return "xl";
  if (h <= 3) return "m";
  return "l";
}

/** Columns for a width: phone 4, then whole pairs of ~88px cells, always even so S/M/L/XL pack with no holes. */
export function colsFor(width: number, minCell = 76, gap = 12, maxCell = 96) {
  // enough columns that a cell stays between minCell and maxCell, so big screens get more tiles, not giant ones
  const n = Math.max(Math.floor((width + gap) / (minCell + gap)), Math.ceil((width + gap) / (maxCell + gap)));
  return Math.max(4, n - (n % 4 === 0 ? 0 : n % 2));
}

type Placed = { x: number; y: number; w: number; h: number };

/** First-fit pack (same order as CSS dense), then grow tiles into any holes so the board has no gaps. */
export function pack(sizes: [number, number][], cols: number): Placed[] {
  const g: number[][] = []; const row = (y: number) => (g[y] ??= Array(cols).fill(-1));
  const free = (x: number, y: number, w: number, h: number) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= cols || row(j)[i] !== -1) return false; return true; };
  const mark = (k: number, p: Placed) => { for (let j = p.y; j < p.y + p.h; j++) for (let i = p.x; i < p.x + p.w; i++) row(j)[i] = k; };
  const out: Placed[] = sizes.map(([w, h], k) => {
    for (let y = 0; ; y++) for (let x = 0; x + w <= cols; x++) if (free(x, y, w, h)) { const p = { x, y, w, h }; mark(k, p); return p; }
  });
  const base = out.map(p => ({ w: p.w, h: p.h }));
  const H = Math.max(0, ...out.map(p => p.y + p.h));
  for (let changed = true; changed;) {
    changed = false;
    out.forEach((p, k) => {
      const b = base[k], wMax = Math.min(cols, b.w + Math.max(2, b.w / 2)), hMax = b.h + Math.max(1, b.h / 2);   // grow at most ~50%: fill small holes, never balloon
      if (p.w < wMax && p.x + p.w < cols && free(p.x + p.w, p.y, 1, p.h)) {   // grow right into a hole column
        const ext = p.w + 2 <= wMax && 2 <= cols - p.x - p.w && free(p.x + p.w, p.y, 2, p.h) ? 2 : 1; mark(k, { ...p, x: p.x + p.w, w: ext }); p.w += ext; changed = true; return;
      }
      if (p.h < hMax && p.y + p.h < H && free(p.x, p.y + p.h, p.w, 1)) { mark(k, { ...p, y: p.y + p.h, h: 1 }); p.h += 1; changed = true; }
    });
  }
  return out;
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
      {(() => {
        const sizes = items.map(({ tile }): [number, number] => {
          let [cw, ch] = TILE[tile];
          if (cw > cols) { ch = Math.round(ch * (cols / cw)) || ch; cw = cols; }   // XL on a phone becomes a full-width L
          return [cw, ch];
        });
        const placed = pack(sizes, cols);
        return items.map(({ key, tile, node }, k) => { const p = placed[k];
          return <div key={key} data-tile={tile} className="relative min-w-0" style={{ gridColumn: `${p.x + 1} / span ${p.w}`, gridRow: `${p.y + 1} / span ${p.h}` }}>{node}</div>; });
      })()}
    </div>
  );
}
