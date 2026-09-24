/**
 * Supplier catalogue: sizes, SKUs (supplier Cat. No.), selling price (CAD),
 * kit cost (CNY) and kits purchased. One kit = 10 vials.
 * Starting stock = kits × 10. Unit cost in CAD uses ~0.21 CAD per CNY.
 */
export type InventorySize = {
  label: string;
  price: number;
  sku: string;
  kitCostCny: number;
  kits: number;
};

export const VIALS_PER_KIT = 10;
export const CNY_TO_CAD = 0.21;

const s = (label: string, price: number, sku: string, kitCostCny: number, kits: number): InventorySize => ({
  label, price, sku, kitCostCny, kits,
});

export const inventory: Record<string, InventorySize[]> = {
  semaglutide: [s("5mg", 35, "SM5", 105, 55), s("10mg", 45, "SM10", 150, 35), s("20mg", 79, "SM20", 270, 15)],
  tirzepatide: [s("10mg", 53, "TR10", 175, 55), s("20mg", 89, "TR20", 310, 25), s("30mg", 125, "TR30", 420, 12)],
  retatrutide: [s("10mg", 74, "RT10", 300, 35), s("20mg", 129, "RT20", 570, 12), s("30mg", 189, "RT30", 795, 5)],
  "bpc-157": [s("5mg", 33, "BC5", 160, 25), s("10mg", 53, "BC10", 210, 18)],
  "tb-500": [s("5mg", 33, "BT5", 300, 12), s("10mg", 53, "BT10", 630, 6), s("20mg", 99, "BT20", 1200, 2)],
  "ghk-cu": [s("50mg", 25, "CU50", 100, 25), s("100mg", 41, "CU100", 110, 15)],
  "cjc-ipamorelin": [s("5mg/5mg", 57, "CP10", 430, 10)],
  "cjc-dac": [s("5mg", 49, "CD5", 740, 3), s("10mg", 89, "CD10", 1320, 1)],
  "melanotan-2": [s("5mg", 25, "ML5", 150, 10), s("10mg", 41, "ML10", 210, 6)],
  selank: [s("5mg", 29, "SK5", 160, 5), s("10mg", 49, "SK10", 240, 4)],
  tesamorelin: [s("5mg", 62, "TSM5", 450, 3), s("10mg", 107, "TSM10", 850, 2)],
  "mots-c": [s("10mg", 33, "MS10", 240, 6), s("40mg", 107, "MS40", 930, 2)],
  kpv: [s("5mg", 23, "KPV5", 190, 6), s("10mg", 37, "KPV10", 270, 4)],
  "pt-141": [s("10mg", 53, "P41", 240, 8)],
  "bpc-tb-blend": [s("20mg", 90, "BB20", 840, 5)],
  "glow-blend": [s("70mg", 103, "BBG70", 910, 3)],
  "klow-blend": [s("80mg", 107, "KLOW80", 1020, 2)],
};

export const unitCostCents = (sz: InventorySize) =>
  Math.round(((sz.kitCostCny * CNY_TO_CAD) / VIALS_PER_KIT) * 100);

export const startingStock = (sz: InventorySize) => sz.kits * VIALS_PER_KIT;

/** Reorder alert when stock falls to ~20% of the starting quantity (min 5). */
export const reorderAt = (sz: InventorySize) => Math.max(5, Math.ceil(startingStock(sz) * 0.2));
