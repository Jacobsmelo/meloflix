# Meloflix

Meloflix is a TMDB-backed movie discovery app. The preserved Vite/React
reference is in [`re-app/`](re-app/); the active Next.js App Router rebuild is
in [`next-app/`](next-app/).

## Run the Next.js app

From `next-app/`, install the app dependencies, copy `.env.example` to
`.env.local`, configure the values below, then initialize the local database
and start Next.js:

```powershell
npm run db:migrate:sqlite
npm run dev
```

Required local settings:

```dotenv
TMDB_ACCESS_TOKEN=your-server-side-tmdb-read-access-token
AUTH_SECRET=your-random-auth-secret
DATABASE_DRIVER=sqlite
LOCAL_DATABASE_PATH=.data/melofix.db
```

Generate `AUTH_SECRET` locally with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

For production, set `DATABASE_DRIVER=neon`, provide `DATABASE_URL`, and apply
the PostgreSQL migration with `npm run db:migrate:neon`. Neon hosts PostgreSQL,
not SQLite files. Never expose the TMDB token or database credentials through
a `NEXT_PUBLIC_` variable.

## Features

- Popular and trending movie discovery and debounced search through TMDB.
- Email/password accounts, editable name and email, and saved theme preference.
- User-owned watchlists and continue-watching status, with watchlist sorting by
  added date, release date, or popularity.
- Responsive MUI interface with the existing background pattern, poster
  fallback, loading states, and reduced-motion support.

The app database stores account and user preference data and references movies
by TMDB ID; it does not duplicate TMDB's movie catalog. `re-app/` remains
separate and unchanged by the Next.js implementation.
