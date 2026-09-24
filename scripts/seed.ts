/**
 * Seeds products, variants, the LABS coupon and the admin user.
 * Safe to re-run: existing rows are updated, stock is never reset once set.
 * Usage: bun run db:seed
 */
import postgres from "postgres";
import { scryptSync, randomBytes } from "node:crypto";

import { products } from "../src/data/products";
import { inventory, startingStock, unitCostCents, reorderAt } from "../src/data/inventory";

const url = process.env["DATABASE_URL"];
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

const skuFor = (slug: string, size: string) =>
  `VL-${slug.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8)}-${size.replace(/[^a-z0-9]/gi, "").toUpperCase()}`;

const defaultStock = Number(process.env["SEED_DEFAULT_STOCK"] ?? 50);

for (const p of products) {
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO products (slug, name, category, badge, rating, reviews)
    VALUES (${p.slug}, ${p.name}, ${p.category}, ${p.badge ?? null}, ${p.rating}, ${p.reviews})
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      badge = EXCLUDED.badge,
      rating = EXCLUDED.rating,
      reviews = EXCLUDED.reviews
    RETURNING id`;

  for (const s of p.sizes) {
    const inv = inventory[p.slug]?.find((i) => i.label === s.label);
    const sku = inv?.sku ?? skuFor(p.slug, s.label);
    const stock = inv ? startingStock(inv) : defaultStock;
    const cost = inv ? unitCostCents(inv) : 0;
    const reorder = inv ? reorderAt(inv) : 5;
    await sql`
      INSERT INTO product_variants (product_id, size_label, price_cents, sku, stock, unit_cost_cents, reorder_at)
      VALUES (${row!.id}, ${s.label}, ${Math.round(s.price * 100)}, ${sku}, ${stock}, ${cost}, ${reorder})
      ON CONFLICT (product_id, size_label) DO UPDATE SET
        price_cents = EXCLUDED.price_cents,
        sku = EXCLUDED.sku,
        unit_cost_cents = EXCLUDED.unit_cost_cents,
        reorder_at = EXCLUDED.reorder_at`;
  }
  // Hide sizes that are no longer offered (keeps order history intact).
  await sql`UPDATE product_variants SET active = false
    WHERE product_id = ${row!.id} AND size_label <> ALL(${p.sizes.map((s) => s.label)})`;
  console.log(`product ${p.slug} (${p.sizes.length} sizes)`);
}

await sql`
  INSERT INTO coupons (code, kind, value, active)
  VALUES ('LABS', 'percent', 30, true)
  ON CONFLICT (code) DO UPDATE SET kind = 'percent', value = 30, active = true`;
console.log("coupon LABS (30% off)");

const adminEmail = process.env["ADMIN_EMAIL"];
const adminPassword = process.env["ADMIN_PASSWORD"];
if (adminEmail && adminPassword) {
  const salt = randomBytes(16).toString("hex");
  const hash = `scrypt:${salt}:${scryptSync(adminPassword, salt, 64).toString("hex")}`;
  await sql`
    INSERT INTO admin_users (email, password_hash)
    VALUES (${adminEmail.toLowerCase()}, ${hash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`;
  console.log(`admin user ${adminEmail}`);
} else {
  console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user");
}

await sql.end();
console.log("Seed complete.");
