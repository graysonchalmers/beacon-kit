import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "ask": ask a local model (Stealth Watch). Model picker, prompt, photo + warm-up buttons, Ask.
// The view keeps the draft in local state; a host wires the real call through its own fetch layer.
const ctl = "rounded-[10px] border border-bk-line bg-bk-bg text-bk-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent";
const iconBtn = `${ctl} grid size-9 place-items-center text-sm hover:bg-bk-raise`;

function Body({ models, model0, prompt0 }: { models: string[]; model0: string; prompt0: string }) {
  const [model, setModel] = useState(model0), [prompt, setPrompt] = useState(prompt0);
  const [photo, setPhoto] = useState(false), [warm, setWarm] = useState(false), [asked, setAsked] = useState("");
  const list = models.includes(model) ? models : [model, ...models];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="relative shrink-0">
        <select aria-label="Model" value={model} onChange={(e) => setModel(e.target.value)}
          className={`${ctl} h-10 w-full appearance-none pl-2.5 pr-8 text-[15px]`}>
          {list.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <svg aria-hidden viewBox="0 0 12 8" className="pointer-events-none absolute right-2.5 top-1/2 h-2 w-3 -translate-y-1/2"><path d="M1 1l5 5 5-5" fill="none" stroke="var(--bk-muted)" strokeWidth="2" /></svg>
      </div>
      <textarea aria-label="Question" rows={2} placeholder="Ask the local model…" value={prompt} onChange={(e) => setPrompt(e.target.value)}
        className={`${ctl} min-h-16 w-full flex-1 resize-y px-2.5 py-2 text-[15px] placeholder:text-bk-muted`} />
      <div className="flex items-center gap-2">
        <button type="button" className={iconBtn} aria-label={photo ? "Change photo" : "Add photo"} title={photo ? "Change photo" : "Add photo"}
          aria-pressed={photo} onClick={() => setPhoto(true)}>🖼</button>
        <button type="button" className={`${iconBtn} ${warm ? "text-bk-warn" : ""}`} aria-label="Warm up" aria-pressed={warm}
          title="Load the model now so the first answer is quick" onClick={() => setWarm(true)}><span className="text-[10px] text-bk-warn">✦</span></button>
        <span className="flex-1" />
        <button type="button" data-primary disabled={!prompt.trim()} onClick={() => setAsked(prompt.trim())}
          className={`${ctl} h-9 px-3 text-[15px] font-semibold hover:bg-bk-raise disabled:opacity-50`}>Ask</button>
      </div>
      {asked && <p aria-live="polite" className="text-sm text-bk-muted">Asking {model}…</p>}
    </div>
  );
}

export const Ask = defineWidget({
  type: "ask", family: "chat", title: "Ask Stealth",
  options: z.object({ label: z.string().default("Ask Stealth"), model: z.string().default("auto") }),
  data: z.object({ prompt: z.string().default(""), models: z.array(z.string()).default([]) }),
  size: { min: [2, 2], default: [3, 2], max: [4, 4] },
  render: function AskView({ options, data, state }) {
    const [big, setBig] = useState(false);
    return (
      <Frame title={options.label ?? "Ask Stealth"} state={state === "ready" && !data ? "empty" : state} icon="ask" empty="Model list not loaded"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {data && <Body models={data.models ?? []} model0={options.model ?? "auto"} prompt0={data.prompt ?? ""} />}
      </Frame>
    );
  },
});
