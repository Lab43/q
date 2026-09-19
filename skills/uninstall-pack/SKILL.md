---
name: uninstall-pack
description: Remove a doc pack from a project, or reconcile a removal already made out of band — a hand-run npm uninstall, a teammate's merge. Invoke with the pack name. Uninstalls the package, removes its briefing index lines, drops its watermark, and surfaces the project docs that reference the pack for the user's ruling. Never removes the framework pack, @lab43/q. The changes ship as a PR.
---

# Uninstall Pack

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. Given no pack, ask which one.

## Step 1: Take stock

Refuse `@lab43/q` — the framework pack is always among a q project's installed packs (source: q conventions/documentation.md, Two tiers of conventions).

Confirm the named target is a doc pack — any of the following identifies it:

- the `q-docs` keyword in `node_modules/<pack>/package.json` (source: q conventions/doc-packs.md)
- the same keyword read from the registry (`npm view <pack> keywords`), for a pack pinned but not installed
- a `docsReconciledAgainst` entry (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md)

A target none of these identify has nothing here to remove — report that and stop.

## Step 2: Settle delivery

Ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). Then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Remove the pack's records

Remove without asking — each item a no-op when already absent:

1. When the pack is pinned: `npm uninstall --ignore-scripts <pack>` (via the project's package manager when it isn't npm).
2. When the pin is already gone: run the package manager's dependency install, catching up any lockfile and `node_modules` remnants the removal left.
3. Remove the pack's lines from the agent briefing's docs index.
4. Drop the pack's `docsReconciledAgainst` entry, per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`.

## Step 4: Rule on references

Grep the docs the documentation policy owns (see: q conventions/documentation.md, Taxonomy) for the pack's name. Every hit lost its backing with the pack: an overrides marker's target, a restatement's home, a cross-reference's destination. On a clean grep, skip the step.

Recommend a resolution for each hit, grounded in the documentation policy, in one AskUserQuestion batch — a conversational stretch. The user rules. Apply the rulings.

## Step 5: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **Local review's gate**: run the gate over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: q conventions/pull-requests.md).
3. Close the session by reporting:
   - The pack removed, or the out-of-band removal reconciled.
   - The index lines and watermark entry dropped, and any lockfile catch-up applied.
   - Each reference surfaced and the user's ruling on it.
