import { Request, Response } from "express";


export function handlerReadiness(req: Request, res: Response) {
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}