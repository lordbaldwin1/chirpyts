import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chirps.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;
  params.body = validateChirps(params.body);
  try {
    const result = await createChirp({
      userId: params.userId,
      body: params.body,
    });
    res.header("Content-Type", "application/json");
    res.status(201).send(JSON.stringify(result));
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
}

function validateChirps(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const splitParams = body.split(" ");
  const profane = ["kerfuffle", "sharbert", "fornax"];
  for (let i = 0; i < splitParams.length; i++) {
    if (profane.includes(splitParams[i].toLowerCase())) {
      splitParams[i] = "****";
    }
  }

  return splitParams.join(" ");
}
