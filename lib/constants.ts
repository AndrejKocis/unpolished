export const SITE_NAME = "unpolished";

// Statický export (`npm run build:static`) beží bez servera — bez cookies na serveri a bez /api.
// Publikuje sa na GitHub Pages s vlastnou doménou (public/CNAME).
export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
export const SITE_URL = "https://unpolished.cz";

export const CONTACT_EMAIL = "info@unpolished.com";
export const WHATSAPP_NUMBER = "421900000000";

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
