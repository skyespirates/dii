import pool from "../infra/db";
import logger from "../utils/logger";
import { InsertedId, Menu } from "../types";

async function getMenu(role_id: number): Promise<Menu[]> {
  const query = `SELECT m.menu_id, m.name, m.parent_id, m.url, m.sort_order
  FROM menus m
  JOIN role_menus rm ON rm.menu_id = m.menu_id
  WHERE rm.role_id = $1
  ORDER BY parent_id, sort_order;
  `;
  try {
    const res = await pool.query<Menu>(query, [role_id]);
    return res.rows;
  } catch (error) {
    logger.error(error);
    throw new Error("failed to get menu");
  }
}

async function isExists(menu_id: number): Promise<boolean> {
  try {
    const result = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM menus WHERE menu_id = $1)",
      [menu_id]
    );
    return result.rows[0];
  } catch (error) {
    logger.error(error);
    throw new Error("menu repository: failed to check is menu exists");
  }
}

async function getMenuById(menu_id: number): Promise<Menu> {
  try {
    const result = await pool.query<Menu>(
      "SELECT menu_id, name, parent_id, url, sort_order FROM menus WHERE menu_id = $1",
      [menu_id]
    );
    return result.rows[0];
  } catch (error) {
    logger.error(error);
    throw new Error("menu repository: failed to get menu by id");
  }
}

async function addMenu(
  name: string,
  parent_id: number,
  url: string,
  sort_order: number
): Promise<number> {
  const queryInsertMenu = `INSERT INTO menus (name, parent_id, url, sort_order) VALUES ($1, $2, $3 ,$4) RETURNING menu_id`;
  const args = [name, parent_id, url, sort_order];

  const queryAdminMenu =
    "INSERT INTO role_menus (role_id, menu_id) VALUES (2, $1)";

  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");

    const result = await conn.query<InsertedId>(queryInsertMenu, args);

    const insertedId = result.rows[0].menu_id;

    await conn.query(queryAdminMenu, [insertedId]);

    await conn.query("COMMIT");

    return insertedId;
  } catch (error) {
    await conn.query("ROLLBACK");
    logger.error(error);
    throw new Error("menu repository: failed to add menu");
  } finally {
    conn.release();
  }
}

async function addPermission(
  role_id: number,
  menu_id: number
): Promise<boolean> {
  try {
    const result = await pool.query(
      "INSERT INTO role_menus (role_id, menu_id) VALUES ($1, $2)",
      [role_id, menu_id]
    );
    if (result.rowCount == null || result.rowCount == 0) {
      return false;
    }
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error("menu repository: failed to add permission");
  }
}

export default { getMenu, addMenu, isExists, getMenuById, addPermission };
