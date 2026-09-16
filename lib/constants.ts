export const SITE_NAME = "unpolished";
export const SITE_URL = "https://unpolished.com";

export const CONTACT_EMAIL = "info@unpolished.com";
export const WHATSAPP_NUMBER = "421900000000";

export const INSTAGRAM_HANDLE = "@unpolished.watches";
export const INSTAGRAM_URL = "https://instagram.com/unpolished.watches";

export const VAT_INFO = "IČ DPH: SK0000000000";

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function watchWhatsappLink(brand: string, model: string, reference: string) {
  return waLink(`Dobrý deň, mám záujem o ${brand} ${model} ref. ${reference}.`);
}
