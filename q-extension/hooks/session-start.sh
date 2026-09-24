#!/bin/bash
# SessionStart hook entry point. The checks live in session-start.mjs; this
# wrapper exists so a missing node fails loud with a useful message instead of
# a cryptic exec error. Node is a given on a project that declares q, which
# arrives as an npm dependency. The gate below keeps the checks off projects
# that declare no q at all.

proj="${CLAUDE_PROJECT_DIR:-.}"
pkg="$proj/package.json"
[ -f "$pkg" ] || exit 0
# Match "@lab43/q" in key position only. As a value it is the name of q's own
# manifest, which declares no q. This stays a loose pre-filter: it also matches
# the key under dependencies. session-start.mjs exits silently unless the key
# is a devDependency.
grep -qE '"@lab43/q"[[:space:]]*:' "$pkg" 2>/dev/null
status=$?
# Exit only on a clean miss: the manifest was read and declares no q. Any other
# failure means the manifest could not be read, and a project that may well
# declare q must not be skipped silently — fall through and let the checks
# report it.
[ "$status" -eq 1 ] && exit 0

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

if ! command -v node >/dev/null; then
  # No node means the checks can't run — same remedy as any other failure.
  # Keep the message in sync with MESSAGE in session-start.mjs.
  printf '{"systemMessage":"The q plugin could not validate this project'"'"'s q setup, so its conventions and tooling may be stale or broken. Run /q:reconcile to repair it.","hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"The q plugin could not validate this project'"'"'s q setup, so its conventions and tooling may be stale or broken. Run /q:reconcile to repair it."}}\n'
  exit 0
fi

CLAUDE_PROJECT_DIR="$proj" CLAUDE_PLUGIN_ROOT="$root" exec node "$root/hooks/session-start.mjs"
