import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "checklist": title with a done/total count, big checkboxes, a done row tinted with an ok check badge.
// Local state seeded from data; a host saves changes through its own fetch layer.
const Item = z.object({ id: z.string(), text: z.string(), done: z.boolean().default(false) });

function Body({ items, onCount }: { items: z.infer<typeof Item>[]; onCount: (n: number) => void }) {
  const [list, setList] = useState(items);
  const toggle = (id: string) => setList((l) => { const n = l.map((x) => (x.id === id ? { ...x, done: !x.done } : x)); onCount(n.filter((i) => i.done).length); return n; });
  return (
    <ul className="flex h-full flex-col overflow-auto">
      {list.map((it) => (
        <li key={it.id}>
          <label className={`flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-[15px] ${it.done ? "bg-[color-mix(in_srgb,var(--bk-ok)_18%,transparent)]" : ""}`}>
            <input type="checkbox" checked={it.done} className="size-5 shrink-0 accent-[var(--bk-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent"
              onChange={() => toggle(it.id)} />
            <span className={`min-w-0 flex-1 truncate ${it.done ? "text-bk-muted line-through" : "text-bk-fg"}`}>{it.text}</span>
            {it.done && <span aria-hidden className="mr-1 grid size-6 shrink-0 place-items-center rounded-full bg-bk-ok text-xs font-bold text-bk-bg">✓</span>}
          </label>
        </li>
      ))}
    </ul>
  );
}

export const Checklist = defineWidget({
  type: "checklist", family: "input", title: "Checklist",
  options: z.object({ label: z.string() }),
  data: z.object({ items: z.array(Item) }),
  size: { min: [2, 2], default: [3, 3], max: [3, 4] },
  render: function ChecklistView({ options, data, state }) {
    const items = data?.items ?? [];
    const [big, setBig] = useState(false);
    const [done, setDone] = useState<number | null>(null);
    const n = done ?? items.filter((i) => i.done).length;
    return <Frame title={options.label} state={state === "ready" && !items.length ? "empty" : state} empty="Nothing to do" icon="📋"
      extra={items.length ? `${n}/${items.length}` : undefined}
      actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
      <Body items={items} onCount={setDone} /></Frame>;
  },
});
