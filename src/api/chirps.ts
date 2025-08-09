import { Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createChirp, deleteChirp, getAllChirps, getChirp, getChirpsByAuthor } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { json } from "stream/consumers";
import { Chirp } from "src/db/schema.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const token = getBearerToken(req);
  const userID = validateJWT(token, config.api.jwtSecret);

  params.body = validateChirps(params.body);
  const chirp = await createChirp({
    userId: userID,
    body: params.body,
  });
  res.header("Content-Type", "application/json");
  res.status(201).send(JSON.stringify(chirp));
}

function validateChirps(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
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

export async function handlerChirpsDelete(req: Request, res: Response) {
  const jwt = getBearerToken(req);
  const userID = validateJWT(jwt, config.api.jwtSecret);
  const chirpID = req.params["chirpID"];
  
  const chirp = await getChirp(chirpID);
  if (!chirp) {
    throw new NotFoundError("BRUH THAT CHIRP DOES NOT EXIST!")
  }
  if (chirp.userId !== userID) {
    throw new ForbiddenError("NAH G THAT IS NOT YOUR CHIRP");
  } 

  const deleted = await deleteChirp(userID, chirpID);
  if (!deleted) {
    throw new Error("AHHH WHAT THE HECK... THAT FAILED TO GET DELETED :(")
  }

  res.status(204).send();
}

export async function handlerChirpsGet(req: Request, res: Response) {
  const chirpID = req.params["chirpID"];
  const chirp = await getChirp(chirpID);
  if (!chirp) {
    throw new NotFoundError("BRUH I SERIOUSLY CAN'T FIND THAT CHIRP. WHAT THE HELL!?!?");
  }

  res.set("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(chirp));
}

export async function handlerChirpsGetAll(req: Request, res: Response) {
  let authorID = "";
  let authorIDQuery = req.query.authorId;
  if (typeof authorIDQuery === "string") {
    authorID = authorIDQuery;
  }

  type Sort = "asc" | "desc";
  let sort = req.query.sort as Sort;
  if (!sort) {
    sort = "asc";
  }

  if (authorID.length > 0) {
    const chirps: Chirp[] = sortChirps(await getChirpsByAuthor(authorID), sort);
    if (chirps.length === 0) {
      throw new NotFoundError("WAAAA NO CHIRPS FROM THAT DUDE");
    }
    res.status(200).send(chirps);
    return;
  }

  const chirps: Chirp[] = sortChirps(await getAllChirps(), sort);
  if (!chirps) {
    throw new NotFoundError("WOW THIS SITE STINKS! NO CHIRPS AT ALL!???");
  }
  res.status(200).send(chirps);
} // CH6, L11

function sortChirps(chirps: Chirp[], sort: "asc" | "desc") {
  if (sort === "asc") {
    return chirps.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else {
    return chirps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
} 
