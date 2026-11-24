import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "spotify": art beside the track, a seek bar, a transport row (↺15 ⏮ Play ⏭ 15↻), "Play on" device select and volume.
// When Spotify answers with an error (not set up, rate limited) the card shows the message and a "Try again" button.
const nowSchema = z.object({
  error: z.string().optional(),
  retryIn: z.number().optional(),            // seconds until a rate limit lifts
  track: z.string().optional(), artist: z.string().optional(), album: z.string().optional(), art: z.string().optional(),
  playing: z.boolean().default(false), progress: z.number().default(0), duration: z.number().default(0),   // ms
  device: z.string().optional(), devices: z.array(z.string()).default([]), groups: z.array(z.string()).default([]),
  volume: z.number().min(0).max(100).optional(), canVolume: z.boolean().default(true),
});
export type SpotifyNow = z.infer<typeof nowSchema>;

const t = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
const btn = "grid min-h-11 min-w-12 place-items-center rounded-lg border border-bk-line bg-bk-bg px-2 text-bk-fg hover:bg-bk-raise focus-visible:outline-2 focus-visible:outline-bk-accent disabled:opacity-50";

export const Spotify = defineWidget({
  type: "spotify", family: "media", title: "Spotify",
  options: z.object({ label: z.string().default("Spotify"), icon: z.string().optional() }),
  data: nowSchema,
  size: { min: [1, 1], default: [2, 2], max: [3, 3] },
  render: function SpotifyView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const [over, setOver] = useState<Partial<SpotifyNow>>({});   // local optimistic changes (play/pause, seek, device, volume)
    const [retried, setRetried] = useState(0);
    const [msg, setMsg] = useState("");
    const st = state === "ready" && !data ? "empty" : state;
    const sp = data ? { ...data, ...over } : undefined;
    const set = (p: Partial<SpotifyNow>, m = "") => { setOver((o) => ({ ...o, ...p })); setMsg(m); };
    let body = null;
    if (sp?.error) {
      body = (
        <div className="grid items-center gap-x-3.5 gap-y-2.5 text-left" style={{ gridTemplateColumns: "clamp(76px, 34%, 150px) 1fr" }}>
          <div className="text-[13px] leading-snug text-bk-muted" role="status">{retried ? "Asking Spotify…" : sp.error}</div>
          <button type="button" className={`${btn} !min-h-9 font-semibold`} onClick={() => setRetried((n) => n + 1)}>Try again</button>
        </div>);
    } else if (sp) {
      const vol = sp.device && sp.canVolume !== false, v = sp.volume ?? 0;
      const seek = (ms: number) => set({ progress: Math.max(0, Math.min(sp.duration, ms)) });
      const singles = sp.devices.filter((d) => !sp.groups.includes(d));
      body = (
        <div className="grid items-center gap-x-3.5 gap-y-2.5 text-left [container-type:inline-size]" style={{ gridTemplateColumns: "clamp(76px, 34%, 150px) 1fr" }}>
          {sp.art && <img src={sp.art} alt={`${sp.album ?? ""} cover`} className="aspect-square w-full rounded object-cover" referrerPolicy="no-referrer" />}
          <div className={`min-w-0 ${sp.art ? "" : "col-span-2"}`}>
            {sp.track ? <><b className="text-lg">{sp.track}</b><div className="line-clamp-2 text-[13px] text-bk-muted">{sp.artist}{sp.album ? ` · ${sp.album}` : ""}</div></>
              : <span className="text-bk-muted">Nothing playing</span>}
          </div>
          {sp.duration > 0 && <div className="col-span-2 flex items-center gap-2">
            <output className="min-w-[2.6em] text-sm tabular-nums opacity-85">{t(sp.progress)}</output>
            <input type="range" min={0} max={sp.duration} step={1000} value={sp.progress} aria-label="Song position" className="min-w-0 flex-1 accent-bk-accent"
              onChange={(e) => seek(+e.target.value)} />
            <output className="min-w-[2.6em] text-sm tabular-nums opacity-85">{t(sp.duration)}</output>
          </div>}
          <div className="col-span-2 flex items-center gap-1.5">
            <button type="button" className={`${btn} whitespace-nowrap text-sm tabular-nums`} aria-label="Back 15 seconds" onClick={() => seek(sp.progress - 15000)}>↺ 15</button>
            <button type="button" className={`${btn} text-xl`} aria-label="Previous" onClick={() => set({ progress: 0 }, "Previous track.")}>⏮</button>
            <button type="button" className={`${btn} min-w-0 flex-1 whitespace-nowrap text-xl`} aria-label={sp.playing ? "Pause" : "Play"} aria-pressed={sp.playing}
              onClick={() => set({ playing: !sp.playing }, sp.playing ? "Paused." : "Playing.")}>
              {sp.playing ? "⏸" : "▶"} <span className="text-base max-[340px]:hidden">{sp.playing ? "Pause" : "Play"}</span></button>
            <button type="button" className={`${btn} text-xl`} aria-label="Next" onClick={() => set({ progress: 0 }, "Next track.")}>⏭</button>
            <button type="button" className={`${btn} whitespace-nowrap text-sm tabular-nums`} aria-label="Forward 15 seconds" onClick={() => seek(sp.progress + 15000)}>15 ↻</button>
          </div>
          <div className="col-span-2 grid items-center gap-2.5" style={{ gridTemplateColumns: "auto minmax(0,1fr)" }}>
            <span className="text-[13px] text-bk-muted">Play on</span>
            <select aria-label="Play on" value={sp.device ?? "None"} onChange={(e) => set({ device: e.target.value }, `Moved to ${e.target.value}.`)}
              className="w-full rounded-lg border border-bk-line bg-bk-bg px-2 py-1.5 text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">
              {!sp.device && <option>None</option>}
              {sp.groups.length ? <><optgroup label="Speaker groups">{sp.groups.map((d) => <option key={d}>{d}</option>)}</optgroup>
                <optgroup label="Single speakers">{singles.map((d) => <option key={d}>{d}</option>)}</optgroup></> : singles.map((d) => <option key={d}>{d}</option>)}
            </select>
            {vol && <><span className="text-bk-muted" title="Volume" aria-hidden>🔊</span>
              <span className="flex items-center gap-2">
                <button type="button" className={`${btn} min-h-10 min-w-10 text-sm`} aria-label="Volume down" onClick={() => set({ volume: Math.max(0, v - 5) })}>▼</button>
                <input type="range" min={0} max={100} value={v} aria-label="Volume" className="min-w-0 flex-1 accent-bk-accent" onChange={(e) => set({ volume: +e.target.value })} />
                <button type="button" className={`${btn} min-h-10 min-w-10 text-sm`} aria-label="Volume up" onClick={() => set({ volume: Math.min(100, v + 5) })}>▲</button>
                <output className="w-[2.2em] text-right tabular-nums">{v}</output>
              </span></>}
          </div>
          {msg && <div className="col-span-2 text-[13px] text-bk-muted" role="status">{msg}</div>}
        </div>);
    }
    return (
      <Frame className="!p-3" title={options.label ?? "Spotify"} icon={options.icon ?? "volume"} state={st} empty="Asking Spotify…"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {body}
      </Frame>
    );
  },
});
