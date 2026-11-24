import { StatTile } from "./stat-tile/widget";
import { Sparkline } from "./sparkline/widget";
import { ItemList } from "./item-list/widget";
import { Cutout2D } from "./cutout-2d/widget";
import { Scene3D } from "./scene-3d/widget";
import { MediaViewer } from "./media-viewer/widget";
import { ZodForm } from "./zod-form/widget";
import { ChatPane } from "./chat-pane/widget";
import { Gauge } from "./gauge/widget";
import { MeterRows } from "./meter-rows/widget";
import { Countdown } from "./countdown/widget";
import { Checklist } from "./checklist/widget";
import { Counter } from "./counter/widget";
import { Markdown } from "./markdown/widget";
import { EmbedFrame } from "./embed-frame/widget";
import { Player } from "./player/widget";
import { RadarMap } from "./radar-map/widget";
import { IsoScene } from "./iso-scene/widget";
import { MediaGrid } from "./media-grid/widget";

/** One entry per widget. Check here before building anything new (STANDARDS rule 1). */
const all = [StatTile, Sparkline, ItemList, Cutout2D, Scene3D, MediaViewer, ZodForm, ChatPane,
  Gauge, MeterRows, Countdown, Checklist, Counter, Markdown, EmbedFrame,
  Player, RadarMap, IsoScene, MediaGrid] as const;
export const registry = Object.fromEntries(all.map((w) => [w.type, w])) as Record<(typeof all)[number]["type"], (typeof all)[number]>;
export type WidgetType = keyof typeof registry;
