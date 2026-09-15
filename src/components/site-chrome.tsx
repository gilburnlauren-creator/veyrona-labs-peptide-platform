import { Link } from "@tanstack/react-router";
import { Check, Truck, Tag } from "lucide-react";
import logo from "@/assets/veyrona-logo.png";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/coas", label: "COAs" },
  { to: "/about", label: "About" },
];

export function PromoBanner() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-xs font-semibold tracking-wide">
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" /> Free shipping on all orders with Canada Post Express
        </span>
        <span className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> Use code LABS for 30% off
        </span>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <PromoBanner />
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-xs tracking-wide">
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Free Canada Post Express on every order</span>
          <span className="opacity-60">·</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Same-day dispatch before 2PM ET</span>
          <span className="opacity-60">·</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Third-party tested</span>
        </div>
      </div>
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Veyrona Labs" width={36} height={36} className="h-9 w-9" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Veyrona <span className="text-primary">Labs</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-muted-foreground transition-colors hover:text-primary">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/shop"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Shop Peptides
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" width={32} height={32} loading="lazy" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold">Veyrona Labs</span>
          </div>
          <p className="mt-4 max-w-sm text-sm opacity-70">
            Canadian supplier of laboratory research peptides with batch tracking, third-party
            analysis and tracked domestic shipping.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-70">
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/coas">Certificates of analysis</Link></li>
            <li><Link to="/about">About us</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Contact & Shipping</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-70">
            <li>support@veyronalabs.ca</li>
            <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> Free shipping on all orders with Canada Post Express</li>
            <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> Use code LABS for 30% off</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs leading-relaxed opacity-60">
          All products sold by Veyrona Labs are intended for laboratory research use only. Not for
          human or veterinary consumption, diagnostic or therapeutic use. © {new Date().getFullYear()} Veyrona Labs.
        </div>
      </div>
    </footer>
  );
}
