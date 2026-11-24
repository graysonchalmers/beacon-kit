import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Rect } from "react-konva";
import { z } from "zod";
import { defineWidget } from "../contract";
import { Frame } from "../_shared/Frame";

function useImg(src?: string) {
  const [img, set] = useState<HTMLImageElement>();
  useEffect(() => { if (!src) return; const i = new window.Image(); i.crossOrigin = "anonymous"; i.onload = () => set(i); i.src = src; }, [src]);
  return img;
}
function useBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, set] = useState({ w: 200, h: 140 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => set({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(ref.current); return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

function Canvas({ src, label }: { src: string; label: string }) {
  const img = useImg(src);
  const [ref, box] = useBox();
  const line = ref.current ? getComputedStyle(ref.current).getPropertyValue("--bk-raise").trim() || "transparent" : "transparent";
  const scale = img ? Math.min(box.w / img.width, box.h / img.height) * 0.9 : 1;
  return (
    <div ref={ref} className="h-full min-h-28 w-full" role="img" aria-label={`${label} cutout, drag to move`}>
      <Stage width={box.w} height={box.h}>
        <Layer>
          <Rect width={box.w} height={box.h} fill={line} cornerRadius={6} />
          {img && <KImage image={img} draggable scaleX={scale} scaleY={scale}
            x={(box.w - img.width * scale) / 2} y={(box.h - img.height * scale) / 2} />}
        </Layer>
      </Stage>
    </div>
  );
}

export const Cutout2D = defineWidget({
  type: "cutout-2d", family: "2d", title: "2D cutout",
  options: z.object({ label: z.string() }),
  data: z.object({ src: z.string() }), // transparent PNG/SVG url or data URI
  size: { min: [2, 2], default: [3, 3], max: [8, 8] },
  render: ({ options, data, state }) => (
    <Frame title={options.label} state={state === "ready" && !data?.src ? "empty" : state} empty="No cutout yet">
      {data?.src && <Canvas src={data.src} label={options.label} />}
    </Frame>
  ),
});
