const SQUARE_SHOTS = new Set(["04-lugs-macro", "05-dial-macro", "07-crown", "08-lume-uv"]);

// Výnimky pre konkrétne fotky, ktoré nesedia na štandardný 4:5 portrétový
// rámik (napr. odfotené na šírku) — kľúč je "referencia/názov-bez-prípony".
const SQUARE_SHOTS_BY_REFERENCE = new Set([
  // GUB 01-dial.jpg je takmer na šírku (1600×1414) — v 4:5 portrétovom
  // rámiku by sa orezalo ~30 % šírky, v štvorcovom len ~12 %.
  "26-Rubis/01-dial",
  // Tudor 05-dial-angle.jpg je odfotená na šírku (1600×1265).
  "7984/05-dial-angle",
  // TAG Heuer 01-dial.jpg (1600×1525) a 03-profile.jpg (1600×1581) sú
  // takmer štvorcové.
  "159.306-1/01-dial",
  "159.306-1/03-profile",
  // Racing Regatta: 02-dial-angle.jpg (1600×1609) a 03-profile.jpg
  // (1600×1469, na šírku) sú takmer/úplne štvorcové.
  "racing-regatta/02-dial-angle",
  "racing-regatta/03-profile",
]);

export function imageAspect(filename: string, reference: string): "square" | "portrait" {
  const base = filename.replace(/\.[a-z0-9]+$/i, "");
  if (SQUARE_SHOTS.has(base) || SQUARE_SHOTS_BY_REFERENCE.has(`${reference}/${base}`)) {
    return "square";
  }
  return "portrait";
}
