# Netlify Deployment Guide

This project is prepared for Netlify deployment without Firebase Storage.

## Project layout

```txt
frontend/      Next.js app deployed to Netlify
backend/       FastAPI backend, deploy later on Render/Railway/Cloud Run
firebase-ready/ Firestore rules, indexes, and Storage rules for later
```

## Netlify build settings

The root `netlify.toml` is already configured:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NEXT_PUBLIC_USE_FIREBASE = "true"
  NEXT_PUBLIC_USE_FIREBASE_STORAGE = "false"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Because the base directory is `frontend`, the publish path `.next` points to `frontend/.next` automatically.
Do not set the publish directory to `frontend/.next` in the Netlify UI.

## Required Netlify environment variables

Add these in:

```txt
Netlify → Site configuration → Environment variables
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_FIREBASE=true
NEXT_PUBLIC_USE_FIREBASE_STORAGE=false
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

Use your Firebase Web App config values.

## Firebase Auth domain

After Netlify gives you the live site URL, add it to Firebase:

```txt
Firebase Console → Authentication → Settings → Authorized domains
```

Add:

```txt
your-site-name.netlify.app
```

## Important

Firebase Storage is disabled for now:

```env
NEXT_PUBLIC_USE_FIREBASE_STORAGE=false
```

Images are served from `frontend/public/images` or manually supplied image URLs. Enable Storage later only after upgrading Firebase billing.

## Local test before push

```bash
cd frontend
npm install
npm run typecheck
npm run build
npm run dev
```

## Git commands

```bash
git add .
git commit -m "Prepare Netlify deployment without Firebase Storage"
git push
```

## Netlify UI settings

If Netlify asks manually:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: .next
```

If the UI says `frontend/.next`, change it to `.next` because publish directory is relative to the base directory.
