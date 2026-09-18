export type ProductDetail = {
  cas: string;
  aka: string;
  className: string;
  form: string;
  molecularWeight: string;
  sequenceLength: string;
  targets: string;
  batch: string;
  tested: string;
  purity: string;
  summary: string;
  overview?: string;
  research: { title: string; body: string }[];
  tags: string[];
  storage: string;
};

export type ProductSize = { label: string; price: number };

export type Product = {
  slug: string;
  name: string;
  size: string;
  price: number;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  sizes: ProductSize[];
  detail: ProductDetail;
};

const storageDefault =
  "Store sealed lyophilised material in a cool, dark and dry place in line with your institutional SOPs. Protect from light and moisture. Once reconstituted, aliquots should be held at −20 °C and used promptly to limit degradation of the peptide backbone.";

type Seed = Omit<Product, "detail" | "sizes"> & {
  sizes?: ProductSize[];
  detail: Partial<ProductDetail> & Pick<ProductDetail, "cas" | "summary">;
};

const seed: Seed[] = [
  {
    slug: "retatrutide",
    name: "Retatrutide",
    size: "10mg",
    price: 145,
    category: "Metabolic",
    badge: "Best Seller",
    rating: 5,
    reviews: 293,
    detail: {
      cas: "2381089-83-2",
      overview: "Retatrutide is one of the most sought-after peptides in weight loss and weight management research. Researchers study it for its effects on metabolism, appetite regulation and fat reduction, and it is currently among the most talked-about compounds in obesity and metabolic research.",
      aka: "LY3437943; GGG tri-agonist",
      className: "Synthetic triple receptor agonist / metabolic research tool",
      molecularWeight: "~4731 Da",
      sequenceLength: "39 amino acids",
      targets: "GLP-1 · GIP · glucagon receptors",
      batch: "VL-RET-05",
      purity: "99.6%",
      summary:
        "Retatrutide is a synthetic peptide studied as a triple agonist at the GLP-1, GIP and glucagon receptors. It is used in receptor pharmacology and metabolic cell models examining how simultaneous activation of all three incretin-family receptors alters downstream signalling.",
      research: [
        { title: "Receptor activation assays", body: "Used in cAMP accumulation and β-arrestin recruitment assays across cell lines expressing GLP-1, GIP and glucagon receptors." },
        { title: "Metabolic cell models", body: "Applied in hepatocyte and adipocyte cultures examining lipolytic and glucose-handling readouts." },
        { title: "Signalling bias studies", body: "Studied as a tool compound for comparing relative potency across the three receptor systems." },
      ],
      tags: ["Metabolic research", "Incretin receptor pharmacology", "cAMP assays", "Triple agonist studies"],
    },
  },
  {
    slug: "bpc-157",
    name: "BPC-157",
    size: "10mg",
    price: 65,
    category: "Cellular",
    badge: "Best Seller",
    rating: 5,
    reviews: 12,
    detail: {
      cas: "137525-51-0",
      overview: "BPC-157 is one of the most popular peptides in healing and recovery research. Researchers study it for tissue repair, tendon and ligament recovery, gut health and inflammation, making it a go-to compound in injury and regenerative research.",
      aka: "Body Protection Compound 157; PL 14736",
      className: "Synthetic pentadecapeptide / tissue repair research tool",
      molecularWeight: "~1419.5 Da",
      sequenceLength: "15 amino acids",
      targets: "Angiogenesis · growth factor signalling",
      batch: "VL-BPC-04",
      purity: "99.4%",
      summary:
        "BPC-157 is a synthetic 15-amino-acid sequence derived from a protein fraction found in gastric juice. It is widely used in cell and tissue models exploring fibroblast migration, angiogenic signalling and connective tissue repair pathways.",
      research: [
        { title: "Fibroblast migration assays", body: "Used as a tool compound in scratch and transwell migration experiments examining tendon and ligament fibroblast behaviour in culture." },
        { title: "Angiogenic signalling models", body: "Studied alongside VEGF pathway readouts in endothelial cell preparations investigating vessel formation in vitro." },
        { title: "Gastrointestinal cell models", body: "Applied in epithelial monolayer studies examining barrier integrity and cytoprotective signalling." },
      ],
      tags: ["Tissue repair models", "Angiogenesis assays", "Fibroblast migration", "Barrier integrity studies"],
    },
  },
  {
    slug: "kpv",
    name: "KPV",
    size: "10mg",
    price: 50,
    category: "Cellular",
    rating: 5,
    reviews: 7,
    detail: {
      cas: "67727-97-3",
      overview: "KPV is widely studied in inflammation and gut health research. Researchers explore it for calming inflammatory responses, supporting gut and skin health, and immune system regulation.",
      aka: "Lys-Pro-Val; α-MSH (11-13)",
      className: "Synthetic tripeptide / inflammatory signalling research tool",
      molecularWeight: "~342.4 Da",
      sequenceLength: "3 amino acids",
      targets: "NF-κB signalling · melanocortin fragment",
      batch: "VL-KPV-02",
      purity: "99.1%",
      summary:
        "KPV is the C-terminal tripeptide fragment of α-MSH. It is studied in cell culture models of inflammatory signalling, particularly experiments tracking NF-κB translocation and cytokine expression in epithelial and immune cell preparations.",
      research: [
        { title: "NF-κB pathway studies", body: "Used in reporter assays examining nuclear translocation and downstream transcriptional activity." },
        { title: "Cytokine expression assays", body: "Applied in qRT-PCR and ELISA workflows measuring pro-inflammatory mediator output in stimulated cultures." },
      ],
      tags: ["Inflammatory signalling", "NF-κB reporter assays", "Epithelial cell models"],
    },
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    size: "50mg",
    price: 45,
    category: "Cellular",
    badge: "Selling Fast",
    rating: 5,
    reviews: 9,
    detail: {
      cas: "89030-95-5",
      overview: "GHK-Cu is the leading beauty peptide. It is heavily researched for skin rejuvenation, collagen production, wrinkle reduction, skin firmness and hair growth — a favourite in anti-aging, beauty and cosmetic research.",
      aka: "Copper tripeptide-1; Gly-His-Lys copper complex",
      className: "Copper-binding tripeptide / matrix remodelling research tool",
      molecularWeight: "~403.9 Da",
      sequenceLength: "3 amino acids",
      targets: "Collagen synthesis · copper transport",
      batch: "VL-GHK-03",
      purity: "99.2%",
      summary:
        "GHK-Cu is a naturally occurring copper-binding tripeptide used in dermal and connective tissue research. Laboratory work focuses on extracellular matrix gene expression, copper transport and fibroblast behaviour in culture.",
      research: [
        { title: "Extracellular matrix studies", body: "Used in fibroblast cultures measuring collagen and glycosaminoglycan gene expression." },
        { title: "Copper coordination chemistry", body: "Studied as a model complex for physiological copper binding and transfer in buffered systems." },
      ],
      tags: ["Matrix remodelling", "Dermal fibroblast models", "Copper coordination"],
    },
  },
  {
    slug: "glow-blend",
    name: "GLOW Blend",
    size: "70mg",
    price: 110,
    category: "Blends",
    rating: 5,
    reviews: 5,
    detail: {
      cas: "Blend — see components",
      aka: "GHK-Cu + BPC-157 + TB-500 combination vial",
      overview: "The GLOW Blend is the beauty and rejuvenation stack. Combining GHK-Cu, BPC-157 and TB-500, it is researched for glowing skin, collagen support, hair health, tissue repair and full-body recovery — all in one vial.",
      className: "Multi-peptide research blend",
      molecularWeight: "Mixed",
      sequenceLength: "Mixed",
      targets: "Matrix remodelling · repair signalling",
      batch: "VL-GLW-01",
      purity: "≥98% per component",
      summary:
        "A combination research vial containing GHK-Cu, BPC-157 and TB-500 in a single lyophilised preparation, supplied for laboratory protocols that examine these compounds together rather than in isolation.",
      research: [
        { title: "Combination exposure models", body: "Used where a protocol calls for simultaneous exposure to matrix and repair-pathway tool compounds." },
        { title: "Component verification", body: "Each component is verified independently before blending; batch documentation lists all three analyses." },
      ],
      tags: ["Multi-compound protocols", "Matrix remodelling", "Repair signalling"],
    },
  },
  {
    slug: "mots-c",
    name: "MOTS-C",
    size: "10mg",
    price: 50,
    category: "Metabolic",
    rating: 5,
    reviews: 6,
    detail: {
      cas: "1627580-64-6",
      overview: "MOTS-C is a mitochondrial peptide studied in energy, metabolism and longevity research. Researchers explore it for fat metabolism, exercise performance, cellular energy and healthy aging.",
      aka: "Mitochondrial ORF of the 12S rRNA type-c",
      className: "Mitochondrial-derived peptide / metabolic research tool",
      molecularWeight: "~2174.6 Da",
      sequenceLength: "16 amino acids",
      targets: "AMPK signalling · folate-methionine cycle",
      batch: "VL-MTC-02",
      purity: "99.0%",
      summary:
        "MOTS-C is a mitochondrial-derived peptide encoded within the 12S rRNA region. It is studied in metabolic cell models examining AMPK activation, glucose handling and the folate–methionine one-carbon cycle.",
      research: [
        { title: "AMPK activation assays", body: "Used in western blot workflows tracking phosphorylation of AMPK and downstream metabolic effectors." },
        { title: "Glucose uptake models", body: "Applied in myotube and adipocyte cultures measuring labelled glucose uptake." },
      ],
      tags: ["Metabolic signalling", "AMPK studies", "Mitochondrial biology"],
    },
  },
  {
    slug: "klow-blend",
    name: "KLOW Blend",
    size: "80mg",
    price: 130,
    category: "Blends",
    rating: 5,
    reviews: 4,
    detail: {
      cas: "Blend — see components",
      aka: "KPV + GHK-Cu + BPC-157 + TB-500 combination vial",
      overview: "The KLOW Blend builds on the GLOW formula by adding KPV, creating a four-peptide stack researched for skin and beauty, inflammation control, gut health, tissue repair and full-body recovery.",
      className: "Multi-peptide research blend",
      molecularWeight: "Mixed",
      sequenceLength: "Mixed",
      targets: "Inflammatory signalling · matrix remodelling",
      batch: "VL-KLW-01",
      purity: "≥98% per component",
      summary:
        "A four-component research vial combining KPV with GHK-Cu, BPC-157 and TB-500, supplied for laboratory protocols examining inflammatory and matrix pathways in the same preparation.",
      research: [
        { title: "Combination exposure models", body: "Used where inflammatory and repair-pathway tool compounds are studied together." },
        { title: "Component verification", body: "All four components are analysed separately before blending." },
      ],
      tags: ["Multi-compound protocols", "Inflammatory signalling", "Matrix remodelling"],
    },
  },
  {
    slug: "cjc-ipamorelin",
    name: "CJC-1295 No DAC + Ipamorelin",
    size: "5mg/5mg",
    price: 75,
    category: "Secretagogue",
    rating: 5,
    reviews: 8,
    detail: {
      cas: "863288-34-0 / 170851-70-4",
      overview: "CJC-1295 + Ipamorelin is the classic growth hormone secretagogue stack. Researchers study this pairing for muscle growth, fat loss, improved sleep, recovery and anti-aging through natural growth hormone release.",
      aka: "Modified GRF (1-29) + Ipamorelin",
      className: "Growth hormone secretagogue research blend",
      molecularWeight: "~3368 Da / ~711.9 Da",
      sequenceLength: "29 AA / 5 AA",
      targets: "GHRH receptor · ghrelin receptor (GHS-R1a)",
      batch: "VL-CJI-03",
      purity: "99.1% / 99.3%",
      summary:
        "A paired secretagogue research vial containing modified GRF (1-29) and Ipamorelin. The two compounds act on separate receptor systems and are commonly studied together in pituitary cell models of growth hormone release.",
      research: [
        { title: "Receptor binding assays", body: "Used in GHRH-R and GHS-R1a binding and activation studies in transfected cell lines." },
        { title: "Pituitary cell models", body: "Applied in primary pituitary cultures measuring secretory output in response to receptor stimulation." },
      ],
      tags: ["Secretagogue research", "Receptor binding", "Pituitary cell models"],
    },
  },
  {
    slug: "tesamorelin",
    name: "Tesamorelin",
    size: "10mg",
    price: 95,
    category: "Secretagogue",
    rating: 4,
    reviews: 3,
    detail: {
      cas: "218949-48-5",
      overview: "Tesamorelin is a GHRH analogue researched for reducing abdominal and visceral fat, growth hormone release, body composition and anti-aging. It is one of the most studied peptides in fat-reduction research.",
      aka: "TH9507; trans-3-hexenoyl-GRF (1-44)",
      className: "GHRH analogue / secretagogue research tool",
      molecularWeight: "~5135.9 Da",
      sequenceLength: "44 amino acids",
      targets: "GHRH receptor",
      batch: "VL-TSM-02",
      purity: "98.9%",
      summary:
        "Tesamorelin is a stabilised analogue of growth hormone releasing hormone (1-44). It is used in receptor pharmacology work and pituitary cell models investigating GHRH receptor activation and signalling kinetics.",
      research: [
        { title: "GHRH receptor pharmacology", body: "Used in cAMP accumulation assays characterising receptor activation profiles." },
        { title: "Peptide stability studies", body: "Studied as a model for N-terminal modification strategies that resist enzymatic cleavage." },
      ],
      tags: ["Secretagogue research", "cAMP assays", "Peptide stability"],
    },
  },
  {
    slug: "tb-500",
    name: "TB-500",
    size: "10mg",
    price: 70,
    category: "Cellular",
    rating: 5,
    reviews: 4,
    detail: {
      cas: "77591-33-4",
      overview: "TB-500 is a healing and recovery peptide researched for tissue repair, wound healing, flexibility, muscle recovery and reduced inflammation — a staple in injury and regenerative research.",
      aka: "Thymosin beta-4 fragment (Ac-SDKP extended)",
      className: "Actin-binding peptide / cell motility research tool",
      molecularWeight: "~4963 Da",
      sequenceLength: "43 amino acids",
      targets: "G-actin sequestration · cell migration",
      batch: "VL-TB5-03",
      purity: "99.0%",
      summary:
        "TB-500 is a synthetic analogue of thymosin beta-4, the principal actin-sequestering peptide in mammalian cells. It is studied in cytoskeletal biology, cell motility and wound-closure models in culture.",
      research: [
        { title: "Actin polymerisation assays", body: "Used in pyrene-actin fluorescence experiments measuring G-actin sequestration kinetics." },
        { title: "Cell migration models", body: "Applied in scratch closure and chemotaxis assays across several adherent cell lines." },
      ],
      tags: ["Cytoskeletal biology", "Cell motility", "Actin binding"],
    },
  },
  {
    slug: "semax",
    name: "Semax",
    size: "10mg",
    price: 60,
    category: "Neuro",
    rating: 5,
    reviews: 2,
    detail: {
      cas: "80714-61-0",
      overview: "Semax is a nootropic peptide studied for focus, memory, mental clarity, mood and cognitive performance. Researchers also explore it for neuroprotection and brain health.",
      aka: "ACTH (4-10) Pro-Gly-Pro analogue",
      className: "Synthetic heptapeptide / neuroscience research tool",
      molecularWeight: "~813.9 Da",
      sequenceLength: "7 amino acids",
      targets: "BDNF expression · melanocortin fragment",
      batch: "VL-SMX-02",
      purity: "99.2%",
      summary:
        "Semax is a synthetic analogue of an ACTH fragment extended with a Pro-Gly-Pro tail. It is used in neuroscience cell models examining neurotrophin gene expression and neuronal survival in culture.",
      research: [
        { title: "Neurotrophin expression", body: "Used in qRT-PCR studies measuring BDNF and NGF transcript levels in neuronal preparations." },
        { title: "Neuronal survival assays", body: "Applied in stress-challenge cultures assessing viability readouts." },
      ],
      tags: ["Neuroscience models", "BDNF expression", "Neuronal survival"],
    },
  },
  {
    slug: "selank",
    name: "Selank",
    size: "10mg",
    price: 60,
    category: "Neuro",
    rating: 5,
    reviews: 2,
    detail: {
      cas: "129954-34-3",
      overview: "Selank is a nootropic and calming peptide researched for anxiety relief, stress reduction, mood balance, focus and immune support — often studied alongside Semax in cognitive research.",
      aka: "Tuftsin analogue Thr-Lys-Pro-Arg-Pro-Gly-Pro",
      className: "Synthetic heptapeptide / neuroscience research tool",
      molecularWeight: "~751.9 Da",
      sequenceLength: "7 amino acids",
      targets: "GABAergic signalling · enkephalin turnover",
      batch: "VL-SLK-02",
      purity: "99.0%",
      summary:
        "Selank is a synthetic analogue of the immunopeptide tuftsin. Laboratory work with Selank centres on GABAergic gene expression, enkephalin degradation kinetics and neuroimmune signalling in cell models.",
      research: [
        { title: "GABAergic expression studies", body: "Used in transcript-level work examining GABA-A subunit expression in neuronal cultures." },
        { title: "Enkephalin turnover assays", body: "Applied in enzymatic degradation experiments in plasma and tissue homogenates." },
      ],
      tags: ["Neuroscience models", "GABAergic signalling", "Neuroimmune research"],
    },
  },
  {
    slug: "bac-water",
    name: "Bacteriostatic Water",
    size: "30mL",
    price: 15,
    category: "Lab Supplies",
    rating: 5,
    reviews: 11,
    detail: {
      cas: "7732-18-5 (water)",
      overview: "Bacteriostatic Water is the standard diluent used to reconstitute lyophilised research peptides. The benzyl alcohol preservative keeps the vial sterile across multiple draws, making it an essential companion to every peptide order.",
      aka: "0.9% benzyl alcohol preserved sterile water",
      className: "Laboratory diluent",
      molecularWeight: "18.02 Da (water)",
      sequenceLength: "N/A",
      targets: "Laboratory reconstitution",
      batch: "VL-BAC-07",
      purity: "USP grade",
      summary:
        "Sterile water preserved with 0.9% benzyl alcohol, supplied in a multi-use 30 mL vial for laboratory reconstitution of lyophilised research material.",
      research: [
        { title: "Reconstitution workflows", body: "Standard diluent for preparing stock solutions of lyophilised peptides in bench protocols." },
        { title: "Multi-draw use", body: "The bacteriostatic preservative allows repeated withdrawals within the vial's documented in-use period." },
      ],
      tags: ["Laboratory diluent", "Reconstitution", "Bench supplies"],
      storage: "Store the sealed vial at room temperature away from direct light. Record the date of first entry and follow your institutional limits on in-use periods for multi-draw containers.",
    },
  },
];

const STEPS = [10, 20, 30, 50];
const DISCOUNT = [1, 0.92, 0.88, 0.82];

function buildSizes(p: Seed): ProductSize[] {
  if (p.sizes) return p.sizes;
  const baseMg = Number.parseFloat(p.size);
  if (!p.size.toLowerCase().endsWith("mg") || Number.isNaN(baseMg)) {
    return [{ label: p.size, price: p.price }];
  }
  if (baseMg > 10) {
    return [1, 2, 3].map((m, i) => ({
      label: `${baseMg * m}mg`,
      price: Math.round(p.price * m * (DISCOUNT[i] ?? 1)),
    }));
  }
  const perMg = p.price / baseMg;
  return STEPS.map((mg, i) => ({
    label: `${mg}mg`,
    price: Math.round(perMg * mg * (DISCOUNT[i] ?? 1)),
  }));
}

export const products: Product[] = seed.map((p) => ({
  ...p,
  sizes: buildSizes(p),
  detail: {
    aka: "—",
    className: "Research compound",
    form: "Lyophilised powder",
    molecularWeight: "—",
    sequenceLength: "—",
    targets: "—",
    batch: "—",
    tested: "Aug 12, 2026",
    purity: "≥98%",
    research: [],
    tags: [],
    storage: storageDefault,
    ...p.detail,
  } as ProductDetail,
}));

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

const bestSellerOrder = ["retatrutide", "bpc-157", "glow-blend", "ghk-cu"];

export const bestSellers: Product[] = [
  ...bestSellerOrder.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p)),
  ...products.filter((p) => !bestSellerOrder.includes(p.slug)),
].slice(0, 8);

export const categories = [
  { name: "Metabolic Research (weight loss & fat metabolism)", blurb: "Batch-tracked metabolic compounds including Retatrutide and MOTS-C.", key: "Metabolic" },
  { name: "Cellular Research (recovery, healing & skin)", blurb: "BPC-157, TB-500, GHK-Cu, KPV and related compounds.", key: "Cellular" },
  { name: "Secretagogue Research (growth hormone & anti-ageing)", blurb: "CJC-1295, Ipamorelin, Sermorelin, Tesamorelin.", key: "Secretagogue" },
  { name: "Neuro Research (focus, mood & cognition)", blurb: "Semax, Selank, DSIP and nootropic research compounds.", key: "Neuro" },
  { name: "Peptide Blends (beauty, glow & repair stacks)", blurb: "GLOW, KLOW, CJC/IPA and combination vials.", key: "Blends" },
  { name: "Laboratory Supplies (reconstitution & bench essentials)", blurb: "Bacteriostatic water, storage cases, lab essentials.", key: "Lab Supplies" },
];
