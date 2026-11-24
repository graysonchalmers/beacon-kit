import { useEffect, useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "countdown" (timers). Ticks once a second; the time is data, the tick is view-only.
const fmt = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`; };

function Body({ endsAt, now0 }: { endsAt: number; now0?: number }) {
  const [now, setNow] = useState(now0 ?? Date.now());
  useEffect(() => { if (now0 !== undefined) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [now0]);
  const left = endsAt - now;
  return (
    <div className="flex h-full flex-col justify-center">
      <div role="timer" aria-live="off" className={`text-3xl font-semibold tabular-nums ${left <= 0 ? "text-bk-danger" : "text-bk-fg"}`}>{left <= 0 ? "Done" : fmt(left)}</div>
      <div className="text-xs text-bk-muted">at {new Date(endsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
    </div>
  );
}

export const Countdown = defineWidget({
  type: "countdown", family: "data", title: "Countdown",
  options: z.object({ label: z.string() }),
  data: z.object({ endsAt: z.number(), now: z.number().optional() }),   // epoch ms; `now` freezes the clock (stories, snapshots)
  size: { min: [1, 1], default: [2, 2], max: [3, 2] },
  render: ({ options, data, state }) => (
    <Frame title={options.label} state={state === "ready" && !data ? "empty" : state} empty="No timer">
      {data && <Body endsAt={data.endsAt} now0={data.now} />}
    </Frame>
  ),
});
