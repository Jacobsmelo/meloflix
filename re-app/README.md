# Melofix legacy app

This folder preserves the existing Vite/React movie-discovery app as a
reference while the replacement is planned in the separate root `next-app/`
folder. It currently shows popular TMDB movies, searches by title, displays
movie posters and ratings, and renders a trending carousel.

## Run the legacy app

From this directory:

```powershell
npm install
npm run dev
```

Other available scripts are `npm run lint`, `npm run build`, and
`npm run preview`. This app does not define a test script.

The current browser app reads `VITE_TMDB_API_KEY` from its Vite environment
and uses Appwrite for search-count storage and the ranked trending carousel.
These are legacy implementation details, not the target architecture. Vite
variables are bundled into client code; never put private credentials in
`VITE_` variables.

## Main implementation

- `src/App.jsx`: popular/discover request, debounced search, and page states.
- `src/components/MovieCard.jsx`: movie poster, title, rating, language, and
  release year.
- `src/components/Swip.jsx` and `src/components/NavButtons.jsx`: trending
  movie carousel.
- `src/components/Search.jsx` and `src/components/Spinner.jsx`: search input
  and loading indicator.
- `src/appwrite.js`: Appwrite search-count and trending data operations.
- `public/`: current brand, hero, poster-fallback, and icon assets.

For the migration plan and manual Next.js/MUI setup steps, see
[`../next-app/README.md`](../next-app/README.md). Dependency-update guidance
for this preserved package is in [`issues/`](issues/).
