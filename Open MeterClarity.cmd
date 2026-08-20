@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul || (
  echo Node.js 20.19 or newer is required.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  call npm ci || goto :error
)

call npm run build || goto :error
call npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --open
exit /b %errorlevel%

:error
echo.
echo MeterClarity could not start. Review the message above.
pause
exit /b 1
