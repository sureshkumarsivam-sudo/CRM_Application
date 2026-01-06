@echo off
echo 🛑 Stopping Debtrix CRM Application...
echo.
echo This will stop all Node.js processes (backend and frontend servers).
echo.
pause

echo 🔍 Finding Node.js processes...

REM Kill all node processes
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% == 0 (
    echo ✅ Node.js processes stopped successfully
) else (
    echo ⚠️  No Node.js processes found or already stopped
)

REM Kill Vite dev server processes if any
taskkill /F /IM vite.exe /T 2>nul

echo.
echo 🧹 Cleaning up...

REM Kill any remaining npm processes
taskkill /F /IM npm.cmd /T 2>nul
taskkill /F /IM npm /T 2>nul

echo.
echo ✅ Debtrix CRM Application stopped!
echo.
echo All backend and frontend processes have been terminated.
echo You can now safely close this window.
echo.
pause
