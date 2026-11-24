import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "iso" (Agents & Machines frogs): one island per machine, one figure per job. Drawn as flat SVG in skin tokens.
const Job = z.object({ id: z.string(), say: z.string().optional(), mood: z.enum(["idle", "work", "think", "sad", "sleep"]).default("idle") });
const Machine = z.object({ id: z.string(), name: z.string(), up: z.boolean().default(true), jobs: z.array(Job).default([]) });
const moodFill = { idle: "var(--bk-ok)", work: "var(--bk-accent)", think: "var(--bk-warn)", sad: "var(--bk-danger)", sleep: "var(--bk-muted)" } as const;

function Island({ m }: { m: z.infer<typeof Machine> }) {
  return (
    <figure className="flex flex-col items-center gap-1" aria-label={`${m.name}: ${m.up ? `${m.jobs.length} jobs` : "offline"}`}>
      <svg viewBox="0 0 120 70" className="w-full max-w-36">
        <polygon points="60,20 115,45 60,68 5,45" fill={m.up ? "var(--bk-raise)" : "var(--bk-card)"} stroke="var(--bk-line)" strokeWidth="2" />
        {m.jobs.slice(0, 6).map((j, i) => {
          const x = 35 + (i % 3) * 25, y = 38 + Math.floor(i / 3) * 12;
          return <g key={j.id}><title>{j.say ?? j.mood}</title><ellipse cx={x} cy={y} rx="8" ry="6" fill={moodFill[j.mood]} />
            <circle cx={x - 3} cy={y - 5} r="2" fill="var(--bk-fg)" /><circle cx={x + 3} cy={y - 5} r="2" fill="var(--bk-fg)" /></g>;
        })}
      </svg>
      <figcaption className={`text-xs ${m.up ? "text-bk-fg" : "text-bk-muted line-through"}`}>{m.name}</figcaption>
    </figure>
  );
}

export const IsoScene = defineWidget({
  type: "iso-scene", family: "2d", title: "Agents & machines",
  options: z.object({ label: z.string() }),
  data: z.object({ machines: z.array(Machine) }),
  size: { min: [3, 2], default: [6, 3], max: [12, 6] },
  render: ({ options, data, state }) => {
    const ms = data?.machines ?? [];
    return <Frame title={options.label} state={state === "ready" && !ms.length ? "empty" : state} empty="No machines">
      <div className="grid h-full grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] items-center gap-2 overflow-auto">{ms.map((m) => <Island key={m.id} m={m} />)}</div></Frame>;
  },
});
