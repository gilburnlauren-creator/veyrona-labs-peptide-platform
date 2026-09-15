import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { products } from "@/data/products";

export const Route = createFileRoute("/coas")({
  head: () => ({
    meta: [
      { title: "Certificates of Analysis | Veyrona Labs" },
      {
        name: "description",
        content:
          "View batch certificates of analysis for Veyrona Labs research peptides, with identity and purity testing for every lot.",
      },
      { property: "og:title", content: "Certificates of Analysis | Veyrona Labs" },
      {
        property: "og:description",
        content: "Batch identity and purity testing documentation for Veyrona Labs research peptides.",
      },
    ],
  }),
  component: Coas,
});

function Coas() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold">Certificates of Analysis</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Each Veyrona Labs lot is analysed for identity and purity before release. Batch documents
          are listed below — upload your lab reports to replace the placeholders.
        </p>
        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Compound</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Batch</th>
                <th className="px-5 py-3">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p, i) => (
                <tr key={p.slug}>
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.size}</td>
                  <td className="px-5 py-3 text-muted-foreground">VL-{2600 + i}</td>
                  <td className="px-5 py-3 text-muted-foreground">Pending upload</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
