import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "Dice" (the Sandbox html sample): a big value and a Roll button. Roll is view-local: 1..sides.
function Body({ value0, sides, label }: { value0: string; sides: number; label: string }) {
  const [v, setV] = useState(value0);
  return (
    <div className="flex h-full flex-col items-start gap-2">
      <div aria-live="polite" aria-label={`${label}: ${v}`} className="text-[40px] font-bold leading-[1.15] text-bk-fg">{v}</div>
      <button type="button" onClick={() => setV(String(1 + Math.floor(Math.random() * sides)))}
        className="rounded-[10px] border border-bk-line bg-bk-raise px-3.5 py-2 text-[15px] text-bk-fg hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent">Roll</button>
    </div>
  );
}

export const Dice = defineWidget({
  type: "dice", family: "input", title: "Dice",
  options: z.object({ label: z.string().default("Dice"), sides: z.number().int().min(2).default(6) }),
  data: z.object({ value: z.union([z.string(), z.number()]).optional() }),
  size: { min: [1, 1], default: [3, 2], max: [3, 3] },
  render: function DiceView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const label = options.label ?? "Dice";
    return (
      <Frame title={label} state={state === "ready" && !data ? "empty" : state} icon="🎲"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        {data && <Body value0={String(data.value ?? "-")} sides={options.sides ?? 6} label={label} />}
      </Frame>
    );
  },
});
