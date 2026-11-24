import { StatTile } from "./stat-tile/widget";
export const registry = { [StatTile.type]: StatTile } as const;
export type WidgetType = keyof typeof registry;
