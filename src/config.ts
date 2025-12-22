import pgSession from "connect-pg-simple";
import { SessionOptions } from "express-session";
import session from "express-session";
import pool from "./infra/db";

const pgS = pgSession(session);
export const sessionOptions: SessionOptions = {
  store: new pgS({
    pool,
  }),
  secret: "secret",
  resave: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 1000,
    // maxAge: 30 * 24 * 60 * 60 * 1000,
  },
  saveUninitialized: false,
};
