import { z } from "zod";
export const Menu = z.object({
  name: z.string(),
  parent_id: z.number(),
  url: z.string(),
  sort_order: z.number(),
});
