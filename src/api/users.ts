import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
  };

  const params: parameters = req.body;
  const newUser: NewUser = {
    email: params.email,
  };
  try {
    const result = await createUser(newUser);
    res.header("Content-Type", "application/json");
    const body = JSON.stringify(result);
    res.status(201).send(body);
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
}
