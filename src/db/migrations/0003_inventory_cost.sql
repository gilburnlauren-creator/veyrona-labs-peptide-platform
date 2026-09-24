ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS unit_cost_cents integer NOT NULL DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS reorder_at integer NOT NULL DEFAULT 5;
