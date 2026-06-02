# retrieval

Skills for fetching documents and files from external sources.

- **[manualslib-fetch](./manualslib-fetch/SKILL.md)** — fetch a product manual from ManualsLib
  end-to-end and fully automatically: document data (title, TOC, per-page text), every page
  image, an assembled PDF, and push it all to object storage. Ships a tested pipeline
  ([`fetch-manual.mjs`](./manualslib-fetch/fetch-manual.mjs)) that rebuilds the manual from the
  site's open viewer assets (no reCAPTCHA, no user interaction) and stores via files-sdk. Pairs
  with `storage/object-storage-upload` for cloud-backend credential setup.
