# Inbox — ako pridať novú hodinku

Tento priečinok je "prijímacia schránka" pre nové kusy. Nahraj sem podklady,
napíš do chatu "spracuj inbox/<priečinok>" a Claude dokončí zvyšok podľa
checklistu nižšie.

## Postup

1. Vytvor priečinok, napr. `content/inbox/tudor-submariner-94010/`.
2. Skopíruj doň vzory z `content/inbox/_template/`:
   - `info.yaml` — vyplň (bez ceny, tá príde na konci)
   - `checklist.md` — necháš tak, Claude ho bude odškrtávať
3. Vlož podklady:
   - **1 video** → spracuje sa na hover-loop pre kartu v katalógu
   - **5 fotiek** → pôjdu do galérie na detaile hodinky
4. Napíš: **"spracuj inbox/tudor-submariner-94010"**

## Čo spraví Claude — podľa checklistu

- [ ] **Video pre kartu** — orez na stred, HDR→SDR, kompresia, jemný
      crossfade loop (`scripts/process-video.sh`)
- [ ] **5 fotiek do detailu** — skopíruje a premenuje do
      `public/watches/<media>/` (`media` = referencia, ak je známa, inak
      krátky názov modelu, napr. `memosail`)
- [ ] **Popis modelu** — vyhľadá fakty o referencii na internete (história,
      technické údaje) a napíše ich **vlastnými slovami** v našom brand
      hlase — zberateľský žargón (dial, lugy, dátumovka, high-beat, A/h,
      full set), **prvá osoba jednotného čísla** („predávam“, „môj“), nikdy
      množné („náš“, „predávame“). Kovový náramok je vždy „ťah“, koža a
      kaučuk „remienok“. Nikdy neprevezme cudzí text doslovne (copyright) a neistotu
      radšej prizná, než aby si vymýšľal detaily. Do popisu nepíše vety o
      servise ani hodinárovi (to ukazuje ikona „Servisované“) ani o tom, že
      sériové či referenčné číslo nie je viditeľné alebo známe.
- [ ] **Česká a anglická verzia** — web je CZ (predvolený) / SK / EN.
      Základné texty v `content/watches/<slug>.mdx` sú slovenské; do polí
      `cs:` a `en:` preloží textové špecifikácie (caliber, caseMaterial,
      strap, dial, casePolish, set, service, warranty) a celý popis vrátane
      `<DidYouKnow>` (`content`) v rovnakom štýle (česky: číselník, ouška,
      tah, řemínek, datumovka).
- [ ] **Cena** — Claude sa tu zastaví a opýta sa ťa. Nikdy ju
      nenastaví sám ani neprevezme z inzerátov iných predajcov — je to
      tvoje obchodné rozhodnutie. Dve ceny: `price` v € (SK a EN verzia)
      a `priceCzk` v Kč (CZ verzia).
- [ ] **Zápis do katalógu** — vytvorí `content/watches/<slug>.mdx`,
      priečinok v inboxe potom vyprace.

Claude priebežne odškrtáva položky v `checklist.md` daného priečinka, takže
ak spracovanie preruší (napr. čaká na cenu), po doplnení stačí napísať
"pokračuj" a nadviaže presne tam, kde skončil.

## Prečo nie plne automaticky

Claude beží iba keď ho niekto spustí — nedokáže sám sledovať priečinok na
pozadí. Tento flow je preto na jednu správu v chate, nie bezobslužný cron.
Ak by si chcel aj naplánované/pravidelné spracovanie, dá sa to doplniť cez
scheduled task.
