#!/bin/bash
# SessionStart hook entry point. The checks live in session-start.mjs; this
# wrapper exists so a missing node fails loud with a useful message instead of
# a cryptic exec error. Node itself is a given on q projects — q arrives as an
# npm dependency. The gate below also keeps the checks off projects that don't
# pin q, which is what keeps q's own repo quiet.

proj="${CLAUDE_PROJECT_DIR:-.}"
pkg="$proj/package.json"
[ -f "$pkg" ] || exit 0
# The quoted key, so a package merely starting with @lab43/q doesn't match.
# A loose pre-filter is fine: session-start.mjs exits silently unless the key
# is a devDependency.
grep -q '"@lab43/q"' "$pkg" || exit 0

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

if ! command -v node >/dev/null; then
  # No node means the checks can't run — same remedy as any other failure.
  # Keep the message in sync with MESSAGE in session-start.mjs.
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"The q plugin could not validate this project'"'"'s q setup, so its conventions and tooling may be stale or broken. Run /q:sync to repair it."}}\n'
  exit 0
fi

CLAUDE_PROJECT_DIR="$proj" CLAUDE_PLUGIN_ROOT="$root" exec node "$root/hooks/session-start.mjs"
