import { useState, type ReactNode } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";
import { gl } from "../_shared/Glyph";

// Old Beacon "mesh": Util-Mesh machines (status dot + name), load per host, the overnight digest and recent alerts.
// Sections are headed by a glyph only (words in the tooltip). A small card shows details only on rows that need eyes.
const Machine = z.object({ name: z.string(), level: z.enum(["", "warn", "bad"]).default(""), down: z.array(z.string()).default([]), checks: z.number().default(1), recovered: z.string().optional() });
const Load = z.object({ load1: z.number(), cpus: z.number().default(1), free_mb: z.number(), vram_free_mb: z.number().nullable().optional(), gpu_lease: z.string().optional(), gpu_waiting: z.number().optional() });
const Data = z.object({
  machines: z.array(Machine),
  harbor: z.object({ at: z.string(), down: z.string() }).optional(),
  load: z.record(z.string(), Load).default({}),
  overnight: z.object({ state: z.string().optional(), result: z.string().optional(), start: z.string().optional(), end: z.string().optional(),
    fails: z.array(z.string()).optional(), sync: z.array(z.string()).optional() }).default({}),
  alerts: z.array(z.object({ at: z.string(), source: z.string(), text: z.string(), action: z.string().optional() })).default([]),
});
type Lv = "" | "warn" | "bad";
const NAME: Record<string, string> = { envy: "Envy", legion: "Legion", stealth: "Stealth", moby: "Moby", harbor: "Harbor" };
const DOT = { "": "bg-bk-ok", warn: "bg-bk-warn", bad: "bg-bk-danger" } as const;
const gb = (mb?: number | null) => mb == null ? "–" : (mb / 1024).toFixed(1) + " GB", gg = (mb?: number | null) => mb == null ? "–" : (mb / 1024).toFixed(1) + "G";

export const Mesh = defineWidget({
  type: "mesh", family: "data", title: "Mesh",
  options: z.object({ label: z.string().default("Mesh"), icon: z.string().default("host") }),
  data: Data,
  size: { min: [2, 2], default: [3, 4], max: [6, 4] },
  render: function MeshView({ options, data: d, state, size }) {
    const [big, setBig] = useState(false);
    const [picked, setPicked] = useState<string | null>(null);   // old card posted the tapped row to the brain; here it is local selection
    const compact = size[0] < 4;
    const H4 = (g: string, tip: string) => <h4 title={tip} aria-label={tip} className="mb-1 text-[14px] leading-[1.2]"><span aria-hidden>{gl(g)}</span></h4>;
    const Mx = ({ children }: { children: ReactNode }) => <div className="text-[12px] text-bk-muted">{children}</div>;
    const row = (lvl: Lv, tap: string, head: ReactNode, sub: ReactNode, title?: string) => (
      <button type="button" key={tap} title={title} aria-pressed={picked === tap} onClick={() => setPicked(picked === tap ? null : tap)}
        className={`flex w-full items-baseline gap-2 rounded-md ${compact ? "p-0.5" : "px-1 py-[3px]"} text-left hover:bg-bk-raise focus-visible:outline-2 focus-visible:outline-bk-accent ${picked === tap ? "bg-bk-raise" : ""}`}>
        <span className={`mt-[.3em] size-2.5 flex-none self-start rounded-full ${DOT[lvl]}`} />
        <span className="min-w-0 break-words"><b className={lvl === "bad" ? "text-bk-danger" : "text-bk-fg"}>{head}</b>
          {sub && !(compact && !lvl) && <Mx>{sub}</Mx>}</span>
      </button>);
    const st = state === "ready" && !d ? "empty" : state;
    let body: ReactNode = null;
    if (d) {
      const o = d.overnight ?? {}, ok = o.result === "success" && !o.fails?.length, running = o.state === "activating";
      body = (
        <div className="grid h-full content-start gap-1.5 overflow-auto text-[13px] font-medium leading-[1.35] [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          <section className="min-w-0 px-0.5 py-1">{H4("host", "Machines")}
            {d.machines.map((m) => { const n = NAME[m.name] ?? m.name;
              return row(m.level ?? "", `${n} ${m.down.length ? "down: " + m.down.join(", ") : "up"}`,
                <>{n} {m.down.length ? "· " + (m.down.length === m.checks ? "down" : `${m.down.length} of ${m.checks} down`) : ""}</>,
                [...m.down, m.recovered ? "auto-restart " + m.recovered : ""].filter(Boolean).map((t, i) => <div key={i}>{t}</div>)); })}
            {d.harbor && !compact && <Mx>Harbor's off-site check {d.harbor.at}: down {d.harbor.down}</Mx>}
          </section>
          <section className="min-w-0 px-0.5 py-1">{H4("gauge", "Load")}
            {Object.entries(d.load ?? {}).map(([h, l]) => { const lc = l.load1 / (l.cpus || 1), n = NAME[h] ?? h;
              const lvl: Lv = lc >= 1.5 || l.free_mb < 1500 ? "bad" : lc >= 1 || l.free_mb < 3000 ? "warn" : "";
              const pct = Math.round(Math.max(Math.min(lc / 2, 1), Math.min(Math.max((6000 - l.free_mb) / 4500, 0), 1)) * 100);
              return row(lvl, `${n} load`, <>{n} · {lc.toFixed(1)}/core
                <div className="mt-0.5 h-1 w-full rounded-full bg-bk-raise"><i className={`block h-full rounded-full ${DOT[lvl].split(" ")[0]}`} style={{ width: `${pct}%` }} /></div></>,
                <>💾 {gg(l.free_mb)}{l.vram_free_mb != null && <> · 📟 {gg(l.vram_free_mb)}</>}{l.gpu_lease && <> · 📟 {l.gpu_lease}{l.gpu_waiting ? <> ⏳ {l.gpu_waiting}</> : null}</>}</>,
                `${lc.toFixed(1)} load per core · RAM free ${gb(l.free_mb)}${l.vram_free_mb != null ? ` · VRAM free ${gb(l.vram_free_mb)}` : ""}${l.gpu_lease ? ` · GPU: ${l.gpu_lease}` : ""}`); })}
            {!Object.keys(d.load ?? {}).length && !compact && <Mx>No load table</Mx>}
          </section>
          <section className="min-w-0 px-0.5 py-1">{H4("🌙", "Overnight")}
            {row(running ? "warn" : ok ? "" : "bad", "overnight digest " + (running ? "running" : o.result), <>Digest {running ? "running" : o.result || "?"}</>,
              <>{o.start && <>🕒 {o.start}</>}{o.end && <> · ✅ {o.end}</>}{(o.fails ?? []).map((f, i) => <div key={i}>⚠️ {f}</div>)}</>)}
            {!compact && (o.sync ?? []).map((s, i) => <Mx key={i}>{s}</Mx>)}
          </section>
          <section className="min-w-0 px-0.5 py-1">{H4("⚠️", "Recent alerts")}
            {d.alerts.length ? d.alerts.map((a) => row(a.action === "muted" ? "warn" : /🔴|DOWN|fail/i.test(a.text) ? "bad" : "", `alert ${a.source}: ${a.text}`,
              <>{a.at} · {a.source}{a.action === "muted" ? " (muted)" : ""}</>, a.text)) : !compact && <Mx>None</Mx>}
          </section>
        </div>);
    }
    return (
      <Frame title={options.label ?? "Mesh"} icon={options.icon ?? "host"} empty="Reading the mesh…" state={st}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {body}
      </Frame>
    );
  },
});
