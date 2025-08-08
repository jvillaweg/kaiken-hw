#!/bin/bash

echo "🚀 Setting up Bid Management System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi
echo "✅ Docker is installed"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi
echo "✅ Docker Compose is available"

echo ""
echo "🐳 Starting services with Docker Compose..."

# Start the services
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Bid Management System is starting up!"
    echo ""
    echo "📋 Services:"
    echo "  • Frontend:  http://localhost:3000"
    echo "  • Backend:   http://localhost:8000"
    echo "  • API Docs:  http://localhost:8000/docs"
    echo "  • Database:  localhost:5432"
    echo ""
    echo "⏳ Please wait a moment for all services to initialize..."
    echo ""
    echo "🔧 To stop the services, run: docker-compose down"
else
    echo ""
    echo "❌ Failed to start services. Check the error messages above."
    echo "💡 Try running: docker-compose logs"
fi
