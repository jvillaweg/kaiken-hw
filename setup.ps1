# Setup Script for Windows PowerShell

Write-Host "🚀 Setting up Bid Management System..." -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Desktop with Compose." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Yellow

# Start the services
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Bid Management System is starting up!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Services:" -ForegroundColor Cyan
    Write-Host "  • Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "  • Backend:   http://localhost:8000" -ForegroundColor White
    Write-Host "  • API Docs:  http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  • Database:  localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Please wait a moment for all services to initialize..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 To stop the services, run: docker-compose down" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check the error messages above." -ForegroundColor Red
    Write-Host "💡 Try running: docker-compose logs" -ForegroundColor Yellow
}
