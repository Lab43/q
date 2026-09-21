---
name: reconcile
description: Reconcile the project's records with what npm already did. A version move made out of band — an npm install, a teammate's merge, a Dependabot bump — is diffed, folded into the project's docs, and rewatermarked, and the change ships as a PR. Also sets up or repairs this machine for a q-using project — use it on a fresh clone, or whenever the session-start check reports drift. An extension's arrival still routes to /q:install and a departure to /q:uninstall-extension. A run finding nothing to reconcile repairs the machine, asks nothing, and stops.
---

# Reconcile

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Enforce the pins

Two states have nothing to reconcile yet. Propose `/q:install` and stop for either:

- The project declares no `@lab43/q` devDependency. It has nothing to enforce.
- It declares one but has no `.claude/q-state.json`. q's bytes arrived. The scaffold that records them has not run. This is the window between the bootstrap install and the first `/q:install`. It is the state the session-start check reports.

Otherwise enforce the pins per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via <https://cli.github.com> and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Take stock

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the version the project's lockfile resolves for `@lab43/q` and for each extension against its `reconciledAgainst` entry, and the version installed under `node_modules/` against the lockfile's, in both directions — the extensions are the direct dependencies, in `dependencies` and `devDependencies` alike, whose installed copy carries both halves of an extension's identity — the `q-extension` keyword and a payload directory (source: @lab43/q conventions/extensions.md, Identity). A dependency carrying the keyword, shipping no payload, and holding no `reconciledAgainst` entry is not an extension: leave it out of scope rather than reporting a missing record no skill could resolve. A watermarked package stays in scope however it changed, because a record already exists and only reconciliation or removal clears it

Each finding routes to its remedy:

- A lockfile version differing from its watermark (moved out of band, unreconciled) — a version move: this run reconciles it, through Steps 4 to 7. A watermarked package whose release stopped shipping a payload is a version move too — it is no longer an extension, and leaving it would strand a watermark nothing can move. Reconcile it as a package whose conventions are gone: drop its index lines and its group, then write its watermark like any other, and say in the close that it stopped shipping rules, since the project may want the dependency reconsidered.
- An entry for an extension in neither `dependencies` nor `devDependencies` (removed out of band, the removal never reconciled) → `/q:uninstall-extension`, with the extension name, one run per extension. Read both before reporting this: an extension held as a regular dependency is healthy, and reading `devDependencies` alone reports it as removed.
- No record where one belongs → `/q:install` — bare for a missing state file or a missing `@lab43/q` entry; with the extension name for any other declared extension that has no entry, from either, one run per extension. These were installed or scaffolded by hand, never recorded.

Alongside, hold each third-party extension's q declaration — the `@lab43/q` devDependency in its own `node_modules/<extension>/package.json` (source: @lab43/q conventions/extensions.md, Pinning) — against the project's own installed q, and flag a mismatch either way in the close. A declaration ahead of the project's q closes by the developer moving q forward; one behind closes only by that extension's release.

## Step 4: Settle delivery

A run whose findings all route elsewhere, or that found none, skips to Step 8: it asks nothing and delivers nothing, Steps 1 and 2 having changed machine state only. Otherwise ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes), then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). The findings are the agreement — the rest of the run is autonomous. However many packages moved, one run reconciles them into one change: they are the same project catching up with the same npm install.

## Step 5: Reconcile each version move

Diff the two published versions: `npm pack <package>@<version>` for the watermark and for the installed version into a scratch directory, extract both, and diff the trees. Diff the whole tarball rather than the payload's `conventions/` alone, because a release can change skills, hooks, agents and references too. Work only from the diff. What it touched decides which of these applies, and a diff may touch more than one:

- **Changed conventions docs** — hold the project's docs, and the exception markers its code carries, against each changed rule:
  - remove an override whose target updated to agree or disappeared — it is spent (source: @lab43/q conventions/documentation.md, Three tiers of conventions)
  - re-check each "(source: …)" restatement against its changed home
  - re-check each exception against its changed rule — retarget one whose rule moved, and remove one that is spent, its rule gone or changed to admit the site (source: @lab43/q conventions/documentation.md, Markers)
  - prune a project rule the new text now owns — it is duplication now
  - ask about a project rule the new text contradicts, the one call the go-ahead didn't settle: keep it as a recorded deviation (add the overrides marker) or adopt the incoming rule. Adopting can leave code non-conforming — suggest `/q:review` on the affected area; bringing code back into conformance is out of scope here

  An extension authored in this repo is part of that surface: re-check its docs and its own `q.description` the same way. Its root manifest's exact `@lab43/q` pin is also that extension's shipped declaration of which q version its rules were written against (source: @lab43/q conventions/extensions.md, Pinning) — flag it when it no longer names the q the project now runs; moving it is the developer's npm edit.

  Then sync the briefing's index lines for the package — a doc added or removed changes the list, a changed intro re-draws its blurb (see: @lab43/q conventions/documentation.md, Taxonomy).
- **A changed `q.description`** — re-draw that extension's group heading in the briefing's docs index (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). A release can change the blurb alone.
- **A changed plugin** — re-run `/q:install`, scoped to join this run's change: it is idempotent, creating what the new version's scaffold expects and correcting what has drifted from it.

After each package's reconciliation, write its watermark per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: its `reconciledAgainst` entry to its installed version.

## Step 6: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 7: Open the PR

Skip this step when Step 4 found nothing to deliver.

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).

## Step 8: Report, then hand off

Close the session by reporting:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each version move reconciled and what its release changed.
- Each finding that routes elsewhere, and where.
- Each flagged q declaration, and what closes it.

Then make Step 3's arrival and departure hand-offs — each invocation a full run of its own that asks and delivers for itself.
