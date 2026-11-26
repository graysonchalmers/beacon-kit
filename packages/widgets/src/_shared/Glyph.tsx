import { LINE, PIXEL } from "./glyph-data";

export { weatherGlyph } from "./glyph-data";
export const glyphNames = Array.from(new Set([...Object.keys(PIXEL), ...Object.keys(LINE)])).sort();
export const isGlyph = (n: unknown): n is string => typeof n === "string" && (n in PIXEL || n in LINE);

/** Pixel fills: k outline, o body (currentColor), A gold, a brown, b blue. Skins override via --px-* tokens. */
const FILL: Record<string, string> = { k: "var(--px-k, #0b120d)", o: "currentColor", A: "var(--px-gold, #e9b44c)", a: "#93602f", b: "var(--px-blue, #6fa8dc)" };

function pixelPaths(rows: string[]) {
  const by: Record<string, string[]> = {};
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const c = row[x]; if (c === ".") { x++; continue; }
      let w = 1; while (row[x + w] === c) w++;
      (by[c] ??= []).push(`M${x} ${y}h${w}v1h-${w}z`); x += w;
    }
  });
  return by;
}

/** Old Beacon card glyph. look="pixel" (default, old default) falls back to line when a name has no pixel drawing. */
export function Glyph({ name, look = "pixel", className = "", size = "1.15em" }: {
  name: string; look?: "pixel" | "line"; className?: string; size?: string;
}) {
  const st = { width: size, height: size, flex: "none" as const };
  if (look === "pixel" && PIXEL[name]) {
    return (
      <svg className={`bk-glyph px ${className}`} style={st} viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges" data-glyph={name}>
        {Object.entries(pixelPaths(PIXEL[name])).map(([c, d]) => <path key={c} fill={FILL[c] ?? "currentColor"} d={d.join("")} />)}
      </svg>
    );
  }
  if (!LINE[name]) return null;
  return (
    <svg className={`bk-glyph ${className}`} style={st} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" data-glyph={name} dangerouslySetInnerHTML={{ __html: LINE[name] }} />
  );
}

/** An icon slot that takes a glyph name or literal text/emoji: glyph names draw the old Beacon glyph. */
export const gl = (x: string, size = "1.1em") => (isGlyph(x) ? <Glyph name={x} size={size} /> : x);
