import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { UnauthorizedError } from "./api/errors.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

function makeJWT(userID: string, expiresIn: number, secret: string) {
  const timeInSeconds = Math.floor(Date.now() / 1000);
  const payload: payload = {
    iss: "chirpy",
    sub: userID,
    iat: timeInSeconds,
    exp: timeInSeconds + expiresIn,
  }
  return jwt.sign(payload, secret);
}

function validateJWT(tokenString: string, secret: string) {
  const token = jwt.verify(tokenString, secret);
  if (typeof token === "string") {
    throw new UnauthorizedError("Failed to validate JWT token");
  }
  const userID = token.sub;
  if (!userID) {
    throw new UnauthorizedError("Failed to validate JWT token");
  }
  return userID;
}