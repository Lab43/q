#!/bin/bash
# SessionStart hook entry point. The checks live in session-start.mjs; this
# wrapper exists so non-q projects exit before paying node startup, and so a
# missing node fails loud with a useful message instead of a cryptic exec
# error. Node itself is a given on q projects — npm install is part of setup.

proj="${CLAUDE_PROJECT_DIR:-.}"
pin_file="$proj/.claude/q-marketplace/.claude-plugin/marketplace.json"
[ -f "$pin_file" ] || exit 0

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

if ! command -v node >/dev/null; then
  # No node means the checks can't run — same remedy as any other failure.
  # Keep the message in sync with MESSAGE in session-start.mjs.
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"The q plugin could not validate this project'"'"'s q setup, so its conventions and tooling may be stale or broken. Run /q:sync to repair it."}}\n'
  exit 0
fi

CLAUDE_PROJECT_DIR="$proj" CLAUDE_PLUGIN_ROOT="$root" exec node "$root/hooks/session-start.mjs"
