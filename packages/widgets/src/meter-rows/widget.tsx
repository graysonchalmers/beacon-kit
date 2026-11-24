import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "sysscope" / "quotas" / "mesh" / fleet host rows: labelled bars with warn/danger levels.
const Row = z.object({ id: z.string(), label: z.string(), value: z.number(), max: z.number().default(100), unit: z.string().optional(),
  warn: z.number().optional(), danger: z.number().optional(), note: z.string().optional() });
type R = z.infer<typeof Row>;
const tone = (r: R) => (r.danger !== undefined && r.value >= r.danger ? "bg-bk-danger" : r.warn !== undefined && r.value >= r.warn ? "bg-bk-warn" : "bg-bk-ok");

export const MeterRows = defineWidget({
  type: "meter-rows", family: "data", title: "Meter rows",
  options: z.object({ label: z.string() }),
  data: z.object({ rows: z.array(Row) }),
  size: { min: [2, 2], default: [4, 3], max: [6, 6] },
  render: ({ options, data, state, size }) => {
    const rows = data?.rows ?? [];
    const showNote = size[0] >= 4;
    return (
      <Frame title={options.label} state={state === "ready" && rows.length === 0 ? "empty" : state}>
        <ul className="flex flex-col gap-2 overflow-auto">
          {rows.map((r) => {
            const pct = Math.max(0, Math.min(100, (r.value / (r.max || 1)) * 100));
            return (
              <li key={r.id} className="text-sm">
                <div className="flex justify-between gap-2"><span className="truncate text-bk-fg">{r.label}</span>
                  <span className="text-bk-muted">{+r.value.toFixed(1)}{r.unit ?? ""}{showNote && r.note ? ` · ${r.note}` : ""}</span></div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-bk-raise" role="meter" aria-label={r.label} aria-valuenow={r.value} aria-valuemin={0} aria-valuemax={r.max}>
                  <div className={`h-full rounded-full ${tone(r)}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Frame>
    );
  },
});
