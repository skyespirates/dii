import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ApiResponseSchema } from "./schemas/user_roles.schema";
import { MenuSchemaResponse } from "./schemas/menu.schema";
import {
  LoginPayloadSchema,
  LoginResponseSchema,
} from "./schemas/login.schema";
import {
  AddMenuResponseSchema,
  Menu,
  Permission,
  PermissionResponse,
  RoleSchema,
  SelectRole,
} from "./schemas";
import z from "zod";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/register",
  tags: ["user"],
  responses: {},
});

registry.registerPath({
  method: "post",
  path: "/login",
  tags: ["auth"],
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
  description: "generate token based on user selected role",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SelectRole,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
          example: {
            message: "login successfully",
            access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/roles/user",
  tags: ["roles"],
  description: "Get roles of every user",
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: ApiResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/menus",
  tags: ["menus"],
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
  description: "Create menu",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Menu,
        },
      },
    },
  },
  responses: {
    200: {
      description: "created new menu",
      content: {
        "application/json": {
          schema: AddMenuResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/permissions",
  tags: ["permissions"],
  description: "Allowing which menu can access by a role",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: Permission,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: PermissionResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/menus/{id}",
  tags: ["menus"],
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
  description: "Edit menu",
  security: [{ bearerAuth: [] }],
  responses: {},
});

registry.registerPath({
  method: "post",
  path: "/roles",
  tags: ["roles"],
  security: [{ bearerAuth: [] }],
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
    200: {
      description: "success created new role",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "success" }),
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
  description: "get role list",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "success" }),
            message: z.string().openapi({ example: "get roles successfully" }),
            roles: z.array(RoleSchema),
          }),
        },
      },
    },
  },
});
