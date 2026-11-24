import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "replies": proposed replies (name, age at right, one-line preview), "+N more", Refresh.
const Reply = z.object({ id: z.string(), name: z.string(), channel: z.string(), preview: z.string(), age: z.string().optional(),
  draft: z.enum(["ready", "approved"]).optional(), link: z.string().url().optional() });

export const ReplyQueue = defineWidget({
  type: "reply-queue", family: "list", title: "Reply queue",
  options: z.object({ label: z.string().default("Proposed replies"), onRefresh: z.function().returns(z.any()).optional() }),
  data: z.object({ items: z.array(Reply), total: z.number().int().nonnegative().optional() }),
  size: { min: [2, 2], default: [4, 3], max: [6, 4] },
  render: function ReplyQueueView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const items = data?.items ?? [];
    const more = (data?.total ?? items.length) - items.length;
    // Old card showed muted text for loading/error, not a skeleton or red alert.
    const st = state === "ready" && items.length === 0 ? "empty" : state === "loading" || state === "error" ? "empty" : state;
    const msg = state === "loading" ? "Looking…" : state === "error" ? "The reply queue can't be read right now." : "No replies drafted yet.";
    const refresh = async () => {
      setBusy(true); setStatus("Refreshing…");
      try { if (typeof options.onRefresh === "function") await options.onRefresh();
        setStatus("Updated " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); }
      catch { setStatus("Couldn't refresh"); } finally { setBusy(false); }
    };
    return (
      <Frame title={options.label ?? "Proposed replies"} state={st} icon="✉️" empty={msg}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <div className="flex h-full flex-col overflow-auto">
          <ul className="flex min-w-0 flex-col gap-0.5">
            {items.map((m) => {
              const inner = (<>
                <span className="block truncate pr-10">
                  <b className="text-[15px] font-bold text-bk-fg">{m.name}</b>
                  {m.draft && <span className="ml-1 font-normal opacity-70" aria-label={m.draft === "approved" ? "draft approved" : "draft ready"}>{m.draft === "approved" ? "✓" : "✎"}</span>}
                </span>
                <span className="block truncate text-[13px] text-bk-muted opacity-80">{m.preview}</span>
                {m.age && <span className="absolute right-1.5 top-[5px] text-[13px] tabular-nums text-bk-muted">{m.age}</span>}
              </>);
              const cls = "relative block min-w-0 rounded-lg px-1.5 py-[5px] text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-bk-accent";
              const tip = `${m.name} · ${m.channel}${m.draft ? " · draft " + m.draft : ""} · opens the thread`;
              return <li key={m.id} className="min-w-0">{m.link
                ? <a href={m.link} target="_blank" rel="noopener noreferrer" title={tip} className={`${cls} hover:bg-bk-raise`}>{inner}</a>
                : <div tabIndex={0} title={tip} className={cls}>{inner}</div>}</li>;
            })}
          </ul>
          {more > 0 && <p className="text-[13px] text-bk-muted">+{more} more in the queue</p>}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-1.5 pb-0.5 pt-1.5">
            <button type="button" disabled={busy} onClick={refresh} title="Re-reads Gmail and your reply queue now."
              className="rounded-lg border border-bk-line bg-bk-bg px-2.5 py-[3px] text-[13px] font-semibold text-bk-fg whitespace-nowrap disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-bk-accent">
              <span aria-hidden className="mr-1">↻</span>Refresh</button>
            {status && <span role="status" className="basis-full text-[13px] text-bk-muted">{status}</span>}
          </div>
        </div>
      </Frame>
    );
  },
});
