import employeeRepository from "../repositories/employee.repository";
import roleRepository from "../repositories/role_repository";
import bcrypt from "bcrypt";
import logger from "../utils/logger";
import { EmployeeRole, EmployeeRow } from "../types";
import pool from "../infra/db";

async function registerEmployee(
  fullname: string,
  username: string,
  password: string
): Promise<number | null> {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");
    const hashed_password = await bcrypt.hash(password, 10);
    const employee_id = await employeeRepository.create(
      conn,
      fullname,
      username,
      hashed_password
    );

    if (employee_id == null) {
      return null;
    }

    await roleRepository.setEmployeeRole(conn, employee_id);

    await conn.query("COMMIT");

    return employee_id;
  } catch (error) {
    await conn.query("ROLLBACK");
    logger.error(error);
    throw new Error("service: failed to register employee");
  } finally {
    conn.release();
  }
}

async function getByUsername(username: string) {
  const conn = await pool.connect();
  try {
    const employee: EmployeeRole[] | null = await employeeRepository.get(
      conn,
      username
    );
    return employee;
  } catch (error) {
    logger.error(error);
    throw new Error("service: failed to login");
  }
}

async function getRole(
  employee_id: number,
  role_id: number
): Promise<EmployeeRow | null> {
  try {
    const employee = await employeeRepository.getRole(employee_id, role_id);
    return employee;
  } catch (error) {
    logger.error(error);
    throw new Error("employee service: failed to get employee role");
  }
}

export default { registerEmployee, getByUsername, getRole };
