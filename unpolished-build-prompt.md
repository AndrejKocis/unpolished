# unpolished.com — Build Prompt

## Kontext

Postav web pre `unpolished.com` — kurátorovaný predaj vintage hodiniek. Predajca jeden človek, inventár 10–40 kusov, každý kus unikát (1 z 1).

USP a brand stojí na jednom slove: **nepolírované**. Predávame iba hodinky s originálnym, neprepolírovaným puzdrom — ostré hrany, plné lugy, autentická patina. Nikdy neprerábame kus, aby vyzeral novšie. Zároveň najhodnotnejší keyword v hornom segmente vintage trhu (Wind Vintage dáva "Unpolished" priamo do titulkov).

Zatiaľ **bez platobnej brány**. Web dopyt-first: zákazník napíše e-mail alebo WhatsApp. Nie provizórium — Bulang & Sons ani Wind Vintage nemajú košík na hodinkách za 20 000 €, majú `INTERESTED? MAIL US` a telefónne číslo. Pri vintage nad 2000 € košík zabíja rozhovor, ktorý predaj uzatvára.

Cieľová skupina: zberatelia a poučení kupujúci. Čítajú dlhé popisy, kontrolujú referencie, chcú vidieť fotky lugov.

## Stack a obmedzenia

- Next.js 15, App Router, TypeScript
- Tailwind CSS 4
- MDX pre obsah hodiniek a článkov (`next-mdx-remote` alebo `@next/mdx`)
- `next/image` pre všetky fotky
- Statický export kde možné, deploy na Vercel
- Bez databázy, bez CMS, bez admin rozhrania
- Bez state managementu (žiadny Redux, Zustand)
- Bez UI knižnice — žiadny shadcn/ui, Material, Chakra. Všetko od nuly v Tailwinde.
- Bez animačnej knižnice — žiadny Framer Motion. Iba CSS transitions.
- Formuláre cez Resend API route. Žiadny backend server.

Cieľ výkonu: LCP pod 1.5s na 4G, Lighthouse Performance 95+, žiadny layout shift.

## Design tokens

Definuj v `app/globals.css` ako CSS custom properties, namapuj do Tailwind theme.

```css
:root {
  --white:     #FFFFFF;
  --paper:     #F4F4F4;
  --ink:       #111111;
  --ink-muted: #6B6B6B;
  --line:      #E5E5E5;
  --sold:      #9A9A9A;

  --radius: 0;
  --shadow: none;
}
```

Pozadie stránky `--white`. Fotky produktov sedia na `--paper` — blok fotky sa sám definuje proti bielej stránke, nepotrebuje border. Akcent čierna — stránka bez chromatickej farby.

Typografická škála, nič medzi hodnotami: `11px / 13px / 15px / 18px / 24px / 32px / 48px`.

Vertikálny rytmus medzi sekciami: `64px` mobile, `96px` od `1024px`.

## Zákazy — explicitne

Najdôležitejšia časť špecifikácie. Nedodržanie = nesprávny výstup.

- `border-radius` **vždy 0**. Karty, buttony, inputy, obrázky, badge, všetko. Nikdy `rounded`, `rounded-sm`, `rounded-md`, `rounded-full`.
- `box-shadow` **nikdy**. Žiadny `shadow-sm`, `shadow-md`, `drop-shadow`.
- Žiadne gradienty, žiadny `backdrop-blur`, žiadny glassmorphism.
- Žiadne ikony okrem košíka a hamburger menu. Trust sekcia iba text, nie ikony (žiadny truck, shield, star).
- Žiadne emoji, žiadne hviezdičkové ratingy, žiadne `✓` v texte.
- Žiadne pill buttony, chips, tagy s rádiusom.
- Žiadne sekundárne farby. Celý web čierna na bielej.
- Žiadny `transition` dlhší ako `150ms`. Animovať iba `opacity` a `border-color`. Žiadny hover lift, scale, zoom obrázka na hover.
- Žiadny auto-carousel, slideshow v hero, carousel dots.
- Žiadny Instagram feed embed — iba textový odkaz.
- Žiadne recenzie na detaile produktu (kus 1 z 1, sekcia vždy prázdna, vyzerá opustene). Recenzie na úrovni obchodu.
- Žiadne popupy, exit-intent modal, cookie banner s overlay.

## Komponenty

### WatchCard

```
border: none
border-radius: 0
box-shadow: none
fotka: aspect-ratio 4/5, object-cover, pozadie --paper
text blok: padding 16px
hover: iba border-color na --ink, nič iné
```

Obsah karty, v poradí:
1. Fotka
2. Značka + model — `15px`, serif
3. Referencia + rok — `11px`, mono, uppercase, `letter-spacing: 0.06em`, farba `--ink-muted`
4. Cena — `13px`, mono. Ak `status: sold`, prečiarknuté a farba `--sold`.
5. Badge iba ak `status` nie `available`: text `REZERVOVANÉ` alebo `PREDANÉ`, `11px` mono, farba `--sold`. Bez pozadia, bez rámu, bez červenej.

### Grid

Karty bez medzery medzi sebou — delia jednu hairline. Výsledok vyzerá ako mriežka, nie plávajúce boxy.

```
mobile:  1 kolóna
640px:   2 kolóny
1024px:  3 kolóny
gap: 1px
pozadie kontejnera gridu: #E5E5E5
```

### Button

```
primárny:    background #111111, text #FFFFFF, radius 0, padding 16px 24px, full-width na mobile
sekundárny:  background transparent, border 1px solid #111111, text #111111, radius 0
textový:     underline, text-underline-offset 3px
```

Text buttonov normálny case, nie uppercase. Uppercase iba pri mono meta labeloch.

### Input

Radius 0. Iba `border-bottom: 1px solid #111111`, ostatné strany transparentné. Bez `background`. Bez placeholder ikon.

### SectionDivider

Sekcie oddeľuj `1px solid #E5E5E5` na plnú šírku viewportu. Neoddeľuj zmenou pozadia ani veľkým paddingom. Celý web jedna biela plocha rozdelená linkami.

## Typografia

```
Nadpisy:  serif 400 — Instrument Serif (fallback Georgia, serif)
Telo:     sans 400 — Inter (fallback system-ui, sans-serif)
Meta:     mono 400 — JetBrains Mono (fallback ui-monospace, monospace)
```

Mono na referencie, roky, ceny, sériové čísla, `1 z 1`, veľkosti puzdra. Vždy uppercase s `letter-spacing: 0.06em`. Mono na číslach jediná dekorácia celého webu — vyzerá technicky, hodí sa k referenciám.

Fonty cez `next/font` s `display: swap` a subsetom `latin-ext` (treba slovenskú diakritiku).

## Routy

```
/                     Home
/watches              Katalóg s filtrami
/watches/[slug]       Detail hodinky
/archive              Predané kusy
/about                Filozofia a kto sme
/authentication       Ako overujeme a servisujeme
/sell                 Predaj alebo komisia
/journal              Články
/journal/[slug]       Článok
/faq
/contact
```

## Dátový model

Jedna hodinka = jeden MDX súbor v `/content/watches/`. Fotky v `/public/watches/[reference]/`.

Frontmatter presne takto — polia pomenované tak, aby sa neskôr 1:1 namapovali na Shopify produkt pri migrácii na platby.

```yaml
---
slug: omega-seamaster-2846-black-dial-unpolished
brand: Omega
model: Seamaster
reference: "2846"
year: 1958
serialPrefix: "16xxxxxx"
caliber: Cal. 501
caseSize: 34
caseMaterial: Ocel
dial: Čierny, originálny
casePolish: Nepolírované
set: Iba hodinky
service: Servis 03/2026, vlastný hodinár
warranty: 12 mesiacov
price: 2400
currency: EUR
status: available
images:
  - 01-dial.jpg
  - 02-three-quarter.jpg
  - 03-profile.jpg
  - 04-lugs-macro.jpg
  - 05-dial-macro.jpg
  - 06-caseback.jpg
  - 07-crown.jpg
  - 08-lume-uv.jpg
  - 09-wrist.jpg
---
```

`status` tri hodnoty: `available`, `reserved`, `sold`.

Pole `water resistance` nikdy nepridávaj. Pri vintage právne riziko a nikto tomu neverí.

Sériové číslo publikuj vždy iba čiastočne (`16xxxxxx`), nikdy celé.

Vytvor typovaný loader v `/lib/watches.ts` — parsuje frontmatter, validuje cez Zod, exportuje `getAllWatches()`, `getWatchBySlug()`, `getAvailableWatches()`, `getSoldWatches()`.

## Sekcie — Home

### Nav

Sticky, výška 56px, pozadie `--white`, spodná hairline `--line`. Vľavo wordmark `unpolished` lowercase v serif. Vpravo odkazy `Hodinky`, `Journal`, `O nás`, `Kontakt`. Mobile hamburger otvorí full-screen biely panel s odkazmi `24px` serif, bez animácie okrem `opacity`.

Žiadny košík (nemáme platby).

### Hero

Jedna fotka jednej hodinky, full-bleed, `aspect-ratio 4/5` mobile a `16/9` od `1024px`. Pod ňou nadpis `32px` mobile / `48px` desktop v serif, jedna veta `15px`, jeden primárny button.

Copy: nadpis `Hodinky s históriou.` Podnadpis `Nepolírované, neprerobené, overené. Každý kus je jediný.` Button `Prezrieť kolekciu`.

Bez slideshow, bez video autoplay, bez overlay textu na fotke.

### Trust strip

Štyri krátke tvrdenia, `11px` mono uppercase, oddelené vertikálnymi hairlines. Mobile horizontálny scroll bez scrollbaru.

Text: `Overené odborníkom` / `12 mesiacov záruka` / `14 dní na vrátenie` / `Doprava zdarma EU`

Bez ikon.

### Aktuálne kusy

Nadpis sekcie `24px` serif `Aktuálne kusy`. Pod ním veta `Každý kus je jediný. Keď zmizne, zmizne.`

Grid max 6 kariet, len `status: available`, radené najnovšie prvé. Pod gridom textový odkaz `Všetky hodinky`.

### Prečo nepolírované

Dva stĺpce od `1024px`, mobile stohované. Vľavo makro fotka lugov, vpravo text: 4 vety — polírovanie odstraňuje kov, ničí originálne fazety a lugy, nezvratne znižuje hodnotu kusu. Zakonči textovým odkazom `Naša filozofia`.

Edukačná sekcia a hlavný diferenciátor. Nesmie znieť ako marketing — fakty o kove.

### Proces overenia

Tri kroky, číslované `01`, `02`, `03` v mono `11px`. Nadpis kroku `18px` serif, pod ním veta. Vertikálne na mobile, tri kolóny od `1024px`.

Kroky: `01 Zdroj` / `02 Kontrola a servis` / `03 Foto a listing`

### Prehľad podľa

Nie obrázkové kategórie — textové odkazy v troch skupinách, každá s mono nadpisom:

- `PODĽA DEKÁDY` — 50s, 60s, 70s, 80s
- `PODĽA ZNAČKY` — dynamicky z inventára
- `PODĽA CENY` — do 500 €, 500–1500 €, 1500 € a viac

Odkazy vedú na `/watches` s query parametrom.

### Journal preview

Dva až tri články. Každý: nadpis `18px` serif, dátum `11px` mono, veta výňatku. Bez thumbnailov — čistý text drží stránku tichú.

### Newsletter

Kritická sekcia pri 1-of-1 inventári. Nadpis `Nové kusy oznamujeme e-mailom prvý.` Veta `Väčšina kusov sa predá do 48 hodín od zverejnenia.`

Jeden email input (border-bottom only) + primárny button `Odoslať`. Bez popupu, bez discount promo.

### Footer

Dve kolóny mobile, štyri od `1024px`. Odkazy, Instagram ako text, obchodné podmienky, ochrana údajov, VAT info, `© 2026 unpolished`.

## Sekcie — Katalóg `/watches`

Nad gridom riadok filtrov v `11px` mono uppercase: značka, dekáda, cena, dostupnosť. Filtre = textové odkazy alebo native `<select>` bez custom stylingu, nie custom dropdowny.

Radenie: `Najnovšie`, `Cena rastúco`, `Cena klesajúco`.

Počet výsledkov v mono: `14 KUSOV`.

Filtrovanie URL-driven (`?brand=omega&decade=60s`) — stavy zdieľateľné a indexovateľné. Bez client-side state knižnice.

Predané kusy do gridu nezobrazuj, iba ak zákazník zapne `Zobraziť predané`.

## Sekcie — Detail hodinky `/watches/[slug]`

Najdôležitejšia stránka. Poradie = poradie dôkazov, nesmie sa meniť.

1. **Galéria** — 9 až 11 fotiek. Mobile vertikálny scroll s jednou fotkou na obrazovku, nie swipe carousel. Od `1024px` dva stĺpce fotiek vľavo, sticky info panel vpravo. Zoom na klik (lightbox, biele pozadie, radius 0, zatvorenie na Esc a klik mimo).

2. **Titulok** — `H1`, `24px` mobile / `32px` desktop, serif. Formát: `Značka + Model + Referencia + atribút ciferníka + materiál + Unpolished/Full Set`. 8–15 slov. Referencia musí byť v `H1` — ľudia googlia referencie, nie modely.

3. **Cena a stav** — cena `24px` mono. Pod ňou `1 z 1` v `11px` mono. Ak `reserved` alebo `sold`, namiesto ceny stav.

4. **CTA** — dva buttony, mobile v sticky bare na spodku obrazovky.
   - Primárny `Napíšte nám` — otvorí formulár s predplnenou referenciou.
   - Sekundárny `WhatsApp` — `https://wa.me/<číslo>?text=` s URL-encoded predplnenou správou: značka, model, referencia.
   Pri `status: reserved` buttony disabled s textom `Rezervované`. Pri `sold` nahraď CTA odkazom `Podobné kusy`.

5. **Špecifikácie** — definition list, mono labely `11px` uppercase, hodnoty `15px` sans. Riadky oddelené hairline. Presne tieto polia a nič viac:

   `Referencia` / `Rok` / `Kaliber` / `Priemer puzdra` / `Materiál` / `Ciferník` / `Stav puzdra` / `Set` / `Servis` / `Záruka`

   Max 10 polí. Menta Watches má 5, Bulang 8. Dlhá tabuľka znižuje dôveru, nezvyšuje ju.

6. **Popis** — dvojvrstvový, presne dva odstavce, spolu okolo 200 slov, prvá osoba.
   - Odstavec 1: model a história. Kedy referencia vznikla, prečo zaujímavá. SEO a edukácia.
   - Odstavec 2: tento konkrétny kus, brutálne konkrétne. Sériové číslo a datovanie, stav puzdra, stav ciferníka, originalita lume a ručičiek, stav bezelu, servisná história.

   Jazyk kopíruj z horného segmentu trhu: `nepolírované`, `ostré hrany`, `plné lugy`, `originálny`, `poctivý stav`. Nikdy `luxusný`, `exkluzívny`, `prémiový`. Iba pozorovania, žiadne adjektíva hodnoty.

   Chyby a opotrebenie píš tiež. Poctivý condition report zvyšuje dôveru viac než skrývanie a znižuje počet vrátení.

7. **Accordiony** — natívny `<details>`, bez ikon, bez animácie výšky. `Servis a záruka` / `Doprava a vrátenie` / `Prečo kúpiť u nás`

8. **Podobné kusy** — 3 karty, rovnaká značka alebo dekáda.

## Fotky — pravidlá pre implementáciu aj pre produkciu obsahu

Konzistencia celý trik. To isté pozadie, ten istý crop, to isté svetlo pri každom kuse. Grid u Wind Vintage vyzerá drahšie nie kvalitou jednej fotky, ale tým, že všetkých 130 identicky nasvietených.

Pozadie jednotné `#F4F4F4` bez švov. Žiadne drevo, kamene, mach, káva, koža, žiadny lifestyle stock. Jeden veľký difúzny zdroj svetla zhora-zboku plus odrazka, bez tvrdých tieňov a bez viacnásobných odleskov na skle.

Barvy kalibrované na neutrálny biely bod. Vintage ciferník sa nikdy nefarbí do teplejšieho tónu — patina musí byť presne taká, aká je. Prefarbená patina = vrátený kus a zničená reputácia.

Ručičky na 10:10, korunka vpravo, dátum na 1 alebo 28.

Shot list, presne v tomto poradí v galérii — poradie fotiek je poradie dôkazov:

1. `01-dial` — ciferník zhora, 0°, kolmo. Hero fotka, hodinka v strede, zaberá 80% rámu. Fotka do gridu.
2. `02-three-quarter` — 3/4 uhol, cca 35° zhora. Dá objem puzdru a remienku.
3. `03-profile` — bočný profil, presne 0°, výška očí. Ukazuje hrúbku puzdra a nedotknutú fazetu.
4. `04-lugs-macro` — lugy makro, nízky uhol, šikmé svetlo. **Najdôležitejšia fotka celého brandu.** Šikmé svetlo vykreslí originálnu ostrú hranu medzi hornou plochou a bokom lugu. Fyzický dôkaz, že kus nikto neprepolíroval. Bez tejto fotky je `unpolished` len tvrdenie.
5. `05-dial-macro` — makro 1:1 na indexy, lume plots, potlač, hairlines.
6. `06-caseback` — zadné puzdro kolmo. Ostrosť rytiny, servisné rytiny.
7. `07-crown` — korunka a tlačidlá zblízka. Originalita a opotrebenie.
8. `08-lume-uv` — UV lume shot, tmavé pozadie, UV lampa. Reakcia radia alebo trícia. Zberatelia vyžadujú.
9. `09-wrist` — zápästie, prirodzené svetlo, jedna fotka. Iba mierka, nie lifestyle.

Voliteľné: `10-movement` ak bol servis (dokazuje ho) a `11-full-set` ak je box a papiere.

Deväť kurátorovaných fotiek bije 25 chaotických.

Technicky: master 3000px a viac pre zoom, export 1600px WebP cez `next/image`. Grid crop `4/5` vertikálne, detailné makro `1/1`. Vždy nastav `width` a `height`, nech nevznikne layout shift. `priority` iba na hero a prvú fotku detailu.

## Formulár a odosielanie

Route handler `app/api/inquiry/route.ts`, posiela cez Resend.

Polia: meno, email, správa. Pri dopyte na konkrétny kus predplň správu referenciou a modelom. Skrytý honeypot proti botom, žiadna CAPTCHA. Rate limit v pamäti route handlera.

Newsletter posielaj do rovnakého endpointu s iným `type`, alebo do Resend Audiences.

## Fázy

Nerob všetko naraz. Jeden mega-prompt na celý web dá priemerný výsledok všade.

- **Fáza 1** — tokeny, fonty, layout shell, Nav, Footer, SectionDivider, Button, Input. Žiadny obsah.
- **Fáza 2** — dátový model, loader, Zod schéma, WatchCard, Grid, `/watches` s filtrami.
- **Fáza 3** — detail hodinky s galériou, lightboxom, špecifikáciami, CTA, accordionmi.
- **Fáza 4** — Home so všetkými sekciami.
- **Fáza 5** — Journal, statické stránky, formuláre, `/archive`.
- **Fáza 6** — SEO, metadata, `JSON-LD` Product schema, sitemap, OG obrázky.

## Acceptance criteria

Hotové = všetko nižšie platí. Skontroluj a nahlás každý bod.

- Žiadny `border-radius` väčší ako 0 nikde v CSS ani v Tailwind triedach.
- Žiadny `box-shadow` ani `drop-shadow` nikde.
- Žiadny gradient, žiadny `blur`.
- Presne tri fonty, nič viac.
- Žiadna chromatická farba v CSS — iba biela, čierna a šedé z tokenov.
- Žiadna `transition` dlhšia ako 150ms a žiadna na inej vlastnosti než `opacity` a `border-color`.
- Žiadna ikona okrem hamburgeru.
- Žiadna závislosť na UI knižnici ani animačnej knižnici v `package.json`.
- Detail hodinky má sekcie v presnom poradí 1–8 zo špecifikácie.
- Špecifikácie majú max 10 polí, neobsahujú water resistance.
- Sériové čísla v obsahu vždy iba čiastočné.
- `status: reserved` a `sold` menia CTA korektne.
- WhatsApp odkaz má správne URL-encoded predplnenú správu s referenciou.
- Každý `next/image` má `width` a `height`. CLS je 0.
- Lighthouse Performance 95+ na mobile, Accessibility 100.
- Klávesová navigácia funguje v galérii, lightboxe a mobile menu. Lightbox sa zatvára Escapom a vracia focus.
- Slovenská diakritika sa renderuje správne vo všetkých troch fontoch.
- Stránka funguje a je čitateľná s vypnutým JavaScriptom (okrem lightboxu).