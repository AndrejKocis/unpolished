const SQUARE_SHOTS = new Set(["04-lugs-macro", "05-dial-macro", "07-crown", "08-lume-uv"]);

export function imageAspect(filename: string): "square" | "portrait" {
  const base = filename.replace(/\.[a-z0-9]+$/i, "");
  return SQUARE_SHOTS.has(base) ? "square" : "portrait";
}
