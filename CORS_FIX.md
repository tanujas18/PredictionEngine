# CORS Fix Guide

## The Issue
CORS (Cross-Origin Resource Sharing) errors occur when your Vercel frontend tries to call your Railway backend API.

## Environment Variables to Set

### Railway (Backend)
Go to Railway → Your Project → Variables tab

**Add/Update this variable:**
```
ALLOWED_ORIGINS=https://prediction-engine-five.vercel.app,http://localhost:5173
```

**Important Notes:**
- ✅ Use `https://` (not `http://`)
- ✅ No trailing slash (not `https://prediction-engine-five.vercel.app/`)
- ✅ Separate multiple origins with commas (no spaces)
- ✅ Include your Vercel URL exactly as shown in browser

### Vercel (Frontend)
Go to Vercel → Your Project → Settings → Environment Variables

**Add/Update this variable:**
```
VITE_API_URL=https://predictionengine-production-dab9.up.railway.app
```

**Important Notes:**
- ✅ Use your actual Railway URL (from Railway Settings → Domains)
- ✅ No trailing slash
- ✅ Include `https://`

## After Setting Variables

1. **Railway**: Will auto-redeploy when you save the variable
2. **Vercel**: Go to Deployments → Click "..." on latest → "Redeploy"

## Verification Steps

### Step 1: Check Railway Logs
Go to Railway → Your Project → Click on deployment → View Logs

Look for this line:
```
CORS allowed origins: https://prediction-engine-five.vercel.app,http://localhost:5173
```

### Step 2: Test API Directly
Open this in your browser (use your Railway URL):
```
https://predictionengine-production-dab9.up.railway.app/api/health
```

Should return JSON without errors.

### Step 3: Test from Vercel
1. Open your Vercel app: `https://prediction-engine-five.vercel.app`
2. Open browser console (F12)
3. Look for network requests to Railway
4. Should NOT see CORS errors

### Step 4: Test CORS Manually
In browser console on your Vercel app, run:
```javascript
fetch('https://predictionengine-production-dab9.up.railway.app/api/health')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err))
```

Should log: `Success: { ok: true, ... }`

## Common Issues & Solutions

### Issue 1: Still Getting CORS Errors After Setting Variables

**Solutions:**
1. Check Railway logs - make sure `ALLOWED_ORIGINS` is logged correctly
2. Verify no typos in your Vercel URL
3. Make sure both Railway and Vercel have redeployed
4. Clear browser cache and hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Issue 2: "Origin null is not allowed"

**Solution:**
You're probably testing locally. Make sure local development includes:
```
ALLOWED_ORIGINS=https://prediction-engine-five.vercel.app,http://localhost:5173,http://localhost:3000
```

### Issue 3: Variables Not Taking Effect

**Railway:**
- After changing variables, Railway auto-redeploys
- Check the deployment logs to confirm new environment variables

**Vercel:**
- After changing variables, you MUST manually redeploy
- Go to Deployments → Latest → "..." menu → Redeploy

### Issue 4: Different Error in Production vs Development

**Development:** Works with Vite proxy (no CORS issues)
**Production:** Needs proper CORS setup

Make sure:
- `VITE_API_URL` is set in Vercel
- `ALLOWED_ORIGINS` is set in Railway
- Both include the production URLs

## Quick Checklist

- [ ] Railway has `ALLOWED_ORIGINS` with your Vercel URL (with `https://`, no trailing slash)
- [ ] Vercel has `VITE_API_URL` with your Railway URL (with `https://`, no trailing slash)
- [ ] Railway has redeployed after variable change
- [ ] Vercel has been manually redeployed after variable change
- [ ] Tested API directly in browser - works
- [ ] Tested frontend - loads without CORS errors
- [ ] Checked Railway logs for correct CORS origins

## Still Not Working?

### Enable Debug Mode

**In Railway, add this variable temporarily:**
```
NODE_ENV=development
```

This will show more detailed CORS logs.

### Check Exact URLs

**Railway URL format:**
```
https://your-service-name-production-xxxx.up.railway.app
```

**Vercel URL format:**
```
https://your-app-name.vercel.app
OR
https://your-app-name-git-branch.vercel.app
```

Make sure you're using the PRIMARY domain, not a deployment-specific URL.

### Contact Info

If still stuck, check:
1. Railway deployment logs
2. Vercel function logs
3. Browser network tab (click on failed request → Headers → Response Headers)

Look for:
- `access-control-allow-origin` header in response
- Actual vs expected origin
