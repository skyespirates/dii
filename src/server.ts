import "dotenv/config";
import express from "express";
import employeeService from "./services/employee.service";
import bcrypt from "bcrypt";
import jwt from "./utils/jwt";
import { TokenPayload, Roles, Menu as M } from "./types";
import menuService from "./services/menu.service";
import { buildMenuTree } from "./utils/buildMenu";
import { authenticateJWT, validateData } from "./middlewares";
import cors from "cors";
import menuRepository from "./repositories/menu.repository";
import {
  Login,
  Menu,
  MenuId,
  Permission,
  Register,
  SelectRole,
} from "./schemas";
import roleService from "./services/role.service";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello, world!");
});

app.post("/register", validateData(Register), async (req, res) => {
  const { fullname, username, password } = req.body;
  try {
    const insertedId = await employeeService.registerEmployee(
      fullname,
      username,
      password
    );
    const data = {
      message: "employee registered successfully",
      employee_id: insertedId,
    };
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ status: "error", error });
  }
});

app.post("/login", validateData(Login), async (req, res) => {
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
        message: "login single role successfully",
        access_token: token,
      };

      res.json(data);
      return;
    }

    let roles: Roles[] = [];

    for (let e of employee) {
      const role = {
        role_id: e.role_id,
        name: e.role_name,
      };
      roles.push(role);
    }

    const token = jwt.generateToken(payload);

    const result = {
      message: "select role",
      access_token: token,
      roles,
    };

    res.json(result);
  } catch (error) {
    res.status(401).json({ message: "invalid username or password" });
  }
});

app.post("/roles/select", validateData(SelectRole), async (req, res) => {
  const { employee_id, role_id } = req.body;

  try {
    const emp = await employeeService.getRole(employee_id, role_id);
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
});

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
  const { role_id } = req?.user as TokenPayload;
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

app.post("/menus", authenticateJWT, validateData(Menu), async (req, res) => {
  const { role } = req.user!;
  if (role != "admin") {
    res.status(401).send("only admin can create menu");
    return;
  }

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
    res.status(500).json({ status: "error", message: "internal server error" });
  }
});

app.post(
  "/permissions",
  authenticateJWT,
  validateData(Permission),
  async (req, res) => {
    const { role } = req.user!;
    if (role != "admin") {
      res.status(401).send("only admin can add permission");
      return;
    }

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

app.delete("/menus/:id", authenticateJWT, async (req, res) => {
  const { role } = req.user!;
  if (role != "admin") {
    res.status(401).send("only admin can delete menu");
    return;
  }

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

app.patch("/menus/:id", authenticateJWT, async (req, res) => {
  const { role } = req.user!;
  if (role != "admin") {
    res.status(401).send("only admin can delete menu");
    return;
  }
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

app.post("/roles", authenticateJWT, async (req, res) => {
  const { role } = req.user!;
  if (role != "admin") {
    res.status(401).send("only admin can delete menu");
    return;
  }

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

app.get("/roles", authenticateJWT, async (req, res) => {
  const { role } = req.user!;
  if (role != "admin") {
    res.status(401).send("only admin can delete menu");
    return;
  }
  try {
    const roles = await roleService.getRole();
    res.json({ status: "success", message: "get roles successfully", roles });
  } catch (error) {
    res.send(500).json({ message: "error", error });
  }
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
