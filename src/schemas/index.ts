import { z } from "zod";
export const Menu = z.object({
  name: z.string(),
  parent_id: z.number(),
  url: z.string(),
  sort_order: z.number(),
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

export const MenuId = z.object({ menu_id: z.number() });
