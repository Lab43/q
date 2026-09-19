---
name: update
description: Update q and the project's installed extensions — move pins to the latest releases with the user's go-ahead, reconcile the project's docs with what each release changed, and catch up any pin that moved out of band. Invoked bare it covers q and every installed extension; a named target — q, or an extension — scopes the run. Use after a release ships, or whenever pins may be behind. To audit docs without updating, use groom-docs; to repair this machine without touching docs, use sync. A pin move or catch-up ships as a PR.
---

# Update

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Take stock

Bare invocation covers `@lab43/q` and every installed extension — the direct `devDependencies` whose own `package.json` carries the `q-extension` keyword (source: @lab43/q conventions/extensions.md). A named target scopes the run: `q` means `@lab43/q`; any other name means that extension. Confirm any target you can't identify as an extension before treating it as one. Below, *package* covers both q and an extension.

Read four versions for each package in scope — the watermarks per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`:

| Pinned | Installed | Latest | Watermark |
| --- | --- | --- | --- |
| its pin in the project's `package.json`; in a repo authoring an extension, the q pin lives in that extension's own manifest (source: @lab43/q conventions/extensions.md) | `version` in `node_modules/<package>/package.json` | `npm view <package> version` | its `reconciledAgainst` entry |

Alongside the versions, hold each third-party extension's q declaration — its `@lab43/q` devDependency (source: @lab43/q conventions/extensions.md) — against the project's own q pin, and flag a mismatch either way. A declaration ahead of the pin closes by updating q here; one behind closes only by that extension's release.

A package with no pin and no watermark entry has nothing to update — propose `/q:install` for it and stop.

Validate the records before sorting. Check that every pinned package in scope carries its watermark. Check that no watermark outlives its pin: every watermark on a bare run, the target's on a named run. On any failure, propose `/q:sync` and stop.

Report the versions, then sort each package by its state:

- **Pinned behind latest** → a pin move to offer. Diff the two published versions: `npm pack <package>@<version>` for each into a scratch directory, extract both, and diff the trees. Diff the whole tarball rather than `conventions/` alone, because a release can change skills, hooks, agents and references too. Step 4's reconciliation and the closing report both read from this diff. Summarize what changed and what reconciliation it demands. Pins are recorded decisions — only the user moves them.
- **Pinned ≠ watermark** → a catch-up: the pin moved out of band. Reconciled in Step 4, without moving any pin.
- **Installed ≠ pinned** → machine drift: enforce without asking, per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`. When a pin move is on offer, enforce only after the ask below, so enforcement lands on the pins the run keeps; otherwise enforce now.
- **Everything agreeing, nothing newer** → in force and reconciled; report and stop.

Then ask once, one batch: each offered pin move (take it or stay), and the review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). A run with only catch-ups asks the review mode alone. A run finding only machine drift asks nothing — enforce, report, stop. The go-ahead makes the rest of the run autonomous: declined moves drop out, catch-ups stay in. When the answers leave nothing due, report and stop.

## Step 2: Branch

Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Move the pins

For each pin the user agreed to move:

Run `npm install --save-dev --save-exact --ignore-scripts <package>@<latest>`, via the project's package manager when it isn't npm. Moving any pin is the same act, q's included.

## Step 4: Reconcile what the diff touched

Work only from the diffs. Each package's diff runs from its watermark to its pin as Step 3 left it. What the diff touched decides which of these applies. A diff may touch more than one:

- **Changed `conventions/`** — hold the project's docs against each changed rule:
  - remove an override whose target updated to agree or disappeared — it is spent (source: @lab43/q conventions/documentation.md, Three tiers of conventions)
  - re-check each "(source: …)" restatement against its changed home
  - re-check each exception against its changed rule, in the project's code as well as its docs — retarget one whose rule moved, and remove one whose rule is gone
  - prune a project rule the new text now owns — it is duplication now
  - ask about a project rule the new text contradicts, the one call the go-ahead didn't settle: keep it as a recorded deviation (add the overrides marker) or adopt the incoming rule. Adopting can leave code non-conforming — suggest `/q:review` on the affected area; code fixes are out of scope here

  An extension authored in this repo is part of that surface: re-check its docs and its own `description` the same way. The q pin this run moved is also that extension's shipped written-against declaration, and the re-check is what makes the moved declaration true (source: @lab43/q conventions/extensions.md).

  Then sync the briefing's index lines for the package — a doc added or removed changes the list, a changed intro re-draws its blurb (see: @lab43/q conventions/documentation.md, Taxonomy).
- **A changed extension `description`** — re-draw that extension's group heading in the briefing's docs index (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). A release can change the description alone.
- **A changed plugin** — re-run `/q:install`, scoped to join this run's change: it is idempotent, creating what the new version's scaffold expects and correcting what has drifted from it.

After each package's reconciliation, write its watermark per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: its `reconciledAgainst` entry to its pinned version.

The go-ahead in Step 1 covered this reconciliation — apply it without re-asking.

## Step 5: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting:
   - Old and new pins, and each catch-up applied without a pin move.
   - What each release changed.
   - Each reconciliation applied and any follow-up suggested — a third-party extension the moved q pin leaves behind included; a newer release of that extension is what closes the gap.
