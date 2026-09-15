---
name: sync
description: Set up or repair this machine for a q-using project, handing off to /q:install, /q:update, or /q:uninstall-pack when the project's records don't match its pins. Use on a fresh clone or a new machine, or whenever the session-start check says the project's q setup did not validate. Never moves pins and never reconciles docs; the only tracked file it may touch is a lockfile a dependency install rewrites.
---

# Sync

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation is the agreement — proceed autonomously throughout. Sync delivers no repo change, so there is no branch, review mode, or PR.

## Step 1: Enforce the pins

A project with no `.claude/q-marketplace/` has no pins to enforce — propose `/q:install` and stop. Otherwise enforce the pins per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via https://cli.github.com and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Compare pins against watermarks

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the plugin pin — the version named by the `q--v*` ref in `.claude/q-marketplace/.claude-plugin/marketplace.json`, the tag less its `q--v` prefix — against `qReconciledAgainst`
- each doc pack's pin in `package.json` against its `docsReconciledAgainst` entry, in both directions — the doc packs are the direct `devDependencies` whose own `package.json` carries the `q-docs` keyword (source: q conventions/doc-packs.md)

Each finding routes to its remedy:

- A pin differing from its watermark (moved out of band, unreconciled) → `/q:update`, invoked bare once — a bare run covers every such finding.
- An entry for a pack no longer in `package.json` (removed out of band, the removal never reconciled) → `/q:uninstall-pack`, with the pack name, one run per pack.
- No record where one belongs → `/q:install` — bare for a missing state file or `qReconciledAgainst`; with the pack name for a pinned doc pack that has no entry, one run per pack. These were installed or scaffolded by hand, never recorded.

Never write the state file — watermarks certify reconciliation, and sync never reconciles (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

## Step 4: Report, then hand off

Report:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each finding from Step 3 and the remedy it routes to.

Then make Step 3's hand-offs — each invocation a full run of its own that asks and delivers for itself. Make the `/q:install` and `/q:uninstall-pack` runs before any `/q:update` run, so update starts from repaired records.
