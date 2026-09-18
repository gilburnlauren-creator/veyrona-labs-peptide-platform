/** Browser-side Accept.js loader: card data goes straight to Authorize.Net. */
type AcceptResponse = {
  messages: { resultCode: string; message: { code: string; text: string }[] };
  opaqueData?: { dataDescriptor: string; dataValue: string };
};

declare global {
  interface Window {
    Accept?: {
      dispatchData: (data: unknown, callback: (response: AcceptResponse) => void) => void;
    };
  }
}

export const acceptEnvironment = () =>
  (import.meta.env["VITE_AUTHORIZE_NET_ENVIRONMENT"] as string | undefined) === "production"
    ? "production"
    : "sandbox";

export const acceptClientKey = () =>
  (import.meta.env["VITE_AUTHORIZE_NET_CLIENT_KEY"] as string | undefined) ?? "";

export const acceptLoginId = () =>
  (import.meta.env["VITE_AUTHORIZE_NET_LOGIN_ID"] as string | undefined) ?? "";

const SCRIPTS = {
  sandbox: "https://jstest.authorize.net/v1/Accept.js",
  production: "https://js.authorize.net/v1/Accept.js",
};

let loading: Promise<void> | null = null;

export function loadAcceptJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Accept) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPTS[acceptEnvironment()];
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Could not load the secure payment script."));
    document.head.appendChild(el);
  });
  return loading;
}

export type CardInput = {
  cardNumber: string;
  month: string;
  year: string;
  cardCode: string;
  zip: string;
  fullName: string;
};

export async function tokenizeCard(card: CardInput) {
  await loadAcceptJs();
  const Accept = window.Accept;
  if (!Accept) throw new Error("Secure payment script unavailable.");

  return new Promise<{ dataDescriptor: string; dataValue: string }>((resolve, reject) => {
    Accept.dispatchData(
      {
        authData: { clientKey: acceptClientKey(), apiLoginID: acceptLoginId() },
        cardData: {
          cardNumber: card.cardNumber.replace(/\s+/g, ""),
          month: card.month.padStart(2, "0"),
          year: card.year.length === 2 ? `20${card.year}` : card.year,
          cardCode: card.cardCode,
          zip: card.zip,
          fullName: card.fullName,
        },
      },
      (response) => {
        if (response.messages.resultCode === "Ok" && response.opaqueData) {
          resolve(response.opaqueData);
        } else {
          reject(new Error(response.messages.message[0]?.text ?? "We couldn't verify those card details."));
        }
      },
    );
  });
}
