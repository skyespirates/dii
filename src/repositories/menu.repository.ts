import pool from "../infra/db";
import logger from "../utils/logger";
import { Menu } from "../types";

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

export default { getMenu };
