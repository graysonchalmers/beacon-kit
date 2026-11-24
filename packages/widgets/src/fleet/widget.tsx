import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "fleet" (fleet.js): one tile per machine with an up/down pip, CPU/RAM/(GPU)/DSK mini bars, a two-step
// power row (arm, then confirm) and a GPU lease line. Power actions are local UI state here; a host wires onPower.
const Disk = z.object({ mount: z.string(), free_gb: z.number(), pct: z.number() });
const Machine = z.object({
  id: z.string(), name: z.string().optional(), state: z.enum(["up", "down", "stale", "unknown"]),
  level: z.enum(["", "warn", "bad"]).optional(), age_s: z.number().nullable().optional(),
  cpu: z.number().nullable().optional(), mem: z.number().nullable().optional(),
  gpu: z.object({ util: z.number(), vram_used_gb: z.number(), vram_total_gb: z.number(), temp: z.number() }).optional(),
  disk: Disk.optional(), checks_down: z.array(z.string()).optional(),
});
const data = z.object({
  machines: z.array(Machine),
  lease: z.object({ known: z.boolean(), free: z.boolean().optional(), holder: z.string().optional(), mins: z.number().optional(), queue: z.number().optional() }).optional(),
  power: z.object({ ready: z.record(z.boolean()), why: z.record(z.string()).optional(), idle: z.array(z.string()).default([]) }).optional(),
});
type M = z.infer<typeof Machine>;

const lv = (v: number, w: number, b: number) => (v >= b ? "bg-bk-danger" : v >= w ? "bg-bk-warn" : "bg-bk-ok");
const age = (s?: number | null) => (s == null ? "no data" : s < 90 ? s + "s" : s < 5400 ? Math.round(s / 60) + "m" : Math.round(s / 3600) + "h");
const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

function Bar({ k, tip, v, w, b, txt, off }: { k: string; tip: string; v?: number | null; w: number; b: number; txt?: string; off?: boolean }) {
  return (
    <div className="mt-[3px] flex items-center gap-[5px] text-[11px]" title={tip}>
      <span className="w-6 flex-none text-[10px] opacity-70">{k}</span>
      <span className="h-[7px] min-w-5 flex-1 bg-bk-bg shadow-[inset_0_0_0_1px_var(--bk-line)]">
        <i className={`block h-full ${v == null ? "" : off ? "bg-bk-muted" : lv(v, w, b)}`} style={{ width: `${v == null ? 0 : Math.max(0, Math.min(100, v))}%` }} />
      </span>
      <span className="min-w-[34px] flex-none text-right tabular-nums">{txt ?? (v == null ? "–" : v + "%")}</span>
    </div>
  );
}

const btn = "whitespace-nowrap rounded-md border border-bk-line bg-bk-card px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-[.04em] text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent disabled:cursor-not-allowed disabled:opacity-40";

function Tile({ m, power, idle }: { m: M; power?: z.infer<typeof data>["power"]; idle: boolean }) {
  const [arm, setArm] = useState<{ k: string; w: string } | null>(null);
  const [note, setNote] = useState("");
  const name = m.name ?? cap(m.id), dead = m.state === "down" || m.state === "unknown";
  const stateTip = { up: "Up", down: "Down: unreachable", stale: `Stale: last reading ${age(m.age_s)} ago`, unknown: "No reading yet" }[m.state];
  const grey = m.state === "stale" || m.state === "unknown";
  const pip = m.state !== "up" ? (grey ? "bg-bk-muted" : "bg-bk-danger") : m.level === "bad" ? "bg-bk-danger" : m.level === "warn" ? "bg-bk-warn" : "bg-bk-ok";
  const ok = !!power?.ready[m.id], why = power?.why?.[m.id] ?? "Not available from here";
  const d = m.disk, g = m.gpu;
  const B = (k: string, label: string, w = "") => (
    <button type="button" className={btn} disabled={!ok} title={ok ? `${label} ${name}. Two steps: arm, then confirm` : why}
      onClick={() => { setArm({ k, w }); setNote(""); }}>{label}</button>
  );
  return (
    <div title={`${name}: ${stateTip}` + (m.checks_down?.length ? `. Checks down: ${m.checks_down.join(", ")}` : "")}
      className={`min-w-0 rounded-sm border-2 border-bk-line bg-bk-bg shadow-[2px_2px_0_rgb(0_0_0/.55)] px-2 pb-[7px] pt-1.5 ${grey ? "opacity-55 grayscale" : m.state === "down" ? "opacity-80" : ""}`}>
      <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[.06em]">
        <i className={`size-2.5 flex-none shadow-[0_0_0_2px_rgb(0_0_0/.5)] ${pip}`} />
        <span aria-hidden className="text-[11px]">{g || m.id === "stealth" ? "📼" : "host"}</span>
        <b className="min-w-0 flex-1 truncate text-[13px]">{name}</b>
        {grey && <span className="flex-none bg-bk-raise px-1 text-[10px]" title={stateTip}>{m.state === "stale" ? age(m.age_s) : "?"}</span>}
        {m.state === "down" && <span className="flex-none bg-bk-raise px-1 text-[10px]">DOWN</span>}
      </div>
      <Bar k="CPU" tip="CPU load per core" v={dead ? null : m.cpu} w={60} b={85} />
      <Bar k="RAM" tip="Memory in use" v={dead ? null : m.mem} w={70} b={90} />
      {g && <Bar k="GPU" tip={`GPU ${g.util}% · VRAM ${g.vram_used_gb} of ${g.vram_total_gb} GB · ${g.temp}°C`} v={g.util} w={70} b={95} off={m.state === "down"} />}
      {d ? <Bar k="DSK" tip={`${d.mount} ${d.free_gb} GB free (${d.pct}% used)`} v={d.pct} w={80} b={90} off={m.state === "down"}
        txt={(d.mount.length <= 3 ? d.mount.replace(/[:/]$/, "") + " " : "") + Math.round(d.free_gb) + "G"} />
        : <Bar k="DSK" tip="No disk reading" v={null} w={80} b={90} />}
      {power && (arm ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" className={`${btn} bg-bk-danger text-bk-on-accent`} onClick={() => { setNote(`${arm.k === "reboot" ? "Reboot" : "Shut down"} sent${arm.w ? " (when idle)" : ""}`); setArm(null); }}>
            {arm.k === "reboot" ? "Confirm reboot" : "Confirm shut down"}{arm.w ? " when idle" : ""}</button>
          <button type="button" className={btn} onClick={() => setArm(null)}>Cancel</button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {B("reboot", "Reboot")}{B("shutdown", "Shut down")}
          {idle && <>{B("reboot", "Reboot when idle", "idle")}{B("shutdown", "Shut down when idle", "idle")}</>}
        </div>
      ))}
      {note && <div className="mt-1 text-[10px] opacity-85 [overflow-wrap:anywhere]">{note}</div>}
    </div>
  );
}

export const Fleet = defineWidget({
  type: "fleet", family: "data", title: "Fleet",
  options: z.object({ title: z.string().default("Fleet") }),
  data,
  size: { min: [2, 2], default: [3, 2], max: [6, 4] },
  render: ({ options, data: d, state }) => {
    const l = d?.lease;
    return (
      <Frame className="!p-3" title={options.title ?? "Fleet"} icon="host" state={state === "ready" && !d?.machines.length ? "empty" : state} empty="Reading the fleet…">
        <div className="grid h-full min-h-0 gap-1.5 overflow-y-auto text-[12px] font-semibold leading-[1.3]">
          <div className="grid gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {d?.machines.map((m) => <Tile key={m.id} m={m} power={d.power} idle={!!d.power?.idle.includes(m.id)} />)}
          </div>
          {l && (
            <div className={`flex items-center gap-1.5 border-2 border-bk-line bg-bk-bg px-2 py-1 shadow-[2px_2px_0_rgb(0_0_0/.55)] ${l.known ? "" : "opacity-55 grayscale"}`}
              title={!l.known ? "Stealth's data is stale or missing, so the GPU lease is unknown" : l.free ? "Nobody holds Stealth's GPU" : `Stealth's GPU lease: ${l.holder ?? "unknown holder"} for ${l.mins ?? "?"} min`}>
              <span aria-hidden>📼</span>
              {!l.known ? <span>GPU lease unknown</span> : l.free ? <span>GPU free</span>
                : <span>GPU held{l.holder && <> by <b className="text-bk-warn">{l.holder}</b> · {l.mins} min</>}{l.queue ? ` · ${l.queue} waiting` : ""}</span>}
            </div>
          )}
        </div>
      </Frame>
    );
  },
});
