// Vygeneruje 3D LUT (.cube) na prevod iPhone HDR videa (HLG, BT.2020) do SDR (BT.709),
// aby reely z terénu nevyzerali vyblednuté a ostalo 60 fps (avconvert pri SDR prevode zníži na 30 fps).
//   node scripts/instagram/hlg-lut.mjs <výstup.cube> [expozícia=1.0]
// Vstup LUT: nelineárny HLG signál v RGB (BT.2020). Výstup: BT.709 RGB s gamou BT.709.
import fs from "node:fs";

const [out, expArg = "1.0"] = process.argv.slice(2);
if (!out) throw new Error("Použitie: node scripts/instagram/hlg-lut.mjs <výstup.cube> [expozícia]");
const exposure = Number(expArg);
const N = 33;
const a = 0.17883277, b = 0.28466892, c = 0.55991073;
const hlgInv = (e) => (e <= 0.5 ? (e * e) / 3 : (Math.exp((e - c) / a) + b) / 12);
// BT.2020 → BT.709 (lineárne)
const M = [
  [1.6605, -0.5876, -0.0728],
  [-0.1246, 1.1329, -0.0083],
  [-0.0182, -0.1006, 1.1187],
];
const peak = 1000, ref = 203; // HLG: referenčná biela 203 cd/m² pri 1000 cd/m² displeji
const knee = (x) => (x <= 0.8 ? x : 0.8 + 0.2 * (1 - Math.exp(-(x - 0.8) / 0.2))); // jemné stlačenie svetiel
const oetf709 = (l) => (l < 0.018 ? 4.5 * l : 1.099 * Math.pow(l, 0.45) - 0.099);
let s = `TITLE "HLG BT.2020 to SDR BT.709"\nLUT_3D_SIZE ${N}\n`;
for (let bi = 0; bi < N; bi++) for (let gi = 0; gi < N; gi++) for (let ri = 0; ri < N; ri++) {
  const E = [ri, gi, bi].map((v) => hlgInv(v / (N - 1)));
  const Ys = 0.2627 * E[0] + 0.678 * E[1] + 0.0593 * E[2];
  const ootf = Math.pow(Math.max(Ys, 1e-6), 0.2); // systémová gama 1.2
  const disp = E.map((v) => (v * ootf * peak) / ref * exposure); // 1.0 = referenčná biela
  const lin = M.map((row) => row[0] * disp[0] + row[1] * disp[1] + row[2] * disp[2]);
  const o = lin.map((v) => oetf709(Math.min(1, knee(Math.max(0, v)))));
  s += o.map((v) => v.toFixed(6)).join(" ") + "\n";
}
fs.writeFileSync(out, s);
console.log(out);
