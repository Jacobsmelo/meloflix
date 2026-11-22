# Melofix Next.js rebuild

This is the planned location for the new Melofix web app. **It is intentionally
not scaffolded yet.** The current Vite app remains intact in `../re-app/`.
Initialize this directory manually using the steps below before asking for the
rebuild.

## 1. Initialize Next.js

Run from the repository root. This planning file makes the target directory
non-empty, so move it out of the way before running the scaffolder:

```powershell
Move-Item .\next-app\README.md .\NEXT-APP-MIGRATION-PLAN.md
npx create-next-app@latest next-app --js --eslint --app --src-dir --no-tailwind --use-npm --import-alias "@/*"
Move-Item .\NEXT-APP-MIGRATION-PLAN.md .\next-app\README.md -Force
```

Use the App Router, JavaScript, ESLint, a `src/` directory, npm, and no
Tailwind. If the CLI prompts for optional features, keep the setup minimal;
MUI is the selected styling/component framework. Do not initialize inside
`re-app/`.

## 2. Install app dependencies

From the newly initialized target:

```powershell
Push-Location .\next-app
npm pkg set name=melofix
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/material-nextjs
Pop-Location
```

Swiper is only needed if the trending carousel is retained:

```powershell
Push-Location .\next-app
npm install swiper
Pop-Location
```

Use the MUI App Router cache provider export that matches the Next.js major
version selected by the scaffold. Do not install Appwrite, a movie-catalog
database, or Tailwind/Flowbite for this app.

For the planned account-data layer, the recommended ORM is Drizzle with a
SQLite driver for local development and Neon Serverless for production. Install
the initial dependencies from `next-app/`:

```powershell
Push-Location .\next-app
npm install drizzle-orm better-sqlite3 @neondatabase/serverless
npm install --save-dev drizzle-kit @types/better-sqlite3
Pop-Location
```

Keep SQLite and PostgreSQL schema/migration configurations aligned and verify
both. The local SQLite database is not uploaded to Neon.

## 3. Configure TMDB

Create `next-app/.env.local` and add the TMDB API read access token:

```dotenv
TMDB_ACCESS_TOKEN=replace-with-your-tmdb-read-access-token
```

Keep the actual token private and out of source control. Do not prefix it with
`NEXT_PUBLIC_`. Call TMDB from server components or Next.js route handlers;
browser code should call the Melofix handlers instead.

## 4. User data and database plan

Use SQLite as the local-development database and Neon PostgreSQL for production.
**Neon does not host SQLite files.** Do not upload a local `.db` file to Neon or
expect the same SQLite connection to work there. Keep the data model portable,
configure a database-appropriate driver/connection for each environment, and
maintain and test the corresponding SQLite and PostgreSQL migrations.

The app database is for user/account data, not a copy of TMDB's movie catalog.
Use TMDB movie IDs as references and fetch movie metadata from TMDB. Plan
user-owned records for:

- Accounts/registry: identity, unique login identifier, and authentication
  metadata. If Melofix stores passwords, store only a modern password hash;
  never store plaintext passwords.
- Watchlist: user, TMDB movie ID, and when it was added.
- Continue watching: user, TMDB movie ID, playback position/duration, and
  last-updated time.
- Likes/ratings: user, TMDB movie ID, like state and/or the user's rating value.
- Preferences: user-owned settings such as locale, display preferences, and
  content preferences.

Add uniqueness and useful indexes for user/movie relationships. All reads and
writes must be authenticated and scoped to the owning user on the server.
Keep database URLs and credentials in server-only environment variables; never
use a `NEXT_PUBLIC_` prefix. Choose the auth library after initialization, and
use secure password hashing if Melofix manages credentials.

## Migration plan

1. Add the App Router layout, Melofix metadata, and a shared MUI theme.
2. Implement a portable user-data schema, local SQLite and Neon PostgreSQL
   configurations, and migrations for accounts, watchlist, playback progress,
   likes/ratings, and preferences.
3. Implement registration/authentication and verify server-side ownership for
   every user-data query and mutation.
4. Implement popular/discover, movie search, and trending requests against
   TMDB. Use TMDB's trending endpoint in place of the old Appwrite ranking.
5. Add a responsive search/results page, movie cards (poster, title, rating,
   language, release year), loading/error/empty states, and a trending carousel.
6. Validate and encode search parameters in the server layer; keep TMDB errors
   explicit and credentials out of responses and client bundles.
7. Configure `next/image` for TMDB's poster image host and keep a local
   missing-poster fallback. Reuse only the assets that fit the new design.
8. Add focused tests for API errors, search behavior, user-data persistence and
   authorization, then verify lint, type-check, tests, production build, and
   desktop/mobile UI.

Do not create a movie catalog table, Appwrite integration, or persistent
search-count feature. Keep `re-app/` unchanged as the reference implementation.
