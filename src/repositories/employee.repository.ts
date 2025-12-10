import pool from "../infra/db";
import logger from "../utils/logger";

interface InsertedResult {
  employee_id: number;
}

interface Employee {
  employee_id: number;
  username: string;
  password: string;
  fullname: string;
  is_active: string;
}

async function create(
  username: string,
  password: string
): Promise<number | null> {
  const query =
    "INSERT INTO employees (username, password) VALUES ($1, $2) RETURNING employee_id";
  const args = [username, password];
  try {
    const result = await pool.query<InsertedResult>(query, args);
    if (result.rows.length == 0) {
      return null;
    }
    return result.rows[0].employee_id;
  } catch (error) {
    logger.error(error);
    throw new Error("repositories: failed to create employee");
  }
}

interface EmployeeRole {
  employee_id: number;
  username: string;
  password: string;
  role: string;
}

async function get(username: string): Promise<EmployeeRole | null> {
  const query = `
                    SELECT
                    e.employee_id,
                    e.username,
                    e.password,
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
    const result = await pool.query<EmployeeRole>(query, [username]);
    if (result.rows.length == 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    logger.error(error);
    throw new Error("repository: failed to get employee");
  }
}

export default { create, get };
