import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserRolesSchema } from "../schemas/user_roles.schema";
import { MenuBodySchema, MenuSchemaResponse } from "../schemas/menu.schema";
import {
  LoginPayloadSchema,
  LoginResponseSchema,
} from "../schemas/login.schema";
import z from "zod";
import {
  RegisterBodySchema,
  RegisterResponseSchema,
} from "../schemas/register.schema";
import {
  RoleSelectBodySchema,
  RoleSelectResponseSchema,
} from "../schemas/role_select.schema";
import { PermissionBodySchema } from "../schemas/permission.schema";
import { RoleSchema } from "../schemas/role.schema";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/register",
  summary: "Create new account",
  description: `Newly created account role is set to be staff\n
  and only super user are allowed to assign role\n
  1. aaaa
  2. bbbb
  `,
  tags: ["user"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: RegisterResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/login",
  tags: ["auth"],
  description: "description 🥴",
  summary: "summary 🤮",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login user",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/roles/select",
  tags: ["roles"],
  summary: "users that have multiple roles can choose their role",
  description: "generate token, based on user selected role",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RoleSelectBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: RoleSelectResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/roles/user",
  tags: ["roles"],
  summary: "get list of roles of every user",
  description: "Get roles of every user",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: UserRolesSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/menus",
  tags: ["menus"],
  summary: "for this user, get all of his roles",
  description: "Get all menus that assigned to current role",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: MenuSchemaResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/menus",
  tags: ["menus"],
  summary: "super user can register or create new menu",
  description: "Create menu",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: MenuBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "created new menu",
      content: {
        "application/json": {
          schema: z.object({
            message: z
              .string()
              .openapi({ example: "menu created successfully" }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/permissions",
  tags: ["permissions"],
  summary: "set this role to be able to access this menu",
  description: "Allowing which menu can access by a role",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: PermissionBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "permission added" }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/menus/{id}",
  tags: ["menus"],
  summary: "delete menu based on provided id",
  description: "Delete menu",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.number().openapi({ example: 12 }),
    }),
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "success" }),
            message: z
              .string()
              .openapi({ example: "menu deleted successfully" }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/menus",
  tags: ["menus"],
  summary: "edit menu based on provided id",
  description: "Edit menu",
  security: [{ bearerAuth: [] }],
  responses: {},
});

registry.registerPath({
  method: "post",
  path: "/roles",
  tags: ["roles"],
  security: [{ bearerAuth: [] }],
  summary: "create or register a new menu",
  description: "create new roles",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().openapi({ example: "Developer" }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "success created new role",
      content: {
        "application/json": {
          schema: z.object({
            message: z
              .string()
              .openapi({ example: "role created successfully" }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/roles",
  tags: ["roles"],
  summary: "get list of all available roles",
  description: "get role list",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: z.object({
            roles: z.array(RoleSchema),
          }),
        },
      },
    },
  },
});
