# Instagram koncepty (@unpolished.watch)

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

- Najprv čeština, potom za `—` krátko angličtina.
- Vecný zberateľský tón ako popisy na webe: rok, kaliber, priemer, stav (neleštené), servis, set, ťah/remienok. Jedna-dve vety príbehu modelu.
- Bez emoji. Cenu nikdy neuvádzaj, namiesto nej „Detail a cena na unpolished.cz, odkaz v bio.“
- Predaný kus: „Prodáno: …“, poďakovanie, odkaz na ďalšie kusy. Bez ceny.
- Okolo 10 cielených hashtagov: značka, model, typ (tuningfork, skindiver…), #vintagewatch, #unpolished, #watchcollector, #hodinky.
- Reel: hudba sa pridáva v Instagrame.

## Bio

Navrhovaný odkaz v bio: `https://unpolished.cz/?utm_source=instagram&utm_medium=social&utm_campaign=bio`

Médiá (`*.jpg`, `*.mp4`) sa necommitujú, dajú sa kedykoľvek vygenerovať znova. V gite ostávajú popisy.
