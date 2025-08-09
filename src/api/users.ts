import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import type { User } from "../db/schema.js";
import { checkPasswordHash, hashPassword } from "../auth.js";

type UserResponse = Omit<User, "hashedPassword">;

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
    email: string,
    password: string,
    expiresInSeconds?: number,
  };
  
  const params: Parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  if ((await checkPasswordHash(params.password, user.hashedPassword)) === false) {
    throw new UnauthorizedError("Incorrect email or password");
  }


  res.header("Content-Type", "application/json");
  const response: UserResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  };
  res.status(200).send(response);
}
