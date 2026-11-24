import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "calendar": events grouped under day headings (Today, Tomorrow), a narrow time column, title + place.
const Event = z.object({
  id: z.string(), title: z.string(), where: z.string().optional(),
  day: z.string(),              // group heading, e.g. "Today"
  time: z.string(),             // "9:49 a.m." or "All day"
  soon: z.boolean().optional(), // starts within 30 min: accent, bold time
  link: z.string().url().optional(),
});

export const Agenda = defineWidget({
  type: "agenda", family: "list", title: "Agenda",
  options: z.object({ label: z.string().default("Calendar") }),
  data: z.object({ events: z.array(Event) }),
  size: { min: [2, 2], default: [3, 3], max: [6, 4] },
  render: function AgendaView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const events = data?.events ?? [];
    // Old card showed muted text for loading/error, not a skeleton or red alert.
    const st = state === "ready" && events.length === 0 ? "empty" : state === "loading" || state === "error" ? "empty" : state;
    const msg = state === "loading" ? "Looking…" : state === "error" ? "The calendar can't be read right now." : "Nothing on the calendar for the next day and a half.";
    const groups: { day: string; items: typeof events }[] = [];
    for (const e of events) (groups.at(-1)?.day === e.day ? groups.at(-1)!.items : (groups.push({ day: e.day, items: [] }), groups.at(-1)!.items)).push(e);
    return (
      <Frame title={options.label ?? "Calendar"} state={st} icon="calendar" empty={msg}
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <div className="flex h-full flex-col gap-0.5 overflow-auto">
          {groups.map((g) => (
            <section key={g.day} aria-label={g.day} className="flex flex-col gap-0.5">
              <h4 className="mb-0.5 mt-1.5 text-[13px] text-bk-muted">{g.day}</h4>
              {g.items.map((e) => {
                const inner = (<>
                  <span className={`w-10 shrink-0 text-[13px] tabular-nums ${e.soon ? "font-bold text-bk-accent" : "text-bk-muted"}`}>{e.time}</span>
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate text-[15px] text-bk-fg">{e.title}</span>
                    {e.where && <span className="block truncate text-[13px] text-bk-muted">{e.where}</span>}
                  </span>
                </>);
                const cls = "flex items-baseline gap-2.5 rounded-lg px-1.5 py-[5px] text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-bk-accent";
                const tip = `${e.title}${e.where ? " · " + e.where : ""}`;
                return e.link
                  ? <a key={e.id} href={e.link} target="_blank" rel="noopener noreferrer" title={tip} className={`${cls} hover:bg-bk-raise`}>{inner}</a>
                  : <div key={e.id} tabIndex={0} title={tip} className={cls}>{inner}</div>;
              })}
            </section>
          ))}
        </div>
      </Frame>
    );
  },
});
