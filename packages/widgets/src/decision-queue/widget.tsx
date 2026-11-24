import { createContext, useContext, useRef, useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";
import { useAction, useSendTap, type TapState } from "../_shared/actions";
import { celebrate, type Celebrate } from "../_shared/fx";

const CelebrateContext = createContext<Celebrate>("fireworks");

// Old Beacon "decisions" and "notion" (one Inbox card): tabs Needs you / Claude working / Done recently with counts.
// Needs you lists agent questions (asks) first, then inbox rows. Taps are local state; a host posts them through its own fetch layer.
const Option = z.object({ label: z.string(), hint: z.string().default(""), done: z.boolean().default(false) });
const Ask = z.object({ id: z.string(), title: z.string(), why: z.string().default(""), by: z.string().default("Claude"),
  options: z.array(Option), links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  status: z.enum(["pending", "answered"]).default("pending"), choice: z.string().optional() });
const Row = z.object({ id: z.string(), group: z.enum(["you", "claude", "done"]).default("you"),
  kind: z.string().default("Do"), status: z.string().default(""), title: z.string(), url: z.string().default(""),
  options: z.array(Option).default([]), images: z.array(z.object({ src: z.string(), cap: z.string().default("") })).default([]),
  why: z.string().default(""), groomer: z.string().default("") });
type AskT = z.infer<typeof Ask>; type RowT = z.infer<typeof Row>; type G = RowT["group"];

const GROUPS: [G, string][] = [["you", "Needs you"], ["claude", "Claude working"], ["done", "Done recently"]];
const KIND_GLYPH: Record<string, string> = { Decide: "?", Do: "☐", Review: "👁", Approve: "✓" };
const btn = "rounded-lg border border-bk-line bg-bk-raise text-bk-fg font-semibold hover:border-bk-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent disabled:opacity-50";

function groomChip(g: string, now: number) {
  const m = g.match(/^Groomer note (\d{4}-\d{2}-\d{2}): ([^.]*)\./);
  if (!m) return "Groomer note";
  const age = Math.max(0, Math.floor((now - Date.parse(m[1])) / 864e5));
  return `Groomer: ${m[2]}, ${age ? age + " d" : "today"}`;
}

function OptionButtons({ opts, picked, onPick, small, tap = "idle" }: { opts: z.infer<typeof Option>[]; picked?: number; onPick: (i: number) => void; small?: boolean; tap?: TapState }) {
  const busy = tap === "sending" || tap === "sent";
  return <>{opts.map((o, i) => (
    <button key={i} type="button" disabled={o.done || busy} aria-busy={picked === i && tap === "sending"} onClick={() => onPick(i)} title={o.hint || o.label}
      className={`${btn} flex max-w-full flex-col items-start text-left ${small ? "px-2 py-0.5 text-[12px]" : "px-2.5 py-1.5 text-[15px]"} ${picked === i && busy ? "!opacity-100 border-bk-accent" : ""}`}>
      <span>{picked === i && tap === "sending" ? "Sending…" : picked === i && tap === "sent" ? "✓ Sent" : `${o.done ? "✓ " : ""}${o.label}`}</span>
      {o.hint && <span className="line-clamp-2 max-w-[34ch] text-[11px] font-normal text-bk-muted">{o.hint}</span>}
    </button>))}</>;
}

/** Old Beacon tap feedback: card dims while sending, ✓ Sent + celebrate, folds away; on failure it shakes and says so. */
function useAnswer(onGone: () => void, payload: (i: number) => Record<string, unknown>, action = "answer") {
  const send = useAction(), ref = useRef<HTMLDivElement>(null), celebrateMode = useContext(CelebrateContext);
  const [picked, setPicked] = useState<number>();
  const [tap, run] = useSendTap(onGone);
  const pick = (i: number) => { setPicked(i); run(() => send(action, payload(i))).then((ok) => {
    if (ok) celebrate(ref.current, celebrateMode);
    else ref.current?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-3px)" }, { transform: "none" }], { duration: 360 }); }); };
  const fail = tap === "failed" && <div role="alert" className="basis-full text-[12.5px] text-bk-danger">Didn't go through. Tap again.</div>;
  const cls = tap === "sending" ? "opacity-60 pointer-events-none" : tap === "sent" ? "bk-sent" : "";
  return { ref, picked, tap, pick, fail, cls };
}

function AskCard({ d, onGone }: { d: AskT; onGone: () => void }) {
  const a = useAnswer(onGone, (i) => ({ id: d.id, choice: d.options[i].label }));
  return (
    <div ref={a.ref} className={`flex flex-col gap-1.5 rounded-[10px] border border-bk-line px-2.5 py-2 transition-opacity ${a.cls}`}>
      <h4 className="m-0 text-[15px] font-semibold text-bk-fg">{d.title}</h4>
      {d.why && <details className="text-[13px] text-bk-muted"><summary className="w-max cursor-pointer" title={`Why ${d.by} is asking`}>? Why</summary><div>{d.why}</div></details>}
      <div className="flex flex-wrap gap-1.5"><OptionButtons opts={d.options} picked={a.picked} onPick={a.pick} tap={a.tap} /></div>{a.fail}
      {d.links.length > 0 && <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">{d.links.map((l) => (
        <a key={l.url} href={l.url.startsWith("https://") ? l.url : undefined} target="_blank" rel="noopener noreferrer" className="text-bk-accent">{l.label} ↗</a>))}</div>}
      <div><button type="button" onClick={onGone} title="Drop this question without answering" className={`${btn} px-2.5 py-1.5 text-[15px]`}>Not now</button></div>
    </div>
  );
}

function InboxRow({ r, g, now, onDone }: { r: RowT; g: G; now: number; onDone: () => void }) {
  const a = useAnswer(onDone, (i) => (i < 0 ? { id: r.id, done: true } : { id: r.id, choice: r.options[i].label }), "inbox");
  const glyph = g === "done" ? "✓" : g === "claude" ? "timer" : KIND_GLYPH[r.kind] ?? "☐";
  const label = g === "you" ? r.kind : g === "claude" ? "Claude is on it" : "Done";
  const [head, ...rest] = r.title.split(": "), tags = rest.length ? rest.join(": ").split(/,\s*/) : [];
  const gr = r.groomer.replace(/^Groomer note\s*/, "");
  return (
    <div ref={a.ref} className={`flex flex-wrap items-center gap-2 rounded-lg px-1.5 py-1 transition-opacity ${a.cls} hover:bg-[color-mix(in_srgb,var(--bk-accent)_12%,transparent)]`}>
      <span title={label} aria-label={label} className={`grid size-[26px] shrink-0 place-items-center rounded-full border text-xs ${r.kind === "Decide" && g === "you" ? "border-bk-accent text-bk-accent" : "border-bk-line text-bk-muted"}`}>{glyph}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-bk-fg" title={r.title}>{head}</span>
      {tags.length > 0 && <span className="flex flex-wrap gap-1">{tags.map((t) => <i key={t} className="rounded-full bg-[color-mix(in_srgb,var(--bk-accent)_16%,transparent)] px-1.5 text-[11px] not-italic text-bk-muted">{t}</i>)}</span>}
      {g === "you" ? <button type="button" onClick={() => a.pick(-1)} title="Mark done" aria-label="Mark done" className={`${btn} grid size-[26px] place-items-center p-0 text-xs`}>✓</button>
        : r.status && <span className="shrink-0 text-[11px] text-bk-muted">{r.status}</span>}
      {(r.images.length > 0 || r.why || gr) && (
        <div className="flex min-w-0 basis-full flex-col gap-1.5">
          {r.images.length > 0 && <div className="flex gap-1.5 overflow-hidden">{r.images.map((i, k) => (
            <figure key={k} className={`m-0 flex min-w-0 flex-1 flex-col gap-0.5 ${r.images.length > 1 ? "max-w-[50%]" : ""}`}>
              <img src={i.src} alt={i.cap || "Inbox picture"} loading="lazy" className="block h-24 max-w-full rounded-md border border-bk-line bg-bk-bg object-contain text-bk-fg" />
              {i.cap && <figcaption className="text-[11px] leading-tight text-bk-muted [overflow-wrap:anywhere]">{i.cap}</figcaption>}
            </figure>))}</div>}
          {r.why && <div className="line-clamp-3 rounded-md border-l-[3px] border-bk-accent bg-[color-mix(in_srgb,var(--bk-accent)_8%,transparent)] px-2 py-1 text-[12.5px] leading-snug text-bk-fg" title={r.why}><b className="font-semibold">Why approve</b> {r.why}</div>}
          {gr && <details className="rounded-md border-l-[3px] border-bk-muted bg-[color-mix(in_srgb,var(--bk-muted)_10%,transparent)] px-2 py-1 text-[12.5px] leading-snug text-bk-muted">
            <summary className="cursor-pointer truncate" title="The nightly groomer's proposal (nothing was changed)">{groomChip(r.groomer, now)}</summary><div className="mt-1">{gr}</div></details>}
        </div>)}
      {g === "you" && r.options.length > 0 && <div className="flex basis-full flex-wrap gap-1 pl-0.5"><OptionButtons small opts={r.options} picked={a.picked} onPick={a.pick} tap={a.tap} /></div>}
      {a.fail}
    </div>
  );
}

function Body({ asks, rows, now }: { asks: AskT[]; rows: RowT[]; now: number }) {
  const [tab, setTab] = useState<G>("you");
  const [gone, setGone] = useState<Set<string>>(new Set());
  const hide = (id: string) => setGone((s) => new Set(s).add(id));
  const pend = asks.filter((a) => a.status === "pending" && !gone.has("d" + a.id)), answered = asks.filter((a) => a.status === "answered").slice(0, 3);
  const by = (g: G) => rows.filter((r) => r.group === g && !gone.has("n" + r.id));
  const n = { you: by("you").length + pend.length, claude: by("claude").length, done: by("done").length + answered.length };
  const list = by(tab);
  const empty = { you: "Nothing waiting on you.", claude: "Claude isn't working on anything from the Inbox.", done: "Nothing closed lately." }[tab];
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
    const j = (i + d + 3) % 3; setTab(GROUPS[j][0]);
    (e.currentTarget.parentElement?.children[j] as HTMLElement | undefined)?.focus();
  };
  return (
    <div className="flex h-full flex-col gap-0.5 overflow-auto">
      <div role="tablist" className="mb-1 flex flex-wrap gap-1">{GROUPS.map(([g, lab], i) => (
        <button key={g} role="tab" type="button" aria-selected={g === tab} tabIndex={g === tab ? 0 : -1} onClick={() => setTab(g)} onKeyDown={(e) => onKey(e, i)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[12.5px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent ${g === tab ? "border-bk-accent text-bk-accent" : "border-bk-line bg-bk-raise text-bk-fg opacity-70"}`}>
          {lab}<span className="min-w-4 rounded-full bg-[color-mix(in_srgb,var(--bk-muted)_25%,transparent)] px-1 text-center text-[11px] text-bk-fg">{n[g]}</span></button>))}</div>
      <div role="tabpanel" className="flex flex-col gap-0.5">
        {tab === "you" && pend.map((a) => <AskCard key={a.id} d={a} onGone={() => hide("d" + a.id)} />)}
        {list.map((r) => <InboxRow key={r.id} r={r} g={tab} now={now} onDone={() => hide("n" + r.id)} />)}
        {tab !== "claude" && answered.map((a) => <div key={a.id} className="text-[13px] text-bk-muted" title={a.title}>✓ {a.title} → <b>{a.choice}</b></div>)}
        {!list.length && !(tab === "you" && pend.length) && !(tab !== "claude" && answered.length) && <p className="text-sm text-bk-muted">{empty}</p>}
      </div>
    </div>
  );
}

export const DecisionQueue = defineWidget({
  type: "decision-queue", family: "input", title: "Decisions",
  options: z.object({ title: z.string().default("Decisions"), icon: z.string().default("ask"),
    /** ISO date used to age groomer notes; defaults to now. */ now: z.string().optional(),
    /** Old card setting "Celebrate when you answer". */ celebrate: z.enum(["off", "flash", "sparkle", "fireworks"]).optional() }),
  data: z.object({ asks: z.array(Ask).default([]), rows: z.array(Row).default([]) }),
  size: { min: [2, 3], default: [3, 6], max: [6, 6] },
  render: ({ options, data, state }) => {
    const asks = data?.asks ?? [], rows = data?.rows ?? [];
    const now = options.now ? Date.parse(options.now) : Date.now();
    return <Frame title={options.title ?? "Decisions"} icon={options.icon ?? "ask"} empty="Nothing waiting on you."
      state={state === "ready" && !asks.length && !rows.length ? "empty" : state}>
      <CelebrateContext.Provider value={options.celebrate ?? "fireworks"}><Body asks={asks} rows={rows} now={now} /></CelebrateContext.Provider></Frame>;
  },
});
