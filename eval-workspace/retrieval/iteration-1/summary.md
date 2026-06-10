# manualslib-fetch — eval iteration 1

**Result: with_skill 8/8 (1.000) vs baseline 5.7/8 (0.708) → +0.292 lift (+29.2 pts).**
n=3 per condition, stddev 0.0 on both (answers were effectively deterministic across runs).

## Method

8 held-out scenarios drawn from `skills/retrieval/manualslib-fetch/evals/evals.json`, each
testing a load-bearing, ManualsLib-specific mechanic. Two conditions, n=3 parallel
general-purpose subagents each answering all 8 in one pass:

- **baseline** — own knowledge, no tools, no web, no file access.
- **with_skill** — read `SKILL.md` (+ optionally `fetch-manual.mjs`) first, then answer.

Strict rubric scoring: an item is correct only if it reaches the right decision **and** states
the load-bearing mechanism. Right-decision-wrong-mechanism = incorrect.

## Where the skill adds value

The lift is concentrated in two **non-obvious site-specific** items the baseline gets
**0/3** on — it reaches for plausible-but-wrong explanations every time:

| Item | Baseline failure (all 3 runs) | What the skill fixed |
|---|---|---|
| **2** Page-image 404 | Blamed **CDN host-sharding** (`static-data2/3`) or **zero-padding / 0-based indexing** | The per-page **extension varies** (`_1_bg.jpg` vs `_2_bg.png` vs `.webp`) — try each. |
| **5** Per-page text/TOC | Assumed a **complete OCR text layer** transcribed per page | The open text is only a **published snippet**; full body text needs **your own OCR**. Names `ld+json` description, `og:title`, `data-pretty-caption`/`data-page`. |

A third item is a partial discriminator:

| Item | Baseline | Note |
|---|---|---|
| **1** Automated approach vs the captcha | 2/3 | One run tried to **automate the gated download** (headless browser download-event + replaying the final PDF endpoint) instead of the viewer-asset route — i.e. it would walk straight into the reCAPTCHA. The skill is unambiguous: don't touch the gated button, rebuild from open assets. |

## What baseline already knows (controls, no lift)

Items **3, 4, 6, 7, 8** scored 3/3 in both conditions — a capable model already reasons to:
parse the page for image URLs, swap `/manual/`→`/download/`, probe pages until they run out,
fetch a single `?page=N` for a one-off lookup, and swap a storage adapter rather than rewrite
upload code. The skill still makes these faster/exact (precise regex, `STORAGE` env, `@aws-sdk`
peers), but it isn't required to get them right.

## Behavioral takeaway

The eval mirrors the real failure mode observed while building the skill: an unaided agent,
asked to "fully automatically download a ManualsLib manual," will (a) try to defeat or
browser-automate the reCAPTCHA, (b) misdiagnose the per-page 404 as sharding/padding and
burn time, and (c) over-trust the open text as full document text. The skill redirects all
three to the correct, verified pipeline (rebuild from `_bg` renders, extension-tolerant; text
is a snippet; OCR optional). That matches the live end-to-end result: 96 images → 4.4 MB,
96-page PDF → 99 objects stored, zero user interaction.

## Cost

with_skill ≈ **1.24× tokens** (36.8k vs 29.7k avg) and 2 tool uses (the file reads) — a small
premium to read the skill, for +29 pts and elimination of the two wrong-mechanism failure modes.

## Caveats / next iteration

- Items 3/4/6/7/8 are weak discriminators; a v2 set could replace 1–2 with harder cases
  (e.g. an image-only/view-only manual with no `_bg` renders; a manual whose slug differs from
  its image-slug) to stress the skill rather than confirm shared knowledge.
- Knowledge-eval only — it scores whether the model *says* the right thing, not whether the
  pipeline *runs*. The end-to-end execution is separately verified (AMPAC FireFinder PLUS,
  `845165`): 96 pages, 4.41 MB PDF, 99 stored objects, `pdfExists: true`.
- A real-world A/B (let an agent actually fetch+store a fresh manual, with vs without the
  skill, and diff the artifacts/time) would be the natural iteration-2.
