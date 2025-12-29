import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import employeeService from "./services/employee.service";
import bcrypt from "bcrypt";
import jwt from "./utils/jwt";
import { TokenPayload, Roles, Menu as M, Users, Role } from "./types";
import menuService from "./services/menu.service";
import { buildMenuTree } from "./utils/buildMenu";
import {
  authenticateJWT,
  isAdmin,
  isMultiRole,
  validateData,
} from "./middlewares";
import cors from "cors";
import menuRepository from "./repositories/menu.repository";
import { getUser } from "./repositories/user.repository";
import roleService from "./services/role.service";
import passport from "passport";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { getAllUsers } from "./repositories/user.repository";

import githubStrategy from "./auth/github";
import googleStrategy from "./auth/google";

import session from "express-session";
import { sessionOptions } from "./config";
import swaggerUi from "swagger-ui-express";
import { generateApiDocumentation } from "./docs/openapi-doc";
import { RegisterBodySchema } from "./schemas/register.schema";
import { LoginPayloadSchema } from "./schemas/login.schema";
import { RoleSelectBodySchema } from "./schemas/role_select.schema";
import { MenuBodySchema } from "./schemas/menu.schema";
import { PermissionBodySchema } from "./schemas/permission.schema";
import { HttpError } from "./utils/error";

passport.use(githubStrategy);
passport.use(googleStrategy);

// tentukan apa yang akan disimpan di session
// dalam hal ini saya memutuskan untuk menyimpan id
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// jika user sudah login, bagaimana cara mendapatkan data user berdasarkan id yg disimpan di session tadi
passport.deserializeUser(async function (id, done) {
  try {
    if (!id) throw new Error("deserialize");
    const user = await getUser(String(id));
    if (!user) {
      throw new Error("user not found in session");
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

const app = express();

const server = createServer(app);

type Message = {
  id: number;
  message: string;
};

const serverId = 2;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const sessionMiddleware = session(sessionOptions);

app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const wrap = (middleware: any) => (socket: any, next: any) =>
  middleware(socket.request, {} as any, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  const user = socket.request.user as Users | undefined;

  if (!user) {
    return next(new Error("Unauthorized"));
  }

  socket.user = user; // attach user to socket
  next();
});

io.on("connection", (socket) => {
  console.log("user connected 🚀");

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
  socket.on("disconnect", () => {
    console.log("disconnected! 🥴");
  });
});

app.get("/chat", (req, res) => {
  const msg: Message = {
    id: serverId,
    message: "hello world! 🥴",
  };
  io.emit("message", msg);

  res.send("message sent");
});

app.get("/", async (req, res) => {
  // const user = await getUser("hello");
  // if (user == undefined) {
  //   res.send("user not fould!");
  //   return;
  // }
  res.send("hello, world!");
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failWithError: true }),
  (req: Request, res: Response) => {
    res.redirect("http://localhost:5173");
  },
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.redirect("http://localhost:5173/login");
  }
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failWithError: true }),
  (req: Request, res: Response) => {
    res.redirect("http://localhost:5173");
  },
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.redirect("http://localhost:5173/login");
  }
);

app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:5173/login");
  });
});

app.get("/users", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json("Unauthorized!");
  }
  const users = await getAllUsers(req.user.id);
  const resp = { users };
  res.json(resp);
});

app.get("/api/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json("Unauthorized!");
  }

  const payload: TokenPayload = {
    employee_id: req.user.id,
  };
  const resp = {
    user: req.user,
    token: jwt.generateToken(payload),
  };
  res.json(resp);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(generateApiDocumentation()));

app.post("/register", validateData(RegisterBodySchema), async (req, res) => {
  const { fullname, username, password } = req.body;
  const insertedId = await employeeService.registerEmployee(
    fullname,
    username,
    password
  );
  const payload: TokenPayload = {
    employee_id: insertedId,
    role_id: 1,
  };
  const token = jwt.generateToken(payload);

  res.json({ access_token: token });
});

app.post("/login", validateData(LoginPayloadSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const employee = await employeeService.getByUsername(username);
    if (employee == null) {
      res.status(401).json({ message: "invalid username or password" });
      return;
    }

    const emp = employee[0];

    const isMatch = await bcrypt.compare(password, emp.password);
    if (!isMatch) {
      res.status(401).json({ message: "invalid username or password" });
      return;
    }

    const payload: TokenPayload = {
      employee_id: emp.employee_id,
    };

    if (employee.length == 1) {
      payload.role_id = emp.role_id;
      payload.role = emp.role_name;

      const token = jwt.generateToken(payload);

      const data = {
        access_token: token,
      };

      res.json(data);
      return;
    }

    let roles: Roles[] = [];
    const r: number[] = [];

    for (let e of employee) {
      const role = {
        role_id: e.role_id,
        name: e.role_name,
      };
      roles.push(role);
      r.push(role.role_id);
    }

    payload.roles = r;

    const token = jwt.generateToken(payload);

    const result = {
      access_token: token,
      roles,
    };

    res.json(result);
  } catch (error) {
    res.status(401).json({ message: "invalid username or password" });
  }
});

app.post(
  "/roles/select",
  authenticateJWT,
  validateData(RoleSelectBodySchema),
  isMultiRole,
  async (req, res) => {
    const { employee_id } = req.users!;
    const { role_id } = req.body;

    try {
      const emp = await employeeService.getRole(Number(employee_id), role_id);
      if (emp == null) {
        res.status(400).json({ message: "failed to get employee role" });
        return;
      }
      const payload: TokenPayload = {
        employee_id: emp.employee_id,
        role_id: emp.role_id,
        role: emp.role_name,
      };

      const token = jwt.generateToken(payload);

      const data = {
        message: "login successfully",
        access_token: token,
      };

      res.json(data);
      return;
    } catch (error) {
      res.status(500).json({ message: "failed to get employee role", error });
    }
  }
);

app.get("/roles/user", async (req, res) => {
  try {
    const userRoles = await roleService.getUserRole();
    const data = {
      status: "success",
      message: "get all roles for all users",
      users: userRoles,
    };
    res.json(data);
  } catch (error) {
    res.status(500).send("internal server error");
  }
});

app.get("/menus", authenticateJWT, async (req, res) => {
  const { role_id } = req?.users as TokenPayload;
  try {
    if (!role_id) {
      res.status(400).send("no role_id provided");
      return;
    }
    const menus = await menuService.getAllMenus(role_id);
    const result = buildMenuTree(menus);
    res.json({ result: result });
  } catch (error) {
    res.status(500).send("internal server error");
  }
});

app.post(
  "/menus",
  authenticateJWT,
  validateData(MenuBodySchema),
  isAdmin,
  async (req, res) => {
    const { name, parent_id, url, sort_order } = req.body;
    try {
      const insertedId = await menuRepository.addMenu(
        name,
        parent_id,
        url,
        sort_order
      );
      if (insertedId == -1) {
        res.status(400).json({
          status: "failed",
          message: "parent_id is invalid or not found",
        });
        return;
      }
      res.status(201).json({
        message: "menu inserted successfully",
        insertedId,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "internal server error" });
    }
  }
);

app.post(
  "/permissions",
  authenticateJWT,
  validateData(PermissionBodySchema),
  isAdmin,
  async (req, res) => {
    const { role_id, menu_id } = req.body;
    try {
      const succeed = await menuService.addMenuPermission(role_id, menu_id);
      if (!succeed) {
        res.json({
          status: "failed",
          message: `failed to add permission to menu_id: ${menu_id}`,
        });
        return;
      }
      res.json({
        status: "success",
        message: `role permission added to menu ${menu_id}`,
      });
    } catch (error) {
      res.send(500).send("internal server error");
    }
  }
);

app.delete("/menus/:id", authenticateJWT, isAdmin, async (req, res) => {
  const { id } = req.params;
  const menu_id = parseInt(id);
  try {
    const succeed = await menuService.deleteMenu(menu_id);
    if (!succeed) {
      res.status(400).json({
        status: "error",
        message: "failed to delete menu_id: " + menu_id,
      });
      return;
    }

    res.json({ status: "success", message: "menu deleted successfully" });
  } catch (error) {
    res.send(500).json({ message: "error", error });
  }
});

app.patch("/menus/:id", authenticateJWT, isAdmin, async (req, res) => {
  const { id } = req.params;
  const menu_id = parseInt(id);
  const { name, url, sort_order } = req.body;
  const m: M = {
    menu_id,
    name,
    url,
    sort_order,
    parent_id: -1,
  };
  try {
    const result = await menuService.updateMenu(m);
    if (result == null) {
      res
        .status(400)
        .json({ status: "error", message: "failed to update menu" });
      return;
    }
    res.json({
      status: "success",
      message: "menu updated successfully",
      result,
    });
  } catch (error) {
    res.send(500).json({ message: "error", error });
  }
});

app.post("/roles", authenticateJWT, isAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const created = await roleService.createRole(name);
    if (!created) {
      res
        .status(400)
        .json({ status: "error", message: "failed to create a new role" });
      return;
    }

    res.json({
      status: "success",
      message: "role created successfully",
    });
  } catch (error) {
    res.send(500).json({ message: "error", error });
  }
});

app.get("/roles", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const roles = await roleService.getRole();
    res.json({ status: "success", message: "get roles successfully", roles });
  } catch (error) {
    res.send(500).json({ message: "error", error });
  }
});

// handle 404 not found
app.use((req, res, next) => {
  const error = new HttpError(
    404,
    "error",
    `cant find ${req.originalUrl} on the server 🥴🥴🥴`
  );
  next(error);
});

// global error handler
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpError) {
    res
      .status(error.statusCode)
      .json({ status: error.status, message: error.message });

    return;
  }

  res
    .status(500)
    .json({ status: "error", message: "internal server error 🤮🤮🤮" });
});

server.listen(3000, () => {
  console.log("server running on port 3000");
});

declare global {
  namespace Express {
    interface Request {
      users?: TokenPayload;
    }
    interface User extends Users {}
  }
}

declare module "http" {
  interface IncomingMessage {
    user?: Users;
  }
}

declare module "socket.io" {
  interface Socket {
    user?: Users;
  }
}
