# Luxora Perfume Store — Pre-deployment audited version

This is the final pre-database version of the perfume store project.

It includes:

- Next.js frontend
- FastAPI backend
- Local JSON backend persistence
- English, Dari, Pashto UI
- RTL support
- Customer login/register demo
- Admin login demo
- Customer profile and saved addresses
- Order history
- Product search and advanced filters
- Product details and reviews
- Cart and checkout
- Demo payment flow
- Admin dashboard
- Admin control for homepage, SEO text, footer, contact info, products, categories, orders, reviews, users, and roles
- Backend API with validation, pagination, auth, rate limiting, security headers, atomic JSON store, and tests
- Firebase-ready rules for later database integration

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Run backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

API docs:

```txt
http://localhost:8000/docs
```

## Demo accounts

Admin:

```txt
admin@luxora.dev
admin12345
```

Customer:

```txt
customer@luxora.dev
customer12345
```

Backend demo admin token:

```txt
demo-admin-token
```

Backend demo customer token:

```txt
demo-customer-token
```

## Before deployment

Read:

```txt
PRE_DEPLOYMENT_AUDIT.md
```

Then run:

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

```bash
cd backend
pip install -r requirements.txt
python -m pytest
```

## Next phase

After this version is approved, connect the database:

- Firebase Auth
- Firestore
- Firebase Storage
- Admin role via Firebase custom claims or users collection


## Firebase Auth + Firestore mode

This version supports two modes:

1. Local/demo mode with localStorage and backend JSON.
2. Firebase mode with Firebase Auth and Firestore.

### Frontend Firebase setup

Create `frontend/.env.local`:

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

Then run:

```bash
cd frontend
npm install
npm run dev
```

### Firestore rules

Use the latest rules from:

```txt
firebase-ready/firestore.rules
```

The rules allow:
- Public read for products, categories, reviews, and settings.
- Admin write access for products, categories, settings, orders, users, and review moderation.
- Customer create/read access for their own orders.
- Customer profile updates without allowing customers to promote themselves to admin.

### Backend Firebase mode

The backend is still able to run in local JSON mode. To enable Firebase Admin SDK mode later:

```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-firebase-later.txt
```

Create `backend/.env`:

```env
USE_FIREBASE=true
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.firebasestorage.app
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
```

Then run:

```bash
python -m uvicorn app.main:app --reload
```

Do not commit service account files or `.env` files to GitHub.
