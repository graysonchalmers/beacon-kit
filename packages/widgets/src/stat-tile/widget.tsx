import { z } from "zod";
import { defineWidget } from "../contract";

/** Old Beacon tile sparkline: the value's recent history as a filled line. */
function Spark({ v }: { v: number[] }) {
  const lo = Math.min(...v), hi = Math.max(...v), r = hi - lo || 1, W = 100, H = 30;
  const pts = v.map((x, i) => `${(i / (v.length - 1)) * W},${H - ((x - lo) / r) * (H - 2) - 1}`).join(" ");
  return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2 h-10 w-full text-bk-accent" aria-hidden>
    <polygon points={`0,${H} ${pts} ${W},${H}`} fill="currentColor" opacity=".15" /><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>;
}

const span = (s: number) => (s < 3600 ? `${Math.round(s / 60)} min` : s < 86400 ? `${Math.round(s / 3600)} h` : `${Math.round(s / 86400)} d`);
const card = "flex h-full flex-col w-full rounded-[var(--bk-radius)] bg-bk-card p-4 border border-bk-line";

export const StatTile = defineWidget({
  type: "stat-tile",
  family: "data",
  title: "Stat tile",
  options: z.object({ label: z.string(), unit: z.string().optional() }),
  data: z.object({ value: z.number(), delta: z.number().optional(), hist: z.array(z.number()).optional(), every: z.number().optional(), caption: z.string().optional() }),
  size: { min: [2, 1], default: [3, 2], max: [6, 4] },
  render: ({ options, data, state }) => {
    const label = <div className="text-xs uppercase tracking-wide text-bk-muted">{options.label}</div>;
    if (state === "loading")
      return <div className={card} aria-busy="true">{label}<div className="mt-2 h-8 w-24 animate-pulse rounded bg-bk-raise" /></div>;
    if (state === "error")
      return <div className={card} role="alert">{label}<div className="mt-2 text-sm text-bk-danger">Couldn't load data</div></div>;
    if (state === "empty" || !data)
      return <div className={card}>{label}<div className="mt-2 text-sm text-bk-muted">No data yet</div></div>;
    const up = (data.delta ?? 0) >= 0;
    return (
      <div className={card}>
        {label}
        <div className="mt-1 text-3xl font-semibold text-bk-fg">
          {data.value}<span className="ml-1 text-base text-bk-muted">{options.unit}</span>
        </div>
        {options.unit === "%" && <div className="mt-2 h-2 rounded-full bg-bk-raise"><i className="block h-full rounded-full bg-bk-accent" style={{ width: `${Math.max(0, Math.min(100, data.value))}%` }} /></div>}
        {data.caption && <div className="mt-2 flex flex-wrap gap-1">{data.caption.split(/\s*[·|•]\s*|,\s+/).filter(Boolean).slice(0, 6).map((c, i) =>
          <span key={i} className="rounded-full border border-bk-line bg-bk-raise px-2 py-0.5 text-xs text-bk-fg">{c}</span>)}</div>}
        {data.hist && data.hist.length > 1 && <div className="mt-auto"><Spark v={data.hist} />
          {data.every && <div className="flex justify-between text-[10px] text-bk-muted"><span>{span(data.hist.length * data.every)} ago</span><span>now</span></div>}</div>}
        {data.delta !== undefined && (
          <div className={`mt-1 text-sm ${up ? "text-bk-ok" : "text-bk-accent"}`}>{up ? "▲" : "▼"} {Math.abs(data.delta)}</div>
        )}
      </div>
    );
  },
});
