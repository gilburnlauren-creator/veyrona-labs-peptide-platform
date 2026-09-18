import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2, Truck, X, Check } from "lucide-react";
import { vialImage } from "@/data/vial-images";
import { getProduct, products } from "@/data/products";

export type CartLine = {
  slug: string;
  name: string;
  size: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "veyrona-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === line.slug && l.size === line.size);
      if (i === -1) return [...prev, { ...line, qty }];
      const next = [...prev];
      next[i] = { ...next[i]!, qty: next[i]!.qty + qty };
      return next;
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.size === size))
        : prev.map((l) => (l.slug === slug && l.size === size ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
    return { lines, count, subtotal, open, setOpen, add, setQty, remove };
  }, [lines, open, add, setQty, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart (${count} items)`}
      className="relative rounded-md border border-border p-2 text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

const UPSELL_SLUGS = ["bac-water", "syringes"];

function Upsells() {
  const { lines, add } = useCart();
  const suggestions = products.filter(
    (p) => UPSELL_SLUGS.includes(p.slug) && !lines.some((l) => l.slug === p.slug),
  );
  if (lines.length === 0 || suggestions.length === 0) return null;

  return (
    <div className="border-t border-border px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Often added with peptides
      </p>
      <div className="mt-3 space-y-2">
        {suggestions.map((p) => {
          const size = p.sizes[0]!;
          return (
            <div key={p.slug} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5">
              <img src={vialImage(p.slug)} alt="" width={816} height={816} loading="lazy" className="h-12 w-12 rounded object-contain" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{size.label} · ${size.price.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={() => add({ slug: p.slug, name: p.name, size: size.label, price: size.price })}
                className="rounded-md border border-primary px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { lines, open, setOpen, subtotal, setQty, remove, count } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Your cart ({count})</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-md p-1.5 hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Your cart is empty.</p>
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Browse peptides
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={`${l.slug}-${l.size}`} className="flex gap-3 px-5 py-4">
                  <Link to="/products/$slug" params={{ slug: l.slug }} onClick={() => setOpen(false)} className="shrink-0">
                    <img src={vialImage(l.slug)} alt="" width={816} height={816} loading="lazy" className="h-16 w-16 rounded-md border border-border bg-surface object-contain" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{getProduct(l.slug)?.name ?? l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.size}</p>
                      </div>
                      <button type="button" onClick={() => remove(l.slug, l.size)} aria-label={`Remove ${l.name}`} className="rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border">
                        <button type="button" aria-label="Decrease quantity" onClick={() => setQty(l.slug, l.size, l.qty - 1)} className="px-2 py-1.5 hover:text-primary">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => setQty(l.slug, l.size, l.qty + 1)} className="px-2 py-1.5 hover:text-primary">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">${(l.price * l.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Upsells />
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-red-600">
                <Truck className="h-3.5 w-3.5" /> Canada Post Express shipping
              </span>
              <span className="font-semibold text-red-600">−$25.00</span>
            </div>
            <p className="mt-1 text-xs text-red-600">You save $25.00 — shipping is free on every order</p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg font-semibold">${subtotal.toFixed(2)} CAD</span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" /> Use code LABS for 30% off at checkout
            </p>

            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="mt-4 block w-full rounded-md bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full rounded-md border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
