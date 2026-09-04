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
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$context"
