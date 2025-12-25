import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// 1. Define the innermost element: the array of roles
const RoleSchema = z
  .array(z.string().min(1, { message: "Role name cannot be empty" }))
  .openapi({
    description: "A list of roles assigned to the user.",
    example: ["staff", "admin"],
  });

// 2. Define the nested element: the User object
const UserSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .openapi({
        description: "The unique username of the user.",
        example: "skyes07",
      }),
    // Nest the RoleSchema array inside the User object
    roles: RoleSchema,
  })
  .openapi({
    description: "A user object including their roles.",
  });

export const UserRolesSchema = z.object({
  users: z.array(UserSchema),
});
