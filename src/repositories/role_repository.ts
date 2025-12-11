import { PoolClient } from "pg";
import logger from "../utils/logger";
import pool from "../infra/db";

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

export default {
  setEmployeeRole,
};
