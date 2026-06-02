---
name: object-storage-upload
description: Upload, back up, or archive a local file to object storage (AWS S3, Cloudflare R2, Google Cloud Storage, Azure Blob, MinIO, and 40+ backends) using the unified files-sdk (files-sdk.dev). Use when the user wants to save/push/store/back up a file to a bucket, mentions files-sdk, S3/R2/GCS/Azure, or wants to archive a downloaded file (e.g. a manual fetched via manualslib-fetch). Triggers: upload to bucket, back up file, store in object storage, S3, R2, GCS, Azure Blob, files-sdk.
---

# Store files in object storage with files-sdk

[files-sdk](https://files-sdk.dev) is a unified JS storage SDK: one `Files` class with ten
methods (`upload, download, head, exists, delete, copy, move, list, url, signedUploadUrl`)
that works identically across 40+ object/blob backends. You pick a backend by swapping one
adapter import — the calling code stays the same. This skill leads with **AWS S3 /
S3-compatible**; the swap note at the end covers the rest.

## When to use

- "Upload / push / store / back up / archive `<file>` to `<bucket>` (S3 / R2 / GCS / Azure)."
- "Save this manual (or any local file) to object storage."
- The user mentions `files-sdk`, an S3 bucket, or object storage generally.

## Steps

### 1. Install

Install the SDK plus only the chosen adapter's peer deps. For S3 / S3-compatible:

```bash
npm install files-sdk @aws-sdk/client-s3 @aws-sdk/s3-presigned-post @aws-sdk/s3-request-presigner
```

### 2. Configure credentials

The S3 adapter uses the **standard AWS credential chain** — no SDK-specific config needed.
Set, in the environment (or rely on a shared profile / IAM role):

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
```

For S3-compatible providers (R2, MinIO, Backblaze B2, DigitalOcean Spaces, Wasabi, …) also
pass their `endpoint` in the adapter options.

### 3. Upload

Write a small ESM script and run it with `node`. (This repo's convention is not to commit
helper scripts — author it ad hoc, e.g. `/tmp/upload.mjs`.)

```js
// upload.mjs
import { readFileSync } from "node:fs";
import { Files } from "files-sdk";
import { s3 } from "files-sdk/s3";

const files = new Files({
  adapter: s3({ bucket: "my-bucket", region: process.env.AWS_REGION }),
  // S3-compatible: adapter: s3({ bucket, region, endpoint: "https://<acct>.r2.cloudflarestorage.com" })
});

const localPath = process.argv[2];                 // e.g. ./Roland-Tr-8s.pdf
const key = process.argv[3] ?? localPath.split("/").pop();

await files.upload(key, readFileSync(localPath), { contentType: "application/pdf" });
console.log("uploaded", key);
```

```bash
node upload.mjs ./Roland-Tr-8s.pdf manuals/Roland-Tr-8s.pdf
```

Pass the right `contentType` for the file (`application/pdf`, `image/png`, …). For large
files, `files-sdk` handles multipart automatically; pass a stream instead of buffering if the
file is big.

### 4. Verify / fetch back

```js
await files.exists(key);          // -> true
const link = await files.url(key);// shareable/temporary URL (use signedUploadUrl for client-side puts)
const got  = await files.download(key);
```

## Swap to another backend

Change only the import and adapter — the ten methods are identical:

```js
import { r2 } from "files-sdk/r2";          // Cloudflare R2
import { gcs } from "files-sdk/gcs";        // Google Cloud Storage
import { azure } from "files-sdk/azure";    // Azure Blob
import { filesystem } from "files-sdk/filesystem"; // local, zero-credential (great for testing)
// const files = new Files({ adapter: filesystem({ root: "./store" }) });
```

Each adapter has its own peer deps and credential env vars (GCS uses Application Default
Credentials; Azure a connection string/account key; Vercel Blob `BLOB_READ_WRITE_TOKEN`; etc.)
— see the provider list at https://files-sdk.dev. The `filesystem` and `memory` adapters need
no credentials and are ideal for a quick round-trip smoke test before wiring real cloud creds.

## Notes

- A `files-sdk` **CLI** and read-only MCP server exist (commands `upload`/`download`/`list`/…),
  but the programmatic Node API above is the canonical, fully-documented path — prefer it.
- **Chaining:** pairs with the `manualslib-fetch` skill — fetch a manual to a local file, then
  upload that path here to archive it.
