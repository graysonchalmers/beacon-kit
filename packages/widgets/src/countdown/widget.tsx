import { useEffect, useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "countdown": no header row; big time left on the left, then a small timer dot, the label and "at 9:23 AM".
// Ticks once a second; the end time is data, the tick is view-only.
const fmt = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`; };

function Card({ label, endsAt, now0 }: { label: string; endsAt: number; now0?: number }) {
  const [now, setNow] = useState(now0 ?? Date.now()), [big, setBig] = useState(false);
  useEffect(() => { if (now0 !== undefined) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [now0]);
  const left = endsAt - now;
  const at = new Date(Math.round(endsAt / 60000) * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <section aria-label={label} className="flex h-full w-full min-w-0 flex-col gap-1.5 overflow-hidden rounded-[var(--bk-radius)] border border-bk-line bg-bk-card px-3 py-2.5">
      <div className="flex items-start gap-3">
        <div role="timer" aria-live="off" className={`text-[44px] font-bold leading-none tabular-nums ${left <= 0 ? "text-bk-danger" : "text-bk-fg"}`}>{left <= 0 ? "Done" : fmt(left)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate text-[15px] text-bk-fg"><span aria-hidden className="size-2.5 shrink-0 rounded-full bg-bk-warn" />{label}</div>
          <div className="text-[13px] text-bk-muted">at {at}</div>
        </div>
      </div>
      <button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
        className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>
    </section>
  );
}

export const Countdown = defineWidget({
  type: "countdown", family: "data", title: "Countdown",
  options: z.object({ label: z.string() }),
  data: z.object({ endsAt: z.number(), now: z.number().optional() }),   // epoch ms; `now` freezes the clock (stories, snapshots)
  size: { min: [1, 1], default: [2, 2], max: [3, 2] },
  render: ({ options, data, state }) => state === "ready" && data
    ? <Card label={options.label} endsAt={data.endsAt} now0={data.now} />
    : <Frame title={options.label} state={state === "ready" ? "empty" : state} empty="No timer" icon="timer" />,
});
