import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const LoginPayloadSchema = z.object({
  username: z.string().openapi({ example: "skyes07" }),
  password: z.string().openapi({ example: "password123" }),
});

const RoleSchema = z.object({
  role_id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: "Menu 1.1" }),
  description: z.string().optional().openapi({ example: "this is admin role" }),
});

export const LoginResponseSchema = z.object({
  message: z.string().openapi({ example: "login successfully" }),
  access_token: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }),
  roles: z
    .array(RoleSchema)
    .optional()
    .openapi({ description: "user with single role dont have this key" }),
});
