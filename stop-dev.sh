#!/bin/bash

# HR Reports Development Server Stop Script

echo "🛑 Stopping HR Reports Development Server..."
echo "================================================"

# Find and kill processes on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "📍 Found React development server on port 3000"
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t)
    echo "✅ Development server stopped"
else
    echo "ℹ️  No development server running on port 3000"
fi

# Also check for any node processes running react-scripts
REACT_PIDS=$(ps aux | grep '[n]ode.*react-scripts' | awk '{print $2}')
if [ ! -z "$REACT_PIDS" ]; then
    echo "📍 Found React script processes"
    echo "$REACT_PIDS" | xargs kill -9 2>/dev/null
    echo "✅ React script processes stopped"
fi

echo ""
echo "✨ All development processes stopped"
echo "================================================"