/**
 * Minimal Authorize.Net JSON API client (no SDK — the official SDK is Node-only
 * and heavy). We only use authCaptureTransaction, refundTransaction and
 * voidTransaction, plus webhook signature verification.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

import type { ShippingAddress } from "./store.types";

const ENDPOINTS = {
  sandbox: "https://apitest.authorize.net/xml/v1/request.api",
  production: "https://api.authorize.net/xml/v1/request.api",
};

function credentials() {
  const name = process.env["AUTHORIZE_NET_LOGIN_ID"];
  const transactionKey = process.env["AUTHORIZE_NET_TRANSACTION_KEY"];
  const env = (process.env["AUTHORIZE_NET_ENVIRONMENT"] ?? "sandbox") === "production"
    ? "production"
    : "sandbox";
  if (!name || !transactionKey) return null;
  return { name, transactionKey, url: ENDPOINTS[env] };
}

export function paymentsConfigured() {
  return credentials() !== null;
}

type AnetResponse = {
  transactionResponse?: {
    responseCode?: string;
    authCode?: string;
    avsResultCode?: string;
    transId?: string;
    errors?: { errorCode: string; errorText: string }[];
    messages?: { code: string; description: string }[];
  };
  messages?: { resultCode: string; message: { code: string; text: string }[] };
};

async function call(body: unknown): Promise<AnetResponse> {
  const creds = credentials();
  if (!creds) throw new Error("Authorize.Net credentials are not configured");
  const res = await fetch(creds.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  // Authorize.Net returns JSON prefixed with a BOM.
  const text = (await res.text()).replace(/^\uFEFF/, "").trim();
  return JSON.parse(text) as AnetResponse;
}

export type ChargeInput = {
  amountCents: number;
  dataDescriptor: string;
  dataValue: string;
  email: string;
  invoiceNumber: string;
  address: ShippingAddress;
  /** Billing address as it appears on the card; defaults to the shipping address. */
  billingAddress?: ShippingAddress | undefined;
  lineItems: { name: string; quantity: number; unitPriceCents: number }[];
};

export type ChargeResult =
  | { ok: true; transactionId: string; authCode: string; avsResult: string }
  | { ok: false; error: string; code: string };

export async function chargeCard(input: ChargeInput): Promise<ChargeResult> {
  const creds = credentials();
  if (!creds) return { ok: false, error: "Payments are not configured yet.", code: "NOT_CONFIGURED" };

  const [firstName, ...rest] = input.address.fullName.trim().split(/\s+/);
  const body = {
    createTransactionRequest: {
      merchantAuthentication: { name: creds.name, transactionKey: creds.transactionKey },
      refId: input.invoiceNumber.slice(0, 20),
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: (input.amountCents / 100).toFixed(2),
        currencyCode: "CAD",
        payment: {
          opaqueData: { dataDescriptor: input.dataDescriptor, dataValue: input.dataValue },
        },
        order: { invoiceNumber: input.invoiceNumber.slice(0, 20), description: "Veyrona Labs order" },
        lineItems: {
          lineItem: input.lineItems.slice(0, 30).map((li, i) => ({
            itemId: String(i + 1),
            name: li.name.slice(0, 31),
            quantity: String(li.quantity),
            unitPrice: (li.unitPriceCents / 100).toFixed(2),
          })),
        },
        customer: { email: input.email },
        billTo: {
          firstName: (firstName ?? "").slice(0, 50),
          lastName: (rest.join(" ") || "-").slice(0, 50),
          address: input.address.line1.slice(0, 60),
          city: input.address.city.slice(0, 40),
          state: input.address.province,
          zip: input.address.postalCode.slice(0, 20),
          country: "CA",
          ...(input.address.phone ? { phoneNumber: input.address.phone.slice(0, 25) } : {}),
        },
        shipTo: {
          firstName: (firstName ?? "").slice(0, 50),
          lastName: (rest.join(" ") || "-").slice(0, 50),
          address: input.address.line1.slice(0, 60),
          city: input.address.city.slice(0, 40),
          state: input.address.province,
          zip: input.address.postalCode.slice(0, 20),
          country: "CA",
        },
        transactionSettings: {
          setting: [{ settingName: "duplicateWindow", settingValue: "120" }],
        },
      },
    },
  };

  let response: AnetResponse;
  try {
    response = await call(body);
  } catch (err) {
    console.error("Authorize.Net request failed", err);
    return { ok: false, error: "We couldn't reach the payment processor. Please try again.", code: "NETWORK" };
  }

  const tr = response.transactionResponse;
  if (tr?.responseCode === "1" && tr.transId) {
    return {
      ok: true,
      transactionId: tr.transId,
      authCode: tr.authCode ?? "",
      avsResult: tr.avsResultCode ?? "",
    };
  }

  const detail =
    tr?.errors?.[0]?.errorText ??
    response.messages?.message?.[0]?.text ??
    "The payment was declined.";
  const code = tr?.errors?.[0]?.errorCode ?? response.messages?.message?.[0]?.code ?? "DECLINED";
  return { ok: false, error: detail, code };
}

export async function refundOrVoid(transactionId: string, amountCents: number, last4?: string) {
  const creds = credentials();
  if (!creds) return { ok: false as const, error: "Payments are not configured." };

  const attempt = async (type: "refundTransaction" | "voidTransaction") =>
    call({
      createTransactionRequest: {
        merchantAuthentication: { name: creds.name, transactionKey: creds.transactionKey },
        transactionRequest: {
          transactionType: type,
          ...(type === "refundTransaction"
            ? {
                amount: (amountCents / 100).toFixed(2),
                payment: { creditCard: { cardNumber: last4 ?? "0000", expirationDate: "XXXX" } },
              }
            : {}),
          refTransId: transactionId,
        },
      },
    });

  let res = await attempt("refundTransaction");
  if (res.transactionResponse?.responseCode !== "1") {
    // Unsettled transactions must be voided rather than refunded.
    res = await attempt("voidTransaction");
  }
  if (res.transactionResponse?.responseCode === "1") return { ok: true as const };
  return {
    ok: false as const,
    error:
      res.transactionResponse?.errors?.[0]?.errorText ??
      res.messages?.message?.[0]?.text ??
      "Refund failed.",
  };
}

export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  const key = process.env["AUTHORIZE_NET_SIGNATURE_KEY"];
  if (!key || !header) return false;
  const provided = header.replace(/^sha512=/i, "").trim().toUpperCase();
  const expected = createHmac("sha512", Buffer.from(key, "hex").length === key.length / 2 ? Buffer.from(key, "hex") : key)
    .update(rawBody)
    .digest("hex")
    .toUpperCase();
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
