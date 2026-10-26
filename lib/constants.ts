export const SITE_NAME = "unpolished";

// Statický export (`npm run build:static`) beží bez servera — bez cookies na serveri a bez /api.
// Publikuje sa na GitHub Pages s vlastnou doménou (public/CNAME).
export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
export const SITE_URL = "https://unpolished.cz";
// Umami (štatistiky bez cookies, cloud.umami.is). Prázdne ID = meranie vypnuté.
export const UMAMI_WEBSITE_ID = "66a1ba4e-acd0-4ec5-8d9d-154c12c9bcc2";

export const CONTACT_EMAIL = "info@unpolished.cz";
// Web3Forms (web3forms.com) doručí formuláre zo statického webu na CONTACT_EMAIL.
// Kľúč je verejný (patrí do prehliadača). Prázdny = formuláre otvoria e-mailového klienta (mailto).
export const WEB3FORMS_ACCESS_KEY = "";
export const WHATSAPP_NUMBER = "420724462929";

export const INSTAGRAM_HANDLE = "@unpolished.watches";
export const INSTAGRAM_URL = "https://instagram.com/unpolished.watches";

export const VAT_INFO = "IČ DPH: SK0000000000";

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// `greeting` je úvod správy v jazyku návštevníka (dict.watchDetail.whatsappMessage).
export function watchWhatsappLink(greeting: string, label: string) {
  return waLink(`${greeting} ${label}.`);
}
