import { lazy, Suspense } from "react";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// three.js is ~600 KB: load it only when a 3D card is actually on screen.
const Scene = lazy(() => import("./Scene"));

export const Scene3D = defineWidget({
  type: "scene-3d", family: "3d", title: "3D scene",
  options: z.object({ label: z.string() }),
  data: z.object({ shape: z.enum(["box", "torus", "sphere"]), color: z.string().default("#ffb020") }),
  size: { min: [2, 2], default: [4, 3], max: [12, 8] },
  render: ({ options, data, state }) => (
    <Frame title={options.label} state={state === "ready" && !data ? "empty" : state} empty="No scene loaded">
      {data && (
        <div className="h-full min-h-32 w-full" role="img" aria-label={`${options.label}: rotating ${data.shape}`}>
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded bg-white/10" />}>
            <Scene shape={data.shape} color={data.color ?? "#ffb020"} />
          </Suspense>
        </div>
      )}
    </Frame>
  ),
});
