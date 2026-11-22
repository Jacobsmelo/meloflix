# Melofix project instructions

## Repository layout

- `re-app/` is the preserved Vite/React implementation and feature reference.
- `next-app/` is the separate Next.js App Router target. Follow
  `.github/skills/melofix-nextapp/SKILL.md`.
- Keep the legacy app and its dependencies separate from the Next.js app.

## Product and data

- Melofix is a movie discovery and search web app backed by TMDB.
- Use TMDB's movie search, popular/discover, and trending endpoints. Do not add
  a movie catalog database, Appwrite, or persistent search-count table. Persist
  user accounts and user-owned movie preferences in SQLite for local
  development and Neon PostgreSQL in production.
- Do not treat Neon as a SQLite host. Keep a portable user-data schema and
  maintain/apply the appropriate migrations for local SQLite and production
  PostgreSQL; do not copy a SQLite database file to Neon.
- Persist TMDB movie IDs and user-specific state (watchlist, playback progress,
  likes/ratings, and preferences), not a duplicate catalog of TMDB movie data.
- Protect user data by authenticated ownership checks. Never store plaintext
  passwords; use an established authentication approach and secure password
  hashing if credentials are managed by Melofix.
- Keep the TMDB bearer token server-side in `TMDB_ACCESS_TOKEN`; never expose
  it through a `NEXT_PUBLIC_` variable or browser bundle. Have Next.js server
  code or route handlers call TMDB and validate user-supplied query parameters.
- Use MUI as the primary component and theme system. Avoid adding Tailwind or
  Flowbite unless the user asks for them.
- Preserve the current app's useful flows (popular movies, debounced search,
  trending carousel, movie cards, poster fallback) while redesigning for
  responsive, accessible behavior rather than copying the old markup.

## Implementation and verification

- Do not begin implementing the Next.js rebuild until the user has initialized
  `next-app` using its setup guide.
- Keep dependency manifests and lockfiles scoped to their respective apps.
- Before concluding a Next.js milestone, run its available lint, type-check,
  tests, and production build scripts. Report unavailable scripts rather than
  implying they passed.
