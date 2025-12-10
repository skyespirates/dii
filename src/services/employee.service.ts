import employeeRepository from "../repositories/employee.repository";
import bcrypt from "bcrypt";
import logger from "../utils/logger";

async function registerEmployee(
  username: string,
  password: string
): Promise<number | null> {
  try {
    const hashed_password = await bcrypt.hash(password, 10);
    const res = await employeeRepository.create(username, hashed_password);
    return res;
  } catch (error) {
    logger.error(error);
    throw new Error("service: failed to register employee");
  }
}

async function getEmployee(username: string) {
  try {
    const employee = await employeeRepository.get(username);
    return employee;
  } catch (error) {
    logger.error(error);
    throw new Error("service: failed to login");
  }
}

export default { registerEmployee, getEmployee };
