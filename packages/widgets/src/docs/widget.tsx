import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "docs": a search box over links grouped under labels (Hubs, Hosting, Design kits...), one line per link: bold label + muted note.
const Link = z.object({ group: z.string().optional(), label: z.string(), url: z.string(), note: z.string().optional() });
const safe = (u: string) => (/^https?:\/\//.test(u) ? u : undefined);

export const Docs = defineWidget({
  type: "docs", family: "list", title: "Docs",
  options: z.object({ label: z.string().default("Docs"), q: z.string().default("") }),
  data: z.object({ links: z.array(Link) }),
  size: { min: [2, 2], default: [2, 3], max: [6, 6] },
  render: function DocsView({ options, data, state }) {
    const [q, setQ] = useState(options.q ?? "");
    const links = data?.links ?? [];
    const ws = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = links.filter((l) => ws.every((t) => [l.group, l.label, l.note].join(" ").toLowerCase().includes(t)));
    const groups = [...new Set(hits.map((l) => l.group || "Other"))];
    const st = state === "ready" && !data ? "empty" : state;
    return (
      <Frame title={options.label ?? "Docs"} icon="🗒️" state={st} empty="No links yet: add rows to docs/links.json.">
        <div className="flex h-full min-h-0 flex-col text-[15px] leading-snug">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a doc" aria-label="Find a doc"
            className="w-full border border-bk-line bg-bk-bg px-1 py-0.5 text-[15px] text-bk-fg placeholder:text-bk-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent" />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!hits.length ? <p className="mt-1.5 text-[13px] text-bk-muted">{links.length ? "No doc matches." : "No links yet: add rows to docs/links.json."}</p>
              : groups.map((g) => (
                <div key={g}>
                  <div className="mb-0.5 mt-2 text-xs text-bk-muted first:mt-1.5">{g}</div>
                  {hits.filter((l) => (l.group || "Other") === g).map((l) => (
                    <a key={l.label + l.url} href={safe(l.url)} target="_blank" rel="noopener" title={l.note || l.url}
                      className="group flex min-w-0 items-baseline gap-2 whitespace-nowrap py-1 text-bk-fg no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent">
                      <b className="flex-none font-semibold group-hover:underline">{l.label}</b>
                      <span className="min-w-0 truncate text-[13px] text-bk-muted">{l.note}</span>
                    </a>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </Frame>
    );
  },
});
