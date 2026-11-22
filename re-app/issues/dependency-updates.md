# Updating legacy app dependencies

Use this guide for dependency-update issues concerning the preserved Vite app
in `re-app/`. The Next.js app has a separate package and lockfile.

## Issue checklist

1. Record the package name, installed/current version, desired version, and
   reason for the update.
2. Note whether it is a patch/minor update or a breaking major release.
3. Keep changes to `re-app/package.json` and `re-app/package-lock.json`; do not
   update `next-app` dependencies as part of a legacy-app issue.
4. Include the verification output and any migration notes in the issue.

## Update and verify

Run these commands from the repository root in PowerShell:

```powershell
Push-Location .\re-app
npm outdated
npm update
npm run lint
npm run build
Pop-Location
```

`npm update` applies updates allowed by the existing semver ranges and refreshes
the lockfile. For a major version, review that package's migration guide and
update it explicitly rather than widening all dependency ranges at once:

```powershell
Push-Location .\re-app
npm install <package>@<version>
npm run lint
npm run build
Pop-Location
```

Review the manifest and lockfile diff before opening an issue or merging a
change. Run `npm audit` to inspect advisories; do not apply `npm audit fix
--force` without reviewing the breaking changes it may introduce. This app has
no configured test script, so lint and production build are the available
project checks.
