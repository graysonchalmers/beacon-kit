import { z } from "zod";

/** A board is plain JSON an agent can write. Validated before render; bad cards become error cards. */
export const Card = z.object({
  type: z.string(),
  x: z.number().int().min(0), y: z.number().int().min(0),
  w: z.number().int().min(1), h: z.number().int().min(1),
  options: z.record(z.unknown()).default({}),
});
export const Board = z.object({ board: z.string(), cards: z.array(Card) });
export type Board = z.infer<typeof Board>;
