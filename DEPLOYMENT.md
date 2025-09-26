# Deployment Guide

## Environment Configuration

- **Development**: Uses `.env` → `ai-focus-app-dev` Supabase project
- **Production**: Uses `.env.production` → `ai-focus-app-prod` Supabase project

## Development Workflow

### Local Development
```bash
npm run dev                    # Uses dev database
```

### Test with Dev Database
```bash
npm run build:dev             # Build with dev config
./dev-test.ps1                # Test with dev database
```

## Production Deployment

### Build and Deploy
```bash
npm run build:prod            # Build with production config
./deploy.ps1                  # Deploy to production
```

### Manual Steps
```bash
# 1. Build for production
npm run build:prod

# 2. Build Docker container
docker build -t ghcr.io/jisujit/ai-focus:latest .

# 3. Test locally (optional)
docker run -p 3001:80 ghcr.io/jisujit/ai-focus:latest

# 4. Push to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u jisujit --password-stdin
docker push ghcr.io/jisujit/ai-focus:latest
```

## Important Notes

- **Always use `npm run build:prod`** for production deployments
- **Test with dev database first** using `./dev-test.ps1`
- **Production uses `ai-focus-app-prod`** database
- **Development uses `ai-focus-app-dev`** database
