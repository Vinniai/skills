# convex-best-practices — cost & efficiency analysis

How much cheaper is the converged eval-workspace result (a cheap model + the skill) than the comparable
more-expensive models? Short answer: on real-code review, **Haiku 4.5 + skill matches Opus-grade quality at
~5–6× lower cost**, and reaches a recall band (≥0.90) that **no un-skilled model hits at any price**.

## Pricing ($ per 1M tokens, from the Claude API reference)

| Model | Input | Output |
|-------|------:|-------:|
| Opus 4.8 (`claude-opus-4-8`) | $5.00 | $25.00 |
| Sonnet 4.6 (`claude-sonnet-4-6`) | $3.00 | $15.00 |
| Haiku 4.5 (`claude-haiku-4-5`) | $1.00 | $5.00 |

**The ladder is a clean 1 : 3 : 5** (Haiku : Sonnet : Opus) on **both** input and output. This matters for
the methodology below.

## Methodology & the token-split caveat

The eval harness logs **total** subagent tokens per run (input + output combined), not the split. A
per-token dollar figure therefore needs an input/output mix assumption. Two consequences, one of which is
very convenient:

1. **Cross-tier ratios are EXACT and split-independent.** Because each tier costs exactly k× another on
   *both* input and output (Opus = 5× Haiku, Sonnet = 3× Haiku, per token, at any mix), the cost *ratio*
   between two runs is `(price-ladder factor) × (token-count ratio)` — the input/output split cancels out.
   So every "× cheaper" number in this doc is exact, derived only from measured token counts.
2. **Absolute $/run carries the split assumption.** Only the absolute dollars depend on the mix. We report a
   **range** across plausible splits (70%–95% input — these are read-heavy review tasks: read the skill +
   file, emit a short findings list) with the ~85/15 midpoint called out. An exact absolute figure would
   require instrumenting real API calls for `usage.input_tokens` / `usage.output_tokens`; the harness does
   not expose that, and the ranges below bound it.

Blended rate at input-fraction *s*: Opus `25−20s`, Sonnet `15−12s`, Haiku `5−4s` ($/MTok).

## Real-code audit — cost per run

Measured tokens/time from the committed evals (baselines: iteration-3; with-skill: iteration-6 Haiku,
iteration-3 Sonnet/Opus). `$/run` shown as the 70–95%-input range with the 85/15 midpoint.

| Tier × condition | recall | avg tokens | $/run (range) | $/run (~85/15) | avg time |
|------------------|:------:|-----------:|:-------------:|:--------------:|:--------:|
| Haiku baseline   | 0.35 | 28.6k | $0.034–0.063 | **$0.046** | ~16s |
| **Haiku + skill** | **0.975** | 36.8k | $0.044–0.081 | **$0.059** | ~16s |
| Sonnet baseline  | 0.55 | 28.2k | $0.102–0.186 | $0.135 | ~18s |
| Sonnet + skill   | 1.00 | 35.3k | $0.127–0.233 | $0.169 | ~30s |
| Opus baseline    | 0.70 | 34.7k | $0.208–0.381 | **$0.277** | ~20s |
| Opus + skill     | 1.00 | 43.4k | $0.260–0.477 | $0.347 | ~24s |

## Efficiency multiples (exact — split-independent)

`ratio = price-ladder-factor × token-ratio`. These hold at *any* input/output mix.

| Comparison | quality | cost multiple | how it's computed |
|------------|---------|:-------------:|-------------------|
| **Haiku+skill** vs **Opus default** | 0.975 vs 0.70 | **4.71× cheaper** | 5 × (34.7k / 36.8k) |
| **Haiku+skill** vs **Opus + skill** | 0.975 vs 1.00 | **5.90× cheaper** | 5 × (43.4k / 36.8k) |
| **Haiku+skill** vs **Sonnet + skill** | 0.975 vs 1.00 | **2.88× cheaper** | 3 × (35.3k / 36.8k) |

The cheapest model with the skill **beats the most expensive model without it** on both quality (0.975 vs
0.70) and cost (4.7× less), and gets within 0.025 recall of Opus+skill for ~1/6th the price.

## Cost to reach a quality bar (the real lever)

| Target recall (real-code audit) | Cheapest way to get there | $/run (~85/15) |
|---|---|:---:|
| ≥ 0.90 | **Haiku + skill** | **$0.059** |
| 1.00 | Sonnet + skill | $0.169 |
| ≤ 0.70 (and no higher) | Opus **default** | $0.277 |

**No un-skilled (default) model reaches 0.90 at any price** — Opus default tops out at 0.70 for $0.28. The
skill doesn't just cut cost; it unlocks a quality tier you cannot buy with a bigger default model.

## Time

Wall-clock (16–30s) is noisy at n=2–4 and the weak axis; $/run is where the 3–6× separation lives. Notably
**Haiku+skill is also the fastest with-skill option** (~16s vs Sonnet ~30s / Opus ~24s) — the smaller model
emits tokens faster — so the cheap tier wins on cost *and* latency here.

## Secondary benchmark — knowledge quiz (iteration-2)

Same shape, smaller gap (defaults are stronger on a pointed quiz than on real code): Haiku+skill ~33.6k tok
(~$0.054 at 85/15) reaching 1.00, vs Opus default ~33.2k (~$0.266) at 0.875. Still ~5× cheaper at higher
quality. The real-code audit is the headline because that's where defaults actually fail.

## Multi-lens workflow (the comprehensive option)

The review workflow (4 lenses + adversarial verify, 26 Sonnet agents, 734.7k total tokens) ≈ **$2.6–4.9 /
file** (~$3.53 at 85/15) — roughly **21× a single Sonnet+skill pass** ($0.17). It returns the verified
*union* (20 findings spanning Convex + general logic + perf, 2 false positives dropped). That's the
CI-gate / high-value-file price point; route everyday review through the **$0.06 Haiku+skill** pass.

## Bottom line

The eval-workspace result, in cost terms: **a converged narrow skill makes the cheapest model (Haiku 4.5)
do Opus-grade real-code review at ~1/5–1/6th the cost and equal-or-better latency**, and lifts it into a
recall band (≥0.90) that the most expensive *default* model can't reach for any amount of money. Buy the
skill, not the bigger model — and reserve the multi-lens workflow (~20× the unit cost) for CI gates and
high-value files.

---

*Token/time figures: `iteration-2` (quiz), `iteration-3` (audit baselines + Sonnet/Opus skill),
`iteration-6` (Haiku skill, converged), and the `convex-multi-lens-review` workflow run. Pricing: Claude
API reference, Opus 4.8 / Sonnet 4.6 / Haiku 4.5. Absolute dollars use a 70–95% input-token assumption
(85/15 midpoint); cross-tier ratios are exact and assumption-free.*
