import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "mail": unread rows (age, sender, subject) plus Check LinkedIn and Refresh buttons.
const Mail = z.object({ id: z.string(), from: z.string(), subject: z.string(), age: z.string(),
  channel: z.enum(["gmail", "linkedin"]).default("gmail"), link: z.string().url().optional() });

export const Inbox = defineWidget({
  type: "inbox", family: "list", title: "Inbox",
  options: z.object({ label: z.string().default("Inbox"), linkedin: z.boolean().default(true),
    onRefresh: z.function().returns(z.any()).optional(), onCheckLinkedIn: z.function().returns(z.any()).optional() }),
  data: z.object({ mail: z.array(Mail) }),
  size: { min: [2, 2], default: [4, 3], max: [6, 4] },
  render: function InboxView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState<"" | "li" | "rf">("");
    const mail = data?.mail ?? [];
    // Old card showed muted text for loading/error, not a skeleton or red alert.
    const st = state === "ready" && mail.length === 0 ? "empty" : state === "loading" || state === "error" ? "empty" : state;
    const msg = state === "loading" ? "Looking…" : state === "error" ? "Mail can't be read right now." : "No unread mail from the last 3 days.";
    const run = async (k: "li" | "rf", fn: unknown, pending: string, done: () => string) => {
      setBusy(k); setStatus(pending);
      try { if (typeof fn === "function") await fn(); setStatus(done()); } catch { setStatus(k === "li" ? "Couldn't request" : "Couldn't refresh"); } finally { setBusy(""); }
    };
    const btn = "rounded-lg border border-bk-line bg-bk-bg px-2.5 py-[3px] text-[13px] font-semibold text-bk-fg whitespace-nowrap disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-bk-accent";
    return (
      <Frame title={options.label ?? "Inbox"} state={st} icon="mail" empty={msg}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <div className="flex h-full flex-col overflow-auto">
          <ul className="flex flex-col gap-0.5">
            {mail.map((m) => {
              const inner = (<>
                <span className="w-10 shrink-0 text-[13px] tabular-nums text-bk-muted">{m.age}</span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <b className="text-[15px] font-bold text-bk-fg">{m.from}</b>
                  {m.channel === "linkedin" && <span className="font-normal opacity-70"> · in</span>}
                  <span className="block truncate text-[13px] text-bk-muted">{m.subject}</span>
                </span>
              </>);
              const cls = "flex items-baseline gap-2.5 rounded-lg px-1.5 py-[5px] text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-bk-accent";
              const tip = `${m.from}: ${m.subject} · opens in ${m.channel === "linkedin" ? "LinkedIn" : "Gmail"}`;
              return <li key={m.id}>{m.link
                ? <a href={m.link} target="_blank" rel="noopener noreferrer" title={tip} className={`${cls} hover:bg-bk-raise`}>{inner}</a>
                : <div tabIndex={0} title={tip} className={cls}>{inner}</div>}</li>;
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-1.5 pb-0.5 pt-1.5">
            {options.linkedin !== false && <button type="button" className={btn} disabled={busy !== ""}
              title="Asks a Claude session with the browser to read your LinkedIn inbox. Nothing is sent."
              onClick={() => run("li", options.onCheckLinkedIn, "Requesting…", () => "Requested: waiting on a Claude session")}>Check LinkedIn</button>}
            <button type="button" className={btn} disabled={busy !== ""} title="Re-reads Gmail and your reply queue now."
              onClick={() => run("rf", options.onRefresh, "Refreshing…", () => "Updated " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }))}>
              <span aria-hidden className="mr-1">↻</span>Refresh</button>
            {status && <span role="status" className="basis-full text-[13px] text-bk-muted">{status}</span>}
          </div>
        </div>
      </Frame>
    );
  },
});
