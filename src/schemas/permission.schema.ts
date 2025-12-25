import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const PermissionBodySchema = z.object({
  role_id: z.number().openapi({ example: 1 }),
  menu_id: z.number().openapi({ example: 18 }),
});
