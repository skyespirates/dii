import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";
import { z, ZodError } from "zod";

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
      req.user = payload as TokenPayload;
      next();
    });
  } else {
    res.status(401).json({ message: "missing access token" });
  }
}

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}
