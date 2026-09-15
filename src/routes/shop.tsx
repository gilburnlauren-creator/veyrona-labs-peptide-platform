import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";
import { products, categories } from "@/data/products";

type ShopSearch = { category?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Research Peptides | Veyrona Labs Canada" },
      {
        name: "description",
        content:
          "Browse the full Veyrona Labs catalogue of lab-tested research peptides, blends and laboratory supplies, shipped across Canada.",
      },
      { property: "og:title", content: "Shop Research Peptides | Veyrona Labs" },
      {
        property: "og:description",
        content: "Lab-tested research peptides, blends and laboratory supplies shipped across Canada.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const list = category ? products.filter((p) => p.category === category) : products;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold">Shop Research Peptides</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every Veyrona Labs compound is made in Canada, batch-tracked and supplied strictly for
          laboratory research use. Prices shown in CAD.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
          {[
            "Made in Canada",
            "Third-party lab tested",
            "Free shipping with Canada Post Express",
            "Code LABS — 30% off",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> {t}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            to="/shop"
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
              !category ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.key}
              to="/shop"
              search={{ category: c.key }}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
                category === c.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
