#!/bin/bash

# Entheory PoC Startup Script
echo "🏥 Starting Entheory Medical AI PoC..."
echo "🔧 Initializing server..."

# Kill any existing processes on port 3001
echo "🧹 Cleaning up any existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build frontend assets
echo "🛠️ Building frontend assets..."
npm run build

# Start the server
echo "🚀 Starting development server on port 3001..."
echo "📋 Main Dashboard: http://localhost:3001"
echo "🔍 Medical Search: http://localhost:3001/medical-search.html"
echo "📊 Analytics: http://localhost:3001/analytics.html"
echo "📑 Reports: http://localhost:3001/tumor-board-reports.html"
echo ""
echo "🎉 All systems ready! The application will open in your browser."
echo "📝 Features available:"
echo "   ✅ Clinician Dashboard with Patient Overview"
echo "   ✅ Individual Patient Profiles (7-tab system)"
echo "   ✅ Medical Search with Perplexity AI"
echo "   ✅ Tumor Board Reports"
echo "   ✅ Hospital Analytics"
echo "   ✅ All modals and errors fixed"
echo ""

# Run the development server
npm run dev

