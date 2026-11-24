import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

export const Sparkline = defineWidget({
  type: "sparkline", family: "data", title: "Sparkline",
  options: z.object({ label: z.string(), unit: z.string().optional() }),
  data: z.object({ points: z.array(z.number()).min(2) }),
  size: { min: [2, 1], default: [4, 2], max: [8, 4] },
  render: ({ options, data, state }) => {
    const pts = data?.points ?? [];
    const ok = state === "ready" && pts.length >= 2;
    const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
    const path = pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${40 - ((v - min) / span) * 36 - 2}`).join(" ");
    const last = pts[pts.length - 1];
    return (
      <Frame title={options.label} state={ok || state !== "ready" ? state : "empty"}>
        <div className="flex h-full flex-col">
          <div className="text-2xl font-semibold text-bk-fg">{last}<span className="ml-1 text-sm text-bk-muted">{options.unit}</span></div>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mt-1 min-h-6 w-full flex-1" role="img"
            aria-label={`${options.label} trend, ${pts.length} points, min ${min}, max ${max}, latest ${last}`}>
            <polyline points={path} fill="none" stroke="var(--bk-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </Frame>
    );
  },
});
