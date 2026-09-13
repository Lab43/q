---
name: sync
description: Set up or repair this machine for a q-using project — the npm install, the pinned plugin install, the GitHub CLI check — and flag pins whose docs were never reconciled, routing those to an update run. Use on a fresh clone or a new machine, when the session-start hook reports drift, or whenever the local install may not match the pins. Never moves pins and never reconciles docs; the only file it may touch is a lockfile an npm sync rewrites.
---

# Sync

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation is the agreement — proceed autonomously throughout. Sync delivers no repo change, so there is no branch, review mode, or PR.

## Step 1: Enforce the pins

A project with no `.claude/q-marketplace/` has no pins to enforce — propose `/q:install-q` and stop. Otherwise run the enforcement procedure — `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via https://cli.github.com and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Compare pins against watermarks

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the plugin pin — the `q--v*` ref in `.claude/q-marketplace/.claude-plugin/marketplace.json` — against `scaffoldedAgainst`
- each doc pack's pin in `package.json` against its `reconciledAgainst` entry

A mismatch means the pin moved without the project's docs being reconciled. An absent file, or a pinned artifact with no entry, means reconciliation was never recorded — treat it as a mismatch too. Route each one: `/q:update-q` for the plugin or the framework pack, `/q:update-pack` for any other pack. Never write the state file — watermarks certify reconciliation, and sync never reconciles (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

## Step 4: Report

Close by reporting:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each pin-vs-watermark mismatch and the update run it routes to.
