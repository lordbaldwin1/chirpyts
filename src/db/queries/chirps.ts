import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function deleteChirp(userID: string, chirpID: string) {
  const rows = await db.delete(chirps).where(and(
    eq(chirps.userId, userID),
    eq(chirps.id, chirpID),
  ));
  return rows.length > 0;
}

export async function getChirp(chirpID: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpID));
  return result;
}

export async function getChirpsByAuthor(authorID: string) {
  const rows = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, authorID));
  return rows;
}

export async function getAllChirps() {
  const rows = await db
    .select()
    .from(chirps);
  return rows;
}
