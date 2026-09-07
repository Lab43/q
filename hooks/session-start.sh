#!/bin/bash
# SessionStart hook: one line of context carrying the resolved plugin root, so
# sessions can read the framework conventions without a q skill in play.
# ${CLAUDE_PLUGIN_ROOT} exists only inside plugin components, and the install
# path embeds the plugin version, so no doc can state the path durably —
# injecting it at session start is the only rot-free channel. Injecting the
# conventions' *content* here was rejected: too much forced into every
# consumer's context — the one-line path is the accepted footprint.

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
[ -d "$root/conventions" ] || exit 0

context="q plugin root: ${root} — framework conventions at ${root}/conventions/ (principles.md, documentation.md). Pointers to q framework docs in the agent briefing resolve against this path."

# Drift check, tag pins only: a sha pin (pre-first-release bootstrap) has
# nothing cheap to compare against, so it is skipped.
pin_file=".claude/q-marketplace/.claude-plugin/marketplace.json"
if [ -f "$pin_file" ]; then
  pinned=$(grep -o 'q--v[0-9][0-9.]*' "$pin_file" | head -1 | sed 's/^q--v//')
  installed=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$root/.claude-plugin/plugin.json" | head -1)
  if [ -n "$pinned" ] && [ -n "$installed" ] && [ "$pinned" != "$installed" ]; then
    context="${context} NOTE: this project pins q ${pinned} but the loaded q is ${installed} — run claude plugin install q@q-pin --scope project, then restart, to match the pin."
  fi
fi

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$context"
