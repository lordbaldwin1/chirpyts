import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT } from "../auth.js";

describe("JWT Creation and Validation", () => {
  const secret = "abc123";

  const userID1 = "fartstinky";
  const userID2 = "123abc456";

  let jwt1: string;
  let jwt2: string;
  let jwt3: string;
  beforeAll(async () => {
    jwt1 = makeJWT(userID1, 10, secret);
    jwt2 = makeJWT(userID2, 10, secret);
    jwt3 = makeJWT(userID2, 0, secret);
  });

  it("should return correct userID for jwt+secret", () => {
    const result = validateJWT(jwt1, secret);
    expect(result).toBe(userID1);
  });

  it("should throw for incorrect secret", () => {
    expect(() => validateJWT(jwt1, secret + "a")).toThrow();
  });

  it("should return correct userID2 for jwt+secret", () => {
    const result = validateJWT(jwt2, secret);
    expect(result).toBe(userID2);
  });

  it("should throw for expired tokens", () => {
    setTimeout(() => {
      expect(() => validateJWT(jwt3, secret)).toThrow();
    }, 100);
  });
});
