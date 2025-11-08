# AI Focus App

## Project Overview

This is a modern web application built with React, TypeScript, and Vite. The project provides a platform for AI-focused training and services.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project can be deployed to various hosting platforms such as:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure your domain in Netlify dashboard

## Custom Domain Setup

You can connect a custom domain by:

1. Purchasing a domain from a domain registrar
2. Configuring DNS settings to point to your hosting provider
3. Setting up SSL certificates (usually handled automatically by modern hosting providers)

## 🚀 Development Workflow System

This project includes a comprehensive development workflow system to help you manage your development sessions efficiently.

### **Quick Start for Development:**
```powershell
./startup-dev-session.ps1
```

### **Session End:**
```powershell
./session-closeout.ps1 -SessionDescription "What you accomplished"
```

### **Key Documentation:**
- **[DEVELOPMENT_WORKFLOW_README.md](DEVELOPMENT_WORKFLOW_README.md)** - Complete workflow guide
- **[DEV_STARTUP_CHEATSHEET.md](DEV_STARTUP_CHEATSHEET.md)** - Quick reference guide
- **[UTILITY_SCRIPTS_GLOSSARY.md](UTILITY_SCRIPTS_GLOSSARY.md)** - All utility scripts reference
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Environment management guide
- **[KEEPALIVE_SYSTEM_GUIDE.md](KEEPALIVE_SYSTEM_GUIDE.md)** - Keepalive system documentation

### **Essential Scripts:**
- `startup-dev-session.ps1` - Complete development session startup
- `session-closeout.ps1` - Proper session ending
- `project-status.ps1` - Project status overview
- `validate-env.ps1` - Environment validation
- `switch-to-dev.ps1` / `switch-to-prod.ps1` - Environment switching

### **Current Project Status:**
- ✅ Security issues resolved (RLS, Function Security)
- ✅ Keepalive system active (GitHub Actions)
- ✅ Environment management working
- ✅ Professional email notifications
- ✅ WCAG 2.1 AA Accessibility compliance
- ✅ **IDE Context System** - Complete context for any agentic system
- ✅ **Session Continuity** - Never lose context between sessions
- ✅ **Automated Documentation** - Session summaries and TODOs
