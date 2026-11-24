import { z } from "zod";
import { defineWidget } from "../contract";

const card = "h-full w-full min-w-56 rounded-[var(--bk-radius)] bg-bk-card p-4 border border-white/5";

export const StatTile = defineWidget({
  type: "stat-tile",
  family: "data",
  title: "Stat tile",
  options: z.object({ label: z.string(), unit: z.string().optional() }),
  data: z.object({ value: z.number(), delta: z.number().optional() }),
  size: { min: [2, 1], default: [3, 2], max: [6, 4] },
  render: ({ options, data, state }) => {
    const label = <div className="text-xs uppercase tracking-wide text-bk-muted">{options.label}</div>;
    if (state === "loading")
      return <div className={card} aria-busy="true">{label}<div className="mt-2 h-8 w-24 animate-pulse rounded bg-white/10" /></div>;
    if (state === "error")
      return <div className={card} role="alert">{label}<div className="mt-2 text-sm text-red-400">Couldn't load data</div></div>;
    if (state === "empty" || !data)
      return <div className={card}>{label}<div className="mt-2 text-sm text-bk-muted">No data yet</div></div>;
    const up = (data.delta ?? 0) >= 0;
    return (
      <div className={card}>
        {label}
        <div className="mt-1 text-3xl font-semibold text-bk-fg">
          {data.value}<span className="ml-1 text-base text-bk-muted">{options.unit}</span>
        </div>
        {data.delta !== undefined && (
          <div className={`mt-1 text-sm ${up ? "text-emerald-400" : "text-bk-accent"}`}>{up ? "▲" : "▼"} {Math.abs(data.delta)}</div>
        )}
      </div>
    );
  },
});
