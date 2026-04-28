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
