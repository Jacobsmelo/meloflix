---
name: melofix-nextapp
description: Plan and implement Melofix's TMDB-backed movie discovery app in Next.js with MUI.
---

# Melofix Next.js migration

Use this skill for planning and implementing the movie app rebuild. The current
Vite application is preserved in `re-app/`; the separate target is `next-app/`.
Do not overwrite or mix the legacy app into the Next.js project.

## Existing app inventory

- `re-app/src/App.jsx` loads popular movies and searches TMDB, with a 3-second
  debounced query and loading/error states.
- `re-app/src/components/MovieCard.jsx` displays poster, title, vote average,
  language, and release year, with a missing-poster fallback.
- `re-app/src/components/Swip.jsx` and `NavButtons.jsx` render a Swiper-based
  trending carousel.
- `re-app/src/appwrite.js` stores search counts and reads a ranked-trending
  list from Appwrite. This is legacy behavior, not a target requirement.
- `re-app/public/` holds the current logo, hero, poster, and icon assets.
- Vite, Tailwind, Flowbite, Appwrite, Swiper, and React utilities belong only
  to the legacy package; do not copy its dependencies wholesale.

## Product and data decisions

- Brand the web app **Melofix**.
- Use TMDB's movie search, popular/discover, and trending HTTP endpoints.
- Do not create a movie catalog table, Appwrite project, or persistent
  search-count feature. Replace the Appwrite-backed trending list with TMDB's
  trending endpoint.
- Use SQLite for local development and Neon PostgreSQL in production. Neon
  hosts PostgreSQL, not SQLite files: keep the user-data model portable and
  maintain the appropriate migrations for each database rather than trying to
  upload or attach the local SQLite file to Neon.
- Persist account records and user-owned data only: watchlist entries,
  continue-watching progress, likes/ratings, and user preferences. Reference
  movie records by TMDB ID; fetch movie details from TMDB instead of duplicating
  its catalog in the app database.
- Scope every user-data query and mutation to the authenticated user. Use
  secure password hashing if Melofix manages credentials; never store raw
  passwords or expose database credentials to browser code.
- Keep the TMDB bearer token in `next-app/.env.local` as
  `TMDB_ACCESS_TOKEN`. Never use a `NEXT_PUBLIC_` prefix or call authenticated
  TMDB endpoints directly from browser code.
- Use server components for initial data where practical, and route handlers
  for interactive search or browser-triggered requests. Validate and encode
  query input, handle TMDB errors explicitly, and avoid returning credentials.

## Target architecture

- Use Next.js App Router under `next-app/src/app/`.
- Put reusable MUI components in `src/components/`, TMDB server helpers in
  `src/lib/`, and domain types in `src/types/` when needed.
- Build a shared MUI theme and use the App Router-compatible MUI/Emotion cache
  provider that matches the installed Next.js major version.
- Configure `next/image` to allow only the TMDB image host used for posters;
  retain a local fallback for missing posters.
- Migrate only assets that are actually reused. Do not copy the Vite shell,
  Tailwind/Flowbite setup, or Vite environment variable conventions.

## Migration sequence

1. Follow `next-app/README.md` to initialize Next.js and install MUI manually.
2. Set up the App Router layout, metadata, MUI theme, and server-only TMDB
   configuration.
3. Design user/account and user-owned collection tables around TMDB IDs;
   configure local SQLite and production Neon PostgreSQL connections and
   migrations without introducing a movie catalog table.
4. Implement registration/authentication and owner-scoped watchlist,
   continue-watching, like/rating, and preference operations.
5. Implement popular/discover results, debounced search, and TMDB trending.
6. Rebuild the responsive movie cards and carousel with accessible MUI-based
   controls, retaining loading, empty, error, and poster-fallback states.
7. Add focused tests for TMDB requests, auth/ownership boundaries, and
   persistence behavior.
8. Run lint, type-check, tests, and production build scripts available in the
   target app; check desktop and mobile layouts.

Do not start the rebuild until the user has initialized `next-app`. Keep
`re-app/` intact as the reference implementation. The app database stores
user data only; movie discovery and details remain TMDB-backed.
