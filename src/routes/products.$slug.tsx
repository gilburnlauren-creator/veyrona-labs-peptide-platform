import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  FlaskConical,
  Truck,
  ShieldCheck,
  Package,
  Snowflake,
  FileText,
} from "lucide-react";
import vial from "@/assets/vial.jpg";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";
import { getProduct, products } from "@/data/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable | Veyrona Labs" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.name} ${product.size} | Veyrona Labs Canada`;
    const description = `${product.name} ${product.size} lyophilised research peptide, batch-tested and shipped across Canada by Veyrona Labs. For laboratory research use only.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Product not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">That compound isn't in our catalogue.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Back to shop
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const d = product.detail;
  const [selected, setSelected] = useState(product.sizes[0]!);
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  useEffect(() => {
    setSelected(product.sizes[0]!);
  }, [product.slug]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="container-page pt-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> /{" "}
          <span className="text-foreground">{product.name} {product.size}</span>
        </div>

        {/* Buy box */}
        <section className="container-page grid gap-10 py-8 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-10">
            <img
              src={vial}
              alt={`${product.name} ${product.size} lyophilised research vial from Veyrona Labs`}
              width={816}
              height={816}
              className="mx-auto h-80 w-auto object-contain"
            />
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold uppercase">{product.name}</h1>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-primary">{"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}</span>{" "}
              {product.reviews} reviews
            </div>
            <div className="mt-4 font-display text-3xl font-semibold">${selected.price.toFixed(2)}</div>
            <p className="mt-1 text-xs text-muted-foreground">CAD · in stock · ships free with Canada Post Express</p>

            <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Select size
            </label>
            <select
              value={selected.label}
              onChange={(e) => {
                const next = product.sizes.find((s) => s.label === e.target.value);
                if (next) setSelected(next);
              }}
              className="mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold sm:max-w-xs"
            >
              {product.sizes.map((s) => (
                <option key={s.label} value={s.label}>
                  {s.label} — ${s.price.toFixed(2)}
                </option>
              ))}
            </select>

            <button className="mt-6 w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto sm:px-10">
              Add {selected.label} to cart
            </button>

            <div className="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Use code LABS for 30% off your order</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Applies to every research compound — enter LABS at checkout.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Mix & match all peptides</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span><strong className="text-foreground">3+</strong> · 5% off</span>
                <span><strong className="text-foreground">5+</strong> · 10% off</span>
                <span><strong className="text-foreground">10+</strong> · 20% off</span>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>Free shipping on all orders with Canada Post Express.</strong> Placed before 2PM ET? It ships the same business day, tracked and discreetly packaged.</span></li>
              <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>Secure checkout.</strong> Encrypted payment processing with no compound details on your statement.</span></li>
              <li className="flex gap-3"><Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>Sealed & batch-labelled.</strong> Every vial carries its batch reference so results trace back to documented analysis.</span></li>
            </ul>

            {/* Lab verified panel */}
            <div className="mt-6 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-display text-sm font-semibold">Third-party lab verified</p>
                  <p className="text-xs text-muted-foreground">HPLC + MS — independently tested for identity and purity</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-xs text-muted-foreground">Batch</div><div className="font-semibold">{d.batch}</div></div>
                <div><div className="text-xs text-muted-foreground">Tested</div><div className="font-semibold">{d.tested}</div></div>
                <div><div className="text-xs text-muted-foreground">Purity</div><div className="font-semibold">{d.purity}</div></div>
              </div>
              <Link to="/coas" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <FileText className="h-4 w-4" /> View certificate of analysis
              </Link>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="border-y border-border bg-surface py-10">
          <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["CAS#", d.cas],
              ["Also known as", d.aka],
              ["Class", d.className],
              ["Form", d.form],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-1 text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="container-page py-14">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="font-display text-2xl font-semibold">About {product.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d.summary}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Supplied by Veyrona Labs as a lyophilised powder for in-vitro laboratory research use.
                This compound has not been authorised by Health Canada for any therapeutic, clinical,
                veterinary or human use.
              </p>
            </div>
            <div className="grid gap-4 self-start">
              {[
                [d.targets, "Research targets"],
                [d.sequenceLength, "Peptide length"],
                [d.molecularWeight, "Molecular weight"],
              ].map(([big, small]) => (
                <div key={small} className="rounded-lg border border-border bg-card p-5">
                  <div className="font-display text-base font-semibold text-primary">{big}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{small}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Molecular profile */}
        <section className="border-t border-border bg-surface py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-semibold">Molecular profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">Identity, class and analytical data for this batch.</p>
            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-border">
                  {[
                    ["CAS number", d.cas],
                    ["Research designation", d.aka],
                    ["Compound class", d.className],
                    ["Sequence length", d.sequenceLength],
                    ["Molecular weight", d.molecularWeight],
                    ["Physical form", d.form],
                    ["Analytical method", "High-performance liquid chromatography (HPLC) + mass spectrometry (MS)"],
                    ["Appearance", "White to off-white lyophilised solid"],
                    ["Purity", `${d.purity} — verify against the batch certificate of analysis`],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <th className="w-64 bg-surface px-5 py-3 font-medium text-muted-foreground">{k}</th>
                      <td className="px-5 py-3">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Research context */}
        {d.research.length > 0 && (
          <section className="container-page py-14">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold">In-vitro research context</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              How this compound is used in published laboratory work — laboratory use only.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {d.research.map((r) => (
                <div key={r.title} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              ))}
            </div>
            {d.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {d.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Formats + storage */}
        <section className="border-t border-border bg-surface py-14">
          <div className="container-page grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-semibold">Available formats</h2>
              <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-5 py-3">Format</th><th className="px-5 py-3">Net quantity</th><th className="px-5 py-3">Form</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-5 py-3">{product.name} {product.size}</td>
                      <td className="px-5 py-3">{product.size} / vial</td>
                      <td className="px-5 py-3">{d.form}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Supplied from a verified batch. Quantities should be determined by qualified research
                personnel according to your own in-vitro protocol.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold">Laboratory storage</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d.storage}</p>
              <p className="mt-4 rounded-lg border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Note:</strong> no preparation, reconstitution or
                administration instructions are supplied. This product is for in-vitro laboratory
                research only and must be handled by qualified personnel under institutional safety
                protocols.
              </p>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="container-page py-14">
            <h2 className="font-display text-2xl font-semibold">Related research compounds</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
