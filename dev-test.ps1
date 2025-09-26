# Development Testing Script
# This script builds and tests with development database

Write-Host "Starting Development Testing..." -ForegroundColor Green

# Step 1: Build for development
Write-Host "Building for development..." -ForegroundColor Yellow
npm run build:dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Build Docker container with dev config
Write-Host "Building Docker container with dev config..." -ForegroundColor Yellow
docker build -t ghcr.io/jisujit/ai-focus:dev .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Test container locally
Write-Host "Testing container locally with dev database..." -ForegroundColor Yellow
Write-Host "Visit http://localhost:3001 to test" -ForegroundColor Cyan
Write-Host "This will use your development database (ai-focus-app-dev)" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
docker run -p 3001:80 ghcr.io/jisujit/ai-focus:dev

Write-Host "Development testing completed!" -ForegroundColor Green
