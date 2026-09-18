CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  badge text,
  rating integer NOT NULL DEFAULT 5,
  reviews integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  sku text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_idx ON product_variants (sku);
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_product_size_idx ON product_variants (product_id, size_label);

CREATE TABLE IF NOT EXISTS customers (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  phone text,
  orders_count integer NOT NULL DEFAULT 0,
  lifetime_spend_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'percent',
  value integer NOT NULL,
  min_subtotal_cents integer NOT NULL DEFAULT 0,
  max_redemptions integer,
  times_redeemed integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_id integer REFERENCES customers(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  auth_code text,
  avs_result text,
  idempotency_key text,
  coupon_code text,
  subtotal_cents integer NOT NULL,
  discount_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'CAD',
  shipping_address jsonb NOT NULL,
  tracking_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_idx ON orders (idempotency_key);

CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id integer REFERENCES product_variants(id) ON DELETE SET NULL,
  slug text NOT NULL,
  name text NOT NULL,
  size_label text NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL,
  line_total_cents integer NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id serial PRIMARY KEY,
  coupon_id integer NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id text PRIMARY KEY,
  admin_id integer NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_log (
  id serial PRIMARY KEY,
  order_id integer REFERENCES orders(id) ON DELETE SET NULL,
  to_address text NOT NULL,
  subject text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id serial PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
