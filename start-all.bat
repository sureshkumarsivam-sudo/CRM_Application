@echo off
echo 🚀 Starting Complete CRM Application...
echo.
echo This will start both backend and frontend servers.
echo Make sure MongoDB is running before proceeding.
echo.
pause

echo 🔧 Starting Backend Server...
start /D backend npm run dev

echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Frontend Application...
start /D frontend npm run dev

echo ✅ Both servers are starting...
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000/api
echo.
echo Press any key to close this window (servers will continue running)
pause