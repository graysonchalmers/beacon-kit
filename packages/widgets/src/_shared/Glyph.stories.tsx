import type { Meta, StoryObj } from "@storybook/react";
import { Glyph, glyphNames } from "./Glyph";

function Sheet({ look }: { look: "pixel" | "line" }) {
  return (
    <div data-skin="beacon" className="grid grid-cols-8 gap-3 bg-bk-bg p-4 text-bk-text">
      {glyphNames.map((n) => (
        <figure key={n} className="flex flex-col items-center gap-1 text-[10px] text-bk-muted">
          <span className="grid size-9 place-items-center rounded-md bg-bk-raise text-bk-text"><Glyph name={n} look={look} size="20px" /></span>{n}
        </figure>
      ))}
    </div>
  );
}
const meta: Meta<typeof Sheet> = { title: "Foundations/Glyphs", component: Sheet };
export default meta;
export const Pixel: StoryObj<typeof Sheet> = { args: { look: "pixel" } };
export const Line: StoryObj<typeof Sheet> = { args: { look: "line" } };
