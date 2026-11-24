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

import { Agenda } from "./agenda/widget";
import { Ask } from "./ask/widget";
import { Backpack } from "./backpack/widget";
import { Boss } from "./boss/widget";
import { DecisionQueue } from "./decision-queue/widget";
import { DevStream } from "./devstream/widget";
import { Dice } from "./dice/widget";
import { Docs } from "./docs/widget";
import { Favorites } from "./favorites/widget";
import { Fleet } from "./fleet/widget";
import { Inbox } from "./inbox/widget";
import { Mesh } from "./mesh/widget";
import { Projects } from "./projects/widget";
import { Quotas } from "./quotas/widget";
import { Radar } from "./radar/widget";
import { ReplyQueue } from "./reply-queue/widget";
import { Spotify } from "./spotify/widget";
import { SysScope } from "./sysscope/widget";
import { YouTube } from "./youtube/widget";

/** One entry per widget. Check here before building anything new (STANDARDS rule 1). */
const all = [StatTile, Sparkline, ItemList, Cutout2D, Scene3D, MediaViewer, ZodForm, ChatPane,
  Gauge, MeterRows, Countdown, Checklist, Counter, Markdown, EmbedFrame,
  Player, RadarMap, IsoScene, MediaGrid,
  Agenda, Ask, Backpack, Boss, DecisionQueue, DevStream, Dice, Docs, Favorites, Fleet, Inbox, Mesh, Projects, Quotas, Radar, ReplyQueue, Spotify, SysScope, YouTube] as const;
export const registry = Object.fromEntries(all.map((w) => [w.type, w])) as Record<(typeof all)[number]["type"], (typeof all)[number]>;
export type WidgetType = keyof typeof registry;
