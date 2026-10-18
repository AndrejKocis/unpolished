# Instagram koncepty (@unpolished.watches)

Agent pripravuje koncepty, zverejňuje ich majiteľ ručne. Publikovanie cez Meta Graph API zatiaľ nie je.

## Kedy

- Pri pridaní nových hodiniek alebo pri označení kusu ako predaného pripraví agent koncept v tej istej práci.
- Ďalšie koncepty pripravuje na požiadanie.

## Ako

1. Spusti `node scripts/instagram/draft.mjs <slug>` (potrebuje aktuálny build v `docs/`, odtiaľ berie logo).
   - Na predaj vznikne carousel `01.jpg…` (1080×1350, logo len na prvej) a `reel.mp4` (1080×1920, loop + 3 fotky, bez zvuku).
   - Pri predanom kuse vznikne `01.jpg` so štítkom „Prodáno“ a logom.
2. Napíš `caption.md` do toho istého priečinka podľa pravidiel nižšie.
3. Publikuj koncept ako súkromnú stránku (Artifact) s médiami na stiahnutie a tlačidlom na skopírovanie popisu. Pošli majiteľovi odkaz.

## Popis

- Najprv angličtina, potom po prázdnom riadku krátko čeština (2–3 vety + odkaz). Bez „—“ a bez „·“ zoznamov.
- Prvá osoba, prirodzené vety s kontrakciami (it's, I had it serviced…), konkrétne čísla a mená: rok, kaliber, priemer, servis, set.
- Bez ceny: „Price and details on unpolished.cz, link in bio.“ Predaný kus: štítok SOLD na fotke.
- 3 hashtagy (značka, model, #vintagewatches).
- Pred zverejnením skontroluj anglickú časť: `python3 <instagram-agent>/skills/ig-human/detect.py caption.md` musí dať PASS.
  Pozor, humanize.py kazí češtinu (veľké písmeno po „70.“), na český text ho nepoužívaj.

## Reel

- `hook.txt` v priečinku konceptu: krátky anglický háčik (napr. „POV: a 1969 watch that hums instead of ticks“),
  ukáže sa prvé 2,5 s, potom 3 s názov hodiniek. Bez `hook.txt` len názov.
- Hudbu pridáva majiteľ ručne v Instagrame (populárna skladba = vyšší dosah). Cez API len carousel a fotky.

## Zverejnenie cez API

`node scripts/instagram/publish.mjs <slug> [--reel] [--publish]`: médiá najprv skopíruj do `public/ig/<slug>/`,
build + push, potom skúška bez `--publish`, zverejnenie až po súhlase majiteľa.

## Bio

Bio a highlights: `profile/bio.md`, obrázky `node scripts/instagram/profile.mjs`. Odkaz v bio: `https://unpolished.cz/?utm_source=instagram&utm_medium=social&utm_campaign=bio`

Médiá (`*.jpg`, `*.mp4`) sa necommitujú, dajú sa kedykoľvek vygenerovať znova. V gite ostávajú popisy.
