# Melofix

Melofix is a movie-discovery app currently implemented with Vite and React.
This repository keeps that implementation in [`re-app/`](re-app/) and reserves
[`next-app/`](next-app/) as the separate Next.js App Router rebuild target.

The current app's feature inventory and run instructions are in
[`re-app/README.md`](re-app/README.md). Its dependency-maintenance workflow is
in [`re-app/issues/dependency-updates.md`](re-app/issues/dependency-updates.md).

**The Next.js app has not been scaffolded or rebuilt yet.** Before implementation,
follow [`next-app/README.md`](next-app/README.md) to initialize Next.js and
install MUI dependencies manually. The target uses TMDB directly, has no movie
catalog database, and keeps the TMDB access token on the server. The plan uses
SQLite locally for user data and Neon PostgreSQL in production; Neon does not
host SQLite files.
