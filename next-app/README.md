# Meloflix Next.js app

This is the Next.js App Router implementation. The Vite reference app remains
in `../re-app/`; keep its dependencies and source separate.

## Development

1. Copy `.env.example` to `.env.local`.
2. Set `TMDB_ACCESS_TOKEN` to a TMDB API read access token and generate a local
   `AUTH_SECRET`.
3. Keep `DATABASE_DRIVER=sqlite` and apply the SQLite migration.
4. Run the app:

```powershell
npm run db:migrate:sqlite
npm run dev
```

## Production database

Set `DATABASE_DRIVER=neon` and `DATABASE_URL` to a Neon PostgreSQL connection
string, then run `npm run db:migrate:neon` in an environment where
`DATABASE_URL` is available. The SQLite database is local only; it is not
uploaded to Neon.

## User data and security

Auth.js handles credentials sign-in with scrypt password hashes and
HTTP-only, same-site session cookies. The database contains accounts,
watchlist/continue-watching references, and a theme preference. User mutations
are authenticated and scoped to the current account. Movie metadata and posters
are loaded from TMDB by movie ID instead of stored as an app catalog.

The TMDB bearer token, auth secret, and database connection string must remain
server-side. Never use `NEXT_PUBLIC_` variables for secrets.
