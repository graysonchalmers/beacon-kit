import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

const Item = z.object({ id: z.string(), label: z.string(), meta: z.string().optional(), status: z.enum(["ok", "warn", "fail"]).optional() });
const dot = { ok: "bg-emerald-400", warn: "bg-bk-accent", fail: "bg-red-400" } as const;

export const ItemList = defineWidget({
  type: "item-list", family: "list", title: "Item list",
  options: z.object({ label: z.string(), max: z.number().int().positive().default(8) }),
  data: z.object({ items: z.array(Item) }),
  size: { min: [2, 2], default: [3, 3], max: [6, 8] },
  render: ({ options, data, state, size }) => {
    const items = data?.items ?? [];
    const st = state === "ready" && items.length === 0 ? "empty" : state;
    const showMeta = size[0] >= 3;
    return (
      <Frame title={options.label} state={st} empty="Nothing here">
        <ul className="flex flex-col divide-y divide-white/5 overflow-auto">
          {items.slice(0, options.max ?? 8).map((it) => (
            <li key={it.id} tabIndex={0} className="flex items-center gap-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-bk-accent">
              {it.status && <span aria-label={it.status} className={`size-2 shrink-0 rounded-full ${dot[it.status]}`} />}
              <span className="flex-1 truncate text-bk-fg">{it.label}</span>
              {showMeta && it.meta && <span className="text-xs text-bk-muted">{it.meta}</span>}
            </li>
          ))}
        </ul>
      </Frame>
    );
  },
});
