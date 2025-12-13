import roleRepository from "../repositories/role_repository";
import { Roles } from "../types";
import logger from "../utils/logger";

async function createRole(name: string): Promise<boolean> {
  try {
    const created = await roleRepository.create(name);
    return created;
  } catch (error) {
    logger.error(error);
    throw new Error("role service: failed to create role");
  }
}

async function getRole(): Promise<Roles[]> {
  try {
    const roles = await roleRepository.get();
    return roles;
  } catch (error) {
    logger.error(error);
    throw new Error("role service: failed to get role list");
  }
}

export default { createRole, getRole };
