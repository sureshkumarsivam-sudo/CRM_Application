@echo off
echo 📊 Importing CSV Data to MongoDB...
echo.
echo 📁 Looking for FULL_DUMP.csv in the root directory...
echo 🗃️  This will import all customer records from the CSV file
echo.
echo ⚠️  WARNING: This will clear existing customer data!
echo.
set /p choice=Continue with import? (y/N): 
if /I "%choice%" neq "y" (
    echo Import cancelled.
    pause
    exit /b 0
)

echo.
echo 🚀 Starting import process...
cd backend
npm run import-csv

echo.
echo ✅ Import process completed!
pause