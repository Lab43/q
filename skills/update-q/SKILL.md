---
name: update-q
description: Sync the installed q to the project's pin, and optionally move the pin to the latest release, reconciling the project with what changed. Use when the session-start hook reports drift, after a q release ships, or whenever the pin may be behind; to audit docs without updating, use groom-docs.
---

# Update q

## Step 1: Take stock — three versions

1. **Pinned**: the `ref` in `.claude/q-marketplace/.claude-plugin/marketplace.json`. No pin → propose `/q:setup`, which scaffolds the declaration, and stop.
2. **Installed**: `version` in `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`.
3. **Latest**: the highest `q--v*` tag on `Lab43/q` (`gh api repos/Lab43/q/git/matching-refs/tags/q--v`).

Report the three, then:

- **Installed ≠ pinned** → sync: `claude plugin install q@q-pin --scope project` (a restart loads it). Sync without asking — the pin is the project's recorded decision, and this merely enforces it. If the pin is also behind latest, settle the next branch's question first: taking the update makes this sync redundant (Step 3's install lands on the new pin); declining it is when this sync runs.
- **Pinned behind latest** → diff the two (`gh api repos/Lab43/q/compare/<pinned>...<latest>` — no clone or install needed), summarize what the release changes and what reconciliation it would demand of this project, then ask: move the pin (Steps 2–4), or stay and sync to the current pin. The pin is a recorded decision — only the user moves it.
- **All three equal** → report the project is current and stop.

## Step 2: Reconcile what the diff touched

Work only from the diff:

- **`conventions/`** — hold the project's docs against each changed rule:
  - an override whose target updated to agree or disappeared is spent and comes out (source: q documentation.md, Two tiers of conventions)
  - a "(source: q …)" restatement is re-checked against its changed home
  - a project rule the new text now owns is duplication to prune
  - a project rule the new text contradicts is the one call the go-ahead didn't settle — ask: keep it as a recorded deviation (add the overrides marker) or adopt the framework rule. Adopting can leave code non-conforming — suggest `/q:evaluate` on the affected area; code fixes are out of scope here

  Then sync the briefing's framework index lines to the new payload — a doc added or removed changes the list, a changed intro re-draws its blurb.
- **`skills/setup/`** — re-run `/q:setup` after Step 3: it is idempotent and adds only what's missing.
- **Hooks or agents** — take effect only after a session restart; note it.

The go-ahead in Step 1 covered this reconciliation — apply it without re-asking.

## Step 3: Move the pin

1. Update the pin in the project's marketplace file to the new release tag.
2. Apply it: `claude plugin marketplace update q-pin`, then `claude plugin update q@q-pin --scope project`. If the content doesn't move, uninstall and reinstall `q@q-pin` — the plugin cache is keyed by version, so a pin move without a version change is otherwise invisible.
3. The running session keeps the old plugin loaded until restart.

## Step 4: Report

Old and new pins; what the release changed; each reconciliation applied and any follow-up suggested; what waits on the restart. Committing is the user's call.
