import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LogOut, Package, RefreshCw, Tag, Users } from "lucide-react";

import { money } from "@/lib/tax";
import {
  adminSession,
  adminLogin,
  adminLogout,
  adminOverview,
  adminMarkShipped,
  adminRefund,
  adminProducts,
  adminUpdateVariant,
  adminCoupons,
  adminSaveCoupon,
  adminCustomers,
  type AdminOrderRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store admin | Veyrona Labs" },
      { name: "description", content: "Veyrona Labs store administration: orders, inventory, coupons and customers." },
      { property: "og:title", content: "Store admin | Veyrona Labs" },
      { property: "og:description", content: "Private store administration for Veyrona Labs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const input =
  "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const btn =
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60";
const ghost =
  "rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary";

type Tab = "orders" | "inventory" | "coupons" | "customers";

function AdminPage() {
  const session = useServerFn(adminSession);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);

  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [dbReady, setDbReady] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("orders");

  const refreshSession = useCallback(async () => {
    try {
      const s = await session();
      setAdmin(s.admin ? { email: s.admin.email } : null);
      setDbReady(s.databaseConfigured);
    } catch {
      setAdmin(null);
    } finally {
      setReady(true);
    }
  }, [session]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const res = await login({ data: { email, password } });
            if (res.ok) await refreshSession();
            else setError(res.error ?? "Those details didn't match.");
          }}
          className="w-full max-w-sm rounded-lg border border-border p-6"
        >
          <h1 className="font-display text-xl font-semibold">Veyrona Labs admin</h1>
          {!dbReady && (
            <p className="mt-3 rounded-md bg-surface px-3 py-2 text-xs text-muted-foreground">
              The store database isn't connected yet, so sign-in won't work until it is.
            </p>
          )}
          <input className={`${input} mt-5 w-full`} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={`${input} mt-3 w-full`} type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <button className={`${btn} mt-5 w-full`}>Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="font-display text-lg font-semibold">Veyrona Labs admin</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{admin.email}</span>
            <button
              className={ghost}
              onClick={async () => {
                await logout();
                await refreshSession();
              }}
            >
              <LogOut className="mr-1 inline h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl gap-1 px-4">
          {([
            ["orders", "Orders", Package],
            ["inventory", "Inventory", RefreshCw],
            ["coupons", "Coupons", Tag],
            ["customers", "Customers", Users],
          ] as const).map(([key, labelText, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="mr-1.5 inline h-4 w-4" />
              {labelText}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "orders" && <OrdersTab />}
        {tab === "inventory" && <InventoryTab />}
        {tab === "coupons" && <CouponsTab />}
        {tab === "customers" && <CustomersTab />}
      </main>
    </div>
  );
}

function OrdersTab() {
  const overview = useServerFn(adminOverview);
  const markShipped = useServerFn(adminMarkShipped);
  const refund = useServerFn(adminRefund);

  const [status, setStatus] = useState("all");
  const [data, setData] = useState<Awaited<ReturnType<typeof adminOverview>> | null>(null);
  const [tracking, setTracking] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await overview({ data: { status } }));
    } finally {
      setBusy(false);
    }
  }, [overview, status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Paid orders" value={String(data.stats.paid_orders)} />
        <Stat label="Revenue" value={money(data.stats.revenue_cents)} />
        <Stat label="Pending" value={String(data.stats.pending_orders)} />
        <Stat label="Customers" value={String(data.stats.customers)} />
      </div>

      {data.lowStock.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-semibold">Running low</p>
          <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            {data.lowStock.map((v) => (
              <li key={`${v.slug}-${v.size_label}`}>
                {v.name} {v.size_label} — {v.stock} left
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2">
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          {["all", "paid", "shipped", "pending", "refunded", "cancelled", "failed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className={ghost} onClick={() => void load()} disabled={busy}>Refresh</button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.orders.map((o: AdminOrderRow) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium">
                  {o.order_number}
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("en-CA")}
                  </div>
                </td>
                <td className="px-4 py-3">{o.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs">{o.status}</span>
                  <div className="text-xs text-muted-foreground">{o.payment_status}</div>
                </td>
                <td className="px-4 py-3">{money(o.total_cents)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className={`${input} w-36`}
                      placeholder={o.tracking_number ?? "Tracking #"}
                      value={tracking[o.id] ?? ""}
                      onChange={(e) => setTracking((t) => ({ ...t, [o.id]: e.target.value }))}
                    />
                    <button
                      className={ghost}
                      onClick={async () => {
                        const t = tracking[o.id];
                        if (!t || t.length < 3) return;
                        await markShipped({ data: { id: o.id, trackingNumber: t } });
                        await load();
                      }}
                    >
                      Mark shipped
                    </button>
                    <button
                      className={ghost}
                      onClick={async () => {
                        await refund({ data: { id: o.id } });
                        await load();
                      }}
                    >
                      Refund
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryTab() {
  const list = useServerFn(adminProducts);
  const update = useServerFn(adminUpdateVariant);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminProducts>> | null>(null);

  const load = useCallback(async () => setRows(await list()), [list]);
  useEffect(() => {
    void load();
  }, [load]);

  if (!rows) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Price (CAD)</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Visible</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.variant_id}>
              <td className="px-4 py-3 font-medium">{r.name}<div className="text-xs text-muted-foreground">{r.sku}</div></td>
              <td className="px-4 py-3">{r.size_label}</td>
              <td className="px-4 py-3">
                <input
                  className={`${input} w-28`}
                  type="number"
                  step="0.01"
                  defaultValue={(r.price_cents / 100).toFixed(2)}
                  onBlur={async (e) => {
                    const cents = Math.round(Number(e.target.value) * 100);
                    if (Number.isFinite(cents) && cents !== r.price_cents) {
                      await update({ data: { variantId: r.variant_id, priceCents: cents } });
                      await load();
                    }
                  }}
                />
              </td>
              <td className="px-4 py-3">
                <input
                  className={`${input} w-24`}
                  type="number"
                  defaultValue={r.stock}
                  onBlur={async (e) => {
                    const stock = Number(e.target.value);
                    if (Number.isInteger(stock) && stock !== r.stock) {
                      await update({ data: { variantId: r.variant_id, stock } });
                      await load();
                    }
                  }}
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  defaultChecked={r.active}
                  onChange={async (e) => {
                    await update({ data: { variantId: r.variant_id, active: e.target.checked } });
                    await load();
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsTab() {
  const list = useServerFn(adminCoupons);
  const save = useServerFn(adminSaveCoupon);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminCoupons>> | null>(null);
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");

  const load = useCallback(async () => setRows(await list()), [list]);
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const raw = Number(value);
          await save({
            data: {
              code,
              kind,
              value: kind === "percent" ? Math.round(raw) : Math.round(raw * 100),
              minSubtotalCents: 0,
              maxRedemptions: null,
              expiresAt: null,
              active: true,
            },
          });
          setCode("");
          await load();
        }}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
      >
        <input className={input} required placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <select className={input} value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")}>
          <option value="percent">% off</option>
          <option value="fixed">$ off</option>
        </select>
        <input className={`${input} w-28`} required type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className={btn}>Save coupon</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(rows ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3">{c.kind === "percent" ? `${c.value}%` : money(c.value)}</td>
                <td className="px-4 py-3">{c.times_redeemed}</td>
                <td className="px-4 py-3">{c.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersTab() {
  const list = useServerFn(adminCustomers);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminCustomers>> | null>(null);

  useEffect(() => {
    void list().then(setRows);
  }, [list]);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Lifetime spend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {(rows ?? []).map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3">{c.email}</td>
              <td className="px-4 py-3">{c.name ?? "—"}</td>
              <td className="px-4 py-3">{c.orders_count}</td>
              <td className="px-4 py-3">{money(c.lifetime_spend_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
