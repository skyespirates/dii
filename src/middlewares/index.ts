import { Request, Response, NextFunction, raw } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";
import { z, ZodError } from "zod";
import { env } from "../configs/env";
import { HttpError } from "../utils/error";

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret_key = env.JWT_SECRET;

  const rawToken = req.header("Authorization");
  if (!rawToken?.startsWith("Bearer")) {
    const error = new HttpError(401, "fail", "token must be Bearer");
    next(error);
    return;
  }

  const splittedToken = rawToken.split(" ");

  if (splittedToken.length != 2) {
    const error = new HttpError(401, "fail", "no token is provided");
    next(error);
    return;
  }

  const token = splittedToken[1];

  jwt.verify(token, secret_key, (err, payload) => {
    if (err) {
      const error = new HttpError(401, "fail", err.message);
      next(error);
      return;
    }
    req.users = payload as TokenPayload;
    next();
  });
}

export function isMultiRole(req: Request, res: Response, next: NextFunction) {
  const { roles } = req.users!;
  const { role_id } = req.body;
  const isMultirole = roles?.includes(role_id);
  if (!isMultirole) {
    const error = new HttpError(
      403,
      "fail",
      "you are not assigned to that role"
    );
    next(error);
  }
  next();
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
        const err = new HttpError(
          400,
          "validation error",
          errorMessages[0].message
        );
        next(err);
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const { role_id } = req.users!;
  if (role_id != 2) {
    const error = new HttpError(403, "fail", "admin only");
    next(error);
    return;
  }
  next();
}
