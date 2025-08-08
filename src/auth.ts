import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { UnauthorizedError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";
type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  const timeInSeconds = Math.floor(Date.now() / 1000);
  const payload: payload = {
    iss: "chirpy",
    sub: userID,
    iat: timeInSeconds,
    exp: timeInSeconds + expiresIn,
  }
  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UnauthorizedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UnauthorizedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UnauthorizedError("No user ID in token");
  }

  return decoded.sub;
}