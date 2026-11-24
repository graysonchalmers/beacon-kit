import { useState } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "kit" inventory screen (kitscreen.js): a framed panel, big "Inventory" lettering, 64px item slots with ×n and a label.
// The old one drew pixel-art 9-slice PNGs; this draws the same layout with tokens (warm frame = warn mix, felt = ok mix).
const Slot = z.union([z.string(), z.object({ id: z.string().optional(), name: z.string().optional(), n: z.number().int().optional() })]);
const PICS: Record<string, string> = { rock: "🪨", sprout: "🌱", frog: "🐸" };
const frame = "border-[color-mix(in_srgb,var(--bk-warn)_45%,var(--bk-raise))]";

function Body({ title, items }: { title: string; items: z.infer<typeof Slot>[] }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className={`mx-auto w-full max-w-[560px] rounded-lg border-[6px] ${frame} bg-[color-mix(in_srgb,var(--bk-ok)_22%,var(--bk-card))] p-4`}>
      <div className="mb-3 text-[28px] font-black leading-none text-bk-warn [text-shadow:0_2px_0_var(--bk-bg)]">{title}</div>
      <ul className="grid grid-cols-[repeat(auto-fill,64px)] gap-2">
        {items.slice(0, 24).map((it, i) => {
          const o = typeof it === "string" ? { name: it } : it, key = String(o.id || o.name || "").toLowerCase();
          const name = String(o.name || o.id || "").replace(/^./, (c) => c.toUpperCase());
          return (
            <li key={i}>
              <button type="button" title={name} aria-label={o.n && o.n > 1 ? `${name} ×${o.n}` : name} aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)}
                className={`relative grid size-16 place-items-center rounded-lg border-[5px] ${frame} bg-[color-mix(in_srgb,var(--bk-ok)_12%,var(--bk-bg))] text-[22px] font-bold text-bk-fg transition-transform hover:-translate-y-0.5 aria-pressed:outline aria-pressed:outline-2 aria-pressed:outline-bk-warn focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-accent motion-reduce:transition-none`}>
                <span aria-hidden>{PICS[key] ?? (name.slice(0, 1).toUpperCase() || "?")}</span>
                {o.n && o.n > 1 && <span aria-hidden className="absolute -bottom-1 -right-1.5 text-[13px] [text-shadow:0_1px_0_var(--bk-bg)]">×{o.n}</span>}
              </button>
              <span className="mt-0.5 block max-w-16 truncate text-center text-[11px] font-bold text-[color-mix(in_srgb,var(--bk-warn)_55%,var(--bk-fg))]">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const Backpack = defineWidget({
  type: "backpack", family: "2d", title: "Backpack",
  options: z.object({ label: z.string().default("Backpack"), title: z.string().default("Inventory") }),
  data: z.object({ items: z.array(Slot) }),
  size: { min: [2, 2], default: [4, 4], max: [6, 6] },
  render: function BackpackView({ options, data, state }) {
    const [big, setBig] = useState(false);
    const items = data?.items ?? [];
    return (
      <Frame title={options.label ?? "Backpack"} state={state === "ready" && !items.length ? "empty" : state} icon="🎮" empty="The backpack is empty"
        actions={<button type="button" aria-label="Larger" aria-pressed={big} onClick={() => setBig(!big)}
          className="grid size-7 place-items-center rounded-md border border-bk-line bg-bk-bg font-semibold text-bk-fg focus-visible:outline-2 focus-visible:outline-bk-accent">+</button>}>
        <Body title={options.title ?? "Inventory"} items={items} />
      </Frame>
    );
  },
});
