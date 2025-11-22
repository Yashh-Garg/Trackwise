# Trackwise - Run Script for Windows PowerShell
# This script runs both frontend and backend development servers

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Function to handle cleanup on exit
function Cleanup {
    Write-Host "`n[INFO] Stopping servers..." -ForegroundColor Green
    if ($BackendProcess -and !$BackendProcess.HasExited) {
        Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Info "Backend server stopped"
    }
    if ($FrontendProcess -and !$FrontendProcess.HasExited) {
        Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Info "Frontend server stopped"
    }
}

# Register cleanup on script exit
Register-EngineEvent PowerShell.Exiting -Action { Cleanup } | Out-Null

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

# Print header
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Trackwise Development Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if node_modules exist, if not, install dependencies
if (-not (Test-Path "backend\node_modules")) {
    Write-Info "Installing backend dependencies..."
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Info "Installing frontend dependencies..."
    Set-Location frontend
    npm install
    Set-Location ..
}

# Start backend
Write-Info "Starting Backend Server..."
Set-Location backend
$BackendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
Set-Location ..

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Check if backend started successfully
if ($BackendProcess.HasExited) {
    Write-Error "Backend failed to start. Check the output above for details."
    exit 1
}

# Start frontend
Write-Info "Starting Frontend Server..."
Set-Location frontend
$FrontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
Set-Location ..

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

# Check if frontend started successfully
if ($FrontendProcess.HasExited) {
    Write-Error "Frontend failed to start. Check the output above for details."
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Print success message
Write-Host "`n✓ Both servers are running!`n" -ForegroundColor Green
Write-Host "Server Information:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  API:      http://localhost:5000/api-v1" -ForegroundColor White
Write-Host "`nProcess IDs:" -ForegroundColor Cyan
Write-Host "  Backend PID:  $($BackendProcess.Id)" -ForegroundColor Green
Write-Host "  Frontend PID: $($FrontendProcess.Id)" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop both servers`n" -ForegroundColor Yellow

# Wait for both processes
try {
    Wait-Process -Id $BackendProcess.Id, $FrontendProcess.Id
} catch {
    Cleanup
}

