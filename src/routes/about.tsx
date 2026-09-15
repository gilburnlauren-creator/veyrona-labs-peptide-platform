import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Veyrona Labs | Canadian Research Peptide Supplier" },
      {
        name: "description",
        content:
          "Veyrona Labs is a Canadian supplier of batch-tested research peptides for laboratory and in-vitro research use.",
      },
      { property: "og:title", content: "About Veyrona Labs" },
      {
        property: "og:description",
        content: "Canadian supplier of batch-tested research peptides for laboratory use.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page max-w-3xl py-14">
        <h1 className="font-display text-3xl font-semibold">About Veyrona Labs</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Veyrona Labs is a Canadian supplier of research peptides for laboratory and in-vitro
          study. Everything we sell is made in Canada with accredited manufacturing partners,
          verified lot by lot through independent analysis and traceable to its batch record.
        </p>
        <ul className="mt-6 grid gap-2 text-sm font-medium sm:grid-cols-2">
          {[
            "Made in Canada",
            "Third-party lab tested",
            "Free shipping on all orders with Canada Post Express",
            "Use code LABS for 30% off",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-primary" /> {t}
            </li>
          ))}
        </ul>
        <h2 className="mt-10 font-display text-xl font-semibold">Quality standards</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Compounds are lyophilised, sealed and stored cold until dispatch. Identity and purity
          results are published on our certificates of analysis page so researchers can check a lot
          before and after purchase.
        </p>
        <h2 className="mt-10 font-display text-xl font-semibold">Shipping</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Shipping is free on every order and always goes out with Canada Post Express — tracked,
          plain and discreet. Orders placed before 2PM ET on a business day are dispatched the same
          day.
        </p>
        <h2 className="mt-10 font-display text-xl font-semibold">Research use only</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          All products are sold strictly for laboratory research. They are not drugs, foods or
          cosmetics, and are not intended for human or veterinary use.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
