import { Request, Response } from "express";
import { upgradeUserChirpyRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
import { UnauthorizedError } from "./errors.js";

export async function handlerUpgradeChirpyRed(req: Request, res: Response) {
  const apiKey = getAPIKey(req);
  if (apiKey !== config.api.polkaApiKey) {
    throw new UnauthorizedError("OMG YOU REALLY THOUGHT THAT WAS THE RIGHT API KEY LOL!");
  }
  type Parameters = {
    event: string,
    data: {
      userId: string,
    }
  };

  const params: Parameters = req.body;
  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  await upgradeUserChirpyRed(params.data.userId);
  res.status(204).send();
}