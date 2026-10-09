// Zverejnenie konceptu na Instagram cez Instagram API (Facebook Login, stránka Unpolished ↔ @unpolished.watches).
//   node scripts/instagram/publish.mjs <slug> [--reel] [--publish]
// Bez --publish len pripraví kontajnery a overí, že ich Instagram spracoval; nič sa nezverejní.
// Token: INSTAGRAM_ACCESS_TOKEN v .env.local (gitignorovaný, používateľský token aplikácie unpolished-posts).
// Médiá musia byť verejne na webe:
// skript ich hľadá na https://unpolished.cz/ig/<slug>/, kam ich treba skopírovať (public/ig/) a pushnúť.
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const API = "https://graph.facebook.com/v26.0";
const IG_USER = "17841469954150828"; // @unpolished.watches
const SITE = "https://unpolished.cz";

const [slug, ...flags] = process.argv.slice(2);
if (!slug) throw new Error("Použitie: node scripts/instagram/publish.mjs <slug> [--reel] [--publish]");
const reel = flags.includes("--reel");
const publish = flags.includes("--publish");

const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
const token = env.match(/^INSTAGRAM_ACCESS_TOKEN=(.+)$/m)?.[1].trim();
if (!token) throw new Error("Chýba INSTAGRAM_ACCESS_TOKEN v .env.local");

const draft = path.join(ROOT, "instagram/drafts", slug);
const caption = fs.readFileSync(path.join(draft, "caption.md"), "utf8").trim();
const photos = fs.readdirSync(draft).filter((f) => f.endsWith(".jpg")).sort();
const url = (f) => `${SITE}/ig/${slug}/${f}`;

async function api(method, endpoint, params = {}) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = method === "GET" ? await fetch(`${API}${endpoint}?${body}`) : await fetch(`${API}${endpoint}`, { method, body });
  const json = await res.json();
  if (json.error) throw new Error(`${endpoint}: ${json.error.message}`);
  return json;
}

async function ready(id) {
  for (let i = 0; i < 60; i++) {
    const { status_code } = await api("GET", `/${id}`, { fields: "status_code" });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Kontajner ${id}: ${status_code}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`Kontajner ${id} sa nespracoval včas`);
}

// Instagram si médiá stiahne sám, preto najprv overím, že sú na webe.
const files = reel ? ["reel.mp4"] : photos;
for (const f of files) {
  const res = await fetch(url(f), { method: "HEAD" });
  if (!res.ok) throw new Error(`${url(f)} nie je dostupné (${res.status}), skopíruj médiá do public/ig/${slug}/ a pushni`);
}

const me = await api("GET", `/${IG_USER}`, { fields: "username" });
console.log(`Účet: @${me.username}`);

let container;
if (reel) {
  ({ id: container } = await api("POST", `/${IG_USER}/media`, { media_type: "REELS", video_url: url("reel.mp4"), caption, share_to_feed: "true" }));
} else if (photos.length === 1) {
  ({ id: container } = await api("POST", `/${IG_USER}/media`, { image_url: url(photos[0]), caption }));
} else {
  const children = [];
  for (const f of photos) children.push((await api("POST", `/${IG_USER}/media`, { image_url: url(f), is_carousel_item: "true" })).id);
  for (const c of children) await ready(c);
  ({ id: container } = await api("POST", `/${IG_USER}/media`, { media_type: "CAROUSEL", children: children.join(","), caption }));
}
await ready(container);
console.log(`Kontajner ${container} je pripravený (${reel ? "reel" : `${photos.length} fotiek`}).`);

if (!publish) {
  console.log("Nezverejnené. Na zverejnenie spusti znova s --publish.");
} else {
  const { id } = await api("POST", `/${IG_USER}/media_publish`, { creation_id: container });
  const { permalink } = await api("GET", `/${id}`, { fields: "permalink" });
  console.log(`Zverejnené: ${permalink}`);
}
