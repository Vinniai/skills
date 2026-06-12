#!/usr/bin/env bash
# Deterministic regression gate for the convex-doctor-fix skill.
#
# Asserts that applying the golden fix to the Convex Next.js example STRICTLY
# raises the react-convex-doctor score AND introduces zero new finding
# rule-classes. Fails (non-zero exit) if the doctor's score↔remedy relationship
# regresses — e.g. a doctor version bump, an example change, or a bad golden fix.
#
# Requires the sibling `convex-doctor` checkout (built). Override paths via env:
#   DOCTOR=/abs/path/to/packages/react-doctor/bin/react-doctor.js
#   EXAMPLE=/abs/path/to/examples/convex-nextjs
#
# Usage:  bash gate.sh        # prints before/after + PASS/FAIL, exits 0/1
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DOCTOR="${DOCTOR:-$HERE/../../../../convex-doctor/packages/react-doctor/bin/react-doctor.js}"
EXAMPLE="${EXAMPLE:-$HERE/../../../../convex-doctor/examples/convex-nextjs}"
GOLDEN="$HERE/golden/myFunctions.fixed.ts"

[ -f "$DOCTOR" ] || { echo "doctor bin not found: $DOCTOR (set DOCTOR=)"; exit 2; }
[ -d "$EXAMPLE" ] || { echo "example not found: $EXAMPLE (set EXAMPLE=)"; exit 2; }

WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
rsync -a --exclude node_modules --exclude .git --exclude .next --exclude .turbo "$EXAMPLE/" "$WORK/proj/" >/dev/null

scan() { node "$DOCTOR" "$WORK/proj" --json 2>/dev/null; }

BEFORE="$(scan)"
cp "$GOLDEN" "$WORK/proj/convex/myFunctions.ts"
AFTER="$(scan)"

BEFORE="$BEFORE" AFTER="$AFTER" python3 - <<'PY'
import json, os, sys
b = json.loads(os.environ["BEFORE"]); a = json.loads(os.environ["AFTER"])
bs, as_ = b["summary"]["score"], a["summary"]["score"]
brules = {x["rule"] for x in b["diagnostics"]}
arules = {x["rule"] for x in a["diagnostics"]}
new = sorted(arules - brules)
bcount = sum(1 for x in b["diagnostics"] if x["rule"].startswith("convex-"))
acount = sum(1 for x in a["diagnostics"] if x["rule"].startswith("convex-"))
print(f"score:           {bs} -> {as_}   (delta {as_-bs:+d})")
print(f"convex findings: {bcount} -> {acount}")
print(f"new rule classes introduced: {new if new else 'none'}")
ok = (as_ > bs) and (len(new) == 0)
print(f"\nGATE: {'PASS' if ok else 'FAIL'}  (require: score strictly up AND zero new rule classes)")
sys.exit(0 if ok else 1)
PY
