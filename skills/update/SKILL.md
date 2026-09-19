---
name: update
description: Update q and the project's doc packs — move pins to the latest releases with the user's go-ahead, reconcile the project's docs with what each release changed, and catch up any pin that moved out of band. Invoked bare it covers the plugin and every installed pack; a named target — q (or plugin), or a pack — scopes the run. Use after a release ships, or whenever pins may be behind. To audit docs without updating, use groom-docs; to repair this machine without touching docs, use sync. A pin move or catch-up ships as a PR.
---

# Update

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Take stock

Bare invocation covers the plugin and every installed doc pack — the direct `devDependencies` whose own `package.json` carries the `q-docs` keyword (source: q conventions/doc-packs.md). A named target scopes the run: `q` or `plugin` means the plugin and the framework pack, which move together; a pack name means that pack. Confirm any other target before treating it as a pack.

Read four versions for each artifact in scope — the watermarks per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`:

| | Pinned | Installed | Latest | Watermark |
| --- | --- | --- | --- | --- |
| Plugin | the `q--v*` ref in `.claude/q-marketplace/.claude-plugin/marketplace.json`, less its prefix | `version` in `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` | the highest `q--v*` tag on `Lab43/q` (`gh api repos/Lab43/q/git/matching-refs/tags/q--v`) | `qReconciledAgainst` |
| Each doc pack | its pin in the project's `package.json`; the framework pack's, in a pack-authoring repo, lives in the authored pack's own manifest (source: q conventions/doc-packs.md) | `version` in `node_modules/<pack>/package.json` | `npm view <pack> version` | its `docsReconciledAgainst` entry |

Alongside the versions, hold each third-party pack's framework declaration — its `@lab43/q` devDependency (source: q conventions/doc-packs.md) — against the project's framework pin, and flag a mismatch either way. A declaration ahead of the pin closes by updating the framework here; one behind closes only by a pack release.

An artifact with no pin and no watermark entry has nothing to update — propose `/q:install` for it and stop.

Validate the records before sorting. Check that every pinned artifact in scope carries its watermark. Check that no watermark outlives its pin: every watermark on a bare run, the target's on a named run. On any failure, propose `/q:sync` and stop.

Report the versions, then sort each artifact by its state:

- **Pinned behind latest** → a pin move to offer. Diff pinned against latest — the plugin via `gh api repos/Lab43/q/compare/<pinned-tag>...<latest-tag>` (no clone or install needed); a pack by diffing the two versions' `conventions/` (`npm pack <pack>@<version>` into a scratch directory, extracted) — and summarize what changed and what reconciliation it demands. Pins are recorded decisions — only the user moves them.
- **Pinned ≠ watermark** → a catch-up: the pin moved out of band. Reconciled in Step 4, without moving any pin.
- **Installed ≠ pinned** → machine drift: enforce without asking, per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`. When a pin move is on offer, enforce only after the ask below, so enforcement lands on the pins the run keeps; otherwise enforce now.
- **Everything agreeing, nothing newer** → in force and reconciled; report and stop.

Then ask once, one batch: each offered pin move (take it or stay), and the review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). A run with only catch-ups asks the review mode alone. A run finding only machine drift asks nothing — enforce, report, stop. The go-ahead makes the rest of the run autonomous: declined moves drop out, catch-ups stay in. When the answers leave nothing due, report and stop.

## Step 2: Branch

Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Move the pins

For each pin the user agreed to move:

1. Plugin: update the `ref` in the project's marketplace file to the new release tag, then apply it per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.
2. A pack: `npm install --save-dev --save-exact --ignore-scripts <pack>@<latest>` (via the project's package manager when it isn't npm).

## Step 4: Reconcile what the diff touched

Work only from the diffs. Each artifact's diff runs from its watermark to its pin as Step 3 left it. Per artifact:

- **A pack's `conventions/`** — framework or third-party — hold the project's docs against each changed rule:
  - remove an override whose target updated to agree or disappeared — it is spent (source: q conventions/documentation.md, Two tiers of conventions)
  - re-check each "(source: …)" restatement against its changed home
  - prune a project rule the new text now owns — it is duplication now
  - ask about a project rule the new text contradicts, the one call the go-ahead didn't settle: keep it as a recorded deviation (add the overrides marker) or adopt the incoming rule. Adopting can leave code non-conforming — suggest `/q:review` on the affected area; code fixes are out of scope here

  A pack authored in this repo is part of that surface: re-check its docs the same way. The framework pin this run moved is also the pack's shipped written-against declaration, and the re-check is what makes the moved declaration true (source: q conventions/doc-packs.md).

  Then sync the briefing's index lines for the pack — a doc added or removed changes the list, a changed intro re-draws its blurb (see: q conventions/documentation.md, Taxonomy).
- **The plugin** — re-run `/q:install`, scoped to join this run's change: it is idempotent, creating what the new plugin's scaffold expects and correcting what has drifted from it.

After each artifact's reconciliation, write its watermark per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: `docsReconciledAgainst` to the pack's pinned version, `qReconciledAgainst` to the plugin's pinned version.

The go-ahead in Step 1 covered this reconciliation — apply it without re-asking.

## Step 5: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **Local review's gate**: run the gate over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: q conventions/pull-requests.md).
3. Close the session by reporting:
   - Old and new pins, and each catch-up applied without a pin move.
   - What each release changed.
   - Each reconciliation applied and any follow-up suggested — a third-party pack the moved framework pin leaves behind included; a newer release of that pack is what closes the gap.
