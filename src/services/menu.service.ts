import menuRepository from "../repositories/menu.repository";
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

export default { getAllMenus, createNewMenu, addMenuPermission };
