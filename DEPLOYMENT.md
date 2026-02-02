# Deployment Guide for Render and Firebase

## Step 1: Backend on Render
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set **Runtime** to `Node`.
4. Set **Build Command** to `npm install && npm run build`.
5. Set **Start Command** to `npm start`.
6. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL URL.
   - `SESSION_SECRET`: A random string for session security.
   - `NODE_ENV`: `production`

## Step 2: Frontend on Firebase
1. Run `firebase deploy --only hosting` from your local terminal.
2. Ensure the `BACKEND_URL` in `client/src/lib/queryClient.ts` matches your Render URL.

## Important URLs
- **Frontend**: https://norax-drop.web.app
- **Backend (Render)**: https://norax-drop-backend.onrender.com (Update this if Render gives you a different one)
