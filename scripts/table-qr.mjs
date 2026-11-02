// Printable table QR codes: one HTML sheet per branch (a card per table,
// A4, six per page) plus a general menu QR, written to qr-codes/.
// Open a sheet in the browser and print it.
//
//   NEXT_PUBLIC_SITE_URL=https://example.com npm run qr
//   npm run qr -- https://example.com
//
// Print only once the final domain is set: the URL is inside the codes.
// Reads the same mock data and link helper as the site (Node strips the
// TypeScript types); once a dashboard exists, this moves there.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import { restaurantConfig } from "../src/config/restaurant.ts";
import { ordering } from "../src/data/mock/ordering.ts";
import { siteInfo } from "../src/data/mock/site-info.ts";
import { tableMenuPath } from "../src/lib/table-session.ts";

const OUT_DIR = "qr-codes";

// The URL as an argument (any shell), else the env var the site uses
const base = process.argv.slice(2).find((arg) => /^https?:\/\//.test(arg)) ?? process.env.NEXT_PUBLIC_SITE_URL;
if (!base) {
    console.error("Missing the site URL: npm run qr -- https://… (or set NEXT_PUBLIC_SITE_URL)");
    process.exit(1);
}
if (/localhost|127\.0\.0\.1/.test(base)) console.warn("Warning: these codes point to localhost (testing only).");

const url = (path) => new URL(path, base).toString();
const icon = `data:image/png;base64,${(await readFile("src/app/icon.png")).toString("base64")}`;
const { background, accent } = restaurantConfig.seo.shareColors;

const qrSvg = (link) =>
    QRCode.toString(link, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: background, light: "#ffffff" } });

const escape = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const card = async ({ title, subtitle, link }) => `
    <article class="card">
        <header><img src="${icon}" alt=""><span>${escape(restaurantConfig.name)}</span></header>
        <h2>${escape(title)}</h2>
        <div class="qr">${await qrSvg(link)}</div>
        <p class="cta">امسح الكود واطلب من طاولتك</p>
        <p class="sub">${escape(subtitle)}</p>
    </article>`;

const page = (title, cards) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>${escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;800&display=swap" rel="stylesheet">
<style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Tajawal, system-ui, sans-serif; color: ${background}; }
    .sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; }
    .card { height: 88mm; border: 1.5px solid ${accent}; border-radius: 6mm; padding: 4mm; display: flex; flex-direction: column; align-items: center; gap: 1mm; break-inside: avoid; }
    .card header { display: flex; align-items: center; gap: 2mm; font-weight: 800; font-size: 11pt; }
    .card header img { width: 7mm; height: 7mm; border-radius: 1.5mm; }
    .card h2 { margin: 0; font-size: 20pt; font-weight: 800; color: ${accent}; }
    .qr svg { width: 46mm; height: 46mm; display: block; }
    .cta { margin: 0; font-weight: 800; font-size: 11pt; }
    .sub { margin: 0; font-size: 8pt; opacity: 0.7; }
    .hint { font-size: 10pt; margin: 0 0 6mm; }
    @media screen { body { padding: 8mm; } }
    @media print { .hint { display: none; } }
</style>
</head>
<body>
<p class="hint">اطبعي هالصفحة (Ctrl+P)، A4، بدون هوامش إضافية.</p>
<div class="sheet">${cards.join("")}</div>
</body>
</html>`;

await mkdir(OUT_DIR, { recursive: true });
const written = [];

for (const setting of ordering.dineIn.branches) {
    const branch = siteInfo.branches.find((candidate) => candidate.id === setting.branchId);
    if (!branch || !setting.isEnabled || setting.tableCount < 1) continue;

    const cards = [];
    for (let table = 1; table <= setting.tableCount; table++) {
        cards.push(await card({ title: `طاولة ${table}`, subtitle: branch.name, link: url(tableMenuPath(branch.id, table)) }));
    }
    const file = join(OUT_DIR, `tables-${branch.id}.html`);
    await writeFile(file, page(`طاولات ${branch.name}`, cards));
    written.push(`${file} (${setting.tableCount} tables)`);
}

// General menu code: entrance, flyers, social posts
const menuFile = join(OUT_DIR, "menu.html");
await writeFile(menuFile, page("قائمة الطعام", [await card({ title: "قائمة الطعام", subtitle: url("/menu"), link: url("/menu") })]));
written.push(menuFile);

console.log(`QR codes for ${base}:\n  ${written.join("\n  ")}`);
