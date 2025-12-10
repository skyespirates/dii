import { Request, Response } from "express";

async function registerHandler(req: Request, res: Response) {
  res.send("hello world");
}
