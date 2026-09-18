import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { PlaceOrderResult, Quote } from "./store.types";

const itemSchema = z.object({
  slug: z.string().min(1).max(60),
  size: z.string().min(1).max(20),
  qty: z.number().int().min(1).max(99),
});

const quoteSchema = z.object({
  items: z.array(itemSchema).max(50),
  couponCode: z.string().max(40).optional().nullable(),
  province: z.string().max(2).optional().nullable(),
});

export const getQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => quoteSchema.parse(d))
  .handler(async ({ data }): Promise<Quote> => {
    const { buildQuote } = await import("./store.server");
    return buildQuote(data);
  });

const addressSchema = z.object({
  fullName: z.string().min(2).max(80),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(60),
  province: z.string().length(2),
  postalCode: z.string().min(5).max(10),
  country: z.literal("CA"),
  phone: z.string().max(30).optional(),
});

const placeOrderSchema = z.object({
  email: z.string().email().max(160),
  address: addressSchema,
  billingAddress: addressSchema.optional(),
  items: z.array(itemSchema).min(1).max(50),
  couponCode: z.string().max(40).optional().nullable(),
  idempotencyKey: z.string().min(8).max(80),
  paymentMethod: z.enum(["card", "etransfer"]).default("card"),
  opaqueData: z
    .object({
      dataDescriptor: z.string().min(1).max(120),
      dataValue: z.string().min(1).max(4000),
    })
    .optional(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => placeOrderSchema.parse(d))
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const { databaseConfigured } = await import("@/db/client.server");
    if (!databaseConfigured()) {
      return { ok: false, error: "The store database isn't connected yet.", code: "NO_DB" };
    }

    const store = await import("./store.server");

    const existing = await store.findOrderByIdempotencyKey(data.idempotencyKey);
    if (existing) {
      return { ok: true, orderNumber: existing.order_number, totalCents: existing.total_cents, email: existing.email };
    }

    // Prices, stock, discount and tax are always recalculated server-side.
    const quote = await store.buildQuote({
      items: data.items,
      couponCode: data.couponCode ?? null,
      province: data.address.province,
    });

    if (quote.lines.length === 0) return { ok: false, error: "Your cart is empty." };
    const oos = quote.lines.find((l) => !l.inStock);
    if (oos) return { ok: false, error: `${oos.name} ${oos.size} is out of stock.`, code: "OUT_OF_STOCK" };
    if (quote.totalCents <= 0) return { ok: false, error: "This order total is invalid." };

    let charge: { transactionId: string; authCode: string; avsResult: string } | undefined;

    if (data.paymentMethod === "card") {
      const anet = await import("./authorize-net.server");
      if (!anet.paymentsConfigured()) {
        return { ok: false, error: "Card payments aren't switched on yet.", code: "NOT_CONFIGURED" };
      }
      if (!data.opaqueData) {
        return { ok: false, error: "Card details are missing." };
      }

      const invoiceNumber = store.generateOrderNumber();
      const result = await anet.chargeCard({
        amountCents: quote.totalCents,
        dataDescriptor: data.opaqueData.dataDescriptor,
        dataValue: data.opaqueData.dataValue,
        email: data.email,
        invoiceNumber,
        address: data.address,
        billingAddress: data.billingAddress,
        lineItems: quote.lines.map((l) => ({
          name: `${l.name} ${l.size}`,
          quantity: l.quantity,
          unitPriceCents: l.unitPriceCents,
        })),
      });

      if (!result.ok) return { ok: false, error: result.error, code: result.code };
      charge = result;
    }

    const { orderId, orderNumber } = await store.createPaidOrder({
      email: data.email,
      address: data.address,
      quote,
      couponCode: quote.couponCode,
      idempotencyKey: data.idempotencyKey,
      paymentMethod: data.paymentMethod,
      payment: charge,
    });

    // Emails must never break a successful payment.
    try {
      const mail = await import("./email.server");
      if (mail.emailConfigured()) {
        const payload = {
          orderNumber,
          email: data.email,
          name: data.address.fullName,
          lines: quote.lines.map((l) => ({
            name: l.name, size: l.size, quantity: l.quantity, lineTotalCents: l.lineTotalCents,
          })),
          subtotalCents: quote.subtotalCents,
          discountCents: quote.discountCents,
          taxCents: quote.taxCents,
          totalCents: quote.totalCents,
          address: data.address,
        };
        await mail.sendOrderConfirmation(payload);
        await mail.sendAdminAlert(payload);
        await store.logEmail(orderId, data.email, `Order ${orderNumber}`, "confirmation", "sent");
      }
    } catch (err) {
      console.error("Order email failed", err);
      await store.logEmail(orderId, data.email, `Order ${orderNumber}`, "confirmation", "failed", String(err));
    }

    return {
      ok: true,
      orderNumber,
      totalCents: quote.totalCents,
      email: data.email,
      paymentMethod: data.paymentMethod,
    };
  });

export const lookupOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ orderNumber: z.string().min(4).max(40), email: z.string().email().max(160) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { databaseConfigured, getSql } = await import("@/db/client.server");
    if (!databaseConfigured()) return null;
    const sql = getSql();
    const rows = await sql<
      {
        id: number; order_number: string; status: string; payment_status: string;
        payment_method: string;
        subtotal_cents: number; discount_cents: number; tax_cents: number; total_cents: number;
        coupon_code: string | null; tracking_number: string | null;
        shipping_address: Record<string, string>; created_at: string;
      }[]
    >`SELECT id, order_number, status, payment_status, payment_method, subtotal_cents, discount_cents, tax_cents,
             total_cents, coupon_code, tracking_number, shipping_address, created_at
      FROM orders
      WHERE upper(order_number) = ${data.orderNumber.trim().toUpperCase()}
        AND lower(email) = ${data.email.trim().toLowerCase()} LIMIT 1`;
    const order = rows[0];
    if (!order) return null;
    const items = await sql<
      { name: string; size_label: string; quantity: number; line_total_cents: number; slug: string }[]
    >`SELECT slug, name, size_label, quantity, line_total_cents FROM order_items WHERE order_id = ${order.id}`;
    return { order, items };
  });

/** Live stock for the shop/product pages. Returns {} when no database is connected. */
export const getStock = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slugs: z.array(z.string().max(60)).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { stockForSlugs } = await import("./store.server");
    return stockForSlugs(data.slugs);
  });
