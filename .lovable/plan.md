# Veyrona Labs — store backend, checkout and admin

Build the full selling side of the site so it runs on your own server with your own database, with Authorize.Net taking the payments.

## What you'll be able to do

- Take real orders: cart → checkout → card payment → confirmation page.
- See every order, customer and payment status in an admin area at `/admin`.
- Keep stock counts that drop automatically when an order is paid, and show "Sold out" when a size runs out.
- Apply coupon codes (starting with your LABS 30% code) with expiry dates, usage limits and minimum spend.
- Get an email for every new order, and send the customer a confirmation email.

## Customer flow

1. Cart drawer → **Checkout** page: contact email, shipping address, coupon box, order summary (items, shipping shown free, discount, tax, total).
2. Card details are entered in Authorize.Net's own hosted card field, so raw card numbers never touch your server — that keeps your PCI burden minimal.
3. On payment approval the order is written to the database, stock is reduced, the coupon use is recorded, emails go out, and the shopper lands on an order-confirmation page with their order number.
4. If the card is declined or the payment errors, they stay on checkout with a clear message and nothing is charged or reserved.
5. `/order/<number>` lets a guest look up their order with their email — no account needed.

## Admin area

Password-protected at `/admin` (single admin login you set):

- **Orders** — list with status filters, order detail with items, customer, address, payment result, and buttons to mark shipped (with tracking number) or refunded.
- **Products** — stock per size, price, and an on/off switch for visibility.
- **Coupons** — create/edit/disable codes, see how many times each was used.
- **Customers** — email, order count, lifetime spend.

## Technical notes

- **Database:** PostgreSQL, accessed with Drizzle ORM. Tables: `products`, `product_variants` (size, price, stock, SKU), `customers`, `orders`, `order_items`, `coupons`, `coupon_redemptions`, `admin_users`, `email_log`. SQL migrations committed to the repo plus a seed script that imports the current 14 products and their sizes from `src/data/products.ts`.
- **Server code:** TanStack Start server functions in `src/lib/*.functions.ts` for cart pricing, checkout and admin, plus server routes under `src/routes/api/public/` for the Authorize.Net webhook and the Accept.js payment-nonce exchange.
- **Pricing is always recalculated server-side** from the database — client prices are never trusted. Totals: items − coupon discount + GST/HST by province, shipping $0.
- **Authorize.Net:** Accept.js in the browser produces a payment nonce; the server charges it with an `authCaptureTransaction` via the Authorize.Net API using `AUTHORIZE_NET_LOGIN_ID` / `AUTHORIZE_NET_TRANSACTION_KEY` / `AUTHORIZE_NET_ENVIRONMENT` (sandbox until you have live keys). A signed webhook at `/api/public/authorize-net/webhook` keeps payment status in sync for refunds, voids and settlements. Orders are created in `pending` and only move to `paid` on an approved transaction; an idempotency key prevents double charges.
- **Stock:** decremented in the same database transaction as the order insert, with a row-level check so two shoppers can't buy the last vial.
- **Email:** sent over SMTP with credentials you supply (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ORDER_FROM_EMAIL`, `ORDER_ALERT_EMAIL`). Order confirmation and shipping-notification templates, with every send logged.
- **Admin auth:** session cookie (HttpOnly, SameSite=Lax) backed by an `admin_users` row with an Argon2/bcrypt password hash; seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first run.
- **Self-hosting:** `bun run build` produces a Node server; a `.env.example`, a `README-deploy.md` and a `docker-compose.yml` (app + Postgres) are included so you can run it on your own box.

## Build order

1. Database schema, migrations, product seed.
2. Server-side cart pricing, coupon engine, tax and totals.
3. Checkout page UI + Accept.js card field.
4. Authorize.Net charge, order creation, stock decrement, webhook.
5. Confirmation page and guest order lookup.
6. Emails.
7. Admin dashboard.
8. Deployment files and docs.

## Still needed from you

- The from/alert email addresses and SMTP details (build proceeds without them; emails stay disabled until added).
- Authorize.Net keys — sandbox mode is used until you paste live ones.
