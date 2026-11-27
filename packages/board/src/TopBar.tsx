import { useState } from "react";

/** Old Beacon's top bar (view.html): board tabs, voice status pill, alert ticker, bell with unread count. Pure view; the host passes state. */
export type TopBarProps = {
  tabs: { id: string; name: string }[]; current?: string; onTab?: (id: string) => void;
  voice?: "wait" | "follow" | "awake" | "thinking" | "speaking" | "off";
  alerts?: { tier?: string; text: string }[]; notes?: { text: string; read?: boolean; at?: string }[];
};
const VOICE: Record<string, [string, string]> = {
  wait: ["Waiting for wake word", "bg-bk-muted"], follow: ["Listening for a follow-up", "bg-bk-ok"], awake: ["Listening to you", "bg-bk-danger"],
  thinking: ["Thinking", "bg-bk-accent"], speaking: ["Answering", "bg-bk-warn"], off: ["Voice off", "bg-bk-line"],
};

export function TopBar({ tabs, current, onTab, voice = "wait", alerts = [], notes = [] }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const un = notes.filter((n) => !n.read).length, [vl, vc] = VOICE[voice] ?? VOICE.wait;
  const bad = alerts[0]?.tier === "bad" || alerts[0]?.tier === "urgent";
  return (
    <header className="relative mb-3 flex flex-wrap items-center gap-2 rounded-[var(--bk-radius)] border border-bk-line bg-bk-card px-3 py-2 text-sm">
      <nav aria-label="Boards" className="flex min-w-0 gap-1 overflow-x-auto">
        {tabs.map((t) => <button key={t.id} type="button" onClick={() => onTab?.(t.id)} aria-current={t.id === current ? "page" : undefined}
          className={`whitespace-nowrap rounded-md px-2.5 py-1 font-semibold ${t.id === current ? "bg-bk-accent text-bk-on-accent" : "text-bk-muted hover:bg-bk-raise"}`}>{t.name}</button>)}
      </nav>
      <span className="flex items-center gap-1.5 whitespace-nowrap text-bk-muted" title="Voice assistant"><i className={`size-2 rounded-full ${vc}`} />{vl}</span>
      {alerts.length > 0 && (
        <div role="status" title={alerts.map((a) => a.text).join("\n")}
          className={`min-w-0 flex-1 basis-48 overflow-hidden whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${bad ? "bg-[color-mix(in_srgb,var(--bk-danger)_25%,transparent)] text-bk-fg" : "bg-[color-mix(in_srgb,var(--bk-warn)_22%,transparent)] text-bk-fg"}`}>
          <span className="inline-block motion-safe:animate-[bk-tick_18s_linear_infinite]">{alerts[0].text}{alerts.length > 1 ? `  +${alerts.length - 1}` : ""}</span>
        </div>)}
      {!alerts.length && <span className="flex-1" />}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Notifications${un ? `, ${un} unread` : ""}`}
        className="relative rounded-md p-1.5 text-bk-fg hover:bg-bk-raise">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
        {un > 0 && <i className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-bk-danger px-1 text-[10px] not-italic font-bold text-white">{un > 9 ? "9+" : un}</i>}
      </button>
      {open && <ul className="absolute right-2 top-full z-20 mt-1 max-h-80 w-80 max-w-[90vw] overflow-auto rounded-[var(--bk-radius)] border border-bk-line bg-bk-card p-2 text-xs shadow-xl">
        {notes.length ? notes.slice(0, 30).map((n, i) => <li key={i} className={`border-b border-bk-line py-1.5 last:border-0 ${n.read ? "text-bk-muted" : "text-bk-fg"}`}>{n.at && <span className="mr-1 text-bk-muted">{n.at}</span>}{n.text}</li>)
          : <li className="text-bk-muted">No notifications.</li>}</ul>}
    </header>
  );
}
