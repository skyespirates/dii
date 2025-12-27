import logger from "../utils/logger";
import { EmployeeRole, EmployeeRow } from "../types";
import { PoolClient } from "pg";
import pool from "../infra/db";
import { HttpError } from "../utils/error";

interface InsertedResult {
  employee_id: number;
}

type PostgresError = {
  code: string;
  constraint: string;
  detail: string;
};

function isPostgresError(error: unknown): error is PostgresError {
  return typeof error == "object" && error != null && "code" in error;
}

async function create(
  conn: PoolClient,
  fullname: string,
  username: string,
  password: string
): Promise<number> {
  const query =
    "INSERT INTO employees (fullname, username, password) VALUES ($1, $2, $3) RETURNING employee_id";
  const args = [fullname, username, password];
  try {
    const result = await conn.query<InsertedResult>(query, args);
    return result.rows[0].employee_id;
  } catch (error) {
    if (isPostgresError(error) && error.code == "23505") {
      throw new HttpError(409, "error", "username already exists");
    }
    throw error;
  }
}

async function get(
  conn: PoolClient,
  username: string
): Promise<EmployeeRole[] | null> {
  const query = `
                    SELECT
                    e.employee_id,
                    e.username,
                    e.password,
                    r.role_id,
                    r.name AS role_name
                    FROM
                    employees e
                    JOIN
                    employee_roles er ON e.employee_id = er.employee_id
                    JOIN
                    roles r ON er.role_id = r.role_id
                    WHERE e.username = $1;
                    `;
  try {
    const result = await conn.query<EmployeeRole>(query, [username]);
    if (result.rows.length == 0) {
      return null;
    }
    return result.rows;
  } catch (error) {
    logger.error(error);
    throw new Error("employee repository: failed to get employee");
  }
}

async function getRole(
  employee_id: number,
  role_id: number
): Promise<EmployeeRow | null> {
  const query = `
              SELECT 
              e.employee_id, 
              e.username, 
              r.role_id, 
              r.name AS role_name 
              FROM employees e 
              JOIN 
              employee_roles er ON er.employee_id = e.employee_id
              JOIN 
              roles r ON r.role_id = er.role_id 
              WHERE e.employee_id= $1 AND r.role_id= $2
  `;
  const args = [employee_id, role_id];
  try {
    const result = await pool.query<EmployeeRow>(query, args);
    if (result.rows.length == 0) {
      return null;
    }
    const res = result.rows[0];
    return res;
  } catch (error) {
    logger.error(error);
    throw new Error("employee repository: failed to get employee role");
  }
}

export default { create, get, getRole };
