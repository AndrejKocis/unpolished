// Po statickom builde vygeneruje WebP verzie fotiek pre lib/image-loader.ts:
//   public/watches/x/01-dial.jpg  →  <out>/_img/watches/x/01-dial-<šírka>.webp
// Použitie: node scripts/optimize-images.mjs out
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTHS = [480, 828, 1200, 1600]; // zhodné s lib/image-loader.ts
const SOURCES = ["watches", "hero"];
const outDir = process.argv[2];
if (!outDir) throw new Error("Chýba cieľový adresár (napr. out).");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) yield full;
  }
}

let count = 0;
for (const source of SOURCES) {
  for await (const file of walk(path.join("public", source))) {
    const rel = path.relative("public", file).replace(/\.[^.]+$/, "");
    await mkdir(path.join(outDir, "_img", path.dirname(rel)), { recursive: true });
    await Promise.all(
      WIDTHS.map((width) =>
        sharp(file)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(path.join(outDir, "_img", `${rel}-${width}.webp`)),
      ),
    );
    count++;
  }
}
console.log(`optimize-images: ${count} fotiek × ${WIDTHS.length} šírok`);
