import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "checklist". Local state seeded from data; a host saves changes through its own fetch layer.
const Item = z.object({ id: z.string(), text: z.string(), done: z.boolean().default(false) });

function Body({ items }: { items: z.infer<typeof Item>[] }) {
  const [list, setList] = useState(items);
  const done = list.filter((i) => i.done).length;
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="text-xs text-bk-muted">{done}/{list.length} done</div>
      <ul className="flex flex-col overflow-auto">
        {list.map((it) => (
          <li key={it.id}>
            <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
              <input type="checkbox" checked={it.done} className="size-4 accent-[var(--bk-accent)]"
                onChange={() => setList((l) => l.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))} />
              <span className={it.done ? "text-bk-muted line-through" : "text-bk-fg"}>{it.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Checklist = defineWidget({
  type: "checklist", family: "input", title: "Checklist",
  options: z.object({ label: z.string() }),
  data: z.object({ items: z.array(Item) }),
  size: { min: [2, 2], default: [3, 3], max: [3, 4] },
  render: ({ options, data, state }) => {
    const items = data?.items ?? [];
    return <Frame title={options.label} state={state === "ready" && !items.length ? "empty" : state} empty="Nothing to do">
      <Body items={items} /></Frame>;
  },
});
