import { PoolClient } from "pg";
import logger from "../utils/logger";
import { boolean } from "zod";
import pool from "../infra/db";
import { Roles } from "../types";

async function setEmployeeRole(conn: PoolClient, employee_id: number) {
  try {
    await conn.query(
      "INSERT INTO employee_roles (employee_id, role_id) VALUES ($1, 1)",
      [employee_id]
    );
  } catch (error) {
    logger.error(error);
    throw new Error("role repository: failed to set role");
  }
}

async function create(name: string): Promise<boolean> {
  try {
    const result = await pool.query("INSERT INTO roles (name) VALUES ($1)", [
      name,
    ]);

    if (result.rowCount == 0) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error("role repository: failed to create role");
  }
}

async function get(): Promise<Roles[]> {
  try {
    const result = await pool.query<Roles>(
      "SELECT role_id, name, description FROM roles"
    );
    return result.rows;
  } catch (error) {
    logger.error(error);
    throw new Error("role repository: failed get role list");
  }
}

export default {
  setEmployeeRole,
  create,
  get,
};
