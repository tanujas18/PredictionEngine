# Deployment Guide

## Railway Deployment

This app is configured to deploy to Railway with both the client (React) and server (Express).

### Configuration Files

- `package.json` - Root package.json tells Railway this is a Node.js project
- `nixpacks.toml` - Nixpacks configuration for building both client and server
- `railway.toml` - Railway-specific deployment settings

### Environment Variables

Set these in your Railway project settings:

**Required:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `OPENROUTER_MODEL` - Model to use (e.g., `poolside/laguna-s-2.1:free`)

**Optional:**
- `PORT` - Railway will set this automatically (defaults to 8788)
- `API_LATENCY` - Artificial latency for testing (defaults to 350ms)

### Deployment Steps

1. **Connect your GitHub repository to Railway**
   - Go to Railway dashboard
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository

2. **Set environment variables**
   - In Railway project settings, go to "Variables"
   - Add `OPENROUTER_API_KEY` with your API key
   - Add `OPENROUTER_MODEL` with your model choice

3. **Deploy**
   - Railway will automatically detect the configuration
   - Build process:
     1. Install client dependencies
     2. Install server dependencies
     3. Build client (creates `client/dist`)
     4. Start server (serves API + static client files)

4. **Access your app**
   - Railway provides a URL like `https://your-app.railway.app`
   - Server serves both API (`/api/*`) and client routes

### Build Process

```bash
# Install phase
cd client && npm ci
cd server && npm ci

# Build phase
cd client && npm run build

# Start phase
cd server && npm start
```

### Troubleshooting

**Build fails on "Script start.sh not found"**
- Make sure `package.json` exists at the root
- Verify `nixpacks.toml` is present

**Client not building**
- Check that `client/package.json` has a `build` script
- Verify all client dependencies are in `client/package.json`

**Server won't start**
- Check Railway logs for specific errors
- Verify all environment variables are set
- Make sure `server/package.json` has a `start` script

**Port issues**
- Railway automatically sets `PORT` environment variable
- Your server should use `process.env.PORT`
- Current config: `const PORT = Number(process.env.PORT) || 8788;`

### Local Testing

Test the production build locally:

```bash
# Build client
cd client && npm install && npm run build

# Start server
cd ../server && npm install && npm start
```

Visit `http://localhost:8788` to test.
