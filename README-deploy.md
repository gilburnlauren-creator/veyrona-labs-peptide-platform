# Veyrona Labs — self-hosting guide

The store runs as a single Node app (TanStack Start) plus a PostgreSQL database.

## 1. Requirements

- Node 20+ (or Bun 1.1+)
- PostgreSQL 15+
- An Authorize.Net merchant account
- An SMTP mailbox for order emails

## 2. Configure

Copy `.env.example` to `.env` and fill it in:

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTHORIZE_NET_ENVIRONMENT` | `sandbox` while testing, `production` when live |
| `AUTHORIZE_NET_LOGIN_ID` / `AUTHORIZE_NET_TRANSACTION_KEY` | From Authorize.Net → Account → API Credentials |
| `AUTHORIZE_NET_SIGNATURE_KEY` | From Authorize.Net → Account → Webhooks (signature key) |
| `VITE_AUTHORIZE_NET_CLIENT_KEY` / `VITE_AUTHORIZE_NET_LOGIN_ID` | Public Accept.js keys (safe in the browser) |
| `VITE_AUTHORIZE_NET_ENVIRONMENT` | Must match `AUTHORIZE_NET_ENVIRONMENT` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Order email delivery |
| `STORE_ADMIN_EMAIL` | Where new-order alerts go |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` | Creates the first admin login during seeding |

## 3. Database

```bash
bun install
bun run db:migrate   # creates all tables
bun run db:seed      # loads products, sizes, stock and the LABS coupon
```

Re-running the seed is safe; it updates instead of duplicating.

## 4. Run

```bash
bun run build
bun run start        # serves on PORT (default 3000)
```

Put it behind nginx/Caddy with HTTPS — card checkout requires TLS.

## 5. Authorize.Net webhook

In Authorize.Net → Account → Webhooks, add:

```
https://YOUR-DOMAIN/api/public/authorize-net/webhook
```

Subscribe to the payment events (authcapture, capture, refund, void, fraud).
Paste the signature key into `AUTHORIZE_NET_SIGNATURE_KEY`. Requests without a
valid signature are rejected.

## 6. Admin

Visit `https://YOUR-DOMAIN/admin` and sign in with the seeded admin account.
From there you can see orders and revenue, add tracking numbers (which emails
the customer), refund payments, edit prices and stock, manage discount codes,
and view customers.

## 7. Docker (optional)

```bash
docker compose up -d       # starts PostgreSQL + the app
docker compose exec app bun run db:migrate
docker compose exec app bun run db:seed
```
