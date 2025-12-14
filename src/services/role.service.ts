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

type Role = {
  username: string;
  roles: string[];
};

async function getUserRole(): Promise<Role[]> {
  try {
    const userRoles = await roleRepository.getUserRoles();
    const rolesMap = new Map<string, Role>();

    for (const r of userRoles) {
      if (!rolesMap.has(r.username)) {
        rolesMap.set(r.username, {
          username: r.username,
          roles: [r.role_name],
        });
      } else {
        rolesMap.get(r.username)!.roles.push(r.role_name);
      }
    }

    const result: Role[] = Array.from(rolesMap.values());
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error("role service: failed to get roles of all users");
  }
}

export default { createRole, getRole, getUserRole };
