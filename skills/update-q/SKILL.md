---
name: update-q
description: Sync the installed q to the project's pins — plugin and conventions pack — and optionally move both to the latest releases, reconciling the project with what changed. Use when the session-start hook reports drift, after a q release ships, or whenever the pins may be behind; to audit docs without updating, use groom-docs.
---

# Update q

## Step 1: Take stock — two pins, three versions each

Versioned independently, moved together in one run:

- **Plugin**: pinned — the `ref` in `.claude/q-marketplace/.claude-plugin/marketplace.json`; installed — `version` in `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`; latest — the highest `q--v*` tag on `Lab43/q` (`gh api repos/Lab43/q/git/matching-refs/tags/q--v`).
- **Conventions pack**: pinned — `@lab43/q-conventions` in `package.json` `devDependencies`, which in a pack-authoring repo is the pack's own `package.json` (source: q conventions/doc-packs.md); installed — `version` in `node_modules/@lab43/q-conventions/package.json`; latest — `npm view @lab43/q-conventions version`.

Either pin missing → propose `/q:install-q`, which scaffolds the declarations, and stop. Otherwise report all six, then:

- **Installed ≠ pinned** → sync: `claude plugin install q@q-pin --scope project` then `/reload-plugins` for the plugin, `npm install` for the pack. Sync without asking — a pin is the project's recorded decision, and this merely enforces it. If a pin is also behind latest, settle the next branch's question first: taking the update makes this sync redundant (Step 3's installs land on the new pins); declining it is when this sync runs.
- **A pin behind latest** → diff pinned against latest for each artifact that moved: the plugin via `gh api repos/Lab43/q/compare/<pinned-tag>...<latest-tag>` (no clone or install needed); the pack by downloading both tarballs (`npm pack @lab43/q-conventions@<version>` into a scratch directory, extracted) and diffing their `conventions/`. Summarize what the releases change and what reconciliation they would demand of this project, then ask once: move both pins (Steps 2–4), or stay and sync to the current pins. Pins are recorded decisions — only the user moves them.
- **Everything equal** → report the project is current and stop.

## Step 2: Reconcile what the diff touched

Work only from the diffs:

- **The pack's `conventions/`** — hold the project's docs against each changed rule:
  - an override whose target updated to agree or disappeared is spent and comes out (source: q conventions/documentation.md, Two tiers of conventions)
  - a "(source: q …)" restatement is re-checked against its changed home
  - a project rule the new text now owns is duplication to prune
  - a project rule the new text contradicts is the one call the go-ahead didn't settle — ask: keep it as a recorded deviation (add the overrides marker) or adopt the framework rule. Adopting can leave code non-conforming — suggest `/q:evaluate` on the affected area; code fixes are out of scope here

  A pack authored in this repo is part of that surface — its docs re-checked the same way — and the moved pin is the pack's written-against declaration: this re-check is what moving it certifies (source: q conventions/doc-packs.md).

  Then sync the briefing's framework index lines to the new payload — a doc added or removed changes the list, a changed intro re-draws its blurb.
- **Installed doc packs** — each declares the framework version its docs are written against, via its `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md). A pack the moved pin leaves behind is flagged with a suggestion to run `/q:update-pack`, which closes the gap when a newer pack release does.
- **`skills/install-q/`** — re-run `/q:install-q` after Step 3: it is idempotent and adds only what's missing.

The go-ahead in Step 1 covered this reconciliation — apply it without re-asking.

## Step 3: Move the pins

1. Update the plugin pin in the project's marketplace file to the new release tag, then apply it: `claude plugin marketplace update q-pin`, then `claude plugin update q@q-pin --scope project`. If the content doesn't move, uninstall and reinstall `q@q-pin` — the plugin cache is keyed by version, so a pin move without a version change is otherwise invisible.
2. Move the pack pin: `npm install --save-dev --save-exact --ignore-scripts @lab43/q-conventions@<latest>`.
3. Run `/reload-plugins` — it loads the new plugin, hooks included, into the running session; the new pack docs are readable the moment `npm install` finishes.

## Step 4: Report

Old and new pins; what the release changed; each reconciliation applied and any follow-up suggested. Committing is the user's call.
