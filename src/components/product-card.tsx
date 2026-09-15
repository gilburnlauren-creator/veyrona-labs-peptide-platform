import vial from "@/assets/vial.jpg";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
          {product.badge}
        </span>
      )}
      <div className="bg-surface p-6">
        <img
          src={vial}
          alt={`${product.name} ${product.size} research vial`}
          width={816}
          height={816}
          loading="lazy"
          className="mx-auto h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
        <h3 className="font-display text-sm font-semibold">
          {product.name} {product.size}
        </h3>
        <div className="text-xs text-muted-foreground">
          <span className="text-primary">{"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}</span>{" "}
          {product.rating} · {product.reviews} reviews
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-base font-semibold">${product.price.toFixed(2)}</span>
          <button className="rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
