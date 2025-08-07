import { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "./errors.js";

export async function handlerReadiness(_: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
  res.end();
}

export async function handlerMetrics(_: Request, res: Response) {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`
  <html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
    </body>
  </html>
  `);
  res.end();
}

export async function handlerReset(_: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError("Cannot reset metrics outside of dev environment");
  }

  type resParams = {
    hitCount: number;
    deletedUsers: number;
  };
  config.api.fileServerHits = 0;
  const result = await deleteAllUsers();

  const body: resParams = {
    hitCount: config.api.fileServerHits,
    deletedUsers: result.count,
  };
  res.status(200).send(body);
  res.end();
}
