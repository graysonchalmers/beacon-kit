import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";
import { gl } from "../_shared/Glyph";

// Old Beacon "projects": search box, sort select + "All projects & details" link, then up to 12 rows (emoji tile, name, nick, one-liner, globe link).
const Project = z.object({ name: z.string(), nick: z.string().optional(), emoji: z.string().optional(), tags: z.string().optional(),
  say: z.string().optional(), description: z.string().optional(), url: z.string().optional(), last: z.string().default(""), sessions: z.number().default(0) });
type P = z.infer<typeof Project>;
const SORTS = { recent: "Recently worked", match: "Best match", sessions: "Most sessions", name: "Name A–Z" } as const;
type Sort = keyof typeof SORTS;

function hitsOf(list: P[], q: string, by: Sort) {
  const ws = q.toLowerCase().split(/\s+/).filter(Boolean);
  const score = (p: P) => ws.reduce((n, t) => {
    const f = [[p.nick, p.name], [p.emoji, p.tags, p.say], [p.description]].findIndex((g) => g.join(" ").toLowerCase().includes(t));
    return f < 0 ? -Infinity : n + 3 - f;
  }, 0);
  const nm = (p: P) => (p.nick || p.name).replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();
  const cmp = { match: (x: [P, number], y: [P, number]) => y[1] - x[1], recent: (x: [P, number], y: [P, number]) => y[0].last.localeCompare(x[0].last),
    sessions: (x: [P, number], y: [P, number]) => y[0].sessions - x[0].sessions, name: (x: [P, number], y: [P, number]) => nm(x[0]).localeCompare(nm(y[0])) }[by];
  return list.map((p) => [p, score(p)] as [P, number]).filter((x) => x[1] >= 0).sort((x, y) => cmp(x, y) || y[1] - x[1]).map((x) => x[0]);
}
const tile = (p: P): [string, string] => {
  const m = /^(\p{Extended_Pictographic}️?)\s*(.*)$/u.exec(p.nick || "");
  return m ? [m[1], m[2]] : [/\p{Extended_Pictographic}/u.test(p.emoji || "") ? p.emoji! : "projects", p.nick || p.name];
};
const ring = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent";

export const Projects = defineWidget({
  type: "projects", family: "list", title: "Projects",
  options: z.object({ label: z.string().default("Projects"), q: z.string().default(""), sort: z.enum(["recent", "match", "sessions", "name"]).default("recent"),
    home: z.string().default("https://claude.ai/artifact/54PPMkLyQ5JE1FfY98xwJ2") }),
  data: z.object({ projects: z.array(Project) }),
  size: { min: [2, 2], default: [2, 2], max: [6, 6] },
  render: function ProjectsView({ options, data, state }) {
    const [q, setQ] = useState(options.q ?? "");
    const [sort, setSort] = useState<Sort>(options.sort ?? "recent");
    const hits = hitsOf(data?.projects ?? [], q, sort);
    const st = state === "ready" && !data ? "empty" : state;
    return (
      <Frame title={options.label ?? "Projects"} icon="projects" state={st}>
        <div className="flex h-full min-h-0 flex-col text-[15px] leading-snug">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, nickname, emoji or what it does" aria-label="Find a project"
            className={`box-border w-full rounded-lg border border-bk-line bg-bk-bg px-2 py-1.5 text-bk-fg placeholder:text-bk-muted ${ring}`} />
          <div className="my-1 flex flex-wrap items-center justify-between gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort projects"
              className={`appearance-none rounded-md border border-bk-line bg-bk-bg p-1 text-[13px] text-bk-fg ${ring}`}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <a href={options.home} target="_blank" rel="noopener" className={`text-[13px] text-bk-accent underline ${ring}`}>All projects &amp; details ↗</a>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {hits.length ? hits.slice(0, 12).map((p) => (
              <div key={p.name} title={p.say || p.description} className="flex items-center gap-2.5 border-t border-bk-line py-1.5 [overflow-wrap:anywhere] first:border-t-0">
                <span aria-hidden className="grid size-[34px] flex-none place-items-center bg-bk-raise text-xl">{gl(tile(p)[0], "20px")}</span>
                <span className="min-w-0 flex-1">
                  <b>{tile(p)[1]}</b>{p.nick && <> <span className="text-[13px] text-bk-muted">{p.name}</span></>}
                  <span className="block truncate text-[13px] text-bk-muted">{p.say || p.description}</span>
                </span>
                {p.url && /^https?:\/\//.test(p.url) && (
                  <a href={p.url} target="_blank" rel="noopener" title={p.url.replace(/^https:\/\//, "")} aria-label={`Open ${p.nick || p.name}`}
                    className={`grid size-[30px] flex-none place-items-center text-bk-accent ${ring}`}>🌐</a>
                )}
              </div>
            )) : <p className="text-[13px] text-bk-muted">No project matches.</p>}
            {hits.length > 12 && <p className="text-[13px] text-bk-muted">+{hits.length - 12} more: add a word</p>}
          </div>
        </div>
      </Frame>
    );
  },
});
