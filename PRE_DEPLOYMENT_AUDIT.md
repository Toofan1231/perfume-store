# Pre-deployment audit notes

This version was prepared as a deployment-readiness pass for the perfume store MVP.

## Checked and improved

- Frontend structure separated from backend.
- Next.js config includes security headers and workspace-root protection.
- App Router error, loading, and not-found pages added.
- Admin panel now controls:
  - Homepage content
  - SEO text
  - Footer text
  - Contact info
  - Hero image
  - Products
  - Categories
  - Orders
  - Reviews
  - Users and roles
- Customer profile now supports saved addresses and order history.
- Cart validates stock limits and can use saved addresses.
- Local storage key was versioned to avoid old browser-cache state issues.
- Backend JSON store now writes atomically and is thread-safe for local development.
- Backend auth now supports dynamic demo tokens for newly registered users.
- Backend passwords are hashed for new users while still supporting old demo passwords.
- Backend includes settings routes, user role routes, pagination, validation, security headers, rate limiting, and tests.
- Firebase-ready rules are still included for later database integration.

## Manual test checklist before deployment

Frontend:

1. Open `/`.
2. Switch English / Dari / Pashto.
3. Open `/products`.
4. Test search, category, brand, gender, scent, and price filters.
5. Open a product detail page.
6. Add product to cart.
7. Open cart.
8. Checkout with cash.
9. Login as customer and check `/profile`.
10. Login as admin and open `/admin`.
11. Edit shop settings.
12. Add/edit/delete product.
13. Add/delete category.
14. Change order status.
15. Change user role.
16. Delete review.

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m pytest
python -m uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run typecheck
npm run build
npm run dev
```

## Known intentional limitations

- Payment is still demo/manual until you connect Stripe, PayPal, Zarinpal, or another provider.
- Database is intentionally not connected yet because the next phase is database integration.
- Image upload is represented with image URL fields until Firebase Storage or another storage provider is connected.
