# Luxora Perfume Store — Netlify Ready

This is the prepared production-style MVP for the perfume store.

## Included

- Next.js frontend in `frontend/`
- FastAPI backend in `backend/`
- Firebase Auth + Firestore-ready frontend
- Firebase Storage disabled for now
- Netlify deployment configuration in `netlify.toml`
- Firestore rules in `firebase-ready/firestore.rules`
- Premium navbar, footer, cart UI, profile, admin, products, orders, and multilingual UI

## Local frontend

```bash
cd frontend
npm install
npm run dev
```

## Local build test

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

## Netlify settings

The root `netlify.toml` is already configured.

If Netlify asks manually, use:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: .next
```

Do not use `frontend/.next` as publish directory when base directory is already `frontend`.

## Firebase environment variables

Add the Firebase variables in Netlify → Site configuration → Environment variables.

Storage remains disabled:

```env
NEXT_PUBLIC_USE_FIREBASE_STORAGE=false
```

## Backend

The backend can be deployed later to Render, Railway, or Google Cloud Run.
The current Netlify deployment only needs the frontend + Firebase Auth + Firestore.
