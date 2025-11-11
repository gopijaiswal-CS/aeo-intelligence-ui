#!/bin/bash

echo "🚀 Starting AEO Intelligence Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your configuration:"
    echo "   - MONGODB_URI"
    echo "   - GEMINI_API_KEY"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if MongoDB is running (optional)
if command -v mongosh &> /dev/null; then
    if ! mongosh --eval "db.version()" &> /dev/null; then
        echo "⚠️  MongoDB is not running"
        echo "💡 Start MongoDB with: brew services start mongodb-community"
        echo ""
        read -p "Press Enter to continue anyway or Ctrl+C to exit..."
    else
        echo "✅ MongoDB is running"
    fi
fi

echo ""
echo "🎯 Starting server..."
echo ""

npm run dev

