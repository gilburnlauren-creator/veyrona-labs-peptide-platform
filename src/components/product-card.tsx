import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import vial from "@/assets/vial.jpg";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const lowest = Math.min(...product.sizes.map((s) => s.price));
  const multi = product.sizes.length > 1;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
          {product.badge}
        </span>
      )}
      <Link to="/products/$slug" params={{ slug: product.slug }} className="bg-surface p-6">
        <img
          src={vial}
          alt={`${product.name} research vial`}
          width={816}
          height={816}
          loading="lazy"
          className="mx-auto h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
        <h3 className="font-display text-sm font-semibold">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <div className="text-xs text-muted-foreground">
          <span className="text-primary">{"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}</span>{" "}
          {product.rating} · {product.reviews} reviews
        </div>
        <p className="text-xs text-muted-foreground">
          {multi ? product.sizes.map((s) => s.label).join(" · ") : product.size}
        </p>
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Third-party lab tested</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Free Canada Post Express</li>
          <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Made in Canada</li>
        </ul>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-base font-semibold">
            {multi && <span className="text-xs font-normal text-muted-foreground">from </span>}
            ${lowest.toFixed(2)}
          </span>
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            View product
          </Link>
        </div>
      </div>
    </div>
  );
}
