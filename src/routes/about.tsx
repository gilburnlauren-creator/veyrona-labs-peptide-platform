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
          study. We work with accredited manufacturing partners, verify each lot through
          independent analysis, and keep every vial traceable to its batch record.
        </p>
        <h2 className="mt-10 font-display text-xl font-semibold">Quality standards</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Compounds are lyophilised, sealed and stored cold until dispatch. Identity and purity
          results are published on our certificates of analysis page so researchers can check a lot
          before and after purchase.
        </p>
        <h2 className="mt-10 font-display text-xl font-semibold">Shipping</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Orders ship from within Canada in plain, discreet packaging with tracking. Orders placed
          before 2PM ET on a business day are dispatched the same day.
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
