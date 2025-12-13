import menuRepository from "../repositories/menu.repository";
import { Menu } from "../types";
import logger from "../utils/logger";

async function getAllMenus(role_id: number) {
  try {
    const result = await menuRepository.getMenu(role_id);
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error("menu service: failed to getAllMenus");
  }
}

async function createNewMenu(
  name: string,
  parent_id: number,
  url: string,
  sort_order: number
): Promise<number> {
  try {
    const exists = await menuRepository.isExists(parent_id);
    if (!exists) {
      return -1;
    }
    const insertedId = await menuRepository.addMenu(
      name,
      parent_id,
      url,
      sort_order
    );
    return insertedId;
  } catch (error) {
    logger.error(error);
    throw new Error("menu service: failed to create new menu");
  }
}

async function addMenuPermission(
  role_id: number,
  menu_id: number
): Promise<boolean> {
  try {
    const succeed = await menuRepository.addPermission(role_id, menu_id);
    return succeed;
  } catch (error) {
    logger.error(error);
    throw new Error("menu service: failed to add menu permission");
  }
}

async function deleteMenu(menu_id: number): Promise<boolean> {
  try {
    const result = await menuRepository.deleteMenu(menu_id);
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error("menu service: failed to delete menu");
  }
}

async function updateMenu(m: Menu): Promise<Menu | null> {
  try {
    const menu = await menuRepository.getMenuById(m.menu_id);
    if (!menu) {
      logger.info(`menu_id ${m.menu_id} is not found`);
      return null;
    }

    const parent_id = menu.parent_id;

    Object.assign(menu, m);

    menu.parent_id = parent_id;

    const result = await menuRepository.updateMenu(menu);
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error("menu service: failed to update menu");
  }
}

export default {
  getAllMenus,
  createNewMenu,
  addMenuPermission,
  deleteMenu,
  updateMenu,
};
