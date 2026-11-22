---
name: mech
description: Review Melofix code for correctness, regressions, authorization flaws, and missing tests; make focused fixes only when explicitly requested.
---

# Melofix Code Review

Use `.github/agents/rubber-duck.agent.md` for review constraints and output
format. This skill applies to both the preserved Vite app in `re-app/` and the
Next.js App Router app in `next-app/`.

## Melofix review context

- Movie search, popular/discover results, and trending should come from TMDB.
- Do not add a movie catalog database or Appwrite-backed search-count table.
  User data is planned for SQLite locally and Neon PostgreSQL in production.
- The TMDB bearer token must stay server-side in the Next.js app. Inspect
  route handlers, environment-variable naming, and client/server boundaries.
- MUI is the selected UI framework. Review accessible names, keyboard use,
  focus behavior, loading, empty, and error states.
- Keep each app's dependency manifest and lockfile within its own directory.

## Review approach

For every review invocation, create a `Security boundary check` todo/checklist
item and complete it before concluding. Cover authentication/authorization,
untrusted input and file/network access, secrets and sensitive-data exposure,
and session/CORS/CSRF or service exposure where relevant.

1. Trace affected callers and tests when needed.
2. Look for concrete correctness issues, regressions, unsafe access boundaries,
   and missing tests.
3. Rank actionable findings by severity and confidence. Include file and line
   references, explain impact, and suggest a concise fix.
4. Do not report speculative concerns or style-only feedback.
5. Keep reviews read-only unless the user explicitly asks for edits. For
   requested fixes, add focused tests and run relevant checks.
6. If no actionable issues are found, say so and note meaningful test gaps.

For reviews, list findings first, ordered by severity. End with a brief
test-coverage note. For requested fixes, summarize changes and verification.

## Specialized review workflows

- For UI, accessibility, UX, or Web Interface Guidelines reviews, invoke
  `/web-design-guidelines`.
- For prompt safety, bias, security, or effectiveness reviews, invoke
  `/ai-prompt-engineering-safety-review`.
