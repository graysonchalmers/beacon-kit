import { z } from "zod";
import { defineWidget } from "../contract";

export const StatTile = defineWidget({
  type: "stat-tile",
  family: "data",
  title: "Stat tile",
  options: z.object({ label: z.string(), unit: z.string().optional() }),
  data: z.object({ value: z.number(), delta: z.number().optional() }),
  size: { min: [2, 1], default: [3, 2], max: [6, 4] },
  render: ({ options, data, state }) => {
    if (state === "loading") return <div className="bk-skeleton" aria-busy="true" />;
    if (state === "error") return <div role="alert">Couldn't load {options.label}</div>;
    if (state === "empty" || !data) return <div>{options.label}: no data</div>;
    return (
      <div>
        <div className="bk-label">{options.label}</div>
        <div className="bk-value">{data.value}{options.unit ? ` ${options.unit}` : ""}</div>
      </div>
    );
  },
});
