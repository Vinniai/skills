---
name: manualslib-fetch
description: Fetch a product manual from ManualsLib (manualslib.com) end-to-end and fully automatically — its document data (title, table of contents, per-page text), every page image, an assembled PDF, and push it all to object storage. Use when the user asks to get/download/fetch/archive a manual, user guide, service manual, or datasheet for a specific brand + model (e.g. "download the Roland TR-8S manual", "grab the AMPAC FireFinder manual and store it"). Triggers: manual, owner's/user/service manual, instruction manual, datasheet, manualslib, "fetch the PDF", "archive the manual".
---

# Fetch manuals from ManualsLib

ManualsLib (https://www.manualslib.com) is a free, no-signup library of 10M+ product
manuals with **no public API**. Its "Download" button is gated behind a **Google reCAPTCHA**
(a human must tick a box) — but the manual's **page renders and text are served openly to any
visitor**, with no captcha. So the reliable, no-user-interaction path is **Method A**: rebuild
the document from the open viewer assets (images + text), assemble a PDF, and store it. Only
reach for the captcha-gated official PDF (**Method B**) if a human is in the loop and you
specifically need ManualsLib's original file.

## When to use

- "Download / fetch / archive the manual (or user guide / service manual / datasheet) for `<brand> <model>`."
- "Get the `<product>` manual's images / text / PDF and store it in our bucket."
- The user names a specific product and wants its documentation as files.

If they only want an *answer from* a manual (one spec or step), skip the pipeline and just
`WebFetch` `…/manual/<ID>/<Slug>.html?page=<N>` — those pages are ungated.

## Method A — automated: data + images + PDF + storage (default, no user interaction)

### 1. Locate the manual page

Site-scoped `WebSearch` is the most reliable discovery path (the on-site search bot-blocks):

- Query `"<brand> <model> manual"` with `allowed_domains: ["manualslib.com"]`.
- Pick a result `https://www.manualslib.com/manual/<ID>/<Brand>-<Model>.html`
  (e.g. `…/manual/845165/Ampac-Firefinder-Plus.html`). The numeric **`<ID>`** and the
  **`<Slug>`** (the `Brand-Model` part) are the two inputs to the pipeline. If several variants
  exist (reference vs. service vs. quick-start), confirm which the user wants.

### 2. Run the pipeline

The bundled [`fetch-manual.mjs`](./fetch-manual.mjs) does the whole job. Install deps **in the
directory you run it from** (Node/ESM resolves `node_modules` relative to the script file, and
ignores `NODE_PATH`), then run:

```bash
mkdir manual-fetch && cd manual-fetch
cp /path/to/skills/retrieval/manualslib-fetch/fetch-manual.mjs .
npm init -y >/dev/null && npm i pdf-lib files-sdk

# default: stores to a local files-sdk `fs` bucket under <outDir>/store
node fetch-manual.mjs 845165 Ampac-Firefinder-Plus ./out

# or store straight to your own cloud (one env switch, no code change):
#   S3 / S3-compatible — also: npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
STORAGE=s3 S3_BUCKET=my-manuals AWS_REGION=us-east-1 \
  node fetch-manual.mjs 845165 Ampac-Firefinder-Plus ./out
#   Cloudflare R2: STORAGE=r2 S3_BUCKET=… S3_ENDPOINT=https://<acct>.r2.cloudflarestorage.com
```

It prints a JSON summary and writes, both locally under `./out` and into storage under
`manuals/<ID>-<Slug>/`:

- `<Slug>.pdf` — every page render assembled into a PDF
- `<Slug>.manifest.json` — **document data**: title, `pageCount`, reported size, full
  table of contents (`section → page`), and per-page `{title, text, image}`
- `<Slug>.txt` — flat per-page text
- `images/p001.…, p002.…` — the individual page renders

**Verified end-to-end** on `845165 / Ampac-Firefinder-Plus`: 96 page images, a 96-page **4.4 MB
PDF**, 119 TOC entries, and **99 objects stored** with `pdfExists: true`, in ~2.5 min (paced),
with zero user interaction and no reCAPTCHA.

### 3. How it works (so you can adapt without the script)

ManualsLib renders each manual page to an image and ships the page text/structure in the HTML:

- **Image base + slug:** on the manual page, any thumbnail URL
  `…/images/<imgSlug>_<n>_thumb.png` gives the CDN base path and `<imgSlug>` (e.g.
  `firefinder_plus`).
- **Page renders (ungated):** the full image is `…/images/<imgSlug>_<n>_bg.<ext>` — **the
  extension varies per page** (`_1_bg.jpg`, `_2_bg.png`, …), so try `jpg`, then `png`, then
  `webp`. Send `Referer: https://www.manualslib.com/`. Walk `n` upward until ~2 consecutive
  pages have no render — that's the page count.
- **Per-page text + section title:** fetch `…/manual/<ID>/<Slug>.html?page=<n>`; the
  `application/ld+json` `description` is the page's published text snippet and `og:title` is the
  section name.
- **Table of contents:** on the manual page, every `data-pretty-caption="…" … data-page="N"`
  pair is a section → page mapping.
- **Assemble + store:** combine the images with `pdf-lib` (`embedJpg`/`embedPng`), then push the
  PDF + manifest + text + images with `files-sdk` (`fs` adapter for local, `s3`/`r2`/… for cloud).

## Method B — official reCAPTCHA-gated PDF (only with a human in the loop)

The `…/download/<ID>/<Slug>.html` page's **"Get manual"** button is gated by a Google reCAPTCHA
("Please, tick the box below to get your link"). Verified: clicking it only fires the reCAPTCHA
`anchor`/`bframe` challenge — no PDF request is issued until a human ticks the box. **Do not
attempt to solve or bypass the reCAPTCHA** (intentional anti-bot control, against ToS). If the
user specifically needs ManualsLib's original file: open that URL in a visible browser (drive
navigation via the `agent-browser` skill / chrome-devtools MCP, or just hand the user the URL),
have **the user tick the box**, then capture the resulting download. For everything else, Method
A is strictly better — same content, fully automated.

## Notes

- **Responsible use:** these are ManualsLib's openly-served viewer assets (no access control
  circumvented), but still pace requests (the script does), honor `robots.txt`/ToS, and fetch
  manuals for legitimate personal/operational use — don't bulk-scrape.
- **Full OCR text (optional):** per-page text is the published snippet, not full body text. For
  complete searchable text, OCR the page images (`tesseract p*.png`) and fold it into the
  manifest. Not installed by default.
- **Image-only manuals:** if no `_<n>_bg.*` renders resolve, the manual is view-only — tell the user.
- **Storage deep-dive / swapping backends:** Method A already stores via files-sdk; see the
  `object-storage-upload` skill for credential setup and the full 40+ backend adapter list.
