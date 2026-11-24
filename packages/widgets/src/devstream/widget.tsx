import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "devstream": the newest DevStream library pictures as 84px tiles, rolling in from the left; a caption under them
// names the newest. When the library can't be read it says so (and keeps the last pictures, if any).
const item = z.object({ id: z.string(), title: z.string(), folder: z.string().default(""), t: z.number(), thumb: z.string(), full: z.string().optional() });
const time = (t: number) => new Date(t * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const DevStream = defineWidget({
  type: "devstream", family: "media", title: "DevStream",
  options: z.object({ label: z.string().default("DevStream"), icon: z.string().optional(), href: z.string().optional() }),
  data: z.object({ ok: z.boolean().default(true), items: z.array(item) }),
  size: { min: [2, 2], default: [2, 2], max: [6, 4] },
  render: function DevStreamView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const [sel, setSel] = useState<number | null>(null);
    const st = state === "ready" && !data ? "empty" : state;
    const items = data?.items ?? [], cur = sel !== null ? items[sel] : undefined;
    const label = options.label ?? "DevStream";
    const sub = "basis-full text-[13px] text-bk-muted";
    return (
      <Frame className="!p-3" title={label} icon={options.icon ?? "image"} state={st} empty="Looking at DevStream…"
        extra={options.href ? <a href={options.href} target="_blank" rel="noopener" className="text-bk-muted underline-offset-2 hover:underline">Open</a> : undefined}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {data && <div className="flex flex-wrap items-start gap-1.5">
          {items.map((i, k) => <button key={i.id} type="button" title={`${i.title} · ${i.folder} · ${time(i.t)}`} onClick={() => setSel(k)}
            className="block shrink-0 cursor-zoom-in overflow-hidden rounded-md bg-bk-bg leading-none focus-visible:outline-2 focus-visible:outline-bk-accent">
            <img src={i.thumb} alt={i.title} loading="lazy" className="block size-[84px] object-cover" /></button>)}
          {!data.ok ? <div className={sub}>DevStream's library can't be read right now{items.length ? ": showing the last pictures it had" : ""}.</div>
            : !items.length && <div className={sub}>No pictures yet.</div>}
          {items[0] && <div className={sub}>{items[0].title} · {items[0].folder} · {time(items[0].t)}</div>}
        </div>}
        {cur && <div role="dialog" aria-label={cur.title} tabIndex={-1} className="absolute inset-0 z-10 flex flex-col gap-2 bg-bk-card"
          onKeyDown={(e) => { if (e.key === "Escape") setSel(null); if (e.key === "ArrowRight") setSel((sel! + 1) % items.length); if (e.key === "ArrowLeft") setSel((sel! - 1 + items.length) % items.length); }}>
          <img src={cur.full ?? cur.thumb} alt={cur.title} className="min-h-0 flex-1 rounded-md object-contain" />
          <div className="flex items-center gap-2 text-[13px] text-bk-muted">
            <button type="button" aria-label="Previous picture" className="rounded px-2 hover:bg-bk-raise" onClick={() => setSel((sel! - 1 + items.length) % items.length)}>‹</button>
            <span className="min-w-0 flex-1 truncate">{cur.title} · {cur.folder} · {time(cur.t)} · {sel! + 1}/{items.length}</span>
            <button type="button" aria-label="Next picture" className="rounded px-2 hover:bg-bk-raise" onClick={() => setSel((sel! + 1) % items.length)}>›</button>
            <button type="button" aria-label="Close" autoFocus className="rounded px-2 hover:bg-bk-raise" onClick={() => setSel(null)}>✕</button>
          </div>
        </div>}
      </Frame>
    );
  },
});
