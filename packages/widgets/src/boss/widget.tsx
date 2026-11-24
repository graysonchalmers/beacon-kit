import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "boss": the ask-the-main-system log plus an ask box. Rows are data; a typed question shows locally as "Asking…".
const Row = z.object({ q: z.string(), src: z.string().optional(), at: z.string().optional(), answer: z.string().optional(),
  propose: z.string().optional(), waiting: z.boolean().optional() });

function Body({ rows }: { rows: z.infer<typeof Row>[] }) {
  const [list, setList] = useState(rows), [q, setQ] = useState("");
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex min-h-0 flex-col gap-2 overflow-auto" aria-live="polite">
        {list.length ? list.map((r, i) => (
          <div key={i} className="text-sm">
            <div><b className="text-bk-fg">{r.q}</b> <span className="text-[13px] text-bk-muted">{[r.src, r.at].filter(Boolean).join(" · ")}</span></div>
            <div className={r.answer ? "text-bk-fg" : "text-bk-muted"}>{r.answer ?? "Asking the main system…"}</div>
            {r.propose && <div className={`text-[13px] ${r.waiting ? "text-bk-warn" : "text-bk-muted"}`}>{r.waiting ? "⏳ Say yes to start: " : "Suggested: "}{r.propose}</div>}
          </div>
        )) : <span className="text-[13px] text-bk-muted">Nothing asked yet. Say “ask the boss …” or type below.</span>}
      </div>
      <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); const t = q.trim(); if (!t) return; setList((l) => [...l, { q: t, src: "typed" }]); setQ(""); }}>
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask the main system…" aria-label="Ask the main system a question"
          className="h-10 min-w-0 flex-1 rounded-sm border border-bk-line bg-bk-fg px-1 text-base text-bk-bg placeholder:text-bk-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent" />
        <button type="submit" className="h-10 rounded-[10px] border border-bk-line bg-bk-bg px-3 text-[15px] font-semibold text-bk-fg hover:bg-bk-raise focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent">Ask</button>
      </form>
    </div>
  );
}

export const Boss = defineWidget({
  type: "boss", family: "chat", title: "Boss",
  options: z.object({ label: z.string().default("Boss") }),
  data: z.object({ rows: z.array(Row) }),
  size: { min: [2, 2], default: [4, 4], max: [6, 6] },
  render: function BossView({ options, data, state }) {
    const [big, setBig] = useState(false);
    return (
      <Frame title={options.label ?? "Boss"} state={state === "ready" && !data ? "empty" : state} icon="markdown"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {data && <Body rows={data.rows} />}
      </Frame>
    );
  },
});
