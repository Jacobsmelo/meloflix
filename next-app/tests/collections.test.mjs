import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  listCollectionEntries,
  removeCollectionEntry,
} from "../src/lib/collections.js";
import * as schema from "../src/lib/schema/sqlite.js";

test("collection reads and deletes are scoped to their owner", async () => {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(
    readFileSync(new URL("../migrations/sqlite/0001_user_data.sql", import.meta.url), "utf8"),
  );
  const db = drizzle(sqlite, { schema });
  const now = new Date().toISOString();
  await db.insert(schema.users).values([
    { id: "owner-a", email: "a@example.com", name: "A", passwordHash: "hash", createdAt: now, updatedAt: now },
    { id: "owner-b", email: "b@example.com", name: "B", passwordHash: "hash", createdAt: now, updatedAt: now },
  ]);
  await db.insert(schema.watchlist).values([
    { userId: "owner-a", movieId: 42, addedAt: now },
    { userId: "owner-b", movieId: 42, addedAt: now },
  ]);

  const ownerAEntries = await listCollectionEntries(db, schema, "owner-a", "watchlist");
  assert.equal(ownerAEntries.length, 1);
  assert.equal(ownerAEntries[0].userId, "owner-a");

  await removeCollectionEntry(db, schema, "owner-a", "watchlist", 42);
  const ownerBEntries = await listCollectionEntries(db, schema, "owner-b", "watchlist");
  assert.equal(ownerBEntries.length, 1);
  assert.equal(ownerBEntries[0].movieId, 42);

  sqlite.close();
});
