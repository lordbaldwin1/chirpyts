import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, refreshTokens, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  const result = await db.delete(users);
  return result;
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email));
  if (rows.length === 0) {
    return;
  }
  return rows[0];
}

export async function updateUserCredentials(userId: string, email: string, hashedPassword: string) {
  const [result] = await db
    .update(users)
    .set({
      email: email,
      hashedPassword: hashedPassword,
    })
    .where(eq(users.id, userId))
    .returning();
  return result;
}

export async function upgradeUserChirpyRed(userID: string) {
  await db
    .update(users)
    .set({
      isChirpyRed: true,
    })
    .where(eq(users.id, userID));
}
