import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "radar": a weather image over a base map, frame time, and a precip legend. Images are data; the legend ramp is skin tokens.
export const RadarMap = defineWidget({
  type: "radar-map", family: "2d", title: "Radar map",
  options: z.object({ label: z.string(), showLegend: z.boolean().default(true) }),
  data: z.object({ base: z.string(), overlay: z.string().optional(), at: z.string().optional(), place: z.string().optional() }),
  size: { min: [2, 2], default: [4, 3], max: [8, 6] },
  render: ({ options, data, state, size }) => (
    <Frame title={options.label} state={state === "ready" && !data ? "empty" : state}>
      {data && (
        <figure className="relative h-full w-full overflow-hidden rounded-[var(--bk-radius)]">
          <img src={data.base} alt={`Map of ${data.place ?? "the area"}`} className="absolute inset-0 h-full w-full object-cover" />
          {data.overlay && <img src={data.overlay} alt="Precipitation" className="absolute inset-0 h-full w-full object-cover mix-blend-screen" />}
          <figcaption className="absolute bottom-1 left-1 rounded bg-bk-card/80 px-1.5 text-xs text-bk-fg">{data.place}{data.at ? ` · ${data.at}` : ""}</figcaption>
          {options.showLegend && size[0] >= 3 && <div aria-hidden className="absolute bottom-1 right-1 h-2 w-20 rounded"
            style={{ background: "linear-gradient(90deg, var(--bk-ok), var(--bk-warn), var(--bk-danger))" }} />}
        </figure>
      )}
    </Frame>
  ),
});
