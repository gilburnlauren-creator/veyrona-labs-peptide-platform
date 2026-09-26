import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Banknote, Check, CreditCard, Loader2, Lock, ShieldCheck, Truck, Star } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useCart } from "@/components/cart";
import { vialImage } from "@/data/vial-images";
import { getQuote, placeOrder } from "@/lib/store.functions";
import { PROVINCES, money } from "@/lib/tax";
import { acceptClientKey, tokenizeCard } from "@/lib/accept-js";
import { ETRANSFER_EMAIL, ETRANSFER_SECURITY_ANSWER, type PaymentMethod } from "@/lib/etransfer";
import type { Quote } from "@/lib/store.types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout | Veyrona Labs" },
      {
        name: "description",
        content:
          "Complete your Veyrona Labs order. Free Canada Post Express shipping on every research peptide order, made in Canada.",
      },
      { property: "og:title", content: "Secure Checkout | Veyrona Labs" },
      {
        property: "og:description",
        content: "Encrypted checkout for lab-tested research peptides shipped free across Canada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";
const label = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function CheckoutPage() {
  const { lines, subtotal, count } = useCart();
  const navigate = useNavigate();
  const quoteFn = useServerFn(getQuote);
  const placeFn = useServerFn(placeOrder);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("ON");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const [billingSame, setBillingSame] = useState(true);
  const [bFullName, setBFullName] = useState("");
  const [bLine1, setBLine1] = useState("");
  const [bLine2, setBLine2] = useState("");
  const [bCity, setBCity] = useState("");
  const [bProvince, setBProvince] = useState("ON");
  const [bPostalCode, setBPostalCode] = useState("");

  const [couponInput, setCouponInput] = useState("LABS");
  const [appliedCoupon, setAppliedCoupon] = useState("LABS");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardCode, setCardCode] = useState("");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(
    () => lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })),
    [lines],
  );
  const idempotencyKey = useMemo(
    () => `vl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    if (items.length === 0) {
      setQuote(null);
      return;
    }
    quoteFn({ data: { items, couponCode: appliedCoupon || null, province } })
      .then((q) => !cancelled && setQuote(q))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [items, appliedCoupon, province, quoteFn]);

  const subtotalCents = quote?.subtotalCents ?? Math.round(subtotal * 100);
  const discountCents = quote?.discountCents ?? 0;
  const totalCents = quote?.totalCents ?? subtotalCents;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) return;

    let opaqueData: { dataDescriptor: string; dataValue: string } | undefined;

    if (paymentMethod === "card") {
      if (!acceptClientKey()) {
        setError(
          "Card payments aren't switched on yet. Choose Interac e-Transfer, or add your Authorize.Net keys to take card orders.",
        );
        return;
      }

      const [mm, yy] = expiry.split("/").map((s) => s.trim());
      if (!mm || !yy) {
        setError("Enter the card expiry as MM/YY.");
        return;
      }

      if (!billingSame && (!bFullName || !bLine1 || !bCity || !bPostalCode)) {
        setError("Please fill in the billing address that appears on your card statement.");
        return;
      }

      setSubmitting(true);
      try {
        opaqueData = await tokenizeCard({
          cardNumber,
          month: mm,
          year: yy,
          cardCode,
          zip: billingSame ? postalCode : bPostalCode,
          fullName: billingSame ? fullName : bFullName,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "We couldn't read those card details.");
        setSubmitting(false);
        return;
      }
    } else {
      setSubmitting(true);
    }

    const billingAddress =
      paymentMethod === "card" && !billingSame
        ? {
            fullName: bFullName,
            line1: bLine1,
            ...(bLine2 ? { line2: bLine2 } : {}),
            city: bCity,
            province: bProvince,
            postalCode: bPostalCode,
            country: "CA" as const,
          }
        : undefined;

    try {
      const result = await placeFn({
        data: {
          email,
          address: {
            fullName,
            line1,
            ...(line2 ? { line2 } : {}),
            city,
            province,
            postalCode,
            country: "CA" as const,
            ...(phone ? { phone } : {}),
          },
          ...(billingAddress ? { billingAddress } : {}),
          items,
          couponCode: appliedCoupon || null,
          idempotencyKey,
          paymentMethod,
          ...(opaqueData ? { opaqueData } : {}),
        },
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      try {
        localStorage.removeItem("veyrona-cart");
      } catch {
        /* ignore */
      }
      navigate({
        to: "/order/$number",
        params: { number: result.orderNumber },
        search: { email: result.email },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Secure checkout</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> Encrypted payment</span>
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> Free Canada Post Express</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Made in Canada</span>
        </p>

        {count === 0 ? (
          <div className="mt-10 rounded-lg border border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Browse peptides
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <section className="rounded-lg border border-border p-5">
                <h2 className="font-display text-lg font-semibold">Contact</h2>
                <div className="mt-4">
                  <label className={label} htmlFor="email">Email for your receipt</label>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1.5`} placeholder="you@lab.ca" />
                </div>
              </section>

              <section className="rounded-lg border border-border p-5">
                <h2 className="font-display text-lg font-semibold">Shipping address</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={label} htmlFor="fullName">Full name</label>
                    <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${field} mt-1.5`} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label} htmlFor="line1">Address</label>
                    <input id="line1" required value={line1} onChange={(e) => setLine1(e.target.value)} className={`${field} mt-1.5`} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label} htmlFor="line2">Apartment, unit (optional)</label>
                    <input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} className={`${field} mt-1.5`} />
                  </div>
                  <div>
                    <label className={label} htmlFor="city">City</label>
                    <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} className={`${field} mt-1.5`} />
                  </div>
                  <div>
                    <label className={label} htmlFor="province">Province</label>
                    <select id="province" value={province} onChange={(e) => setProvince(e.target.value)} className={`${field} mt-1.5`}>
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="postalCode">Postal code</label>
                    <input id="postalCode" required value={postalCode} onChange={(e) => setPostalCode(e.target.value.toUpperCase())} className={`${field} mt-1.5`} placeholder="M5V 2T6" />
                  </div>
                  <div>
                    <label className={label} htmlFor="phone">Phone (optional)</label>
                    <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} mt-1.5`} />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border p-5">
                <h2 className="font-display text-lg font-semibold">Payment method</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose how you'd like to pay. Both options are secure and shipping stays free.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
                    <span>
                      <span className="block text-sm font-semibold">Credit or debit card</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Visa, Mastercard, Amex — ships right away
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("etransfer")}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                      paymentMethod === "etransfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Banknote className="mt-0.5 h-5 w-5 text-primary" />
                    <span>
                      <span className="block text-sm font-semibold">Interac e-Transfer</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Pay from any Canadian bank app
                      </span>
                    </span>
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <>
                    <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5 text-primary" /> Card details are encrypted and never stored on our
                      servers.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={label} htmlFor="cardNumber">Card number</label>
                        <input id="cardNumber" inputMode="numeric" autoComplete="cc-number" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={`${field} mt-1.5`} placeholder="4111 1111 1111 1111" />
                      </div>
                      <div>
                        <label className={label} htmlFor="expiry">Expiry (MM/YY)</label>
                        <input id="expiry" autoComplete="cc-exp" required value={expiry} onChange={(e) => setExpiry(e.target.value)} className={`${field} mt-1.5`} placeholder="09/28" />
                      </div>
                      <div>
                        <label className={label} htmlFor="cardCode">Security code</label>
                        <input id="cardCode" autoComplete="cc-csc" required value={cardCode} onChange={(e) => setCardCode(e.target.value)} className={`${field} mt-1.5`} placeholder="123" />
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold">Billing address</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Use the address on your card statement — matching addresses help your bank approve the payment.
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input type="radio" name="billingSame" checked={billingSame} onChange={() => setBillingSame(true)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                          <span>Billing address is the same as shipping</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input type="radio" name="billingSame" checked={!billingSame} onChange={() => setBillingSame(false)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                          <span>Use a different billing address</span>
                        </label>
                      </div>

                      {!billingSame && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className={label} htmlFor="bFullName">Name on card</label>
                            <input id="bFullName" value={bFullName} onChange={(e) => setBFullName(e.target.value)} className={`${field} mt-1.5`} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={label} htmlFor="bLine1">Billing address</label>
                            <input id="bLine1" value={bLine1} onChange={(e) => setBLine1(e.target.value)} className={`${field} mt-1.5`} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={label} htmlFor="bLine2">Apartment, unit (optional)</label>
                            <input id="bLine2" value={bLine2} onChange={(e) => setBLine2(e.target.value)} className={`${field} mt-1.5`} />
                          </div>
                          <div>
                            <label className={label} htmlFor="bCity">City</label>
                            <input id="bCity" value={bCity} onChange={(e) => setBCity(e.target.value)} className={`${field} mt-1.5`} />
                          </div>
                          <div>
                            <label className={label} htmlFor="bProvince">Province</label>
                            <select id="bProvince" value={bProvince} onChange={(e) => setBProvince(e.target.value)} className={`${field} mt-1.5`}>
                              {PROVINCES.map((p) => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={label} htmlFor="bPostalCode">Postal code</label>
                            <input id="bPostalCode" value={bPostalCode} onChange={(e) => setBPostalCode(e.target.value.toUpperCase())} className={`${field} mt-1.5`} placeholder="M5V 2T6" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                    <p className="font-semibold">How Interac e-Transfer works</p>
                    <ol className="mt-3 space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>Place your order — you'll get an order number right away.</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Send your e-Transfer to{" "}
                          <strong className="text-foreground">{ETRANSFER_EMAIL}</strong> for the exact order total.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Put your order number in the message box, and if a security question is needed use the answer{" "}
                          <strong className="text-foreground">{ETRANSFER_SECURITY_ANSWER}</strong>.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>We ship free with Canada Post Express as soon as the transfer lands.</span>
                      </li>
                    </ol>
                  </div>
                )}
              </section>
            </div>

            <aside className="h-fit rounded-lg border border-border bg-surface p-5 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <div className="flex" aria-hidden="true">
                  {[0,1,2,3,4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground">Rated 5.0 by 2,100+ Canadian researchers</span>
              </div>
              <h2 className="font-display text-lg font-semibold mt-4">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {lines.map((l) => (
                  <li key={`${l.slug}-${l.size}`} className="flex items-center gap-3">
                    <img src={vialImage(l.slug)} alt="" width={816} height={816} loading="lazy" className="h-12 w-12 rounded border border-border bg-background object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.size} × {l.qty}</p>
                    </div>
                    <span className="text-sm font-semibold">{money(Math.round(l.price * 100) * l.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-border pt-4">
                <label className={label} htmlFor="coupon">Discount code</label>
                <div className="mt-1.5 flex gap-2">
                  <input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className={field} placeholder="LABS" />
                  <button type="button" onClick={() => setAppliedCoupon(couponInput.trim())} className="rounded-md border border-primary px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                    Apply
                  </button>
                </div>
                {quote?.couponError && <p className="mt-1.5 text-xs text-destructive">{quote.couponError}</p>}
                {quote?.couponCode && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                    <Check className="h-3.5 w-3.5" /> Code {quote.couponCode} applied
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{money(subtotalCents)}</span></div>
                {discountCents > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-semibold text-primary">−{money(discountCents)}</span></div>
                )}
                <div className="flex justify-between text-red-600">
                  <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Canada Post Express shipping</span>
                  <span className="font-semibold">−$25.00</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>No tax charged</span></div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-xl font-semibold">{money(totalCents)} CAD</span>
                </div>
                <p className="text-xs text-red-600">You save $25.00 — shipping is free on every order</p>
              </div>

              {error && (
                <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : paymentMethod === "etransfer" ? (
                  <>Place order · {money(totalCents)}</>
                ) : (
                  <>Pay {money(totalCents)}</>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                {paymentMethod === "etransfer"
                  ? "e-Transfer instructions shown after you order"
                  : "Secured by Authorize.Net"}
              </p>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
