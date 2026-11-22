import { and, desc, eq } from "drizzle-orm";

export function getCollectionTable(schema, name) {
  if (name === "watchlist") return schema.watchlist;
  if (name === "continue") return schema.continueWatching;
  return null;
}

export async function listCollectionEntries(db, schema, userId, name) {
  const table = getCollectionTable(schema, name);
  if (!table) throw new Error("Unknown collection.");

  return db
    .select()
    .from(table)
    .where(eq(table.userId, userId))
    .orderBy(desc(table.addedAt));
}

export async function removeCollectionEntry(db, schema, userId, name, movieId) {
  const table = getCollectionTable(schema, name);
  if (!table) throw new Error("Unknown collection.");

  await db
    .delete(table)
    .where(and(eq(table.userId, userId), eq(table.movieId, movieId)));
}
