import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const RoleSchema = z.object({
  role_id: z.number().openapi({ example: 34 }),
  name: z.string().openapi({ example: "staff" }),
  description: z.string().openapi({ example: "base role for all employees" }),
});
