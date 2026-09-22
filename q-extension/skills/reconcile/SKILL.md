---
name: reconcile
description: Reconcile the project's records with what npm already did — q or an extension updated, installed, or removed (your own npm install, a teammate's merge, a Dependabot bump). The changes ship as a PR. Also sets up or repairs this machine for a q-using project — use it on a fresh clone, or whenever the session-start check reports drift. A project with no q scaffold routes to /q:install instead. A run finding nothing to reconcile repairs the machine, asks nothing, and stops.
---

# Reconcile

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Enforce the declarations

Propose `/q:install` and stop in either of these states — there is nothing to reconcile yet:

- The project declares no `@lab43/q` devDependency. It has nothing to enforce.
- It declares one but has no `.claude/q-state.json`. q's bytes arrived. The scaffold that records them has not run.

Otherwise enforce the declarations per `${CLAUDE_PLUGIN_ROOT}/references/enforce-declarations.md`.

## Step 2: Check the GitHub CLI

Run `gh auth status`, and `gh repo view` to confirm the repo's `origin` is GitHub-hosted — q's workflow skills require both. When either fails, report the fix: install via <https://cli.github.com> and authenticate with `gh auth login` for a missing or unauthenticated CLI; a failing `gh repo view` with an authenticated CLI means `origin` is not GitHub-hosted.

## Step 3: Take stock

Read `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) and compare:

- the version the project's lockfile resolves for `@lab43/q` and for each extension against its `reconciledAgainst` entry, and the version installed under `node_modules/` against the lockfile's, in both directions — the extensions are the direct dependencies, in `dependencies` and `devDependencies` alike, whose installed copy carries both halves of an extension's identity — the `q-extension` keyword and a payload directory (source: @lab43/q conventions/extensions.md, Identity). A dependency carrying the keyword, shipping no payload, and holding no `reconciledAgainst` entry is not an extension: leave it out of scope rather than reporting a missing record no skill could resolve. A watermarked package stays in scope however it changed, because a record already exists and only reconciliation or removal clears it

Each finding routes to its remedy:

- A lockfile version differing from its watermark (moved, never reconciled) — a version move: this run reconciles it (Step 5). When the release stopped shipping a payload, the rules departed while the code stayed: reconcile it as a departure (Step 6) instead.
- An entry for an extension in neither `dependencies` nor `devDependencies` (removed, the removal never reconciled) — a departure: this run reconciles it (Step 6). Read both before treating it as one: an extension held as a regular dependency is healthy, and reading `devDependencies` alone reports it as removed. `@lab43/q` never routes here — a project that dropped its q declaration is Step 1's stop.
- A `reconciledAgainst` map with no `@lab43/q` entry → `/q:install`, invoked bare. The scaffold was never fully recorded, and scaffolding is install's to complete. A state file missing altogether never reaches this step — it is Step 1's stop.
- Any other declared extension with no entry, from either dependency map — an arrival, installed by hand and never recorded: this run reconciles it (Step 7).

Alongside, hold each third-party extension's q declaration — the `@lab43/q` devDependency in its own `node_modules/<extension>/package.json` (source: @lab43/q conventions/extensions.md, Pinning) — against the project's own installed q, and flag a mismatch either way in the close. A declaration ahead of the project's q closes by the developer moving q forward; one behind closes only by that extension's release. A ranged q declaration states no version at all — flag it as the extension author's to fix.

## Step 4: Settle delivery

A run that found nothing to reconcile — no finding at all, or only the `/q:install` hand-off — skips to Step 10: it asks nothing and delivers nothing, Steps 1 and 2 having changed machine state only. Otherwise ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes), then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). The findings are the agreement — the rest of the run is autonomous. However many packages moved, one run reconciles them into one change: they are the same project catching up with the same npm install.

## Step 5: Reconcile each version move

Diff the two published versions: `npm pack <package>@<version>` for the watermark and for the installed version into a scratch directory, extract both, and diff the trees. Diff the whole tarball rather than the payload's `conventions/` alone, because a release can change skills, hooks, agents and references too. Work only from the diff. What it touched decides which of these applies, and a diff may touch more than one:

- **Changed conventions docs** — hold the project's docs, and the exception markers its code carries, against each changed rule:
  - remove an override whose target updated to agree or disappeared — it is spent (source: @lab43/q conventions/documentation.md, Three tiers of conventions)
  - re-check each "(source: …)" restatement against its changed home
  - re-check each exception against its changed rule — retarget one whose rule moved, and remove one that is spent, its rule gone or changed to admit the site (source: @lab43/q conventions/documentation.md, Markers)
  - prune a project rule the new text now owns — it is duplication now
  - ask about a project rule the new text contradicts, the one call the go-ahead didn't settle: keep it as a recorded deviation (add the overrides marker) or adopt the incoming rule. Adopting can leave code non-conforming — suggest `/q:review` on the affected area; bringing code back into conformance is out of scope here

  An extension authored in this repo is part of that surface: re-check its docs and its own `q.description` the same way. The exact `@lab43/q` pin in its root `package.json` is also that extension's shipped declaration of which q version its rules were written against — the manifest goes into the published tarball, which makes this the one `package.json` entry still read as a version (source: @lab43/q conventions/extensions.md, Pinning). Flag it when it no longer names the q the project now runs; moving it is the developer's npm edit.

  Then sync the briefing's index lines for the package — a doc added or removed changes the list, and a changed intro means rewriting the doc's blurb (see: @lab43/q conventions/documentation.md, Taxonomy).
- **A changed `q.description`** — rewrite that extension's group heading in the briefing's docs index (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). A release can change the blurb alone.
- **A changed plugin**, q's or an extension's — re-run `/q:install`, scoped to join this run's change: it is idempotent, creating what the new version's scaffold expects and correcting what has drifted from it. A plugin's changed contents reach sessions from `node_modules/` as they stand; the re-run is what registers a plugin the release started shipping. A plugin the release stopped shipping takes the reverse: remove it from the project's marketplace the way Step 6 does for a departed extension.

After each package's reconciliation, write its watermark per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: its `reconciledAgainst` entry to its installed version.

Step 4's go-ahead already covers this reconciliation, the prunes, drops and watermark writes included. Apply it without re-asking.

## Step 6: Reconcile each departure

The developer already removed the package; this run reconciles the records it left behind. Run the package manager's dependency install once, catching up any lockfile and `node_modules` remnants the removals left — it realizes what the manifest already declares: no named package, no manifest write. A package that departed by dropping its payload takes the same treatment minus that install — its code is still installed, and only its records leave. Then, for each departed extension, remove without asking — each item a no-op when already absent:

1. Remove the extension's group from the agent briefing's docs index — its heading and every line under it. An extension that shipped no conventions docs has no group to remove.
2. Drop the extension's `reconciledAgainst` entry, per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`.
3. Remove the extension's plugin from the project's marketplace. Drop the `.claude-plugin/marketplace.json` entry whose `source` is `./node_modules/<extension>/q-extension`. Then drop the `enabledPlugins` key in `.claude/settings.json` that names the removed entry's plugin at the project's marketplace. Leave every other entry and key alone. An extension that shipped no plugin has neither.

Then rule on what the departure orphaned. Grep the docs the documentation policy owns (see: @lab43/q conventions/documentation.md, Taxonomy) for the extension's name, and grep the project's code for exception markers naming it, excluding `node_modules/` and build artifacts. Every hit lost its backing with the extension: an overrides marker's target, an exception marker's target, a restatement's home, a cross-reference's destination. On a clean sweep, skip this. Otherwise recommend a resolution for each hit, grounded in the documentation policy, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes) — one AskUserQuestion batch. The user rules. Apply the rulings.

## Step 7: Reconcile each arrival

The developer already installed the package; this run records it. For each arrived extension:

1. Verify both halves of its identity (source: @lab43/q conventions/extensions.md, Identity): `node_modules/<extension>/package.json` carries the `q-extension` keyword, and the package holds `q-extension/conventions/`, `q-extension/.claude-plugin/`, or both. Step 3 scoped by this same identity; re-verify at the acting site, because the watermark write is what a misclassification would poison. A package failing the check is reported in the close and left alone — no index lines, and above all no watermark, which would record a package q cannot reconcile.
2. An extension shipping conventions docs gets its own group in the briefing's docs index, written to that file's rules (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). One shipping none is watermarked without being indexed, having no docs to index (source: @lab43/q conventions/extensions.md, Layout).
3. An extension shipping a plugin gets it registered in the project's marketplace: re-run `/q:install`, scoped to join this run's change. One shipping none has nothing to load.
4. Write its watermark from the version in `node_modules/<extension>/package.json`. Never overwrite a present entry, stale or not: a stale watermark moves only by reconciling the version move behind it (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

Report in the close, per arrival:

- A missing `q.description`, if the package ships conventions docs without one (source: @lab43/q conventions/extensions.md, Description). Its group falls back to a heading of the package name alone (source: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). Name it as the extension author's to fix, not the installing project's. Index it anyway — one missing blurb does not stop rules that otherwise work.
- Any overrides markers its docs carry against q's rules. These are deviations the project now lives under. The project's own rulings still win on conflict.

## Step 8: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 9: Open the PR

Skip this step when Step 4 found nothing to deliver.

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).

## Step 10: Report, then hand off

Close the session by reporting:

- What Step 1 enforced, and any tracked file it rewrote (a lockfile) left in the tree as the user's.
- The GitHub CLI result, with the fix when it failed.
- Each version move reconciled and what its release changed.
- Each arrival reconciled — the group and lines indexed, the plugin registered, the watermark written — with Step 7's per-arrival notes, and each package that failed the identity check, left alone.
- Each departure reconciled — the records and plugin registration dropped, any lockfile catch-up applied, and each orphaned reference with the user's ruling. Name a departure by dropped payload as a release that stopped shipping rules, since the project may want the dependency reconsidered.
- Any plugin an install re-run left without a marketplace entry, and why.
- Each flagged q declaration, and what closes it.

Then, where Step 3 found no `@lab43/q` record, make its `/q:install` hand-off — a full run of its own that asks and delivers for itself.
