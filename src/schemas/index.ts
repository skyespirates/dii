import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);
export const Menu = z.object({
  name: z.string().openapi({ example: "Menu 1.1" }),
  parent_id: z.number().optional().openapi({ example: 3 }),
  url: z.string().openapi({ example: "/hello-world" }),
  sort_order: z.number().openapi({ example: 1 }),
});

export const Register = z.object({
  fullname: z.string(),
  username: z.string(),
  password: z.string(),
});

export const Login = z.object({
  username: z.string(),
  password: z.string(),
});

export const SelectRole = z.object({
  employee_id: z.number(),
  role_id: z.number(),
});

export const Permission = z.object({
  role_id: z.number(),
  menu_id: z.number(),
});

export const PermissionResponse = z.object({
  status: z.string().openapi({ example: "success" }),
  message: z
    .string()
    .openapi({ example: "role permission added to menu menu_id: 18" }),
});

export const MenuId = z.object({ menu_id: z.number() });

export const LoginResponseSchema = z.object({
  message: z.string().openapi({ example: "login successfully" }),
  access_token: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }),
});

export const AddMenuResponseSchema = z.object({
  message: z.string().openapi({ example: "menu inserted successfully" }),
  insertedId: z.number().openapi({ example: 18 }),
});

export const RoleSchema = z.object({
  role_id: z.number().openapi({ example: 3 }),
  name: z.string().openapi({ example: "Staff" }),
  description: z
    .string()
    .nullable()
    .openapi({ example: "represents all employees under leader" }),
});
