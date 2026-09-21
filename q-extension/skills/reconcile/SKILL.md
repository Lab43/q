---
name: reconcile
description: Set up or repair this machine for a q-using project, handing off to /q:install, /q:update, or /q:uninstall-extension when the project's records don't match its pins. Use on a fresh clone or a new machine, or whenever the session-start check says the project's q setup did not validate. Never moves pins and never reconciles docs; the only tracked file it may touch is a lockfile a dependency install rewrites.
---

# Reconcile

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation is the agreement — proceed autonomously throughout. Reconcile delivers no repo change, so there is no branch, review mode, or PR.

## Step 1: Enforce the pins

Two states have nothing to reconcile yet. Propose `/q:install` and stop for either:

- The project declares no `@lab43/q` devDependency. It has no pins to enforce.
- It declares one but has no `.claude/q-state.json`. q's bytes arrived. The scaffold that records them has not run. This is the window between the bootstrap install and the first `/q:install`. It is the state the session-start check reports.

Otherwise enforce the pins per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via <https://cli.github.com> and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Compare pins against watermarks

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the version the project's lockfile resolves for `@lab43/q` and for each extension against its `reconciledAgainst` entry, and the version installed under `node_modules/` against the lockfile's, in both directions — the extensions are the direct dependencies, in `dependencies` and `devDependencies` alike, whose installed copy carries both halves of an extension's identity — the `q-extension` keyword and a payload directory (source: @lab43/q conventions/extensions.md, Identity). A dependency carrying the keyword, shipping no payload, and holding no `reconciledAgainst` entry is not an extension: leave it out of scope rather than reporting a missing record no skill could resolve. A watermarked package stays in scope however it changed, because a record already exists and only reconciliation or removal clears it

Each finding routes to its remedy:

- A lockfile version differing from its watermark (moved out of band, unreconciled) → `/q:update`, invoked bare once — a bare run covers every such finding.
- An entry for an extension in neither `dependencies` nor `devDependencies` (removed out of band, the removal never reconciled) → `/q:uninstall-extension`, with the extension name, one run per extension. Read both before reporting this: an extension held as a regular dependency is healthy, and reading `devDependencies` alone reports it as removed.
- No record where one belongs → `/q:install` — bare for a missing state file or a missing `@lab43/q` entry; with the extension name for any other declared extension that has no entry, from either, one run per extension. These were installed or scaffolded by hand, never recorded.

Never write the state file — watermarks certify reconciliation, and detection performs none (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

## Step 4: Report, then hand off

Report:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each finding from Step 3 and the remedy it routes to.

Then make Step 3's hand-offs — each invocation a full run of its own that asks and delivers for itself. Make the `/q:install` and `/q:uninstall-extension` runs before any `/q:update` run, so update starts from repaired records.
