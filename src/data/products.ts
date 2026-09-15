export type Product = {
  slug: string;
  name: string;
  size: string;
  price: number;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
};

// Placeholder catalogue — prices and stock to be replaced with the real list.
export const products: Product[] = [
  { slug: "bpc-157", name: "BPC-157", size: "10mg", price: 65, category: "Cellular", badge: "Best Seller", rating: 5, reviews: 12 },
  { slug: "kpv", name: "KPV", size: "10mg", price: 50, category: "Cellular", rating: 5, reviews: 7 },
  { slug: "ghk-cu", name: "GHK-Cu", size: "50mg", price: 45, category: "Cellular", badge: "Selling Fast", rating: 5, reviews: 9 },
  { slug: "glow-blend", name: "GLOW Blend", size: "70mg", price: 110, category: "Blends", rating: 5, reviews: 5 },
  { slug: "mots-c", name: "MOTS-C", size: "10mg", price: 50, category: "Metabolic", rating: 5, reviews: 6 },
  { slug: "klow-blend", name: "KLOW Blend", size: "80mg", price: 130, category: "Blends", rating: 5, reviews: 4 },
  { slug: "cjc-ipamorelin", name: "CJC-1295 No DAC + Ipamorelin", size: "5mg/5mg", price: 75, category: "Secretagogue", rating: 5, reviews: 8 },
  { slug: "tesamorelin", name: "Tesamorelin", size: "10mg", price: 95, category: "Secretagogue", rating: 4, reviews: 3 },
  { slug: "tb-500", name: "TB-500", size: "10mg", price: 70, category: "Cellular", rating: 5, reviews: 4 },
  { slug: "semax", name: "Semax", size: "10mg", price: 60, category: "Neuro", rating: 5, reviews: 2 },
  { slug: "selank", name: "Selank", size: "10mg", price: 60, category: "Neuro", rating: 5, reviews: 2 },
  { slug: "bac-water", name: "Bacteriostatic Water", size: "30mL", price: 15, category: "Lab Supplies", rating: 5, reviews: 11 },
];

export const categories = [
  { name: "Metabolic Research", blurb: "Batch-tracked metabolic compounds including MOTS-C.", key: "Metabolic" },
  { name: "Cellular Research", blurb: "BPC-157, TB-500, GHK-Cu, KPV and related compounds.", key: "Cellular" },
  { name: "Secretagogue Research", blurb: "CJC-1295, Ipamorelin, Sermorelin, Tesamorelin.", key: "Secretagogue" },
  { name: "Neuro Research", blurb: "Semax, Selank, DSIP and nootropic research compounds.", key: "Neuro" },
  { name: "Peptide Blends", blurb: "GLOW, KLOW, CJC/IPA and combination vials.", key: "Blends" },
  { name: "Laboratory Supplies", blurb: "Bacteriostatic water, storage cases, lab essentials.", key: "Lab Supplies" },
];
