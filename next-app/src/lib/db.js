import { mkdirSync } from "node:fs";
import path from "node:path";

let sqliteConnection;

export async function getDatabase() {
  const driver =
    process.env.DATABASE_DRIVER ||
    (process.env.NODE_ENV === "production" ? "neon" : "sqlite");

  if (driver === "neon") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required when DATABASE_DRIVER=neon.");
    }

    const [{ neon }, { drizzle }, schema] = await Promise.all([
      import("@neondatabase/serverless"),
      import("drizzle-orm/neon-http"),
      import("./schema/postgres.js"),
    ]);

    return {
      db: drizzle(neon(process.env.DATABASE_URL), { schema }),
      schema,
    };
  }

  if (driver !== "sqlite") {
    throw new Error(`Unsupported DATABASE_DRIVER: ${driver}`);
  }

  if (!sqliteConnection) {
    sqliteConnection = (async () => {
      const databasePath = path.resolve(
        /*turbopackIgnore: true*/ process.cwd(),
        process.env.LOCAL_DATABASE_PATH || ".data/melofix.db",
      );
      mkdirSync(path.dirname(databasePath), { recursive: true });

      const [{ default: Database }, { drizzle }, schema] = await Promise.all([
        import("better-sqlite3"),
        import("drizzle-orm/better-sqlite3"),
        import("./schema/sqlite.js"),
      ]);

      const client = new Database(databasePath);
      client.pragma("foreign_keys = ON");
      return { db: drizzle(client, { schema }), schema };
    })();
  }

  return sqliteConnection;
}
