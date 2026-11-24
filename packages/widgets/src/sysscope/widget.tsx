import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "sysscope": the screensaver's probe rows (weather, alerts, temp, claude, queue, build, stealth, legion).
// Each row: a level stripe on the left, glyph + name, a big reading (+ trend), a small line and optional detail lines.
const Level = z.enum(["ok", "warn", "bad"]);
const Probe = z.object({
  key: z.string(),                       // probe key, picks the glyph: weather alerts temp claude queue build stealth legion
  name: z.string().optional(),           // defaults from key
  big: z.string(), trend: z.enum(["▲", "▼"]).optional(),
  small: z.string().optional(), lines: z.array(z.string()).default([]), level: Level.default("ok"),
});
const NAMES: Record<string, string> = { weather: "Weather", alerts: "Alerts", temp: "Temp", claude: "Claude", queue: "Queue", build: "Build", stealth: "Stealth", legion: "Legion" };
const GLYPH: Record<string, string> = { weather: "☁️", alerts: "⚠️", temp: "🌡️", claude: "✳️", queue: "☰", build: "🔨", stealth: "📟", legion: "🖥️" };
const STRIPE = { ok: "border-l-bk-ok", warn: "border-l-bk-warn", bad: "border-l-bk-danger" } as const;
const LEAD: [RegExp, string][] = [[/^⚠ /, "⚠️ "], [/^mail: /, "✉️ "], [/^cal(?:endar)?: /, "📅 "], [/^wx: /, "⚠️ "]];
const lead = (l: string) => { for (const [re, g] of LEAD) if (re.test(l)) return g + l.replace(re, ""); return l; };

export const SysScope = defineWidget({
  type: "sysscope", family: "data", title: "SysScope",
  options: z.object({ label: z.string().default("Envy"), icon: z.string().default("🖥️") }),
  data: z.object({ rows: z.array(Probe) }),
  size: { min: [2, 2], default: [3, 6], max: [4, 4] },
  render: function SysScopeView({ options, data, state, size }) {
    const [big, setBig] = useState(false);
    const rows = data?.rows ?? [];
    const showName = size[0] >= 4;   // narrow card: glyph only, the name lives in the tooltip (as the old card)
    return (
      <Frame title={options.label ?? "Envy"} icon={options.icon ?? "🖥️"} empty="Reading the probes…"
        state={state === "ready" && rows.length === 0 ? "empty" : state}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <ul className="grid h-full content-start gap-2 overflow-auto [mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)] pb-6 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
          {rows.map((r) => {
            const name = r.name ?? NAMES[r.key] ?? r.key;
            return (
              <li key={r.key} tabIndex={0} aria-label={`${name}: ${r.big}${r.small ? ", " + r.small : ""}`}
                className={`min-w-0 border-l-4 px-2.5 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-bk-accent ${STRIPE[r.level ?? "ok"]}`}>
                <div title={name} className="text-[11px] font-semibold uppercase leading-[1.2] tracking-[.08em] text-bk-muted">
                  <span aria-hidden>{GLYPH[r.key] ?? "•"}</span>{showName && <span className="ml-1">{name}</span>}
                </div>
                <div className="text-[26px] font-bold leading-[1.15] tabular-nums text-bk-fg">{r.big}
                  {r.trend && <span title={r.trend === "▲" ? "rising" : "falling"} className="ml-1 align-middle text-[.55em] text-bk-muted">{r.trend}</span>}</div>
                {r.small && <div className="break-words text-[13px] font-medium leading-[1.3] text-bk-fg/85">{r.small}</div>}
                {(r.lines ?? []).map((l, i) => <div key={i} className="mt-0.5 break-words text-[13px] font-medium leading-[1.3] text-bk-muted">{lead(l)}</div>)}
              </li>
            );
          })}
        </ul>
      </Frame>
    );
  },
});
