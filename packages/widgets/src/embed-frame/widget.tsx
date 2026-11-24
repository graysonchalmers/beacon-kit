import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

// Old Beacon "html" card: agent-made HTML in a sandboxed iframe (scripts on, same-origin off). Not skinned inside: it is someone else's page.
export const EmbedFrame = defineWidget({
  type: "embed-frame", family: "media", title: "Embedded page",
  options: z.object({ label: z.string() }),
  data: z.union([z.object({ html: z.string() }), z.object({ url: z.string().url() })]),
  size: { min: [2, 2], default: [4, 4], max: [12, 8] },
  render: ({ options, data, state }) => (
    <Frame title={options.label} state={state === "ready" && !data ? "empty" : state}>
      {data && <iframe title={options.label} sandbox="allow-scripts" className="h-full w-full rounded border border-bk-line bg-white"
        {...("html" in data ? { srcDoc: data.html } : { src: data.url })} />}
    </Frame>
  ),
});
