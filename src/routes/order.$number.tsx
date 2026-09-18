import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Banknote, Check, Loader2, Package, Truck } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { lookupOrder } from "@/lib/store.functions";
import { ETRANSFER_EMAIL, ETRANSFER_SECURITY_ANSWER } from "@/lib/etransfer";
import { money } from "@/lib/tax";

type OrderSearch = { email?: string | undefined };

export const Route = createFileRoute("/order/$number")({
  validateSearch: (search: Record<string, unknown>): OrderSearch => ({
    email: typeof search["email"] === "string" ? search["email"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your order | Veyrona Labs" },
      {
        name: "description",
        content: "Track your Veyrona Labs research peptide order and shipping details.",
      },
      { property: "og:title", content: "Your order | Veyrona Labs" },
      { property: "og:description", content: "Order status and tracking for your Veyrona Labs order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

type Result = Awaited<ReturnType<typeof lookupOrder>>;

function OrderPage() {
  const { number } = Route.useParams();
  const search = Route.useSearch();
  const lookup = useServerFn(lookupOrder);

  const [email, setEmail] = useState(search.email ?? "");
  const [data, setData] = useState<Result>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function run(value: string) {
    if (!value) return;
    setLoading(true);
    try {
      setData(await lookup({ data: { orderNumber: number, email: value } }));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }

  useEffect(() => {
    if (search.email) void run(search.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.email, number]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Thank you — order {number}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A confirmation email is on its way. Your order ships free with Canada Post Express.
          </p>
        </div>

        {!search.email && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(email);
            }}
            className="mt-8 flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email used on the order"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Find order
            </button>
          </form>
        )}

        {loading && (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your order…
          </p>
        )}

        {!loading && checked && !data && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            We couldn't find that order with this email address.
          </p>
        )}

        {data?.order.payment_method === "etransfer" && data.order.payment_status !== "captured" && (
          <div className="mt-8 rounded-lg border border-primary/40 bg-primary/5 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Banknote className="h-5 w-5 text-primary" /> Send your Interac e-Transfer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your order is reserved. We ship free with Canada Post Express as soon as the transfer arrives.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Send to</dt>
                <dd className="font-semibold">{ETRANSFER_EMAIL}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-semibold">{money(data.order.total_cents)} CAD</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Message / reference</dt>
                <dd className="font-semibold">{data.order.order_number}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Security answer (if asked)</dt>
                <dd className="font-semibold">{ETRANSFER_SECURITY_ANSWER}</dd>
              </div>
            </dl>
            <p className="mt-4 inline-flex rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Awaiting payment
            </p>
          </div>
        )}

        {data && (
          <div className="mt-8 rounded-lg border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Package className="h-3.5 w-3.5" /> {data.order.status}
              </span>
              <span className="text-xs text-muted-foreground">
                Placed {new Date(data.order.created_at).toLocaleDateString("en-CA")}
              </span>
            </div>


            <ul className="mt-5 space-y-2 text-sm">
              {data.items.map((i) => (
                <li key={`${i.slug}-${i.size_label}`} className="flex justify-between">
                  <span>{i.name} · {i.size_label} × {i.quantity}</span>
                  <span className="font-medium">{money(i.line_total_cents)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{money(data.order.subtotal_cents)}</span></div>
              {data.order.discount_cents > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount {data.order.coupon_code ? `(${data.order.coupon_code})` : ""}</span><span className="text-primary">−{money(data.order.discount_cents)}</span></div>
              )}
              <div className="flex justify-between text-red-600">
                <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Canada Post Express shipping</span>
                <span className="font-semibold">−$25.00</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Total</span><span className="font-display text-lg">{money(data.order.total_cents)} CAD</span>
              </div>
            </div>

            {data.order.tracking_number && (
              <p className="mt-4 rounded-md bg-surface px-3 py-2 text-sm">
                Tracking number: <strong>{data.order.tracking_number}</strong>
              </p>
            )}

            <div className="mt-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Shipping to</p>
              <p>{data.order.shipping_address["fullName"]}</p>
              <p>{data.order.shipping_address["line1"]}</p>
              <p>
                {data.order.shipping_address["city"]}, {data.order.shipping_address["province"]}{" "}
                {data.order.shipping_address["postalCode"]}
              </p>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
