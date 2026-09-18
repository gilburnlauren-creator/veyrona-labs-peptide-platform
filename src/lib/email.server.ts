/**
 * SMTP email. nodemailer is imported through a variable specifier so the
 * edge/worker bundler never tries to bundle it; on the self-hosted Node
 * server the import resolves normally.
 */
import { money } from "./tax";

export type OrderEmailData = {
  orderNumber: string;
  email: string;
  name: string;
  lines: { name: string; size: string; quantity: number; lineTotalCents: number }[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  address: { line1: string; line2?: string; city: string; province: string; postalCode: string };
};

export function emailConfigured() {
  return Boolean(process.env["SMTP_HOST"] && process.env["ORDER_FROM_EMAIL"]);
}

async function send(to: string, subject: string, html: string) {
  const host = process.env["SMTP_HOST"];
  const from = process.env["ORDER_FROM_EMAIL"];
  if (!host || !from) throw new Error("SMTP is not configured");

  const specifier = "nodemailer";
  const { default: nodemailer } = (await import(/* @vite-ignore */ specifier)) as {
    default: typeof import("nodemailer");
  };
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env["SMTP_PORT"] ?? 587),
    secure: process.env["SMTP_SECURE"] === "true",
    auth: process.env["SMTP_USER"]
      ? { user: process.env["SMTP_USER"]!, pass: process.env["SMTP_PASS"] ?? "" }
      : undefined,
  });
  await transport.sendMail({ from, to, subject, html });
}

const shell = (title: string, body: string) => `
<div style="font-family:Inter,Arial,sans-serif;background:#f6f8f8;padding:28px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e3e8e8">
    <div style="background:#0f2e2e;color:#fff;padding:20px 24px">
      <div style="font-size:18px;font-weight:700;letter-spacing:.04em">VEYRONA LABS</div>
      <div style="font-size:12px;opacity:.75">Research peptides · Made in Canada</div>
    </div>
    <div style="padding:24px;color:#152020;font-size:14px;line-height:1.6">
      <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
      ${body}
    </div>
    <div style="padding:16px 24px;background:#f6f8f8;color:#6a7878;font-size:11px">
      For in-vitro laboratory research use only. Free Canada Post Express shipping on every order.
    </div>
  </div>
</div>`;

const itemRows = (d: OrderEmailData) =>
  d.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0">${l.name} · ${l.size} × ${l.quantity}</td><td align="right">${money(l.lineTotalCents)}</td></tr>`,
    )
    .join("");

const totals = (d: OrderEmailData) => `
<table style="width:100%;border-top:1px solid #e3e8e8;margin-top:12px;padding-top:8px;font-size:13px">
  <tr><td style="padding:4px 0">Items</td><td align="right">${money(d.subtotalCents)}</td></tr>
  ${d.discountCents ? `<tr><td>Discount</td><td align="right">−${money(d.discountCents)}</td></tr>` : ""}
  <tr><td style="color:#c02626">Canada Post Express shipping</td><td align="right" style="color:#c02626">−$25.00</td></tr>
  <tr><td>Tax</td><td align="right">${money(d.taxCents)}</td></tr>
  <tr><td style="font-weight:700;padding-top:8px">Total</td><td align="right" style="font-weight:700;padding-top:8px">${money(d.totalCents)} CAD</td></tr>
</table>`;

export async function sendOrderConfirmation(d: OrderEmailData) {
  const html = shell(
    `Thanks for your order, ${d.name.split(" ")[0] ?? "there"}`,
    `<p>Your order <strong>${d.orderNumber}</strong> is confirmed and being prepared for dispatch.</p>
     <table style="width:100%;font-size:13px">${itemRows(d)}</table>
     ${totals(d)}
     <p style="margin-top:16px">Shipping to:<br>${d.address.line1}${d.address.line2 ? `<br>${d.address.line2}` : ""}<br>${d.address.city}, ${d.address.province} ${d.address.postalCode}</p>`,
  );
  await send(d.email, `Veyrona Labs order ${d.orderNumber} confirmed`, html);
}

export async function sendAdminAlert(d: OrderEmailData) {
  const to = process.env["ORDER_ALERT_EMAIL"] ?? process.env["ORDER_FROM_EMAIL"];
  if (!to) return;
  const html = shell(
    `New order ${d.orderNumber} — ${money(d.totalCents)}`,
    `<p>${d.name} (${d.email})</p>
     <table style="width:100%;font-size:13px">${itemRows(d)}</table>
     ${totals(d)}`,
  );
  await send(to, `New order ${d.orderNumber} — ${money(d.totalCents)}`, html);
}

export async function sendShippingNotice(d: {
  orderNumber: string;
  email: string;
  trackingNumber: string;
}) {
  const html = shell(
    "Your order has shipped",
    `<p>Order <strong>${d.orderNumber}</strong> is on its way with Canada Post Express.</p>
     <p>Tracking number: <strong>${d.trackingNumber}</strong></p>`,
  );
  await send(d.email, `Veyrona Labs order ${d.orderNumber} has shipped`, html);
}
