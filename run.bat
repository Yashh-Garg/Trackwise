@echo off
REM Trackwise - Run Script for Windows
REM This script runs both frontend and backend development servers

echo.
echo ========================================
echo    Trackwise Development Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

REM Check if node_modules exist, if not, install dependencies
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Start backend
echo [INFO] Starting Backend Server...
cd backend
start "Trackwise Backend" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo [INFO] Starting Frontend Server...
cd frontend
start "Trackwise Frontend" cmd /k "npm run dev"
cd ..

echo.
echo [SUCCESS] Both servers are starting in separate windows!
echo.
echo Server Information:
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo   API:      http://localhost:5000/api-v1
echo.
echo Close the server windows to stop them.
echo.
pause

