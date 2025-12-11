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

export default { getAllMenus };
