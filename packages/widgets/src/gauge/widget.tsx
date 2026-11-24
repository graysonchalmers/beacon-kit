import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "gauge": a 240-degree dial. Color comes from warn/danger thresholds, never raw colors.
export const Gauge = defineWidget({
  type: "gauge", family: "data", title: "Gauge",
  options: z.object({ label: z.string(), unit: z.string().optional(), min: z.number().default(0), max: z.number().default(100),
    warn: z.number().optional(), danger: z.number().optional() }),
  data: z.object({ value: z.number() }),
  size: { min: [2, 2], default: [3, 3], max: [4, 4] },
  render: ({ options, data, state }) => {
    const { min = 0, max = 100 } = options;
    const v = data?.value ?? 0, f = Math.max(0, Math.min(1, (v - min) / (max - min || 1)));
    const R = 80, a0 = (Math.PI * 5) / 6, sweep = (Math.PI * 4) / 3;
    const pt = (a: number) => `${(100 + R * Math.cos(a)).toFixed(1)} ${(100 + R * Math.sin(a)).toFixed(1)}`;
    const arc = (to: number) => `M ${pt(a0)} A ${R} ${R} 0 ${to - a0 > Math.PI ? 1 : 0} 1 ${pt(to)}`;
    const tone = options.danger !== undefined && v >= options.danger ? "var(--bk-danger)" : options.warn !== undefined && v >= options.warn ? "var(--bk-warn)" : "var(--bk-accent)";
    return (
      <Frame title={options.label} state={state === "ready" && !data ? "empty" : state}>
        <svg viewBox="0 0 200 170" className="h-full w-full" role="img" aria-label={`${options.label}: ${v} of ${max} ${options.unit ?? ""}`}>
          <path d={arc(a0 + sweep)} fill="none" stroke="var(--bk-raise)" strokeWidth="14" strokeLinecap="round" />
          {f > 0.001 && <path d={arc(a0 + sweep * f)} fill="none" stroke={tone} strokeWidth="14" strokeLinecap="round" />}
          <text x="100" y="110" textAnchor="middle" fontSize="38" fontWeight="600" fill="var(--bk-fg)">{+v.toFixed(1)}</text>
          <text x="100" y="135" textAnchor="middle" fontSize="13" fill="var(--bk-muted)">{options.unit ?? ""} of {+max.toFixed(1)}</text>
        </svg>
      </Frame>
    );
  },
});
