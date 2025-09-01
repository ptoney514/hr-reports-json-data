#!/bin/bash

# HR Reports Local Development Startup Script
# Simple, fast local development without Docker overhead

echo "🚀 Starting HR Reports Development Server..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is less than 18. Recommended: Node.js 18+"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies if node_modules doesn't exist or package.json is newer
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies are up to date"
fi

# Clear any existing React app processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is in use. Stopping existing process..."
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t)
    sleep 2
fi

# Start the development server
echo ""
echo "🎯 Starting React development server..."
echo "================================================"
echo "📍 Application URL: http://localhost:3000"
echo "📊 Enhanced Workforce Dashboard: http://localhost:3000/dashboards/enhanced-workforce"
echo "📈 Turnover Dashboard: http://localhost:3000/dashboards/turnover"
echo "🎯 Recruiting Dashboard: http://localhost:3000/dashboards/recruiting"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Start the React development server
npm start