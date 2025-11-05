# Vercel Deployment Configuration

## Environment Variables Required

The following environment variables **MUST** be set in your Vercel project settings for the frontend to connect to the backend:

### Required Variables:
```
REACT_APP_API_URL=https://your-backend-api-url.com
REACT_APP_SOCKET_URL=https://your-backend-api-url.com
```

### How to Set Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your backend API URL (e.g., `https://connect-nita-backend.onrender.com`)
   - **Environment**: Production, Preview, Development (select all if needed)
4. Repeat for `REACT_APP_SOCKET_URL` (usually same as API URL)
5. **Redeploy** your application for changes to take effect

### Backend URL Examples:

- **Render**: `https://your-app.onrender.com`
- **AWS**: `https://api.yourdomain.com`
- **Heroku**: `https://your-app.herokuapp.com`
- **Railway**: `https://your-app.railway.app`
- **DigitalOcean**: `https://your-app.digitalocean.app`

### Important Notes:

- Environment variables must be prefixed with `REACT_APP_` to be accessible in React
- After adding/changing environment variables, trigger a new deployment
- The backend must have CORS configured to allow your Vercel frontend URL
- Socket.IO requires WebSocket support - ensure your backend hosting supports WebSockets

### Verifying Configuration:

After deployment, check the browser console:
- If you see connection errors, verify the environment variables are set correctly
- Check that the backend URL is accessible and CORS is configured properly
- Verify Socket.IO connection in the Network tab (should show WebSocket connection)

