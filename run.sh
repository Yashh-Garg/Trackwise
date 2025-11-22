#!/bin/bash

# Trackwise - Run Script
# This script runs both frontend and backend development servers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
check_port() {
    if command_exists lsof; then
        lsof -i :$1 >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -an | grep -q ":$1.*LISTEN"
    else
        return 1
    fi
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    print_message "Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_message "Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_message "Frontend server stopped"
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if Node.js is installed
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if ports are available
if check_port 5000; then
    print_warning "Port 5000 is already in use. Backend might not start properly."
fi

if check_port 5173; then
    print_warning "Port 5173 is already in use. Frontend might not start properly."
fi

# Print header
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Trackwise Development Server${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if node_modules exist, if not, install dependencies
if [ ! -d "backend/node_modules" ]; then
    print_message "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    print_message "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start backend
print_message "Starting Backend Server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start frontend
print_message "Starting Frontend Server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Frontend failed to start. Check frontend.log for details."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Print success message
echo ""
echo -e "${GREEN}✓${NC} Both servers are running!"
echo ""
echo -e "${BLUE}Server Information:${NC}"
echo -e "  ${GREEN}Backend:${NC}  http://localhost:5000"
echo -e "  ${GREEN}Frontend:${NC} http://localhost:5173"
echo -e "  ${GREEN}API:${NC}      http://localhost:5000/api-v1"
echo ""
echo -e "${BLUE}Process IDs:${NC}"
echo -e "  Backend PID:  ${GREEN}$BACKEND_PID${NC}"
echo -e "  Frontend PID: ${GREEN}$FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}Logs are being written to:${NC}"
echo -e "  Backend:  ${GREEN}backend.log${NC}"
echo -e "  Frontend: ${GREEN}frontend.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

