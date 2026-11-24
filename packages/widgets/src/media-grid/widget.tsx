import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "devstream" / "ytplaylists" / gallery: searchable thumbnail grid, pick one to see it large.
const Item = z.object({ id: z.string(), title: z.string(), thumb: z.string(), href: z.string().optional() });

function Body({ items, search }: { items: z.infer<typeof Item>[]; search: boolean }) {
  const [q, setQ] = useState(""), [pick, setPick] = useState<string | null>(null);
  const shown = items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
  const sel = items.find((i) => i.id === pick);
  return (
    <div className="flex h-full flex-col gap-2">
      {search && <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search"
        className="rounded-[var(--bk-radius)] border border-bk-line bg-bk-raise px-2 py-1 text-sm text-bk-fg" />}
      {sel ? <button type="button" onClick={() => setPick(null)} className="min-h-0 flex-1 text-left" aria-label={`Close ${sel.title}`}>
        <img src={sel.thumb} alt={sel.title} className="h-[85%] w-full rounded-[var(--bk-radius)] object-contain" /><p className="truncate text-sm text-bk-fg">{sel.title}</p></button>
      : <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2 overflow-auto">
          {shown.map((i) => <li key={i.id}><button type="button" onClick={() => setPick(i.id)} title={i.title}
            className="block w-full overflow-hidden rounded-[var(--bk-radius)] border border-bk-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent">
            <img src={i.thumb} alt={i.title} loading="lazy" className="aspect-square w-full object-cover" /></button></li>)}
          {!shown.length && <li className="text-sm text-bk-muted">No matches</li>}
        </ul>}
    </div>
  );
}

export const MediaGrid = defineWidget({
  type: "media-grid", family: "media", title: "Media grid",
  options: z.object({ label: z.string(), search: z.boolean().default(true) }),
  data: z.object({ items: z.array(Item) }),
  size: { min: [2, 2], default: [4, 4], max: [12, 8] },
  render: ({ options, data, state }) => {
    const items = data?.items ?? [];
    return <Frame title={options.label} state={state === "ready" && !items.length ? "empty" : state}><Body items={items} search={options.search ?? true} /></Frame>;
  },
});
