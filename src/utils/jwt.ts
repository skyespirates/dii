import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";
import { env } from "../configs/env";

const secret = env.JWT_SECRET;
if (!secret) {
  throw new Error("env: JWT_SECRET is unset");
}

const expiresIn = env.JWT_EXPIRED_IN;
if (!expiresIn) {
  throw new Error("env: JWT_EXPIRED_IN is unset");
}

function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export default {
  generateToken,
};
