import type { ComponentType } from "react";
import { z } from "zod";

export type Family = "data" | "list" | "2d" | "3d" | "media" | "input" | "chat";
export type Size = [w: number, h: number];
export type WidgetState = "loading" | "empty" | "error" | "ready";

export interface WidgetDef<O extends z.ZodTypeAny, D extends z.ZodTypeAny> {
  type: string;              // registry key, kebab-case
  family: Family;
  title: string;
  options: O;                // Zod schema: types + validation + editor form
  data: D;
  size: { min: Size; default: Size; max: Size };
  fetch?: (opts: z.infer<O>) => { queryKey: unknown[]; queryFn: () => Promise<z.infer<D>> };
  render: ComponentType<{ options: z.infer<O>; data?: z.infer<D>; state: WidgetState; size: Size }>;
}

export const defineWidget = <O extends z.ZodTypeAny, D extends z.ZodTypeAny>(def: WidgetDef<O, D>) => def;
