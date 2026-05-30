# Iteration 11 — the fix-authoring stage (where does the cheap tier finally break?)

The last untested stage of the pipeline: **fix authoring** (identify → adjudicate → **fix**). This is the
one place judgment *and* code generation combine, so it's the candidate for "where the frontier tier finally
matters." **Result:** fix authoring is the **first stage where the cheap tier (Haiku) clearly falls short** —
not at finding the issue, but at the *completeness/correctness of the generated patch*. **But the floor is
Haiku, not frontier:** Sonnet matched Opus exactly. So the mid tier authors fixes fine; the cheap tier ships
plausible-but-incomplete patches.

## Setup

Three confirmed fitstake findings of escalating difficulty; Haiku+skill, Sonnet+skill, Opus+skill each
authored a patch (read the real code, produce the change + any deps). Two subtleties were planted:
- **B** — `expo-apple-authentication` is **not in package.json**, so a complete SIWA fix must *add* it (and
  wire the native credential to the `@convex-dev/auth` Apple provider), not just swap the component.
- **C** — "truly deletes" (5.1.1(v)) means deleting the **auth identity** (`authAccounts`/`authSessions`/
  `users`), not just the profile + data rows.

Scored 0/1/2 per finding (0 wrong/hallucinated · 1 partial/buggy · 2 correct+complete).

## Scores

| Finding (difficulty) | Haiku | Sonnet | Opus |
|---|---|---|---|
| A — `__DEV__`-gate `AutoAnonymousSignIn` (easy) | 2 | 2 | 2 |
| B — system SIWA button + add missing dep + wire credential (med) | **1.5** | 2 | 2 |
| C — delete account: all data tables **+ auth identity** + confirm + sign-out (hard) | **1** | 2 | 2 |
| **Total / 6** | **4.5** | **6** | **6** |

## Where Haiku fell short (and why it matters)

- **B — incomplete auth flow.** Haiku correctly added the dependency and rendered
  `AppleAuthenticationButton` (didn't hallucinate the package as present — good), **but kept
  `onPress={() => go('apple')}`**, where `go` just calls `signIn('apple')` with **no Apple credential**. The
  button looks right; pressing it doesn't actually authenticate against the convex Apple provider. Sonnet/Opus
  wired `AppleAuthentication.signInAsync()` → `signIn('apple', { idToken })` — the completing detail.
- **C — the account isn't actually deleted.** Haiku swept ~13 data tables but **omitted the auth-identity
  deletion** (`authAccounts`/`authSessions`/`users`), so the account remains and is recoverable — it fails the
  *"truly deletes, not deactivates"* core of 5.1.1(v). It also wrote a **broken query**
  (`withIndex('by_participant', q => q.eq('participantId', undefined))` with a "won't match, collect all"
  comment) and **assumed unverified index names**. Sonnet/Opus both *read the schema* (Sonnet 58 tool-uses)
  for real index names and deleted the auth identity; Opus additionally flagged the persona-wrapper guard
  edge case.

**The failure mode is the dangerous one.** At the *identify* stage the cheap tier fails by *omission*
(caught by fan-out). At the *fix* stage it fails by **plausible incompleteness** — a button that doesn't sign
in, an account that "looks deleted" but isn't, a query that silently no-ops. These *look done* and can ship.
That's why the cheap tier shouldn't author compliance fixes unattended.

## The boundary is Haiku→Sonnet, not Sonnet→Opus

Sonnet and Opus produced **functionally identical, complete** patches on all three (both added the dep + wired
the credential; both deleted the auth identity + confirm + sign-out). Opus's only edge was extra defensive
notes (the persona guard), not a correctness difference. So **fix authoring is well within Sonnet+skill's
reach**; Opus was not required even for the hardest, multi-file fix here.

## Process finding — fix-authors WRITE; isolate them

The Sonnet and Opus fix-authors **applied their edits to the fitstake working tree** (not just proposed them),
and two agents editing the same files in parallel left the tree incoherent. It was reverted (fitstake was
clean at session start; restored to committed state). **Lesson:** a real fix stage must run **isolated** —
`isolation: 'worktree'` per agent, or an explicit "propose a diff, do not apply" instruction — never let
parallel fix-authors mutate a shared tree. (Folding this into the audit skill's tiering note.)

## The complete pipeline — the cheap floor RISES with generativity

| Stage | Cheapest tier that works | Cheap-tier failure mode if pushed lower |
|---|---|---|
| **Identify** | Haiku+skill (steered fan-out → ceiling) | omission — recovered by more/steered finders |
| **Adjudicate** | Sonnet+skill (= Opus; iter-10) | — (Haiku untested here) |
| **Fix-author** | **Sonnet+skill** (= Opus) | **Haiku: plausible-but-incomplete patches (4.5/6)** — unsafe |
| **Hardest call** | Opus, on demand | luxury, not a required stage |

**Net recipe:** Haiku fan-out *identifies* → Sonnet *adjudicates and authors fixes* (in isolation) → Opus is
opt-in for the genuinely ambiguous call. The more generative the stage, the higher the minimum viable tier:
Haiku → Sonnet → (Opus rarely). The cheap tier is for finding, not for fixing.

## Next (iteration 12, optional)

- **Apply-and-build verification:** take Sonnet's three patches, apply them in a **worktree**, and run
  typecheck/build to confirm they're not just plausible but *compile-correct* (the one check this paper-grade
  eval can't make). That closes the loop from "reads correct" to "is correct."
- Re-run the fix stage on a finding requiring a design decision (not just a known-shape fix) to find whether
  *that* is finally an Opus-only stage.
