import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.resolve(
  root,
  process.env.LOCAL_DATABASE_PATH || ".data/melofix.db",
);
await mkdir(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS melofix_migrations (
    name TEXT PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  )
`);

const migrationDir = path.join(root, "migrations", "sqlite");
const migrations = (await readdir(migrationDir))
  .filter((name) => name.endsWith(".sql"))
  .sort();
const hasMigration = db.prepare("SELECT 1 FROM melofix_migrations WHERE name = ?");
const recordMigration = db.prepare(
  "INSERT INTO melofix_migrations (name, applied_at) VALUES (?, ?)",
);

for (const name of migrations) {
  if (hasMigration.get(name)) continue;
  const contents = await readFile(path.join(migrationDir, name), "utf8");
  db.transaction(() => {
    db.exec(contents);
    recordMigration.run(name, new Date().toISOString());
  })();
  console.log(`Applied SQLite migration ${name}`);
}

db.close();
