import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AdminOrderRow = {
  id: number;
  order_number: string;
  email: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_cents: number;
  coupon_code: string | null;
  tracking_number: string | null;
  created_at: string;
};

export type AdminOrderFull = {
  id: number;
  order_number: string;
  email: string;
  status: string;
  payment_status: string;
  transaction_id: string | null;
  auth_code: string | null;
  avs_result: string | null;
  coupon_code: string | null;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  tracking_number: string | null;
  shipping_address: {
    fullName: string; line1: string; line2?: string; city: string;
    province: string; postalCode: string; phone?: string;
  };
  created_at: string;
};

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { currentAdmin } = await import("./admin.server");
  const { databaseConfigured } = await import("@/db/client.server");
  return { admin: await currentAdmin(), databaseConfigured: databaseConfigured() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email().max(160), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { login } = await import("./admin.server");
    return login(data.email, data.password);
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { logout } = await import("./admin.server");
  await logout();
  return { ok: true };
});

export const adminOverview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ status: z.string().max(20).optional() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();

    const status = data.status && data.status !== "all" ? data.status : null;
    const orders = status
      ? await sql<AdminOrderRow[]>`
          SELECT id, order_number, email, status, payment_status, payment_method, total_cents, coupon_code,
                 tracking_number, created_at
          FROM orders WHERE status = ${status} ORDER BY created_at DESC LIMIT 200`
      : await sql<AdminOrderRow[]>`
          SELECT id, order_number, email, status, payment_status, payment_method, total_cents, coupon_code,
                 tracking_number, created_at
          FROM orders ORDER BY created_at DESC LIMIT 200`;


    const [stats] = await sql<
      { paid_orders: number; revenue_cents: number; pending_orders: number; customers: number }[]
    >`SELECT
        (SELECT count(*) FROM orders WHERE status IN ('paid','shipped'))::int AS paid_orders,
        (SELECT coalesce(sum(total_cents),0) FROM orders WHERE status IN ('paid','shipped'))::int AS revenue_cents,
        (SELECT count(*) FROM orders WHERE status = 'pending')::int AS pending_orders,
        (SELECT count(*) FROM customers)::int AS customers`;

    const lowStock = await sql<{ slug: string; name: string; size_label: string; stock: number; sku: string }[]>`
      SELECT p.slug, p.name, v.size_label, v.stock, v.sku
      FROM product_variants v JOIN products p ON p.id = v.product_id
      WHERE v.active AND v.stock <= v.reorder_at ORDER BY v.stock ASC LIMIT 30`;

    return { orders, stats: stats!, lowStock };
  });

export const adminOrderDetail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();
    const rows = await sql<AdminOrderFull[]>`
      SELECT id, order_number, email, status, payment_status, transaction_id, auth_code, avs_result,
             coupon_code, subtotal_cents, discount_cents, tax_cents, shipping_cents, total_cents,
             tracking_number, shipping_address, created_at
      FROM orders WHERE id = ${data.id} LIMIT 1`;
    if (!rows[0]) return null;
    const items = await sql<
      { slug: string; name: string; size_label: string; quantity: number; line_total_cents: number }[]
    >`SELECT slug, name, size_label, quantity, line_total_cents FROM order_items WHERE order_id = ${data.id}`;
    return { order: rows[0], items };
  });

/** Marks an Interac e-Transfer order as paid once the transfer lands in the bank account. */
export const adminMarkPaid = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();
    await sql`
      UPDATE orders
      SET status = 'paid', payment_status = 'captured', updated_at = now()
      WHERE id = ${data.id} AND payment_method = 'etransfer'`;
    return { ok: true };
  });

export const adminMarkShipped = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.number().int().positive(), trackingNumber: z.string().min(3).max(60) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();
    const rows = await sql<{ email: string; order_number: string }[]>`
      UPDATE orders SET status = 'shipped', tracking_number = ${data.trackingNumber}, updated_at = now()
      WHERE id = ${data.id} RETURNING email, order_number`;
    const order = rows[0];
    if (order) {
      try {
        const mail = await import("./email.server");
        if (mail.emailConfigured()) {
          await mail.sendShippingNotice({
            orderNumber: order.order_number,
            email: order.email,
            trackingNumber: data.trackingNumber,
          });
        }
      } catch (err) {
        console.error("Shipping email failed", err);
      }
    }
    return { ok: true };
  });

export const adminRefund = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();
    const rows = await sql<{ transaction_id: string | null; total_cents: number }[]>`
      SELECT transaction_id, total_cents FROM orders WHERE id = ${data.id} LIMIT 1`;
    const order = rows[0];
    if (!order?.transaction_id) return { ok: false, error: "No payment to refund." };

    const { refundOrVoid } = await import("./authorize-net.server");
    const result = await refundOrVoid(order.transaction_id, order.total_cents);
    if (!result.ok) return { ok: false, error: result.error };

    await sql`
      UPDATE orders SET status = 'refunded', payment_status = 'refunded', updated_at = now()
      WHERE id = ${data.id}`;
    // Put the stock back.
    await sql`
      UPDATE product_variants v SET stock = v.stock + i.quantity
      FROM order_items i WHERE i.order_id = ${data.id} AND i.variant_id = v.id`;
    return { ok: true };
  });

export const adminProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();
  const { getSql } = await import("@/db/client.server");
  return getSql()<
    {
      variant_id: number; slug: string; name: string; size_label: string;
      price_cents: number; stock: number; active: boolean; sku: string;
      unit_cost_cents: number; reorder_at: number; sold: number;
    }[]
  >`SELECT v.id AS variant_id, p.slug, p.name, v.size_label, v.price_cents, v.stock,
           (v.active AND p.active) AS active, v.sku, v.unit_cost_cents, v.reorder_at,
           coalesce((SELECT sum(i.quantity) FROM order_items i JOIN orders o ON o.id = i.order_id
                     WHERE i.variant_id = v.id AND o.status NOT IN ('failed','cancelled','refunded')), 0)::int AS sold
    FROM product_variants v JOIN products p ON p.id = v.product_id
    ORDER BY p.name, v.price_cents`;
});

export const adminUpdateVariant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        variantId: z.number().int().positive(),
        stock: z.number().int().min(0).max(100000).optional(),
        priceCents: z.number().int().min(0).max(10_000_00).optional(),
        active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();
    if (data.stock !== undefined) {
      await sql`UPDATE product_variants SET stock = ${data.stock} WHERE id = ${data.variantId}`;
    }
    if (data.priceCents !== undefined) {
      await sql`UPDATE product_variants SET price_cents = ${data.priceCents} WHERE id = ${data.variantId}`;
    }
    if (data.active !== undefined) {
      await sql`UPDATE product_variants SET active = ${data.active} WHERE id = ${data.variantId}`;
    }
    return { ok: true };
  });

export const adminCoupons = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();
  const { getSql } = await import("@/db/client.server");
  return getSql()<
    {
      id: number; code: string; kind: string; value: number; min_subtotal_cents: number;
      max_redemptions: number | null; times_redeemed: number; expires_at: string | null; active: boolean;
    }[]
  >`SELECT id, code, kind, value, min_subtotal_cents, max_redemptions, times_redeemed, expires_at, active
    FROM coupons ORDER BY created_at DESC`;
});

export const adminSaveCoupon = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.number().int().positive().optional(),
        code: z.string().min(2).max(40),
        kind: z.enum(["percent", "fixed"]),
        value: z.number().int().min(1).max(100000),
        minSubtotalCents: z.number().int().min(0).default(0),
        maxRedemptions: z.number().int().min(1).nullable().default(null),
        expiresAt: z.string().nullable().default(null),
        active: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { getSql } = await import("@/db/client.server");
    const sql = getSql();
    const expires = data.expiresAt ? new Date(data.expiresAt) : null;
    await sql`
      INSERT INTO coupons (code, kind, value, min_subtotal_cents, max_redemptions, expires_at, active)
      VALUES (${data.code.toUpperCase()}, ${data.kind}, ${data.value}, ${data.minSubtotalCents},
              ${data.maxRedemptions}, ${expires}, ${data.active})
      ON CONFLICT (code) DO UPDATE SET
        kind = EXCLUDED.kind, value = EXCLUDED.value,
        min_subtotal_cents = EXCLUDED.min_subtotal_cents,
        max_redemptions = EXCLUDED.max_redemptions,
        expires_at = EXCLUDED.expires_at, active = EXCLUDED.active`;
    return { ok: true };
  });

export const adminCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();
  const { getSql } = await import("@/db/client.server");
  return getSql()<
    { id: number; email: string; name: string | null; orders_count: number; lifetime_spend_cents: number }[]
  >`SELECT id, email, name, orders_count, lifetime_spend_cents FROM customers
    ORDER BY lifetime_spend_cents DESC LIMIT 200`;
});
