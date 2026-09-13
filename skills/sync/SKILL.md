---
name: sync
description: Set up or repair this machine for a q-using project — the npm install, the pinned plugin install, the GitHub CLI check — handing off to /q:install or /q:update when the project's docs don't match its pins. Use on a fresh clone or a new machine, or whenever the session-start check says the project's q setup did not validate. Never moves pins and never reconciles docs itself; the only tracked file it may touch is a lockfile an npm sync rewrites.
---

# Sync

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation is the agreement — proceed autonomously throughout. Sync delivers no repo change, so there is no branch, review mode, or PR.

## Step 1: Enforce the pins

A project with no `.claude/q-marketplace/` has no pins to enforce — propose `/q:install` and stop. Otherwise run the enforcement procedure — `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via https://cli.github.com and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Compare pins against watermarks

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the plugin pin — the version named by the `q--v*` ref in `.claude/q-marketplace/.claude-plugin/marketplace.json`, the tag less its `q--v` prefix — against `scaffoldedAgainst`
- each doc pack's pin in `package.json` against its `reconciledAgainst` entry, in both directions — the doc packs are the direct `devDependencies` whose own `package.json` carries the `q-docs` keyword (source: q conventions/doc-packs.md)

Three kinds of finding:

- A pin disagreeing with its watermark: the pin moved out of band, unreconciled.
- No record where one belongs — the state file absent, `scaffoldedAgainst` missing, a pinned doc pack with no entry: installed or scaffolded by hand, never recorded.
- An entry for a pack no longer in `package.json`: removed out of band, the removal never reconciled.

Never write the state file — watermarks certify reconciliation, and sync never reconciles (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

## Step 4: Report, then hand off

Report:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each finding from Step 3.

Then hand off Step 3's findings, each invocation a full run of its own that asks and delivers for itself:

- No record where one belongs → `/q:install` — bare for the state file or `scaffoldedAgainst`; with the pack name for an unrecorded pack, one run per pack.
- A pin disagreeing with its watermark, or an entry for a removed pack → `/q:update`, invoked bare once — its sweep covers every such finding in one run.
