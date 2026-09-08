#!/bin/bash
# SessionStart hook: enforce the project's q pin. Claude Code loads whatever
# plugin version is installed, so a session only learns the pin is stale if
# something checks at session start — no other channel runs every session.

pin_file="${CLAUDE_PROJECT_DIR:-.}/.claude/q-marketplace/.claude-plugin/marketplace.json"
[ -f "$pin_file" ] || exit 0

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
pinned=$(grep -o 'q--v[0-9][0-9A-Za-z.-]*' "$pin_file" | head -1 | sed 's/^q--v//')
installed=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$root/.claude-plugin/plugin.json" | head -1)

if [ -n "$pinned" ] && [ -n "$installed" ] && [ "$pinned" != "$installed" ]; then
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"This project pins q %s but the loaded q is %s — run /q:update-q to sync."}}\n' "$pinned" "$installed"
fi
