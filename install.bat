@echo off
echo 🚀 Starting CRM Application Setup...
echo.

echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)

echo 📦 Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Frontend installation failed!
    pause
    exit /b 1
)

echo ✅ Installation completed successfully!
echo.
echo 📋 Next steps:
echo 1. Make sure MongoDB is running on localhost:27017
echo 2. Run 'start-backend.bat' to start the backend server
echo 3. Run 'start-frontend.bat' to start the frontend application
echo 4. Run 'import-data.bat' to import CSV data (optional)
echo.
pause