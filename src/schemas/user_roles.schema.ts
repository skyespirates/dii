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

// 3. Define the final, outer wrapper: the API Response object
export const ApiResponseSchema = z
  .object({
    status: z.literal("success").openapi({
      description: "The status of the API request.",
      example: "success",
    }),
    message: z.string().openapi({
      description: "A descriptive message about the operation.",
      example: "get all roles for all users",
    }),
    // Nest the UserSchema array inside the main response object
    users: z
      .array(UserSchema)
      .min(1, { message: "The users array cannot be empty" })
      .openapi({
        description: "An array of user objects.",
      }),
  })
  .openapi({
    description:
      "The complete API response structure for fetching users and roles.",
  });

// Infer the TypeScript type from the schema for maximum type safety
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
