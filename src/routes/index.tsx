import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Truck, PackageCheck, ShieldCheck, Check } from "lucide-react";
import heroVials from "@/assets/hero-vials.jpg";
import heroLab from "@/assets/hero-lab.mp4.asset.json";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";
import { bestSellers, categories } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veyrona Labs | Research Peptides Canada" },
      {
        name: "description",
        content:
          "Veyrona Labs supplies lab-tested research peptides in Canada with batch tracking, third-party COAs and fast tracked domestic shipping.",
      },
      { property: "og:title", content: "Veyrona Labs | Research Peptides Canada" },
      {
        property: "og:description",
        content:
          "Lab-tested research peptides in Canada. Batch-tracked, COAs available, fast domestic shipping.",
      },
    ],
  }),
  component: Index,
});

const trust = [
  { icon: BadgeCheck, title: "99%+ Purity Verified", body: "Every batch tested for consistency and research-grade standards." },
  { icon: Truck, title: "Fast Canada Shipping", body: "Discreet tracked delivery, dispatched same or next business day." },
  { icon: PackageCheck, title: "Batch-Tracked Quality", body: "Each vial is documented and traceable for reliable research use." },
  { icon: ShieldCheck, title: "Made in Canada", body: "Produced and packaged in Canada by vetted, accredited partners." },
];

const faqs = [
  {
    q: "Are Veyrona Labs peptides tested?",
    a: "Yes. Every batch is analysed for identity and purity, and the corresponding certificate of analysis is published on our COA page.",
  },
  {
    q: "How much does shipping cost?",
    a: "Shipping is free on all orders. Every parcel goes out with Canada Post Express, fully tracked and discreetly packaged.",
  },
  {
    q: "Do you have a discount code?",
    a: "Yes — enter code LABS at checkout for 15% off your entire order. It works on every research compound we stock.",
  },
  {
    q: "How fast do orders ship in Canada?",
    a: "Orders placed before 2PM ET on a business day are dispatched the same day via Canada Post Express.",
  },
  {
    q: "What are these products used for?",
    a: "All compounds are supplied strictly for laboratory and in-vitro research. They are not for human or veterinary use.",
  },
  {
    q: "Do you ship outside Canada?",
    a: "We currently focus on Canadian domestic shipping so orders clear quickly and arrive without customs delays.",
  },
];

function EmailSignup() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section className="border-y border-border bg-ink text-ink-foreground">
      <div className="container-page grid gap-8 py-14 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold">Get 15% off with code LABS</h2>
          <p className="mt-3 max-w-md text-sm opacity-75">
            Join the Veyrona Labs list for new batch releases, certificate uploads and restock
            alerts. Free Canada Post Express shipping on every order.
          </p>
        </div>
        {sent ? (
          <p className="flex items-center gap-2 text-sm font-medium">
            <Check className="h-4 w-4 text-primary" /> Thanks — you're on the list.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = email.trim();
              if (!value || value.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
              setSent(true);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lab.ca"
              className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 text-sm text-ink-foreground placeholder:text-ink-foreground/50 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign up
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-surface">
          <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Laboratory Research Peptides
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
                Buy Research Peptides in Canada
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Veyrona Labs supplies premium research peptides across Canada with verified batch
                testing, third-party certificates of analysis, fast shipping and secure checkout.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Shop All Peptides
                </Link>
                <Link
                  to="/coas"
                  className="rounded-md border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  View COAs
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-muted-foreground">
                {[
                  "Made in Canada",
                  "Lab Tested",
                  "COAs Available",
                  "Free Canada Post Express",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <video
              src={heroLab.url}
              poster={heroVials}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Veyrona Labs research peptide vials in the lab"
              width={1280}
              height={1024}
              className="aspect-video w-full rounded-lg border border-border object-cover"
            />
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-border bg-card">
          <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((t) => (
              <div key={t.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best sellers */}
        <section className="container-page py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Most Popular Research Peptides
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Explore Our Best Sellers</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Veyrona Labs' most requested lab-tested research peptides, backed by batch tracking,
            fast Canadian shipping and available certificates of analysis.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop All Peptides
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="border-y border-border bg-surface py-16 md:py-20">
          <div className="container-page">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Browse by research area
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Shop by Category</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.key}
                  to="/shop"
                  search={{ category: c.key }}
                  className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
                >
                  <h3 className="font-display text-base font-semibold">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-primary">Browse →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO copy */}
        <section className="container-page py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                HPLC Verified · Batch-Tracked
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Research Peptides Canada</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Veyrona Labs supplies HPLC-verified research peptides to laboratories, universities
                and independent researchers across Canada. Every vial is lyophilised, sealed and
                labelled with its batch reference so results can be traced back to documented
                analysis.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Orders ship from within Canada, so there are no customs delays or international
                brokerage fees. Packaging is plain and discreet, and every shipment is tracked.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 self-start">
              {[
                ["99%+", "Verified purity"],
                ["24h", "Typical dispatch"],
                ["Nationwide", "Canadian shipping"],
                ["Every batch", "COA documented"],
              ].map(([big, small]) => (
                <div key={small} className="rounded-lg border border-border bg-card p-6">
                  <div className="font-display text-2xl font-semibold text-primary">{big}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{small}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-surface py-16 md:py-20">
          <div className="container-page max-w-3xl">
            <h2 className="font-display text-3xl font-semibold">Frequently Asked Questions</h2>
            <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
              {faqs.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none font-display text-sm font-semibold">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <EmailSignup />
      </main>
      <SiteFooter />
    </div>
  );
}
