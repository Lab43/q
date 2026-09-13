#!/bin/bash
# SessionStart hook: enforce the project's q pins. Claude Code loads whatever
# plugin version is installed, so a session only learns of drift if something
# checks at session start — no other channel runs every session. Four checks,
# each silent when its inputs are missing: plugin installed vs pinned, plugin
# pin vs scaffold watermark, each pack's pin vs its reconciled watermark, and
# each watermarked pack's presence in node_modules at its pin.

proj="${CLAUDE_PROJECT_DIR:-.}"
pin_file="$proj/.claude/q-marketplace/.claude-plugin/marketplace.json"
[ -f "$pin_file" ] || exit 0

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
pinned=$(grep -o 'q--v[0-9][0-9A-Za-z.-]*' "$pin_file" | head -1 | sed 's/^q--v//')
installed=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$root/.claude-plugin/plugin.json" | head -1)

findings=""
add() { findings="${findings:+$findings }$1"; }

if [ -n "$pinned" ] && [ -n "$installed" ] && [ "$pinned" != "$installed" ]; then
  add "This project pins q $pinned but the loaded q is $installed — run /q:sync."
fi

state_file="$proj/.claude/q-state.json"
if [ -f "$state_file" ]; then
  scaffolded=$(sed -n 's/.*"scaffoldedAgainst"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$state_file" | head -1)
  if [ -n "$pinned" ] && [ -n "$scaffolded" ] && [ "$pinned" != "$scaffolded" ]; then
    add "The q pin ($pinned) differs from the version its scaffold last matched ($scaffolded) — run /q:update."
  fi

  # One "name": "version" pair per line inside reconciledAgainst; the format
  # guarantees one key per line (see references/q-state.md).
  entries=$(sed -n '/"reconciledAgainst"/,/}/p' "$state_file" |
    sed -n 's/^[[:space:]]*"\([^"]*\)"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1=\2/p')
  for entry in $entries; do
    pack="${entry%%=*}"
    mark="${entry#*=}"
    # Search only the devDependencies block, name regex-escaped — a pack name
    # matching a key elsewhere in package.json must not read as its pin.
    esc=$(printf '%s' "$pack" | sed 's/[].[\\*^$/]/\\&/g')
    pin=$(sed -n '/"devDependencies"/,/}/p' "$proj/package.json" 2>/dev/null |
      grep -o "\"$esc\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    [ -n "$pin" ] || continue
    if [ "$pin" != "$mark" ]; then
      add "$pack is pinned at $pin but its docs were last reconciled against $mark — run /q:update."
    fi
    inst=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$proj/node_modules/$pack/package.json" 2>/dev/null | head -1)
    if [ -z "$inst" ]; then
      add "$pack is pinned at $pin but not installed in node_modules — run /q:sync."
    elif [ "$inst" != "$pin" ]; then
      add "$pack is pinned at $pin but node_modules holds $inst — run /q:sync."
    fi
  done
fi

if [ -n "$findings" ]; then
  esc=$(printf '%s' "$findings" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$esc"
fi
