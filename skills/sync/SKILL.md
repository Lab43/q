---
name: sync
description: Set up or repair this machine for a q-using project, handing off to /q:install, /q:update, or /q:uninstall-extension when the project's records don't match its pins. Use on a fresh clone or a new machine, or whenever the session-start check says the project's q setup did not validate. Never moves pins and never reconciles docs; the only tracked file it may touch is a lockfile a dependency install rewrites.
---

# Sync

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation is the agreement — proceed autonomously throughout. Sync delivers no repo change, so there is no branch, review mode, or PR.

## Step 1: Enforce the pins

Locate q's pin first. `.claude/q-state.json` names the manifest holding it in its `manifest` key, and the pin is the project's own `package.json` wherever that key is absent (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md). A project with no state file at all has no key either, so its pin is the root manifest's too.

Two states have nothing to sync yet. Propose `/q:install` and stop for either:

- That manifest declares no `@lab43/q` devDependency. The project has no pins to enforce, or it authors an extension whose pin was never recorded. `/q:install` settles which, and never adds a pin beside one that already exists.
- It declares one but the project has no `.claude/q-state.json`. q's bytes arrived. The scaffold that records them has not run. This is the window between the bootstrap install and the first `/q:install`. It is the state the session-start check reports.

Otherwise enforce the pins per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via <https://cli.github.com> and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Compare pins against watermarks

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the pin of `@lab43/q`, in the manifest Step 1 located, against its `reconciledAgainst` entry, in both directions
- the pin of each extension in `package.json` against its `reconciledAgainst` entry, in both directions — the extensions are the direct `devDependencies` whose own `package.json` carries the `q-extension` keyword (source: @lab43/q conventions/extensions.md)

Each finding routes to its remedy:

- A pin differing from its watermark (moved out of band, unreconciled) → `/q:update`, invoked bare once — a bare run covers every such finding.
- An entry for an extension no longer in `package.json` (removed out of band, the removal never reconciled) → `/q:uninstall-extension`, with the extension name, one run per extension.
- `@lab43/q` declared in `package.json` as well as in a located manifest → two pins to drift apart (source: @lab43/q conventions/extensions.md, Pinning) → `/q:install`, invoked bare once. It relocates the pin to the manifest that should hold it.
- No record where one belongs → `/q:install` — bare for a missing state file or a missing `@lab43/q` entry; with the extension name for any other pinned extension that has no entry, one run per extension. These were installed or scaffolded by hand, never recorded.

Never write the state file — watermarks certify reconciliation, and sync never reconciles (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

## Step 4: Report, then hand off

Report:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each finding from Step 3 and the remedy it routes to.

Then make Step 3's hand-offs — each invocation a full run of its own that asks and delivers for itself. Make the `/q:install` and `/q:uninstall-extension` runs before any `/q:update` run, so update starts from repaired records.
