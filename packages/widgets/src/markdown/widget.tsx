import { useState, type ReactNode } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "markdown" notes. The old md() subset (headings, bold, italic, code, bullet and numbered lists, rules, https links),
// rendered as React, never as raw HTML.
const inline = (s: string): ReactNode[] => s.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((p, i) => {
  if (p.startsWith("**") && p.length > 4) return <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>;
  if (p.startsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
  if (p.startsWith("`")) return <code key={i} className="rounded bg-bk-raise px-1">{p.slice(1, -1)}</code>;
  const m = p.match(/^\[([^\]]+)\]\((https:[^)]+)\)$/);
  return m ? <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-bk-accent underline">{m[1]}</a> : p;
});

export function Md({ text }: { text: string }) {
  const out: ReactNode[] = []; let list: ReactNode[] = [], kind: "ul" | "ol" | "" = "";
  const flush = () => {
    if (list.length) out.push(kind === "ol" ? <ol key={out.length} className="my-1 ml-6 list-decimal">{list}</ol> : <ul key={out.length} className="my-1 ml-6 list-disc">{list}</ul>);
    list = []; kind = "";
  };
  text.split("\n").forEach((line, i) => {
    const h = line.match(/^(#{1,6})\s+(.*)/), li = line.match(/^\s*(?:([-*])|(\d+)[.)])\s+(.*)/);
    if (li) { const k = li[1] ? "ul" : "ol"; if (kind && kind !== k) flush(); kind = k; list.push(<li key={i}>{inline(li[3])}</li>); return; }
    flush();
    if (h) out.push(<p key={i} className={`font-semibold text-bk-fg ${h[1].length <= 3 ? "text-base" : "text-sm"}`}>{inline(h[2])}</p>);
    else if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) out.push(<hr key={i} className="border-bk-line" />);
    else if (line.trim()) out.push(<p key={i} className="my-1">{inline(line)}</p>);
  });
  flush();
  return <>{out}</>;
}

export const Markdown = defineWidget({
  type: "markdown", family: "media", title: "Markdown note",
  options: z.object({ label: z.string() }),
  data: z.object({ text: z.string() }),
  size: { min: [2, 2], default: [4, 3], max: [8, 8] },
  render: function MarkdownView({ options, data, state }) {
    const [big, setBig] = useState(false);
    return (
      <Frame title={options.label} state={state === "ready" && !data?.text ? "empty" : state} icon="🗒️"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <div className="flex h-full flex-col overflow-auto break-words text-sm leading-snug text-bk-fg">{data && <Md text={data.text} />}</div>
      </Frame>
    );
  },
});
