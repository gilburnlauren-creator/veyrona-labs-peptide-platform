import { createFileRoute } from "@tanstack/react-router";

/**
 * Authorize.Net webhook receiver. Configure this URL in
 * Authorize.Net > Account > Webhooks and paste the signature key into
 * AUTHORIZE_NET_SIGNATURE_KEY. Every request is signature-verified before
 * anything is read from the payload.
 */
export const Route = createFileRoute("/api/public/authorize-net/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const { verifyWebhookSignature } = await import("@/lib/authorize-net.server");

        if (!verifyWebhookSignature(raw, request.headers.get("x-anet-signature"))) {
          return new Response("Invalid signature", { status: 401 });
        }

        const { databaseConfigured, getSql } = await import("@/db/client.server");
        if (!databaseConfigured()) return new Response("ok");

        let payload: {
          notificationId?: string;
          eventType?: string;
          payload?: { id?: string; responseCode?: number };
        };
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const sql = getSql();
        const eventId = payload.notificationId ?? crypto.randomUUID();
        const eventType = payload.eventType ?? "unknown";

        // Ignore replays.
        const inserted = await sql<{ id: number }[]>`
          INSERT INTO webhook_events (event_id, event_type, payload)
          VALUES (${eventId}, ${eventType}, ${sql.json(JSON.parse(raw))})
          ON CONFLICT (event_id) DO NOTHING RETURNING id`;
        if (inserted.length === 0) return new Response("ok");

        const transactionId = payload.payload?.id;
        if (transactionId) {
          const statusMap: Record<string, { payment: string; order?: string }> = {
            "net.authorize.payment.authcapture.created": { payment: "captured", order: "paid" },
            "net.authorize.payment.capture.created": { payment: "captured", order: "paid" },
            "net.authorize.payment.refund.created": { payment: "refunded", order: "refunded" },
            "net.authorize.payment.void.created": { payment: "voided", order: "cancelled" },
            "net.authorize.payment.fraud.declined": { payment: "declined", order: "failed" },
            "net.authorize.payment.fraud.approved": { payment: "captured", order: "paid" },
          };
          const mapped = statusMap[eventType];
          if (mapped) {
            if (mapped.order) {
              await sql`
                UPDATE orders SET payment_status = ${mapped.payment}, status = ${mapped.order}, updated_at = now()
                WHERE transaction_id = ${transactionId}`;
            } else {
              await sql`
                UPDATE orders SET payment_status = ${mapped.payment}, updated_at = now()
                WHERE transaction_id = ${transactionId}`;
            }
          }
        }

        return new Response("ok");
      },
    },
  },
});
