# Render Deployment Guide for Basketball Ref

This guide will help you deploy your Basketball Ref application to Render.

## Prerequisites

1. Create a [Render account](https://render.com)
2. Push your code to a GitHub repository
3. Install PostgreSQL dependencies (we've already added them to package.json)

## Steps to Deploy

### 1. Create a PostgreSQL Database

1. Log in to your Render dashboard
2. Navigate to "New +" > "PostgreSQL"
3. Fill in the following details:
   - Name: basketball-ref-db
   - Database: basketball_ref
   - User: (auto-generated)
   - Region: Choose the closest to you
   - Plan: Free
4. Click "Create Database"
5. Save the "Internal Database URL" - you'll need it later

### 2. Deploy the Backend

1. Navigate to "New +" > "Web Service"
2. Connect your GitHub repository
3. Fill in the following details:
   - Name: basketball-ref-api
   - Environment: Node
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (paste the Internal Database URL from step 1)
5. Click "Create Web Service"

### 3. Deploy the Frontend

1. Navigate to "New +" > "Static Site"
2. Connect your GitHub repository
3. Fill in the following details:
   - Name: basketball-ref-client
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Add the following environment variable:
   - `VITE_API_URL`: (use your backend service URL, e.g., `https://basketball-ref-api.onrender.com`)
5. Set up redirects for single-page application routing:
   - Click on "Redirects/Rewrites"
   - Add a rule: Source path `/*`, Destination path `/index.html`, Type "Rewrite"
6. Click "Create Static Site"

### 4. Update Frontend API Configuration

Before deployment, make sure to update your frontend's API URL configuration to point to your Render backend service.

In your frontend code, create a file at `frontend/src/config.ts` or update an existing configuration file:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

Then use this configuration in your API requests.

### 5. Test Your Deployment

Once everything is deployed, visit your frontend URL to test that everything is working correctly. If you encounter any issues, check the logs in the Render dashboard for each service.

## Automatic Updates

With Render, any changes pushed to your main branch will trigger automatic redeployments of your services. 