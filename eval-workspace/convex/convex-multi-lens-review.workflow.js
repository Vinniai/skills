export const meta = {
  name: 'convex-multi-lens-review',
  description: 'Multi-lens Convex code review: fan out convex/correctness/performance/security lenses over one file, dedupe across lenses, adversarially verify each finding, emit a ranked report.',
  whenToUse: 'Reviewing a Convex function file when you want both the Convex-specific defects AND general logic/perf/security bugs, with false positives filtered by a verify pass.',
  phases: [
    { title: 'Find', detail: 'one isolated agent per review lens, in parallel' },
    { title: 'Verify', detail: 'adversarially refute each unique finding; drop the ones that misread the code' },
  ],
}

// Pass args.file (absolute path to the Convex file under review). args.skill is
// optional and defaults to this repo's convex-best-practices SKILL.md. The default
// file points at the in-repo synthetic fixture so the workflow self-tests out of the box.
const DEFAULT_FILE = 'eval-workspace/convex/iteration-3/fixtures/messages.ts'
const DEFAULT_SKILL = 'skills/convex/convex-best-practices/SKILL.md'
const file = (args && args.file) || DEFAULT_FILE
const skill = (args && args.skill) || DEFAULT_SKILL
if (!file) throw new Error('pass args.file (absolute path to the Convex file to review)')

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          loc: { type: 'string', description: 'function name' },
          issue: { type: 'string', description: 'short defect name' },
          why: { type: 'string', description: 'one-line explanation' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['loc', 'issue', 'why', 'severity'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    real: { type: 'boolean', description: 'true only if this is a genuine defect in THIS file' },
    severity: { type: 'string', enum: ['high', 'medium', 'low'] },
    reason: { type: 'string', description: 'quote the offending line if real, or explain the misread if not' },
  },
  required: ['real', 'severity', 'reason'],
}

const LENSES = [
  {
    key: 'convex',
    prompt: `FIRST read the Convex best-practices skill in full: ${skill}\nALSO read the sibling conventions.md in that same folder.\nTHEN read the target file in full: ${file}\n\nReview ONLY for Convex best-practice violations covered by the skill: missing/redundant indexes, .filter on a db query, unbounded .collect, Date.now()/Math.random() inside a query, missing argument validators, missing access control / spoofable id args, cron/scheduler/ctx.run* targeting a public function, runAction in the same runtime, sequential ctx.runQuery from an action, floating (un-awaited) promises. Do NOT report general logic bugs. Some code is deliberately correct (e.g. .filter() on an array AFTER a bounded .take(), or a function that already calls an auth helper) — do not flag it.`,
  },
  {
    key: 'correctness',
    prompt: `Read the target file in full: ${file}\n\nReview ONLY for general CORRECTNESS / logic bugs, ignoring Convex-framework specifics. Look for: undefined/null mishandling (e.g. \`x !== false\` that counts undefined as true), off-by-one, double-counting or overlapping buckets, duplicate/mislabeled return fields, using the wrong field as a proxy (e.g. createdAt for a status-change time), fragile free-text/substring parsing. Be precise and quote the construct; do not invent.`,
  },
  {
    key: 'performance',
    prompt: `Read the target file in full: ${file}\n\nReview ONLY for PERFORMANCE / scaling issues: aggregates (counts, sums, averages) computed over a .take(n)-truncated read that silently undercount once the table exceeds n; broad reads that load more than needed and could be scoped by an index; repeated/redundant work; N+1 patterns. Ignore pure style. Be precise.`,
  },
  {
    key: 'security',
    prompt: `Read the target file in full: ${file}\n\nReview ONLY for SECURITY / access-control issues: missing authentication on protected data, authorizing off a caller-supplied id, data exposure, public functions that should be internal. IMPORTANT: if a function already calls an auth/permission helper (e.g. requireOrgContext(...) / orgCtx.require(...)), it IS authorized — do not flag it as missing auth. Be precise.`,
  },
]

phase('Find')
const raw = await parallel(LENSES.map((l) => () =>
  agent(l.prompt, { label: `find:${l.key}`, phase: 'Find', schema: FINDINGS_SCHEMA, model: 'sonnet' })
))

const tagged = raw
  .map((r, i) => ({ r, lens: LENSES[i].key }))
  .filter((x) => x.r)
  .flatMap((x) => x.r.findings.map((f) => ({ ...f, lens: x.lens })))

function fnName(loc) { return String(loc).split(/[\s(:#]/)[0] }
function category(f) {
  const t = ((f.issue || '') + ' ' + (f.why || '')).toLowerCase()
  if (t.includes('date.now')) return 'date-now-in-query'
  if (t.includes('isbillable')) return 'isbillable-undefined'
  if (t.includes('truncat') || t.includes('.take(') || t.includes('silently') || t.includes(' cap')) return 'take-truncation'
  if (t.includes('index') && t.includes('nam')) return 'index-naming'
  if (t.includes('double') || t.includes('overlap') || t.includes('redundan') || t.includes('duplicate')) return 'double-count-or-dup'
  if (t.includes('createdat')) return 'createdat-proxy'
  if (t.includes('notes') || t.includes('free-text') || t.includes('substring') || t.includes('keyword')) return 'notes-parsing'
  if (t.includes('consisten') || t.includes('transaction')) return 'cross-query-consistency'
  if (t.includes('await')) return 'floating-promise'
  if (t.includes('validator')) return 'missing-validators'
  if (t.includes('auth') || t.includes('access') || t.includes('spoof')) return 'access-control'
  if (t.includes('.filter')) return 'filter-on-query'
  return (f.issue || '').toLowerCase().slice(0, 32)
}

const byKey = new Map()
for (const f of tagged) {
  const key = fnName(f.loc) + '|' + category(f)
  if (!byKey.has(key)) byKey.set(key, { loc: f.loc, issue: f.issue, why: f.why, lenses: new Set([f.lens]), key })
  else byKey.get(key).lenses.add(f.lens)
}
const unique = [...byKey.values()].map((f) => ({ ...f, lenses: [...f.lenses] }))
log(`${tagged.length} raw findings across ${LENSES.length} lenses -> ${unique.length} unique`)

phase('Verify')
const verified = await parallel(unique.map((f) => () =>
  agent(
    `Read the file ${file}. Adversarially verify this code-review finding — actively try to REFUTE it. If it is a genuine defect in THIS file, set real=true and quote the exact offending line(s). If the code is actually correct or the claim misreads it, set real=false and explain.\n\nFunction: ${f.loc}\nClaim: ${f.issue} — ${f.why}`,
    { label: `verify:${fnName(f.loc)}:${f.key.split('|')[1]}`, phase: 'Verify', schema: VERDICT_SCHEMA, model: 'sonnet' }
  ).then((v) => ({ ...f, verdict: v }))
))

const checked = verified.filter(Boolean)
const confirmed = checked.filter((f) => f.verdict.real)
const dropped = checked.filter((f) => !f.verdict.real)
const rank = { high: 0, medium: 1, low: 2 }
confirmed.sort((a, b) => (rank[a.verdict.severity] ?? 3) - (rank[b.verdict.severity] ?? 3))

log(`verified ${checked.length}: ${confirmed.length} confirmed, ${dropped.length} dropped`)

return {
  file,
  lenses: LENSES.map((l) => l.key),
  raw_count: tagged.length,
  unique_count: unique.length,
  confirmed: confirmed.map((f) => ({ loc: f.loc, issue: f.issue, why: f.why, severity: f.verdict.severity, lenses: f.lenses, evidence: f.verdict.reason })),
  dropped: dropped.map((f) => ({ loc: f.loc, issue: f.issue, lenses: f.lenses, why_dropped: f.verdict.reason })),
}
