import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "spotify": now playing, seek, transport, speaker pick. Controls call onAction-free intents; a host wires them in fetch.
const btn = "rounded-[var(--bk-radius)] bg-bk-raise px-3 py-1.5 text-bk-fg hover:bg-bk-accent hover:text-bk-on-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent";
const t = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

function Body({ d, wide }: { d: z.infer<typeof Data>; wide: boolean }) {
  const [playing, setPlaying] = useState(d.playing);
  const [pos, setPos] = useState(d.position ?? 0);
  return (
    <div className="flex h-full flex-col gap-2 text-sm">
      <div className="flex items-center gap-3">
        {d.art && wide && <img src={d.art} alt={`${d.album ?? d.track} cover`} className="size-14 rounded-[var(--bk-radius)] object-cover" />}
        <div className="min-w-0">{d.track ? <><b className="block truncate text-bk-fg">{d.track}</b><span className="block truncate text-bk-muted">{d.artist}{d.album ? ` · ${d.album}` : ""}</span></> : <span className="text-bk-muted">Nothing playing</span>}</div>
      </div>
      {d.duration ? <div className="flex items-center gap-2 text-xs text-bk-muted"><span>{t(pos)}</span>
        <input type="range" min={0} max={d.duration} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Song position" className="flex-1 accent-[var(--bk-accent)]" /><span>{t(d.duration)}</span></div> : null}
      <div className="flex gap-2">
        <button type="button" className={btn} aria-label="Previous">⏮</button>
        <button type="button" className={btn} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"}</button>
        <button type="button" className={btn} aria-label="Next">⏭</button>
      </div>
      {d.devices.length > 0 && <label className="flex items-center gap-2 text-xs text-bk-muted">Play on
        <select defaultValue={d.device} className="flex-1 rounded-[var(--bk-radius)] border border-bk-line bg-bk-raise p-1 text-bk-fg">{d.devices.map((x) => <option key={x}>{x}</option>)}</select></label>}
    </div>
  );
}
const Data = z.object({ track: z.string().optional(), artist: z.string().optional(), album: z.string().optional(), art: z.string().optional(),
  playing: z.boolean().default(false), position: z.number().optional(), duration: z.number().optional(), device: z.string().optional(), devices: z.array(z.string()).default([]) });

export const Player = defineWidget({
  type: "player", family: "media", title: "Music player",
  options: z.object({ label: z.string() }), data: Data,
  size: { min: [2, 2], default: [3, 3], max: [4, 4] },
  render: ({ options, data, state, size }) => (
    <Frame title={options.label} state={state === "ready" && !data ? "empty" : state} empty="Nothing playing">{data && <Body d={data} wide={size[0] >= 3} />}</Frame>
  ),
});
