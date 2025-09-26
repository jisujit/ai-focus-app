# Production Deployment Script
# This script builds and deploys to production

Write-Host "Starting Production Deployment..." -ForegroundColor Green

# Step 1: Build for production
Write-Host "Building for production..." -ForegroundColor Yellow
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Build Docker container
Write-Host "Building Docker container..." -ForegroundColor Yellow
docker build -t ghcr.io/jisujit/ai-focus:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Test container locally (optional)
Write-Host "Testing container locally..." -ForegroundColor Yellow
Write-Host "Visit http://localhost:3001 to test" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the test and continue deployment" -ForegroundColor Cyan
docker run -p 3001:80 ghcr.io/jisujit/ai-focus:latest

# Step 4: Push to registry
Write-Host "Pushing to container registry..." -ForegroundColor Yellow
echo $env:GITHUB_TOKEN | docker login ghcr.io -u jisujit --password-stdin
docker push ghcr.io/jisujit/ai-focus:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Production deployment completed!" -ForegroundColor Green
Write-Host "Your app is now running with production database!" -ForegroundColor Green
