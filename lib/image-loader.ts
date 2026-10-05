// Loader pre next/image v statickom exporte (bez servera na optimalizáciu obrázkov).
// Fotky z public/ smeruje na WebP verzie, ktoré po builde vygeneruje scripts/optimize-images.mjs.
// Šírky musia sedieť s images.deviceSizes v next.config.ts.
export const IMAGE_WIDTHS = [480, 828, 1200, 1600];

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  const match = src.match(/^(\/.+)\.(jpe?g|png|webp)$/i);
  if (!match) return src;
  return `/_img${match[1]}-${width}.webp`;
}
