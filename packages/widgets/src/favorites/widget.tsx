import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "favorites": grouped copy-the-command rows (label, shell, monospace command, "copy" button), then the group's note.
const Cmd = z.object({ label: z.string(), shell: z.string().optional(), cmd: z.string() });
const Item = z.object({ id: z.string().optional(), label: z.string(), note: z.string().optional(), cmds: z.array(Cmd).default([]),
  text: z.string().optional(), open: z.boolean().optional() });
const Live = z.object({ label: z.string(), value: z.string(), level: z.string().optional() });

function CopyBtn({ cmd, label }: { cmd: string; label: string }) {
  const [say, setSay] = useState("copy");
  const flash = (t: string) => { setSay(t); setTimeout(() => setSay("copy"), 1500); };
  return (
    <button type="button" aria-label={`Copy command: ${label}`}
      onClick={() => (navigator.clipboard ? navigator.clipboard.writeText(cmd).then(() => flash("copied"), () => flash("can't copy")) : flash("can't copy"))}
      className="flex-none rounded-md border border-current px-2.5 py-1 text-[13px] text-bk-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent">
      {say}
    </button>
  );
}

export const Favorites = defineWidget({
  type: "favorites", family: "list", title: "Favorites",
  options: z.object({ label: z.string().default("Favorites") }),
  data: z.object({ live: z.array(Live).default([]), items: z.array(Item) }),
  size: { min: [2, 2], default: [2, 3], max: [6, 6] },
  render: ({ options, data, state }) => {
    const items = data?.items ?? [], live = data?.live ?? [];
    const st = state === "ready" && !items.length && !live.length ? "empty" : state;
    return (
      <Frame title={options.label ?? "Favorites"} icon="markdown" state={st} empty="No favorites: add rows to docs/favorites.json.">
        <div className="h-full overflow-y-auto text-[15px] leading-snug">
          {live.map((l) => (
            <div key={l.label} className="mb-1.5 mt-0.5 flex items-baseline gap-2">
              <span className="text-[13px] text-bk-muted">{l.label}</span>
              <b className={`text-lg ${l.level === "bad" ? "text-bk-danger" : ""}`}>{l.value}</b>
            </div>
          ))}
          {items.map((it, i) => (
            <div key={it.id ?? i}>
              <div className="mb-0.5 mt-2 text-xs text-bk-muted first:mt-0.5">{it.label}</div>
              {it.cmds.map((c) => (
                <div key={c.label} className="flex min-w-0 items-center gap-2 py-[3px]">
                  <span className="min-w-0 flex-1">
                    <span>{c.label}</span> {c.shell && <span className="text-[13px] text-bk-muted">{c.shell}</span>}
                    <code className="block text-[11px] opacity-80 [overflow-wrap:anywhere]">{c.cmd}</code>
                  </span>
                  <CopyBtn cmd={c.cmd} label={c.label} />
                </div>
              ))}
              {it.text ? (
                <details open={it.open}>
                  <summary className="cursor-pointer py-1 text-[13px]">{it.note || "Notes"}</summary>
                  <div className="max-h-[18em] overflow-hidden whitespace-pre-wrap text-xs">{it.text}</div>
                </details>
              ) : <span className="block py-1 text-[13px] text-bk-muted">{it.note}</span>}
            </div>
          ))}
        </div>
      </Frame>
    );
  },
});
