export type ProvinceCode =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

export const PROVINCES: { code: ProvinceCode; name: string; rate: number }[] = [
  { code: "AB", name: "Alberta", rate: 0.05 },
  { code: "BC", name: "British Columbia", rate: 0.12 },
  { code: "MB", name: "Manitoba", rate: 0.12 },
  { code: "NB", name: "New Brunswick", rate: 0.15 },
  { code: "NL", name: "Newfoundland and Labrador", rate: 0.15 },
  { code: "NS", name: "Nova Scotia", rate: 0.14 },
  { code: "NT", name: "Northwest Territories", rate: 0.05 },
  { code: "NU", name: "Nunavut", rate: 0.05 },
  { code: "ON", name: "Ontario", rate: 0.13 },
  { code: "PE", name: "Prince Edward Island", rate: 0.15 },
  { code: "QC", name: "Quebec", rate: 0.14975 },
  { code: "SK", name: "Saskatchewan", rate: 0.11 },
  { code: "YT", name: "Yukon", rate: 0.05 },
];

/** Tax is not charged to customers — it is covered by Veyrona Labs. */
export const taxRateFor = (_province?: string | null) => 0;

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
