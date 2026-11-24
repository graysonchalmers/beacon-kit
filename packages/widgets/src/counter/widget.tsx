import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "counter": named tallies with − / + buttons.
const Item = z.object({ id: z.string(), text: z.string(), n: z.number().int() });
const btn = "size-8 rounded-[var(--bk-radius)] bg-bk-raise text-bk-fg hover:bg-bk-accent hover:text-bk-on-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent";

function Body({ items }: { items: z.infer<typeof Item>[] }) {
  const [list, setList] = useState(items);
  const bump = (id: string, d: number) => setList((l) => l.map((x) => (x.id === id ? { ...x, n: x.n + d } : x)));
  return (
    <ul className="flex flex-col gap-1 overflow-auto">
      {list.map((it) => (
        <li key={it.id} className="flex items-center gap-2 text-sm">
          <span className="flex-1 truncate text-bk-fg">{it.text}</span>
          <button type="button" className={btn} aria-label={`${it.text} minus one`} onClick={() => bump(it.id, -1)}>−</button>
          <span className="w-8 text-center tabular-nums text-bk-fg" aria-live="polite">{it.n}</span>
          <button type="button" className={btn} aria-label={`${it.text} plus one`} onClick={() => bump(it.id, 1)}>+</button>
        </li>
      ))}
    </ul>
  );
}

export const Counter = defineWidget({
  type: "counter", family: "input", title: "Counter",
  options: z.object({ label: z.string() }),
  data: z.object({ items: z.array(Item) }),
  size: { min: [2, 1], default: [3, 2], max: [3, 3] },
  render: ({ options, data, state }) => {
    const items = data?.items ?? [];
    return <Frame title={options.label} state={state === "ready" && !items.length ? "empty" : state}><Body items={items} /></Frame>;
  },
});
