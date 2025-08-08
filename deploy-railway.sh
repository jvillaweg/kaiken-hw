#!/bin/bash

# Railway Deployment Helper Script

echo "🚀 Deploying Bid Management System to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    echo "Run: npm install -g @railway/cli"
    echo "Or visit: https://docs.railway.app/deploy/cli"
    exit 1
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize project
echo "📦 Initializing Railway project..."
railway init

# Deploy backend
echo "🔧 Deploying backend..."
cd backend
railway up --service backend

# Set environment variables for backend
echo "⚙️ Setting backend environment variables..."
railway variables set ENVIRONMENT=production

# Deploy frontend  
echo "🎨 Deploying frontend..."
cd ../frontend
railway up --service frontend

# Set environment variables for frontend
echo "⚙️ Setting frontend environment variables..."
echo "ℹ️ You'll need to set REACT_APP_API_URL manually in Railway dashboard"
echo "   Go to your backend service and copy the domain"
echo "   Then set REACT_APP_API_URL=https://your-backend.railway.app"

echo "✅ Deployment complete!"
echo "📱 Frontend: Check Railway dashboard for your frontend URL"
echo "🔗 Backend: Check Railway dashboard for your backend URL"
echo "💾 Database: Automatically provisioned and connected"

echo ""
echo "📋 Next steps:"
echo "1. Go to Railway dashboard (railway.app)"
echo "2. Find your backend service URL"
echo "3. Set REACT_APP_API_URL in frontend service variables"
echo "4. Redeploy frontend if needed"
