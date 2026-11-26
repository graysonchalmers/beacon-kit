import { useState, type ReactNode } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";
import { gl } from "../_shared/Glyph";

// Old Beacon "quotas" (Tokens and quotas): auto-offload level pips, plan quota bars, Gemini API bars,
// per-backend token sparklines (last 24 h) and local models. Read-only like the old card: every part has a tooltip.
const Lvl = z.enum(["", "warn", "bad"]).default("");
const Plan = z.object({ label: z.string(), pct: z.number().nullable(), text: z.string(), left: z.string().default(""), resets: z.string().optional(), level: Lvl });
const Backend = z.object({ name: z.string(), enabled: z.boolean().default(true), tps: z.number().nullable().default(null), tok24: z.number().nullable().default(null),
  tok: z.array(z.number()), ok: z.number().default(0), fail: z.number().default(0) });
const Data = z.object({
  deck: z.boolean(),                                   // false: "Offload deck not answering"
  levels: z.array(z.string()), auto: z.string().nullable().default(null),
  plans: z.array(Plan).default([]),
  opencode: z.object({ paused: z.boolean(), fails: z.number(), note: z.string() }).optional(),
  gemini: z.object({ free_used: z.number().nullable(), free_cap: z.number(), paid_usd: z.number().nullable(), daily_usd: z.number() }),
  backends: z.array(Backend).default([]),
  gpu: z.object({ lease: z.string().nullable().optional() }).default({}),
  ollama: z.array(z.object({ name: z.string(), gb: z.number(), vram_gb: z.number() })).nullable(),   // null: not answering
});
type L = z.infer<typeof Lvl>;
const BAR: Record<string, string> = { "": "bg-bk-ok", warn: "bg-bk-warn", bad: "bg-bk-danger" };
const qk = (n: number | null | undefined) => n == null ? "–" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n);
const lvlOf = (p: number | null) => (p == null ? "" : p >= 85 ? "bad" : p >= 60 ? "warn" : "") as L;
const META = "text-[12px] leading-[1.35]";

function Head({ g, t, tip }: { g: string; t: string; tip: string }) {
  return <h4 title={tip} className="mb-0.5 flex items-center gap-1.5 text-[14px] leading-[1.25] font-bold text-bk-fg"><span aria-hidden className="text-[13px]">{gl(g)}</span><span>{t}</span></h4>;
}
function Row({ lvl, name, pct, val, tip, mid }: { lvl: L; name: string; pct?: number | null; val: string; tip: string; mid?: ReactNode }) {
  return (
    <div title={tip} className={`grid items-center gap-2 py-0.5 ${META} [grid-template-columns:minmax(84px,1.1fr)_3fr_104px]`}>
      <b className="truncate font-semibold">{name}</b>
      {mid ?? <div role="meter" aria-label={name} aria-valuenow={pct ?? 0} aria-valuemin={0} aria-valuemax={100} className="h-2 bg-bk-bg shadow-[inset_0_0_0_1px_var(--bk-line)]">
        <i className={`block h-full ${BAR[lvl]}`} style={{ width: `${Math.max(0, Math.min(100, pct ?? 0))}%` }} /></div>}
      <span className="whitespace-nowrap text-right tabular-nums">{val}</span>
    </div>
  );
}
function Spark({ tok, tip }: { tok: number[]; tip: string }) {
  const mx = Math.max(...tok, 1);
  return <svg viewBox="0 0 96 22" preserveAspectRatio="none" role="img" aria-label={tip} className="block h-[22px] w-full"><title>{tip}</title>
    {tok.map((v, i) => { const h = Math.max(v ? 1.5 : 0.5, (v / mx) * 22); return <rect key={i} x={i * 4} width={3} y={22 - h} height={h} opacity={v ? 1 : 0.25} fill="var(--bk-ok)" />; })}</svg>;
}

export const Quotas = defineWidget({
  type: "quotas", family: "data", title: "Tokens and quotas",
  options: z.object({ label: z.string().default("Tokens and quotas"), icon: z.string().default("gauge") }),
  data: Data,
  size: { min: [2, 2], default: [3, 4], max: [6, 4] },
  render: function QuotasView({ options, data: d, state }) {
    const [big, setBig] = useState(false);
    const g = d?.gemini, fp = g?.free_used == null ? null : Math.round((g.free_used / g.free_cap) * 100), pp = g?.paid_usd == null ? null : Math.round((g.paid_usd / g.daily_usd) * 100);
    return (
      <Frame title={options.label ?? "Tokens and quotas"} icon={options.icon ?? "gauge"} empty="Reading the quotas…"
        state={state === "ready" && !d ? "empty" : state}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {d && <div className="-mt-1 h-full overflow-auto text-bk-fg">
          {!d.deck && <div className={`${META} text-bk-fg/80`} title="The offload control deck did not answer, so token and level numbers are missing">Offload deck not answering</div>}
          <section className="mb-1.5 min-w-0">
            <Head g="gauge" t="Auto-offload" tip="Auto-offload level" />
            <div role="list" aria-label="Auto-offload level" title="Auto-offload level: how hard sessions are pushed to cheaper channels. Set on the offload control deck." className="flex gap-1">
              {d.levels.map((l) => { const on = l === d.auto; return (
                <span role="listitem" key={l} aria-current={on || undefined} title={on ? `Current level: ${l}` : `Level ${l} (not active)`}
                  className={`flex-1 py-[3px] text-center ${META} uppercase tracking-[.06em] ${on ? "bg-bk-ok/35 shadow-[inset_0_0_0_1px_var(--bk-ok)]" : "bg-bk-bg opacity-55"}`}>{l}</span>); })}
            </div>
          </section>
          <section className="mb-1.5 min-w-0">
            <Head g="✳️" t="Plan quotas" tip="How much of each plan window is used" />
            {d.plans.length ? d.plans.map((p) => <Row key={p.label} lvl={p.level ?? ""} name={p.label} pct={p.pct} val={p.pct == null ? p.text : p.pct + "%"}
              tip={`${p.label}: ${p.text}, ${p.left}${p.resets ? ", resets " + p.resets : ""}`} />) : <div className={`${META} text-bk-fg/80`}>No usage data</div>}
            {d.opencode && <div title={d.opencode.note} className={`${META} ${d.opencode.paused ? "text-bk-fg/80" : "opacity-55"}`}>⚠️ OpenCode {d.opencode.paused ? "paused: free limit reached" : "ok"} ({d.opencode.fails} failed calls ever)</div>}
          </section>
          <section className="mb-1.5 min-w-0">
            <Head g="⚠️" t="Gemini API" tip="Gemini API free calls and paid spend today" />
            <Row lvl={lvlOf(fp)} name="Free key calls" pct={fp} val={g?.free_used == null ? "–" : `${g.free_used} / ${g.free_cap}`}
              tip={`Gemini API free key: ${g?.free_used ?? "unknown"} of ${g?.free_cap} calls today (Google's day, midnight Pacific)`} />
            <Row lvl={lvlOf(pp)} name="Paid spend" pct={pp} val={g?.paid_usd == null ? "n/a" : `$${g.paid_usd.toFixed(2)} / $${g.daily_usd.toFixed(2)}`}
              tip={g?.paid_usd == null ? "The offload budget file is not written yet, so the paid estimate is unknown" : `Estimated paid Gemini spend today against the $${g.daily_usd.toFixed(2)} a day ceiling`} />
          </section>
          <section className="mb-1.5 min-w-0">
            <Head g="☰" t="Tokens, last 24 h" tip="Tokens per hour per backend over the last 24 hours, with 14-day tokens per second" />
            {d.backends.length ? d.backends.map((b) => <div key={b.name} className={b.enabled === false ? "opacity-55" : ""}>
              <Row lvl="" name={b.name} val={`${b.tps != null ? b.tps + " t/s" : "–"} · ${qk(b.tok24)}`}
                tip={`${b.name}: ${b.tps ?? "no"} tokens/s (14-day weighted), ${qk(b.tok24)} tokens in 24 h, ${b.ok} ok / ${b.fail} failed calls`}
                mid={<Spark tok={b.tok} tip={`${b.name}: tokens per hour over the last 24 hours, peak ${qk(Math.max(...b.tok))}`} />} /></div>)
              : <div className={`${META} text-bk-fg/80`}>No deck data</div>}
          </section>
          <section className="mb-1.5 min-w-0">
            <Head g="📟" t="Local models" tip="Stealth GPU lease and loaded Ollama models" />
            <div className={`${META} text-bk-fg/80`} title="Who holds the Stealth GPU lease (stealth-gpu --status)"><span aria-hidden>📟</span> GPU lease: <b>{d.gpu?.lease || "unknown"}</b></div>
            {d.ollama == null ? <div className={`${META} text-bk-fg/80`} title="Stealth Ollama did not answer">Ollama: not answering</div>
              : d.ollama.length ? d.ollama.map((m) => <div key={m.name} className={`${META} text-bk-fg/80`} title={`${m.name}: ${m.gb} GB loaded, ${m.vram_gb} GB in VRAM`}>💾 {m.name} · {m.vram_gb} GB VRAM</div>)
              : <div className={`${META} opacity-55`} title="Ollama has no model in memory right now">Ollama: nothing loaded</div>}
          </section>
        </div>}
      </Frame>
    );
  },
});
