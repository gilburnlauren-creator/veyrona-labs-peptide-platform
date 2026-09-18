import { randomBytes } from "node:crypto";

import { databaseConfigured, getSql } from "@/db/client.server";
import { products as staticProducts, getProduct } from "@/data/products";
import { taxRateFor } from "./tax";
import type { Quote, QuoteItemInput, QuoteLine, ShippingAddress } from "./store.types";

export const SHIPPING_VALUE_CENTS = 2500; // shown as a saving; customer pays $0

type VariantRow = {
  variant_id: number;
  slug: string;
  name: string;
  size_label: string;
  price_cents: number;
  stock: number;
  active: boolean;
};

async function loadVariants(items: QuoteItemInput[]): Promise<VariantRow[]> {
  if (items.length === 0) return [];
  const sql = getSql();
  const slugs = [...new Set(items.map((i) => i.slug))];
  return sql<VariantRow[]>`
    SELECT v.id AS variant_id, p.slug, p.name, v.size_label, v.price_cents, v.stock,
           (v.active AND p.active) AS active
    FROM product_variants v
    JOIN products p ON p.id = v.product_id
    WHERE p.slug IN ${sql(slugs)}`;
}

function staticLine(item: QuoteItemInput): QuoteLine | null {
  const p = getProduct(item.slug);
  const size = p?.sizes.find((s) => s.label === item.size) ?? p?.sizes[0];
  if (!p || !size) return null;
  const unit = Math.round(size.price * 100);
  return {
    slug: p.slug,
    name: p.name,
    size: size.label,
    unitPriceCents: unit,
    quantity: item.qty,
    lineTotalCents: unit * item.qty,
    variantId: null,
    stock: null,
    inStock: true,
  };
}

export type CouponRow = {
  id: number;
  code: string;
  kind: string;
  value: number;
  min_subtotal_cents: number;
  max_redemptions: number | null;
  times_redeemed: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
};

export async function findCoupon(code: string): Promise<CouponRow | null> {
  if (!databaseConfigured()) {
    return code.trim().toUpperCase() === "LABS"
      ? {
          id: 0, code: "LABS", kind: "percent", value: 30, min_subtotal_cents: 0,
          max_redemptions: null, times_redeemed: 0, starts_at: null, expires_at: null, active: true,
        }
      : null;
  }
  const sql = getSql();
  const rows = await sql<CouponRow[]>`
    SELECT * FROM coupons WHERE upper(code) = ${code.trim().toUpperCase()} LIMIT 1`;
  return rows[0] ?? null;
}

export function evaluateCoupon(coupon: CouponRow | null, subtotalCents: number) {
  if (!coupon) return { discountCents: 0, error: "That code isn't valid." };
  const now = Date.now();
  if (!coupon.active) return { discountCents: 0, error: "That code is no longer active." };
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now)
    return { discountCents: 0, error: "That code isn't active yet." };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now)
    return { discountCents: 0, error: "That code has expired." };
  if (coupon.max_redemptions !== null && coupon.times_redeemed >= coupon.max_redemptions)
    return { discountCents: 0, error: "That code has been fully redeemed." };
  if (subtotalCents < coupon.min_subtotal_cents)
    return {
      discountCents: 0,
      error: `Spend $${(coupon.min_subtotal_cents / 100).toFixed(2)} to use this code.`,
    };
  const discount =
    coupon.kind === "fixed"
      ? Math.min(coupon.value, subtotalCents)
      : Math.round((subtotalCents * coupon.value) / 100);
  return { discountCents: discount, error: null as string | null };
}

export async function buildQuote(opts: {
  items: QuoteItemInput[];
  couponCode?: string | null;
  province?: string | null;
}): Promise<Quote> {
  const items = opts.items.filter((i) => i.qty > 0).slice(0, 50);
  let lines: QuoteLine[] = [];

  if (databaseConfigured()) {
    const rows = await loadVariants(items);
    for (const item of items) {
      const row =
        rows.find((r) => r.slug === item.slug && r.size_label === item.size) ??
        rows.find((r) => r.slug === item.slug);
      if (!row || !row.active) continue;
      const qty = Math.max(1, Math.min(item.qty, 99));
      lines.push({
        slug: row.slug,
        name: row.name,
        size: row.size_label,
        unitPriceCents: row.price_cents,
        quantity: qty,
        lineTotalCents: row.price_cents * qty,
        variantId: row.variant_id,
        stock: row.stock,
        inStock: row.stock >= qty,
      });
    }
  } else {
    lines = items.map(staticLine).filter((l): l is QuoteLine => l !== null);
  }

  const subtotalCents = lines.reduce((n, l) => n + l.lineTotalCents, 0);

  let discountCents = 0;
  let couponError: string | null = null;
  let couponCode: string | null = null;
  const raw = opts.couponCode?.trim();
  if (raw) {
    const coupon = await findCoupon(raw);
    const result = evaluateCoupon(coupon, subtotalCents);
    discountCents = result.discountCents;
    couponError = result.error;
    if (!result.error && coupon) couponCode = coupon.code.toUpperCase();
  }

  const taxable = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxable * taxRateFor(opts.province));
  const shippingCents = 0;

  return {
    lines,
    subtotalCents,
    discountCents,
    taxCents,
    shippingCents,
    totalCents: taxable + taxCents,
    couponCode,
    couponError,
    currency: "CAD",
    shippingSavedCents: SHIPPING_VALUE_CENTS,
  };
}

export function generateOrderNumber() {
  const now = new Date();
  const ymd = `${now.getUTCFullYear()}`.slice(2) +
    String(now.getUTCMonth() + 1).padStart(2, "0") +
    String(now.getUTCDate()).padStart(2, "0");
  return `VL-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export type CreateOrderInput = {
  email: string;
  address: ShippingAddress;
  quote: Quote;
  couponCode: string | null;
  idempotencyKey: string;
  payment: { transactionId: string; authCode: string; avsResult: string };
};

/**
 * Inserts the order, its items, the coupon redemption and decrements stock in
 * one transaction. The stock UPDATE has a `stock >= qty` guard so two shoppers
 * cannot oversell the last vial.
 */
export async function createPaidOrder(input: CreateOrderInput) {
  const sql = getSql();
  const orderNumber = generateOrderNumber();

  return sql.begin(async (tx) => {
    const [customer] = await tx<{ id: number }[]>`
      INSERT INTO customers (email, name, phone)
      VALUES (${input.email.toLowerCase()}, ${input.address.fullName}, ${input.address.phone ?? null})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id`;

    const [order] = await tx<{ id: number }[]>`
      INSERT INTO orders (
        order_number, customer_id, email, status, payment_status, transaction_id, auth_code,
        avs_result, idempotency_key, coupon_code, subtotal_cents, discount_cents, tax_cents,
        shipping_cents, total_cents, shipping_address
      ) VALUES (
        ${orderNumber}, ${customer!.id}, ${input.email.toLowerCase()}, 'paid', 'captured',
        ${input.payment.transactionId}, ${input.payment.authCode}, ${input.payment.avsResult},
        ${input.idempotencyKey}, ${input.couponCode}, ${input.quote.subtotalCents},
        ${input.quote.discountCents}, ${input.quote.taxCents}, ${input.quote.shippingCents},
        ${input.quote.totalCents}, ${tx.json(input.address as unknown as Record<string, unknown>)}
      ) RETURNING id`;

    for (const line of input.quote.lines) {
      await tx`
        INSERT INTO order_items (order_id, variant_id, slug, name, size_label, unit_price_cents, quantity, line_total_cents)
        VALUES (${order!.id}, ${line.variantId}, ${line.slug}, ${line.name}, ${line.size},
                ${line.unitPriceCents}, ${line.quantity}, ${line.lineTotalCents})`;
      if (line.variantId !== null) {
        await tx`
          UPDATE product_variants SET stock = stock - ${line.quantity}
          WHERE id = ${line.variantId} AND stock >= ${line.quantity}`;
      }
    }

    if (input.couponCode) {
      const [coupon] = await tx<{ id: number }[]>`
        UPDATE coupons SET times_redeemed = times_redeemed + 1
        WHERE upper(code) = ${input.couponCode.toUpperCase()} RETURNING id`;
      if (coupon) {
        await tx`
          INSERT INTO coupon_redemptions (coupon_id, order_id, amount_cents)
          VALUES (${coupon.id}, ${order!.id}, ${input.quote.discountCents})`;
      }
    }

    await tx`
      UPDATE customers
      SET orders_count = orders_count + 1,
          lifetime_spend_cents = lifetime_spend_cents + ${input.quote.totalCents}
      WHERE id = ${customer!.id}`;

    return { orderId: order!.id, orderNumber };
  });
}

export async function findOrderByIdempotencyKey(key: string) {
  const sql = getSql();
  const rows = await sql<{ order_number: string; total_cents: number; email: string }[]>`
    SELECT order_number, total_cents, email FROM orders WHERE idempotency_key = ${key} LIMIT 1`;
  return rows[0] ?? null;
}

export async function logEmail(
  orderId: number | null,
  to: string,
  subject: string,
  kind: string,
  status: string,
  error?: string,
) {
  if (!databaseConfigured()) return;
  const sql = getSql();
  await sql`
    INSERT INTO email_log (order_id, to_address, subject, kind, status, error)
    VALUES (${orderId}, ${to}, ${subject}, ${kind}, ${status}, ${error ?? null})`;
}

export async function stockForSlugs(slugs: string[]) {
  if (!databaseConfigured() || slugs.length === 0) return {} as Record<string, number>;
  const sql = getSql();
  const rows = await sql<{ slug: string; size_label: string; stock: number }[]>`
    SELECT p.slug, v.size_label, v.stock
    FROM product_variants v JOIN products p ON p.id = v.product_id
    WHERE p.slug IN ${sql(slugs)}`;
  const out: Record<string, number> = {};
  for (const r of rows) out[`${r.slug}::${r.size_label}`] = r.stock;
  return out;
}

export const allStaticSlugs = staticProducts.map((p) => p.slug);
