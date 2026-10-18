// Vlastné udalosti pre Umami. Kliky na tlačidlá sa merajú cez atribút data-umami-event priamo v JSX,
// tento helper je pre udalosti bez kliku (napr. úspešne odoslaný formulár). Bez skriptu Umami nerobí nič.
declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

export function track(event: string, data?: Record<string, string>) {
  if (typeof window !== "undefined") window.umami?.track(event, data);
}
