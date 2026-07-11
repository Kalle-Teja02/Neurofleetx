# 🔧 Login Issue Troubleshooting Guide

## Quick Diagnosis

### Step 1: Test Your Backend Connection
Visit: `https://your-frontend-url.onrender.com/test-connection`

This page will:
- Show your current API URL
- Test if backend is reachable
- Test the login endpoint
- Show detailed error messages

### Step 2: Common Issues & Solutions

#### ❌ Issue 1: "Backend not reachable" or CORS error
**Symptoms:** 
- Login button doesn't respond
- Browser console shows CORS error
- Network tab shows failed requests

**Solutions:**

1. **Verify Backend is Running**
   - Go to your Render dashboard
   - Check if `neurofleetx-backend` service is deployed and "Live"
   - Check the logs for errors

2. **Check Frontend URL in Backend CORS**
   Your backend `SecurityConfig.java` currently allows:
   ```java
   "https://neurofleetx-frontend-q6ma.onrender.com"
   ```
   
   **If your frontend URL is different:**
   - Update `SecurityConfig.java` line ~76
   - Add your actual frontend URL
   - Redeploy backend

3. **Verify Environment Variables in Render**
   
   **Frontend Environment Variables:**
   - Go to Render dashboard → neurofleetx-frontend → Environment
   - Add: `VITE_API_URL` = `https://neurofleetx-1-ptto.onrender.com`
   - Click "Save Changes"
   - Render will auto-redeploy

   **Backend Environment Variables:**
   - `DB_URL` - Your MySQL database URL
   - `DB_USERNAME` - Database username
   - `DB_PASSWORD` - Database password
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - Should be set automatically by Render

#### ❌ Issue 2: "Invalid credentials" even with correct password
**Symptoms:**
- Backend is reachable
- Login form submits but shows "Invalid credentials"
- Check backend logs

**Solutions:**

1. **Check Database Connection**
   - Verify database is running and accessible
   - Check backend logs in Render for database connection errors
   - Test database credentials

2. **Verify User Exists**
   - Connect to your database
   - Check if users table has data
   - Run: `SELECT * FROM users;`

3. **Re-run SafeDataLoader**
   - Make sure `SafeDataLoader.java` ran successfully on deployment
   - Check backend logs for "SafeDataLoader" messages

#### ❌ Issue 3: Build not updating (old version showing)
**Symptoms:**
- Made changes but old version still showing
- .env changes not reflected

**Solutions:**

1. **Clear Build Cache**
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

2. **Hard Refresh Browser**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Check Render Build Command**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

### Step 3: Check Browser Console

1. Open your deployed frontend
2. Press F12 to open DevTools
3. Go to Console tab
4. Try to login
5. Look for errors:

**Common Console Errors:**

```
❌ "CORS policy: No 'Access-Control-Allow-Origin' header"
→ Backend CORS not configured for your frontend URL

❌ "Failed to fetch" or "Network error"
→ Backend is not running or URL is wrong

❌ "401 Unauthorized"
→ Invalid credentials or JWT token issue

❌ "500 Internal Server Error"
→ Backend error (check backend logs)
```

### Step 4: Test Backend Directly

Open a terminal and test your backend:

```bash
# Test if backend is alive
curl https://neurofleetx-1-ptto.onrender.com/api/auth/login

# Test login
curl -X POST https://neurofleetx-1-ptto.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neurofleetx.com","password":"admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGci...",
  "name": "Admin User",
  "email": "admin@neurofleetx.com",
  "role": "ADMIN",
  "userId": 1
}
```

### Step 5: Verify Environment Variables

#### Check what API URL your frontend is using:

1. Visit `/test-connection` page
2. Check the "Current API URL" displayed
3. It should show: `https://neurofleetx-1-ptto.onrender.com`

If it shows `http://localhost:8082`:
- Your environment variable is not set in Render
- Go to Render → Environment → Add `VITE_API_URL`
- Redeploy

## Test Credentials

After successful deployment, you should have these users (created by SafeDataLoader):

```
Admin:
- Email: admin@neurofleetx.com
- Password: admin123

Manager:
- Email: manager@neurofleetx.com
- Password: manager123

Driver:
- Email: driver@neurofleetx.com
- Password: driver123
```

## Still Not Working?

### Checklist:
- [ ] Backend is deployed and showing "Live" in Render
- [ ] Backend logs show no errors
- [ ] Database is connected (check backend logs)
- [ ] Frontend environment variable `VITE_API_URL` is set
- [ ] Backend CORS includes your frontend URL
- [ ] Browser console shows no CORS errors
- [ ] `/test-connection` page shows backend is reachable

### Get More Info:

1. **Backend Logs:**
   - Render Dashboard → neurofleetx-backend → Logs
   - Look for errors on startup or when login is attempted

2. **Frontend Console:**
   - F12 → Console tab
   - Shows JavaScript errors and API call failures

3. **Network Tab:**
   - F12 → Network tab
   - Try to login
   - Click on the failed request
   - Check Request URL, Headers, Response

## Quick Fix Commands

### Rebuild Frontend:
```bash
cd neurofleetx-frontend
npm run build
# Commit and push to trigger Render redeploy
```

### Update Backend CORS:
Edit `SecurityConfig.java` and add your frontend URL:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://your-actual-frontend-url.onrender.com"  // Add this
));
```

### Force Redeploy on Render:
- Go to Render Dashboard
- Click "Manual Deploy" → "Deploy latest commit"

---

## Contact Support

If you've tried everything above and still can't login, provide:
1. Screenshot of `/test-connection` page
2. Browser console errors (F12 → Console)
3. Backend logs from Render
4. Your frontend URL and backend URL
