# Vercel + Railway Deployment Guide

This guide shows how to deploy the client to Vercel and the server to Railway.

## Architecture

- **Frontend (Client)**: Deployed to Vercel
- **Backend (Server)**: Deployed to Railway
- Communication: Client makes API calls to Railway backend via HTTPS

---

## Part 1: Deploy Backend to Railway

### 1. Get Railway URL

After your Railway deployment succeeds:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Settings" tab
4. Find "Domains" section
5. Click "Generate Domain" if not already generated
6. Copy the URL (e.g., `https://predictionengine-production.up.railway.app`)

**Save this URL - you'll need it for Vercel!**

### 2. Set Railway Environment Variables

In Railway project settings, add:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=poolside/laguna-s-2.1:free
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
```

**Note**: Replace `your-vercel-app.vercel.app` with your actual Vercel URL (from Part 2).

---

## Part 2: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import your repository**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure the project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (very important!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `VITE_API_URL`
     - **Value**: Your Railway URL (e.g., `https://predictionengine-production.up.railway.app`)
     - Select all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your Vercel URL (e.g., `https://prediction-engine.vercel.app`)

6. **Update Railway CORS**
   - Go back to Railway
   - Update `ALLOWED_ORIGINS` environment variable to include your Vercel URL
   - Example: `http://localhost:5173,https://prediction-engine.vercel.app`
   - Railway will automatically redeploy

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: prediction-engine (or your choice)
# - Directory: ./ (we're already in client)
# - Override settings? No

# Set environment variable
vercel env add VITE_API_URL
# Enter your Railway URL when prompted
# Select all environments

# Deploy to production
vercel --prod
```

---

## Part 3: Verify Deployment

### 1. Check Railway Backend

Visit: `https://your-railway-url.railway.app/api/health`

Should return:
```json
{
  "ok": true,
  "dataset": "synthetic",
  "matches": 50,
  "teams": 20,
  "leagues": [...],
  "aiRationale": "enabled"
}
```

### 2. Check Vercel Frontend

Visit: `https://your-vercel-app.vercel.app`

- Page should load
- Matches should appear (fetched from Railway)
- Check browser console for any CORS errors

### 3. Test CORS

Open browser console on your Vercel site and run:
```javascript
fetch('https://your-railway-url.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should succeed without CORS errors.

---

## Quick Reference

### URLs to Save

| Service | Purpose | Example URL |
|---------|---------|-------------|
| Railway Backend | API Server | `https://predictionengine-production.up.railway.app` |
| Vercel Frontend | React Client | `https://prediction-engine.vercel.app` |

### Environment Variables

**Railway (Backend)**
```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=poolside/laguna-s-2.1:free
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
PORT=8787
```

**Vercel (Frontend)**
```
VITE_API_URL=https://your-railway-url.railway.app
```

---

## Troubleshooting

### CORS Errors

**Error**: `Access-Control-Allow-Origin` error in browser console

**Fix**:
1. Check `ALLOWED_ORIGINS` in Railway includes your Vercel URL
2. Make sure there are no trailing slashes
3. Redeploy Railway after updating environment variables

### API Calls Failing

**Error**: `Failed to fetch` or `Network error`

**Fix**:
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Test Railway API directly: `https://your-railway-url.railway.app/api/health`
3. Check Railway logs for errors

### Build Failures on Vercel

**Error**: Build fails with "Cannot find module"

**Fix**:
1. Make sure Root Directory is set to `client` in Vercel
2. Verify all dependencies are in `client/package.json`
3. Check build command is `npm run build`

### Railway Build Failures

**Error**: Nixpacks can't find build command

**Fix**:
1. Ensure `package.json`, `nixpacks.toml`, and `railway.toml` exist at project root
2. Check Railway build logs for specific errors
3. Verify node_modules are gitignored

---

## Local Development

### Backend (Server)
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:8787
```

### Frontend (Client)
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
# Proxies /api/* to localhost:8787
```

The Vite dev server automatically proxies API requests to your local backend, so you don't need to set `VITE_API_URL` for local development.

---

## Production Updates

### Update Frontend
Push to GitHub → Vercel auto-deploys

### Update Backend
Push to GitHub → Railway auto-deploys

### Update Environment Variables
- **Vercel**: Dashboard → Project → Settings → Environment Variables → Redeploy
- **Railway**: Dashboard → Project → Variables → Auto-redeploys
