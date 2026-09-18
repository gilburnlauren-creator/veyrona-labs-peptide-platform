export type QuoteItemInput = { slug: string; size: string; qty: number };

export type QuoteLine = {
  slug: string;
  name: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  variantId: number | null;
  stock: number | null;
  inStock: boolean;
};

export type Quote = {
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  couponCode: string | null;
  couponError: string | null;
  currency: "CAD";
  shippingSavedCents: number;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: "CA";
  phone?: string;
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; totalCents: number; email: string }
  | { ok: false; error: string; code?: string };
