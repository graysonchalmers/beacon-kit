import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

export const MediaViewer = defineWidget({
  type: "media-viewer", family: "media", title: "Media viewer",
  options: z.object({ label: z.string() }),
  data: z.object({ kind: z.enum(["image", "video"]), src: z.string(), alt: z.string(), caption: z.string().optional() }),
  size: { min: [2, 2], default: [4, 3], max: [12, 8] },
  render: ({ options, data, state, size }) => (
    <Frame title={options.label} state={state === "ready" && !data ? "empty" : state} empty="No media">
      {data && (
        <figure className="flex h-full flex-col gap-1">
          {data.kind === "image"
            ? <img src={data.src} alt={data.alt} className="min-h-0 w-full flex-1 rounded object-cover" />
            : <video src={data.src} aria-label={data.alt} controls muted className="min-h-0 w-full flex-1 rounded" />}
          {data.caption && size[1] >= 3 && <figcaption className="text-xs text-bk-muted">{data.caption}</figcaption>}
        </figure>
      )}
    </Frame>
  ),
});
