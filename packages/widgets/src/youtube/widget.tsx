import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "ytplaylists": a search box, a grid of playlist tiles (16:9 thumb, title, "n videos") and a footer note.
// A tile opens the playlist (← Playlists bar + video rows); a video row plays it in an embedded player above the list.
const video = z.object({ id: z.string(), title: z.string(), channel: z.string().default(""), thumb: z.string().optional(), private: z.boolean().optional() });
const playlist = z.object({ id: z.string(), title: z.string(), count: z.number(), thumb: z.string(), videos: z.array(video).optional() });

const tile = "box-border cursor-pointer rounded-lg text-left text-bk-fg hover:bg-bk-raise focus-visible:outline-2 focus-visible:outline-bk-accent";
const sub = "text-[13px] text-bk-muted";
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const hit = (title: string, q: string[]) => q.every((w) => title.toLowerCase().includes(w));

export const YouTube = defineWidget({
  type: "youtube", family: "media", title: "YouTube",
  options: z.object({ label: z.string().default("YouTube"), icon: z.string().optional() }),
  data: z.object({ ok: z.boolean().default(true), error: z.string().optional(), mock: z.boolean().optional(), note: z.string().optional(), playlists: z.array(playlist) }),
  size: { min: [2, 2], default: [2, 3], max: [6, 4] },
  render: function YouTubeView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const [q, setQ] = useState("");
    const [view, setView] = useState<string | null>(null);
    const [play, setPlay] = useState<z.infer<typeof video> | null>(null);
    const st = state === "ready" && !data ? "empty" : state;
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const open = data?.playlists.find((p) => p.id === view);
    let body = null;
    if (data && !data.ok) body = <div className={sub} role="alert">YouTube didn't answer: {data.error ?? ""}</div>;
    else if (data && !open) {
      const hits = data.playlists.filter((p) => hit(p.title, words));
      body = !data.playlists.length ? <div className={sub}>No playlists yet.</div> : <>
        {words.length > 0 && <div className={`${sub} opacity-60`}>{hits.length} of {data.playlists.length} playlists</div>}
        {!hits.length ? <div className={sub}>No playlist matches "{q.trim()}".</div> :
          <div className="grid gap-x-2 gap-y-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))" }}>
            {hits.map((p) => <button key={p.id} type="button" className={`${tile} flex flex-col p-1`} onClick={() => { setView(p.id); setPlay(null); setQ(""); }}>
              <img src={p.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" className="block aspect-video w-full rounded-md bg-bk-bg object-cover" />
              <b className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold leading-tight">{p.title}</b>
              <span className={`${sub} mt-0.5 leading-tight`}>{plural(p.count, "video")}</span>
            </button>)}
          </div>}
        {data.mock ? <div className={`${sub} truncate opacity-60`}>Sample playlists. Run youtube_auth.py to show yours.</div>
          : data.note && <div className={`${sub} truncate opacity-60`}>{data.note}</div>}
      </>;
    } else if (open) {
      const vids = open.videos ?? []; const loadingVids = !open.videos, hits = vids.filter((v) => hit(v.title, words));
      const chip = "rounded-md border-0 bg-bk-raise px-2 py-0.5 text-xs text-bk-fg no-underline focus-visible:outline-2 focus-visible:outline-bk-accent";
      body = <>
        <div className="flex items-center gap-2">
          <button type="button" className={chip} onClick={() => { setView(null); setPlay(null); setQ(""); }}>← Playlists</button>
          <b className="min-w-0 flex-1 truncate">{open.title}</b>
          {play?.private && <a className={chip} href={`https://music.youtube.com/watch?v=${play.id}`} target="_blank" rel="noopener">♪ YouTube Music</a>}
          {!data?.mock && <a className={chip} href={`https://www.youtube.com/playlist?list=${encodeURIComponent(open.id)}`} target="_blank" rel="noopener">↗ YouTube</a>}
        </div>
        {play && <iframe className="block aspect-video w-full rounded-lg border-0 bg-bk-bg" title={play.title} src={`https://www.youtube.com/embed/${play.id}?autoplay=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        {words.length > 0 && <div className={`${sub} opacity-60`}>{hits.length} of {vids.length} videos</div>}
        {loadingVids ? <div className={sub}>Opening the playlist…</div> : !vids.length ? <div className={sub}>Nothing playable in it.</div> : !hits.length ? <div className={sub}>No video matches "{q.trim()}".</div> :
          <div className="flex flex-col gap-0.5">
            {hits.map((v) => <button key={v.id + v.title} type="button" aria-current={play?.id === v.id || undefined} onClick={() => setPlay(v)}
              className={`${tile} grid items-center gap-2 p-[3px] aria-[current]:bg-bk-raise`} style={{ gridTemplateColumns: "96px 1fr" }}>
              <img src={v.thumb ?? `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" referrerPolicy="no-referrer" className="block aspect-video w-full rounded-md bg-bk-bg object-cover" />
              <span><b className="line-clamp-2 text-[12.5px] font-semibold leading-tight">{v.title}</b><span className={`${sub} block`}>{v.private ? "🔒 private · " : ""}{v.channel}</span></span>
            </button>)}
          </div>}
      </>;
    }
    return (
      <Frame className="!p-3" title={options.label ?? "YouTube"} icon={options.icon ?? "play"} state={st} empty="Asking YouTube…"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <div className="flex h-full flex-col gap-2 overflow-y-auto overscroll-contain">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={open ? "Search this playlist" : "Search playlists"}
            aria-label="Search the YouTube card" autoComplete="off" spellCheck={false}
            className="box-border w-full rounded-lg border border-bk-line bg-bk-bg px-2.5 py-1.5 text-bk-fg placeholder:text-bk-muted focus-visible:outline-2 focus-visible:outline-bk-accent" />
          {body}
        </div>
      </Frame>
    );
  },
});
