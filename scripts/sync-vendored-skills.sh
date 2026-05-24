#!/usr/bin/env bash
set -euo pipefail

# Re-copies the vendored skill trees from their sibling source repos into this
# repo, so the in-repo copies stay in sync with the originals.
#
#   skills/agent-sim/agent-sim/   <-  ../agent-sim/skills/agent-sim/
#   skills/agent-emulate/<svc>/   <-  ../agent-emulate/skills/<svc>/
#
# The repo-authored category README.md files are preserved. Removed source
# skills are pruned from the copy. Override source locations with the
# AGENT_SIM_SRC / AGENT_EMULATE_SRC env vars.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SIBLINGS="$(cd "$REPO/.." && pwd)"

AGENT_SIM_SRC="${AGENT_SIM_SRC:-$SIBLINGS/agent-sim/skills}"
AGENT_EMULATE_SRC="${AGENT_EMULATE_SRC:-$SIBLINGS/agent-emulate/skills}"

# rsync -a preserves the tree; --delete prunes skills removed upstream.
sync_dir() {
  local label="$1" src="$2" dest="$3" exclude="${4:-}"
  if [ ! -d "$src" ]; then
    echo "error: $label source not found: $src" >&2
    echo "       set ${label}_SRC to its skills/ directory and re-run." >&2
    return 1
  fi
  mkdir -p "$dest"
  if [ -n "$exclude" ]; then
    rsync -a --delete --exclude="$exclude" "$src/" "$dest/"
  else
    rsync -a --delete "$src/" "$dest/"
  fi
  echo "synced $label: $src -> $dest"
}

# agent-sim ships a single skill folder (+ references/, evals/).
sync_dir AGENT_SIM "$AGENT_SIM_SRC/agent-sim" "$REPO/skills/agent-sim/agent-sim"

# agent-emulate ships many service skills at the top level; keep our README.
sync_dir AGENT_EMULATE "$AGENT_EMULATE_SRC" "$REPO/skills/agent-emulate" "/README.md"

# Flag any vendored skill that isn't registered in plugin.json yet.
echo
echo "checking plugin.json registration..."
plugin="$REPO/.claude-plugin/plugin.json"
missing=0
while IFS= read -r -d '' skill_md; do
  rel="${skill_md#"$REPO"/}"
  dir="$(dirname "$rel")"
  if ! grep -q "\"./$dir\"" "$plugin"; then
    echo "  UNREGISTERED: ./$dir  (add it to $plugin)"
    missing=1
  fi
done < <(find "$REPO/skills/agent-sim" "$REPO/skills/agent-emulate" -name SKILL.md -print0)

if [ "$missing" -eq 0 ]; then
  echo "  all vendored skills are registered."
else
  echo "  ^ register the paths above, then commit."
fi
