import { Request, Response } from "express";
import {
  createUser,
  getUserByEmail,
  updateUserCredentials,
  upgradeUserChirpyRed,
} from "../db/queries/users.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import type { User } from "../db/schema.js";
import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  makeRefreshToken,
  validateJWT,
} from "../auth.js";
import { config } from "../config.js";
import { getUserByRefreshToken, revokeRefreshToken, saveRefreshToken } from "../db/queries/refresh_tokens.js";

type UserResponse = Omit<User, "hashedPassword">;
type LoginResponse = UserResponse & { token: string; refreshToken: string };
const ONE_HOUR = 60 * 60;

export async function handlerUsersCreate(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  params.password = await hashPassword(params.password);
  const user: UserResponse = await createUser({
    email: params.email,
    hashedPassword: params.password,
  });
  if (!user) {
    throw new Error("Could not create user");
  }

  res.header("Content-Type", "application/json");
  res.status(201).send(JSON.stringify(user));
}

export async function handlerLogin(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  if (
    (await checkPasswordHash(params.password, user.hashedPassword)) === false
  ) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  const token = makeJWT(user.id, config.api.jwtSecret);
  const refreshToken = makeRefreshToken();
  const dbRefreshToken = await saveRefreshToken(user.id, refreshToken);
  if (!dbRefreshToken) {
    throw new UnauthorizedError("No refresh token");
  }

  res.header("Content-Type", "application/json");
  const response: LoginResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: token,
    refreshToken: refreshToken,
    isChirpyRed: user.isChirpyRed,
  };
  res.status(200).send(JSON.stringify(response));
}

export async function handlerRefreshJWT(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const result = await getUserByRefreshToken(refreshToken);
  if (!result) {
    throw new UnauthorizedError("User no authenticated");
  }

  const user = result.user;
  const newAccessToken = makeJWT(user.id, config.api.jwtSecret, config.api.jwtDefaultDuration);
  res.set("Content-Type", "application/json");
  res.status(200).send({ token: newAccessToken });
}

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}

export async function handlerUpdateCredentials(req: Request, res: Response) {
  type Parameters = {
    password: string,
    email: string,
  }
  const token = getBearerToken(req);
  const userID = validateJWT(token, config.api.jwtSecret);

  const params: Parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }
  const hashedPassword = await hashPassword(params.password);
  const updatedUser = await updateUserCredentials(userID, params.email, hashedPassword);

  const body: UserResponse = {
    id: updatedUser.id,
    email: updatedUser.email,
    updatedAt: updatedUser.updatedAt,
    createdAt: updatedUser.createdAt,
    isChirpyRed: updatedUser.isChirpyRed,
  }
  res.set("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(body));
}
