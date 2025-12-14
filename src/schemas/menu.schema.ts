import { z } from "zod";
import { Menu } from ".";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Ensure you call this at the start
extendZodWithOpenApi(z);

export interface Menu {
  menu_id: number;
  name: string;
  parent_id: number | null;
  children: Menu[];
}

export const MenuSchema: z.ZodType<Menu> = z
  .lazy(() =>
    z.object({
      menu_id: z.number().openapi({ example: 11 }),
      name: z.string().openapi({ example: "Menu 1.1.1" }),
      parent_id: z.number().or(z.null()).openapi({ example: 1 }),
      children: z.array(MenuSchema).openapi({
        type: "array",
        description:
          "Sub-menu items, referencing the same MenuSchema recursively.",
      }),
    })
  )
  .openapi({
    type: "object",
    description: "A hierarchical menu item.",
  });

export const MenuSchemaResponse = z
  .object({
    result: z.array(MenuSchema).openapi({
      example: [
        {
          menu_id: 1,
          name: "Menu 1",
          parent_id: null,
          children: [
            { menu_id: 11, name: "Menu 1.1", parent_id: 1, children: [] },
          ],
        },
      ],
    }),
  })
  .openapi({ description: "Response structure for the menu tree." });

export type MenuType = z.infer<typeof Menu>;
