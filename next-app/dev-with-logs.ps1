$log = Join-Path $env:TEMP 'events-nextapp-turbopack.log'

npm --loglevel=error run dev 2>&1 | Tee-Object -FilePath $log -Append
exit $LASTEXITCODE
