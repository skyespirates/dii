import "dotenv/config";
import express from "express";
import { JwtPayload } from "jsonwebtoken";
import employeeService from "./services/employee.service";
import logger from "./utils/logger";
import bcrypt from "bcrypt";
import jtw from "./utils/jwt";
import { TokenPayload } from "./types";
import menuService from "./services/menu.service";
import { buildMenuTree } from "./utils/buildMenu";
import { authenticateJWT, validateData } from "./middlewares";
import cors from "cors";
import menuRepository from "./repositories/menu.repository";
import { Menu } from "./schemas";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello, world!");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const insertedId = await employeeService.registerEmployee(
      username,
      password
    );
    const data = {
      message: "employee registered successfully",
      employee_id: insertedId,
    };
    res.status(201).json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).send("internal server error");
  }
});

interface Roles {
  role_id: number;
  name: string;
}

app.post("/login", async (req, res) => {
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

    if (employee.length == 1) {
      const payload: TokenPayload = {
        employee_id: emp.employee_id,
        role_id: emp.role_id,
        role: emp.role_name,
      };

      const token = jtw.generateToken(payload);

      const data = {
        message: "login successfully",
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

    res.json({
      message: "select a role",
      roles,
    });
  } catch (error) {
    res.status(401).json({ message: "invalid username or password" });
  }
});

app.post("/select-role", async (req, res) => {
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

    const token = jtw.generateToken(payload);

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

app.get("/menus", authenticateJWT, async (req, res) => {
  logger.info(req.user);
  const { role_id } = req?.user as TokenPayload;
  try {
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

app.post("/permission", (req, res) => {
  res.send("set permission");
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
