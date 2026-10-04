export const SITE_NAME = "unpolished";

// Statický export (`npm run build:static`) beží bez servera — bez cookies na serveri a bez /api.
// Publikuje sa na GitHub Pages, kde web žije v podadresári /unpolished.
export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
export const BASE_PATH = IS_STATIC_EXPORT ? "/unpolished" : "";
export const SITE_URL = IS_STATIC_EXPORT ? `https://andrejkocis.github.io${BASE_PATH}` : "https://unpolished.com";

// Cesta k súboru z public/. Odkazy (Link, router) dostanú BASE_PATH od Next.js,
// ale src obrázkov, videí a CSS url() ho potrebujú doplniť ručne.
export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

export const CONTACT_EMAIL = "info@unpolished.com";
export const WHATSAPP_NUMBER = "421900000000";

export const INSTAGRAM_HANDLE = "@unpolished.watches";
export const INSTAGRAM_URL = "https://instagram.com/unpolished.watches";

export const VAT_INFO = "IČ DPH: SK0000000000";

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function watchWhatsappLink(label: string) {
  return waLink(`Dobrý deň, mám záujem o ${label}.`);
}
