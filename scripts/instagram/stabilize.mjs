// Stabilizácia trasenia ruky pre záber z terénu (ffmpeg tu nemá vidstab a deshake nepomáha).
//   node scripts/instagram/stabilize.mjs <vstup> <výstup> [okno-snímok=45]
// Odhadne posun obrazu medzi snímkami (block matching so subpixelom na zmenšenom obraze), trajektóriu vyhladí
// kĺzavým priemerom a výrez 90 % obrazu posúva proti traseniu. Úmyselný pohyb kamery (pomalý najazd) ostane.
// Výstup má 90 % pôvodného výrezu; v clip.json potom použi zoom × 0,9.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";

const [input, output, win = "45"] = process.argv.slice(2);
if (!input || !output) throw new Error("Použitie: node scripts/instagram/stabilize.mjs <vstup> <výstup> [okno]");
const probe = (e) => execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", e, "-of", "csv=p=0", input]).toString().trim();
const [fw, fh] = probe("stream=width,height").split(",").filter(Boolean).map(Number);
const rot = Math.abs(Number(probe("stream_side_data=rotation").match(/-?\d+/)?.[0] ?? 0)) % 180 === 90;
const [W, H] = rot ? [fh, fw] : [fw, fh];
const color = (k) => execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", `stream=${k}`, "-of", "default=nw=1:nk=1", input]).toString().trim();
const [prim, trc, space] = ["color_primaries", "color_transfer", "color_space"].map(color);
const colorArgs = prim && prim !== "unknown" ? ["-color_primaries", prim, "-color_trc", trc, "-colorspace", space] : [];
const [num, den = 1] = probe("stream=r_frame_rate").replace(/,$/, "").split("/").map(Number);
const fps = num / den;
const SW = 240;
const SH = Math.round((H / W) * SW / 2) * 2;
const scale = W / SW;

// Malé sivé snímky.
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", input, "-vf", `scale=${SW}:${SH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
const n = raw.length / (SW * SH);
const frame = (i) => raw.subarray(i * SW * SH, (i + 1) * SW * SH);

const R = 10; // hľadanie ±10 px na malom obraze
const m = 24; // okraj, ktorý sa neporovnáva
function sad(a, b, dx, dy) {
  let s = 0;
  for (let y = m; y < SH - m; y += 2) {
    const ra = y * SW, rb = (y + dy) * SW + dx;
    for (let x = m; x < SW - m; x += 2) s += Math.abs(a[ra + x] - b[rb + x]);
  }
  return s;
}
const sub = (l, c, r) => { const d = l - 2 * c + r; return d > 0 ? (l - r) / (2 * d) : 0; };
const tx = [0], ty = [0];
for (let i = 1; i < n; i++) {
  const a = frame(i - 1), b = frame(i);
  let best = Infinity, bx = 0, by = 0;
  const cost = new Map();
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const s = sad(a, b, dx, dy);
    cost.set(`${dx},${dy}`, s);
    if (s < best) { best = s; bx = dx; by = dy; }
  }
  const c = (x, y) => cost.get(`${x},${y}`) ?? best;
  const fx = bx + sub(c(bx - 1, by), best, c(bx + 1, by));
  const fy = by + sub(c(bx, by - 1), best, c(bx, by + 1));
  // posun obsahu snímky i voči i-1 → kamera sa pohla opačne
  tx.push(tx[i - 1] + fx);
  ty.push(ty[i - 1] + fy);
}
// Vyhladená trajektória (kĺzavý priemer) a korekcia.
const w = Number(win), half = Math.floor(w / 2);
const smooth = (t) => t.map((_, i) => { let s = 0, k = 0; for (let j = Math.max(0, i - half); j <= Math.min(n - 1, i + half); j++) { s += t[j]; k++; } return s / k; });
let sx = smooth(tx), sy = smooth(ty);
// LOCK_FROM=sekundy: od tohto času drží obraz na mieste (lineárny trend namiesto kĺzavého priemeru), pre statický detail.
const lockFrom = process.env.LOCK_FROM ? Math.round(Number(process.env.LOCK_FROM) * fps) : null;
if (lockFrom !== null) {
  const lin = (t, s0) => {
    const ys = t.slice(lockFrom), k = ys.length, mean = ys.reduce((p, c) => p + c, 0) / k;
    const slope = ys.reduce((p, c, i) => p + (i - (k - 1) / 2) * (c - mean), 0) / ys.reduce((p, _, i) => p + (i - (k - 1) / 2) ** 2, 0);
    const fit = (i) => mean + slope * (i - lockFrom - (k - 1) / 2);
    // plynulý prechod 30 snímok z kĺzavého priemeru do zámku
    return t.map((_, i) => i < lockFrom - 30 ? s0[i] : i < lockFrom ? s0[i] + (fit(i) - s0[i]) * (i - lockFrom + 30) / 30 : fit(i));
  };
  sx = lin(tx, sx); sy = lin(ty, sy);
}
if (output === "-") {
  // Len meranie: rozptyl polohy v statickej časti (od 3 s), po odčítaní lineárneho trendu.
  const from = Math.round(3 * fps), xs = tx.slice(from), ys = ty.slice(from), k = xs.length;
  const detr = (a) => { const mean = a.reduce((p, c) => p + c, 0) / k; const slope = a.reduce((p, c, i) => p + (i - (k - 1) / 2) * (c - mean), 0) / a.reduce((p, _, i) => p + (i - (k - 1) / 2) ** 2, 0); return a.map((c, i) => c - mean - slope * (i - (k - 1) / 2)); };
  const dx = detr(xs), dy = detr(ys);
  const rms = Math.sqrt(dx.reduce((p, c, i) => p + c * c + dy[i] * dy[i], 0) / k) * scale;
  console.log(`statická časť: kolísanie polohy ${rms.toFixed(1)} px (pri šírke ${W})`);
  process.exit(0);
}
const cw = Math.round(W * 0.9 / 2) * 2, ch = Math.round(H * 0.9 / 2) * 2;
const mx = (W - cw) / 2, my = (H - ch) / 2;
const clamp = (v, lim) => Math.max(-lim, Math.min(lim, v));
let cmds = "";
for (let i = 0; i < n; i++) {
  const x = Math.round(mx + clamp((tx[i] - sx[i]) * scale, mx));
  const y = Math.round(my + clamp((ty[i] - sy[i]) * scale, my));
  cmds += `${(i / fps).toFixed(5)} crop x ${x}, crop y ${y};\n`;
}
const cmdFile = output + ".cmds.txt";
fs.writeFileSync(cmdFile, cmds);
const jitter = tx.map((v, i) => Math.hypot(v - sx[i], ty[i] - sy[i]) * scale);
console.log(`${n} snímok, priemerné trasenie ${(jitter.reduce((a, b) => a + b, 0) / n).toFixed(1)} px, max ${Math.max(...jitter).toFixed(1)} px`);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", input, "-vf", `sendcmd=f=${cmdFile},crop=w=${cw}:h=${ch}:x=${mx}:y=${my}`,
  // Zachová 10 bitov a farebné značky originálu (iPhone HDR/HLG), inak ďalší krok číta iný farebný priestor a obraz vybledne.
  "-c:v", "libx265", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p10le", "-tag:v", "hvc1",
  ...colorArgs, "-an", output], { stdio: "inherit" });
fs.rmSync(cmdFile);
console.log(output);
