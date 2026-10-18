// Náhľadová stránka konceptu (na zverejnenie ako Artifact): instagram/pages/<slug>/index.html
//   node scripts/instagram/page.mjs <slug> "<názov>" "<typ, napr. Nové hodinky · carousel + reel>"
// Médiá stránka odkazuje relatívne (01.jpg…, reel.mp4), pri publikovaní sa pridajú ako súbory z instagram/drafts/<slug>/.
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const [slug, name, kind] = process.argv.slice(2);
if (!slug || !name || !kind) throw new Error('Použitie: node scripts/instagram/page.mjs <slug> "<názov>" "<typ>"');
const dir = path.join(ROOT, "instagram/drafts", slug);
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const caption = fs.readFileSync(path.join(dir, "caption.md"), "utf8").trim();
const photos = fs.readdirSync(dir).filter((f) => /^\d+\.jpg$/.test(f)).sort();
const reel = fs.existsSync(path.join(dir, "reel.mp4"));
const steps = [
  "Ulož fotky: podrž prst na fotke a zvoľ Uložiť. Súbory máš aj v správe od Clauda.",
  reel ? "Carousel zverejni s fotkami v tomto poradí. Reel zverejni zvlášť a hudbu pridaj v Instagrame." : "Fotky zverejni v tomto poradí.",
  "Skopíruj popis tlačidlom a vlož ho do Instagramu.",
];
const html = `<title>Koncept ${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* Jeden stĺpec ako na mobile, rovnaké tokeny ako unpolished.cz. */
:root {
  --bg: #f4f4f4; --surface: #ffffff; --ink: #111111; --muted: #6b6b6b; --line: #dedede;
  --serif: "Instrument Serif", Georgia, serif; --sans: Inter, system-ui, sans-serif; --mono: "JetBrains Mono", Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1a1a1a; --surface: #151515; --ink: #f4f4f4; --muted: #9a9a9a; --line: #2c2c2c; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #1a1a1a; --surface: #151515; --ink: #f4f4f4; --muted: #9a9a9a; --line: #2c2c2c; color-scheme: dark }
body { background: var(--bg); color: var(--ink); font-family: var(--sans); font-size: 15px; line-height: 1.55; }
main { max-width: 560px; margin: 0 auto; padding-inline: 16px; padding-block: 28px 56px; display: grid; gap: 32px; }
.eyebrow, h2, .num, button, .hint { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
.eyebrow { color: var(--muted); margin: 0 0 6px; }
h1 { font-family: var(--serif); font-weight: 400; font-size: 34px; line-height: 1.1; margin: 0; text-wrap: balance; }
h2 { color: var(--muted); font-weight: 400; margin: 0 0 12px; }
ol.steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
.photos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.photos.single { grid-template-columns: minmax(0, 1fr); }
figure { margin: 0; position: relative; }
figure img, video { display: block; width: 100%; max-width: 100%; height: auto; background: var(--surface); }
.num { position: absolute; left: 6px; bottom: 6px; background: var(--surface); color: var(--ink); padding: 2px 6px; }
video { aspect-ratio: 9 / 16; max-height: 80vh; width: auto; margin: 0 auto; }
.caption { background: var(--surface); border: 1px solid var(--line); padding: 16px; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; font-family: var(--sans); font-size: 14px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.row h2 { margin: 0; }
button { background: var(--ink); color: var(--bg); border: 0; padding: 10px 14px; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--muted); outline-offset: 2px; }
.hint { color: var(--muted); margin-top: 8px; }
</style>
<main>
  <header>
    <p class="eyebrow">Instagram koncept · ${esc(kind)}</p>
    <h1>${esc(caption.split("\n")[0])}</h1>
  </header>
  <section>
    <h2>Postup</h2>
    <ol class="steps">${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
  </section>
  <section>
    <div class="row"><h2>Popis</h2><button id="copy" type="button">Kopírovať popis</button></div>
    <pre class="caption" id="caption">${esc(caption)}</pre>
  </section>
  <section>
    <h2>${photos.length > 1 ? `Carousel · ${photos.length} fotiek v poradí` : "Fotka"}</h2>
    <div class="photos${photos.length > 1 ? "" : " single"}">${photos
      .map((p, i) => `<figure><img src="${p}" alt="${esc(name)}, fotka ${i + 1}" loading="lazy" width="1080" height="1350">${photos.length > 1 ? `<span class="num">${i + 1}</span>` : ""}</figure>`)
      .join("")}</div>
  </section>
  ${reel ? `<section><h2>Reel · bez zvuku</h2><video src="reel.mp4" controls muted playsinline loop preload="metadata"></video><p class="hint">Hudbu pridaj v Instagrame</p></section>` : ""}
</main>
<script>
const btn = document.getElementById("copy");
btn.addEventListener("click", () => {
  const text = document.getElementById("caption").textContent;
  navigator.clipboard.writeText(text).then(() => { btn.textContent = "Skopírované"; }, () => {
    const r = document.createRange(); r.selectNodeContents(document.getElementById("caption"));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Označené, skopíruj";
  });
});
</script>
`;
const out = path.join(ROOT, "instagram/pages", slug);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
console.log(path.relative(ROOT, path.join(out, "index.html")), photos.length, "fotiek", reel ? "+ reel" : "");
