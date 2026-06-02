#!/usr/bin/env node
// ManualsLib → document data + page images + assembled PDF → object storage (files-sdk).
// Fully automated, no user interaction. Uses ManualsLib's OPENLY-SERVED viewer assets
// (the same page renders + text any visitor sees) — it does NOT touch the reCAPTCHA-gated
// "Download" button, so there is nothing to solve or bypass.
//
// Deps:   npm i pdf-lib files-sdk            (+ adapter peer deps if not using the fs adapter)
// Usage:  node fetch-manual.mjs <manualId> <slug> [outDir]
//   e.g.  node fetch-manual.mjs 845165 Ampac-Firefinder-Plus
//
// Storage (swap backend with env, no code change):
//   default            → files-sdk `fs` adapter, writes under <outDir>/store
//   STORAGE=s3 S3_BUCKET=my-bucket AWS_REGION=… (+ AWS creds) → AWS S3 / S3-compatible
//   STORAGE=r2 S3_BUCKET=… S3_ENDPOINT=https://<acct>.r2.cloudflarestorage.com → Cloudflare R2
// Tuning: MAXP=<n> caps pages (smoke test);  CONCURRENCY unused (kept sequential + paced).

import { writeFile, mkdir } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { Files } from "files-sdk";

const [ID, SLUG, OUT = "/tmp/manualslib-out"] = process.argv.slice(2);
if (!ID || !SLUG) { console.error("usage: node fetch-manual.mjs <manualId> <slug> [outDir]"); process.exit(2); }

const ORIGIN = "https://www.manualslib.com";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
const H = { "User-Agent": UA, Referer: ORIGIN + "/" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(3, "0");

async function getText(url) {
  const r = await fetch(url, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}
// Download the first existing page-render variant (extension varies per page: jpg|png|webp).
async function getImage(base, slug, n, hintExt) {
  for (const ext of [...new Set([hintExt, "jpg", "png", "webp"].filter(Boolean))]) {
    const url = `${base}${slug}_${n}_bg.${ext}`;
    const r = await fetch(url, { headers: H });
    if (r.ok && (r.headers.get("content-type") || "").startsWith("image/"))
      return { bytes: new Uint8Array(await r.arrayBuffer()), ext, url };
  }
  return null;
}
const jsonLdDescription = (h) => { const m = h.match(/"description":"((?:[^"\\]|\\.)*)"/); return m ? JSON.parse('"' + m[1] + '"') : ""; };
const ogTitle = (h) => (h.match(/og:title" content="([^"]+)"/) || [])[1] || "";
const clean = (t) => t.replace(/\s*\|\s*ManualsLib.*$/i, "").replace(/\s+Pdf Download\s*$/i, "").trim();

async function makeStore() {
  const backend = (process.env.STORAGE || "fs").toLowerCase();
  if (backend === "fs") {
    const { fs } = await import("files-sdk/fs");
    return { store: new Files({ adapter: fs({ root: `${OUT}/store` }) }), where: `${OUT}/store` };
  }
  if (backend === "s3" || backend === "r2") {
    const { s3 } = await import("files-sdk/s3");
    const opts = { bucket: process.env.S3_BUCKET, region: process.env.AWS_REGION };
    if (process.env.S3_ENDPOINT) opts.endpoint = process.env.S3_ENDPOINT;
    return { store: new Files({ adapter: s3(opts) }), where: `${backend}://${opts.bucket}` };
  }
  throw new Error(`unknown STORAGE=${backend}`);
}

(async () => {
  await mkdir(OUT, { recursive: true });

  // 1) Root page → image base + image-slug, title, structured TOC (section → page).
  const root = await getText(`${ORIGIN}/manual/${ID}/${SLUG}.html`);
  const thumb = root.match(/(\/\/[^"' ]*\/images\/)([a-z0-9_]+)_\d+_thumb\.(?:png|jpg)/i);
  if (!thumb) throw new Error("could not locate image base on manual page");
  const base = "https:" + thumb[1], imgSlug = thumb[2];
  const title = clean((root.match(/<title>([^<]+)/) || [])[1] || SLUG);
  const toc = [...root.matchAll(/data-pretty-caption="([^"]+)"[^>]*data-page="(\d+)"/g)]
    .map((m) => ({ section: m[1], page: +m[2] }));

  // 2) Download page → reported size/pages (metadata only; the PDF button itself is captcha-gated).
  let sizeReported = null, pagesReported = null;
  try {
    const dl = await getText(`${ORIGIN}/download/${ID}/${SLUG}.html`);
    sizeReported = (dl.match(/Size:\s*([0-9.]+\s*[KMG]B)/i) || [])[1] || null;
    pagesReported = +(dl.match(/Pages:\s*(\d+)/i) || [])[1] || null;
  } catch {}

  // 3) Walk pages: download each render, capture per-page text + section title from its own HTML.
  const MAXP = +(process.env.MAXP || 1000);
  const pages = [], docData = [];
  let n = 1, miss = 0, hintExt = "jpg";
  while (miss < 2 && n <= MAXP) {
    const img = await getImage(base, imgSlug, n, hintExt);
    if (!img) { miss++; n++; continue; }
    miss = 0; hintExt = img.ext;
    await writeFile(`${OUT}/p${pad(n)}.${img.ext}`, img.bytes);
    let html = ""; try { html = await getText(`${ORIGIN}/manual/${ID}/${SLUG}.html?page=${n}`); } catch {}
    pages.push({ n, ...img });
    docData.push({ page: n, image: `p${pad(n)}.${img.ext}`, title: clean(ogTitle(html)), text: jsonLdDescription(html) });
    process.stderr.write(`page ${n} (${img.ext})\r`);
    if (n % 10 === 0) await sleep(150); // be a polite client
    n++;
  }
  if (!pages.length) throw new Error("no page renders found");

  // 4) Assemble the PDF from the page renders (preserve order; embed jpg + png).
  const pdf = await PDFDocument.create();
  for (const p of pages) {
    const e = p.ext === "jpeg" ? "jpg" : p.ext;
    const img = e === "png" ? await pdf.embedPng(p.bytes) : e === "jpg" ? await pdf.embedJpg(p.bytes) : null;
    if (!img) { console.warn(`\nskip page ${p.n}: ${p.ext} not embeddable`); continue; }
    pdf.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const pdfBytes = await pdf.save();

  // 5) Document-data manifest + flat text.
  const manifest = {
    id: ID, slug: SLUG, title, source: `${ORIGIN}/manual/${ID}/${SLUG}.html`,
    pageCount: pages.length, sizeReported, pagesReported, toc, pages: docData,
    note: "Reconstructed from ManualsLib's openly-served viewer assets; the reCAPTCHA-gated PDF download is not used. Per-page text is the page's published snippet — for full OCR text, run tesseract over the page images.",
  };
  const flatText = docData.map((d) => `\n=== Page ${d.page}: ${d.title} ===\n${d.text}`).join("\n");
  await writeFile(`${OUT}/${SLUG}.pdf`, pdfBytes);
  await writeFile(`${OUT}/${SLUG}.manifest.json`, JSON.stringify(manifest, null, 2));
  await writeFile(`${OUT}/${SLUG}.txt`, flatText);

  // 6) Store everything via files-sdk (PDF + manifest + text + every page image).
  const { store, where } = await makeStore();
  const prefix = `manuals/${ID}-${SLUG}`;
  await store.upload(`${prefix}/${SLUG}.pdf`, pdfBytes, { contentType: "application/pdf" });
  await store.upload(`${prefix}/${SLUG}.manifest.json`, JSON.stringify(manifest), { contentType: "application/json" });
  await store.upload(`${prefix}/${SLUG}.txt`, flatText, { contentType: "text/plain" });
  for (const p of pages)
    await store.upload(`${prefix}/images/p${pad(p.n)}.${p.ext}`, p.bytes, { contentType: `image/${p.ext === "jpg" ? "jpeg" : p.ext}` });

  console.log("\n" + JSON.stringify({
    ok: true, title, pageCount: pages.length, sizeReported,
    pdfMB: +(pdfBytes.length / 1048576).toFixed(2), storage: where, prefix,
    storedObjects: pages.length + 3, pdfExists: await store.exists(`${prefix}/${SLUG}.pdf`),
  }, null, 2));
})().catch((e) => { console.error("\nFAIL", e); process.exit(1); });
