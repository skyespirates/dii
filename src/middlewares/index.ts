import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret_key = process.env.JWT_SECRET;
  if (!secret_key) {
    throw new Error("JWT_SECRET is not set");
  }
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    jwt.verify(token, secret_key, (err, payload) => {
      if (err) {
        res.status(401).json({ message: "invalid or expired token" });
        return;
      }
      req.user = payload;
      next();
    });
  } else {
    res.status(401).json({ message: "missing access token" });
  }
}
