import type { ReactNode } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "markdown" / "docs" notes. A tiny safe subset (headings, lists, bold, code, links), rendered as React, never as raw HTML.
const inline = (s: string): ReactNode[] => s.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((p, i) => {
  if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
  if (p.startsWith("`")) return <code key={i} className="rounded bg-bk-raise px-1">{p.slice(1, -1)}</code>;
  const m = p.match(/^\[([^\]]+)\]\((https?:[^)]+)\)$/);
  return m ? <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-bk-accent underline">{m[1]}</a> : p;
});

export function Md({ text }: { text: string }) {
  const out: ReactNode[] = []; let list: ReactNode[] = [];
  const flush = () => { if (list.length) out.push(<ul key={out.length} className="ml-4 list-disc">{list}</ul>); list = []; };
  text.split("\n").forEach((line, i) => {
    const h = line.match(/^(#{1,3})\s+(.*)/), li = line.match(/^\s*[-*]\s+(.*)/);
    if (li) { list.push(<li key={i}>{inline(li[1])}</li>); return; }
    flush();
    if (h) out.push(<p key={i} className={`font-semibold text-bk-fg ${h[1].length === 1 ? "text-lg" : "text-base"}`}>{inline(h[2])}</p>);
    else if (line.trim()) out.push(<p key={i}>{inline(line)}</p>);
  });
  flush();
  return <>{out}</>;
}

export const Markdown = defineWidget({
  type: "markdown", family: "media", title: "Markdown note",
  options: z.object({ label: z.string() }),
  data: z.object({ text: z.string() }),
  size: { min: [2, 2], default: [4, 3], max: [8, 8] },
  render: ({ options, data, state }) => (
    <Frame title={options.label} state={state === "ready" && !data?.text ? "empty" : state}>
      <div className="flex h-full flex-col gap-1 overflow-auto text-sm text-bk-fg">{data && <Md text={data.text} />}</div>
    </Frame>
  ),
});
