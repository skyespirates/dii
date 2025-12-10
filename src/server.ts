import "dotenv/config";
import express from "express";
import { JwtPayload } from "jsonwebtoken";
import employeeService from "./services/employee.service";
import logger from "./utils/logger";
import bcrypt from "bcrypt";
import jtw from "./utils/jwt";
import { TokenPayload } from "./types";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello, world!");
});

app.post("/employees", async (req, res) => {
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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const emp = await employeeService.getEmployee(username);
    if (emp == null) {
      res.status(401).json({ message: "invalid username or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, emp.password);
    if (!isMatch) {
      res.status(401).json({ message: "invalid username or password" });
      return;
    }

    const payload: TokenPayload = {
      employee_id: emp.employee_id,
      role: emp.role,
    };

    const token = jtw.generateToken(payload);

    const data = {
      message: "login successfully",
      access_token: token,
    };

    res.json(data);
  } catch (error) {
    res.status(401).json({ message: "invalid username or password" });
  }
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});

declare global {
  namespace Express {
    interface Request {
      user?: string | object | JwtPayload;
    }
  }
}
