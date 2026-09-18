/** Interac e-Transfer settings shown to customers at checkout and on the order page. */
export const ETRANSFER_EMAIL =
  (import.meta.env["VITE_ETRANSFER_EMAIL"] as string | undefined) ?? "payments@veyronalabs.ca";

export const ETRANSFER_SECURITY_ANSWER =
  (import.meta.env["VITE_ETRANSFER_ANSWER"] as string | undefined) ?? "veyrona";

export type PaymentMethod = "card" | "etransfer";
