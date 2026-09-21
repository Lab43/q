---
name: update
description: Reconcile the project with q and its installed extensions — catch up any version move the project's dependency tooling already made (an npm install, a teammate's merge, a Dependabot bump), folding the changed rules into the project's docs. Invoked bare it covers q and every installed extension; a named target — q, or an extension — scopes the run. Use after `npm install` brings new rules in, or whenever the session-start check reports drift. To audit docs without updating, use groom-docs; to repair this machine without touching docs, use sync. A catch-up ships as a PR.
---

# Update

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Take stock

Bare invocation covers `@lab43/q` and every installed extension — the direct dependencies, in `dependencies` and `devDependencies` alike, whose installed copy carries both the `q-extension` keyword and a payload directory (source: @lab43/q conventions/extensions.md, Identity).

It covers every watermarked package too, whatever its installed copy now looks like. A release that stopped shipping a payload is no longer an extension and would otherwise fall out of scope, leaving a watermark nothing can move and a session-start check that never goes quiet. Reconcile it as a package whose conventions are gone: drop its index lines and its group, then write its watermark like any other. Say in the close that it stopped shipping rules, since the project may want the dependency reconsidered.

A named target scopes the run: `q` means `@lab43/q`; any other name means that extension. Confirm any target you can't identify as an extension before treating it as one. Below, *package* covers both q and an extension.

Read three versions for each package in scope — the watermarks per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`:

| Locked | Installed | Watermark |
| --- | --- | --- |
| the version the project's lockfile resolves for it | `version` in `node_modules/<package>/package.json` | its `reconciledAgainst` entry |

Alongside the versions, hold each third-party extension's q declaration — its `@lab43/q` devDependency (source: @lab43/q conventions/extensions.md, Pinning) — against the project's own installed q, and flag a mismatch either way. A declaration ahead of the project's q closes by updating q here; one behind closes only by that extension's release.

A package with no declaration and no watermark entry has nothing to update — propose `/q:install` for it and stop.

Validate the records before sorting. Check that every declared package in scope carries its watermark. Check that no watermark outlives its declaration: every watermark on a bare run, the target's on a named run. On any failure, propose `/q:sync` and stop.

Report the versions, then sort each package by its state:

- **Installed ≠ locked** → machine drift: enforce without asking, now, per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md` — the catch-up below diffs against what is installed, so enforcement comes first.
- **Locked ≠ watermark** → a catch-up: the version moved out of band. Reconciled in Step 3, touching no manifest. This is the common case. Nobody runs a q skill to update a UI library — they run `npm install`, and whatever rules that package ships ride along. Diff the two published versions: `npm pack <package>@<version>` for the watermark and for the installed version into a scratch directory, extract both, and diff the trees. Diff the whole tarball rather than the payload's `conventions/` alone, because a release can change skills, hooks, agents and references too. Step 3's reconciliation and the closing report both read from this diff.
- **Everything agreeing** → in force and reconciled; report and stop.

Then ask which review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). A run finding only machine drift asks nothing — enforce, report, stop. The go-ahead makes the rest of the run autonomous.

## Step 2: Branch

Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Reconcile what the diff touched

Work only from the diffs. Each package's diff runs from its watermark to its installed version. What the diff touched decides which of these applies. A diff may touch more than one:

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

The go-ahead in Step 1 covered this reconciliation — apply it without re-asking.

## Step 4: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 5: Open the PR

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting:
   - Each catch-up applied.
   - What each release changed.
   - Each reconciliation applied and any follow-up suggested — a third-party extension the project's newer q leaves behind included; a newer release of that extension is what closes the gap.
