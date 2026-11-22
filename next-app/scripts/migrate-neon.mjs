import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to apply Neon migrations.");
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = neon(process.env.DATABASE_URL);
await sql.query(`
  CREATE TABLE IF NOT EXISTS melofix_migrations (
    name TEXT PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  )
`);

const migrationDir = path.join(root, "migrations", "postgres");
const migrations = (await readdir(migrationDir))
  .filter((name) => name.endsWith(".sql"))
  .sort();
const applied = await sql.query("SELECT name FROM melofix_migrations");
const appliedNames = new Set(applied.map((row) => row.name));

for (const name of migrations) {
  if (appliedNames.has(name)) continue;
  const contents = await readFile(path.join(migrationDir, name), "utf8");
  for (const statement of contents.split(";").map((part) => part.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
  await sql.query(
    "INSERT INTO melofix_migrations (name, applied_at) VALUES ($1, $2)",
    [name, new Date().toISOString()],
  );
  console.log(`Applied Neon migration ${name}`);
}
