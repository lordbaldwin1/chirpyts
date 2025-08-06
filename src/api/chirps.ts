import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const splitParams = params.body.split(" ");
  const profane = ["kerfuffle", "sharbert", "fornax"];
  for (let i = 0; i < splitParams.length; i++) {
    if (profane.includes(splitParams[i].toLowerCase())) {
      splitParams[i] = "****";
    }
  }

  const cleanedParams = splitParams.join(" ");

  respondWithJSON(res, 200, { cleanedBody: cleanedParams });
}
