---
name: turbopack-log
description: Run the Melofix Next.js dev server with Turbopack logging and diagnose errors from its Windows temp log.
---

# Read Melofix Turbopack Logs

Use this skill for the Next.js app in `next-app/`. The skill applies after the
user initializes that app; do not treat a running development server or a
loaded error overlay as a successful production build.

## Run the dev server and capture output

From the repository root, first initialize `next-app` using its README setup
guide, then run:

```powershell
$log = Join-Path $env:TEMP 'melofix-nextapp-turbopack.log'
Push-Location .\next-app
try {
    npm run dev -- --turbopack 2>&1 | Tee-Object -FilePath $log
} finally {
    Pop-Location
}
```

Stop the server with Ctrl+C when finished. Read recent output with:

```powershell
if (Test-Path $log) {
    Get-Content $log -Tail 200
} else {
    Write-Error "Turbopack log not found: $log"
}
```

If the tail contains repeated or truncated errors, search for the latest
compile failure and inspect a bounded range around it. Distinguish the root
error from repeated browser/overlay copies and ordinary `NativeCommandError`
wrappers around stderr.

## Diagnose missing imports

For `Can't resolve '<specifier>'` or `Cannot find module '<specifier>'`:

1. Identify the source file and import trace in the error.
2. Check the import, `next-app/package.json`, project aliases, and whether the
   referenced module exists.
3. If the specifier is a package subpath, verify that the intended npm package
   exports it before installing anything.
4. If confirmed absent, install the dependency from `next-app/` with the
   existing package manager and preserve the package manifest/lockfile.
5. Re-read the log after recompilation and confirm the first/root error is
   gone; report any new root error rather than assuming success.

Keep log excerpts bounded. Redact credentials or other sensitive values.
