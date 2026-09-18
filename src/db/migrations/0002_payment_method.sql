-- Adds the payment method so Interac e-Transfer orders can be tracked
-- alongside Authorize.Net card orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'card';
CREATE INDEX IF NOT EXISTS orders_payment_method_idx ON orders (payment_method);
