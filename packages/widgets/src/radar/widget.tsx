import { useEffect, useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "radar": rain loop over a map with Rain/Clouds/Map/Names layer chips, +/−/⌂ zoom tools,
// a caption ("No rain on the radar"), and a play button + time scrubber ending at "now".
// Layers are image URLs (the host fetches tiles); this widget only stacks, toggles, zooms and loops them.
const Layer = z.enum(["rain", "clouds", "map", "labels"]);
const frame = z.object({ t: z.string().describe("ISO time"), rain: z.string().optional(), clouds: z.string().optional() });

export const Radar = defineWidget({
  type: "radar", family: "2d", title: "Radar",
  options: z.object({ label: z.string().default("Radar"), icon: z.string().optional(),
    zoom: z.number().int().min(5).max(9).default(7), stepMs: z.number().default(450) }),
  data: z.object({ base: z.string().optional(), labels: z.string().optional(), clouds: z.string().optional(),
    frames: z.array(frame).default([]), note: z.string().optional(), error: z.string().optional() }),
  size: { min: [3, 3], default: [3, 4], max: [8, 6] },
  render: ({ options, data, state }) => {
    const home = options.zoom ?? 7;
    const [off, setOff] = useState<Record<z.infer<typeof Layer>, boolean>>({ rain: false, clouds: false, map: false, labels: false });
    const [z0, setZ] = useState(home);
    const [play, setPlay] = useState(true);
    const [i, setI] = useState(0);
    const [big, setBig] = useState(false);
    const fr = data?.frames ?? [], n = fr.length;
    useEffect(() => { setI(n ? n - 1 : 0); }, [n]);
    useEffect(() => {
      if (!play || n < 2) return;
      let k = i; const id = setInterval(() => { k = (k + 1) % (n + 3); setI(Math.min(k, n - 1)); }, options.stepMs ?? 450);
      return () => clearInterval(id);
    }, [play, n]); // eslint-disable-line react-hooks/exhaustive-deps
    const f = fr[Math.min(i, n - 1)];
    const time = (s: string) => new Date(s).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const caption = data?.error ?? (f ? "" : data?.note ?? "No rain on the radar");
    const scale = 2 ** (z0 - home);
    const rb = "min-h-[30px] min-w-[30px] rounded-[7px] border border-bk-fg/20 bg-bk-bg/60 px-2 py-0.5 text-[0.8em] text-bk-fg hover:bg-bk-bg/80 hover:border-bk-warn focus-visible:border-bk-warn focus-visible:outline-none";
    const img = (src: string | undefined, alt: string, cls = "") => src ? <img src={src} alt={alt} draggable={false} className={`absolute inset-0 h-full w-full object-cover ${cls}`} /> : null;
    return (
      <Frame title={options.label ?? "Radar"} icon={options.icon ?? "radar"} state={state === "ready" && !data ? "empty" : state} empty="Loading…"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <div className="flex h-full flex-col">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-bk-bg">
            <div className="absolute inset-0 transition-transform" style={{ transform: `scale(${scale})` }}>
              {!off.map && img(data?.base, "Base map")}
              {!off.clouds && img(f?.clouds ?? data?.clouds, "Clouds")}
              {!off.rain && img(f?.rain, "Rain", "drop-shadow-[1.5px_2.5px_2.5px_rgb(0_0_0/0.85)]")}
              {!off.labels && img(data?.labels, "Place names", "opacity-70")}
            </div>
            <span aria-hidden className="absolute left-1/2 top-1/2 size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-bk-bg bg-bk-warn" />
            <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-52px)] flex-wrap gap-1">
              {([["rain", "Rain"], ["clouds", "Clouds"], ["map", "Map"], ["labels", "Names"]] as const).map(([k, l]) =>
                <button key={k} type="button" aria-pressed={!off[k]} title={`Show or hide the ${l.toLowerCase()} layer`}
                  onClick={() => setOff({ ...off, [k]: !off[k] })} className={`${rb} ${off[k] ? "line-through opacity-45" : ""}`}>{l}</button>)}
            </div>
            <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">
              <button type="button" className={rb} aria-label="Zoom in" title="Zoom in" onClick={() => setZ(Math.min(9, z0 + 1))}>+</button>
              <button type="button" className={rb} aria-label="Zoom out" title="Zoom out" onClick={() => setZ(Math.max(5, z0 - 1))}>−</button>
              <button type="button" className={rb} aria-label="Reset view" title="Back to the home view" onClick={() => setZ(home)}>⌂</button>
            </div>
            {caption && <span role="status" className="absolute bottom-2 left-2 rounded-md bg-bk-bg/60 px-[7px] py-0.5 text-[0.8em] tabular-nums text-bk-fg">{caption}</span>}
          </div>
          <div className="relative mt-1.5 flex items-center gap-2 pt-4">
            {f && <span className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-[5px] bg-bk-bg/60 px-1.5 py-px text-[0.72em] tabular-nums"
              style={{ left: `calc(46px + (100% - 100px) * ${n > 1 ? i / (n - 1) : 1})` }}>{time(f.t)}{i === n - 1 ? " · now" : ""}</span>}
            <button type="button" className={rb} aria-label="Play or pause" aria-pressed={play} title="Play or pause the loop" onClick={() => setPlay(!play)}>{play ? "⏸" : "▶"}</button>
            <span className="whitespace-nowrap text-[0.72em] tabular-nums opacity-70">{n ? time(fr[0].t) : ""}</span>
            <input type="range" min={0} max={Math.max(0, n - 1)} value={Math.min(i, Math.max(0, n - 1))} aria-label="Radar time"
              title="Drag to scrub through time: oldest on the left, now on the right"
              onChange={(e) => { setPlay(false); setI(+e.target.value); }} className="h-6 min-w-0 flex-1 accent-bk-warn" />
            <span className="whitespace-nowrap text-[0.72em] tabular-nums opacity-70">now</span>
          </div>
        </div>
      </Frame>
    );
  },
});
