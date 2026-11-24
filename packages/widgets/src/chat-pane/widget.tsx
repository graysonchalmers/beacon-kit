import { useState, type FormEvent } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

const Msg = z.object({ id: z.string(), from: z.enum(["user", "agent"]), text: z.string() });
type Msg = z.infer<typeof Msg>;

function Pane({ initial }: { initial: Msg[] }) {
  const [msgs, setMsgs] = useState(initial);
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget, text = String(new FormData(f).get("m") ?? "").trim();
    if (!text) return;
    setMsgs((m) => [...m, { id: crypto.randomUUID(), from: "user", text }]); f.reset();
  };
  return (
    <div className="flex h-full flex-col gap-2">
      <ol aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-auto">
        {msgs.map((m) => (
          <li key={m.id} className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-sm ${m.from === "user" ? "self-end bg-bk-accent text-bk-on-accent" : "self-start bg-bk-raise text-bk-fg"}`}>
            <span className="sr-only">{m.from}: </span>{m.text}
          </li>
        ))}
      </ol>
      <form onSubmit={send} className="flex gap-1">
        <input name="m" aria-label="Message" placeholder="Message…" className="min-w-0 flex-1 rounded border border-bk-line bg-bk-bg px-2 py-1 text-sm text-bk-fg outline-none focus-visible:ring-2 focus-visible:ring-bk-accent" />
        <button className="rounded bg-bk-raise px-2 text-sm text-bk-fg focus-visible:ring-2 focus-visible:ring-bk-accent">Send</button>
      </form>
    </div>
  );
}

export const ChatPane = defineWidget({
  type: "chat-pane", family: "chat", title: "Chat",
  options: z.object({ label: z.string() }),
  data: z.object({ messages: z.array(Msg) }),
  size: { min: [2, 3], default: [3, 4], max: [6, 12] },
  render: ({ options, data, state }) => (
    // empty chat is still usable: show the composer with a hint
    <Frame title={options.label} state={state === "empty" ? "ready" : state}>
      {state === "empty" && <p className="text-sm text-bk-muted">No messages yet. Say hi.</p>}
      <Pane initial={data?.messages ?? []} />
    </Frame>
  ),
});
