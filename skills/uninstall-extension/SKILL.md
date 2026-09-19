---
name: uninstall-extension
description: Remove a q extension from a project, or reconcile a removal already made out of band — a hand-run npm uninstall, a teammate's merge. Invoke with the extension name. Uninstalls the package, removes its group from the briefing's docs index, drops its watermark, and surfaces the project docs that reference it for the user's ruling. Refuses @lab43/q. The changes ship as a PR.
---

# Uninstall Extension

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. Given no extension, ask which one.

## Step 1: Take stock

Refuse `q` and `@lab43/q`. q is the framework rather than an extension (source: @lab43/q conventions/extensions.md, Identity), and no q project can remove it (source: @lab43/q conventions/documentation.md, Three tiers of conventions).

Confirm the named target is an extension — any of the following identifies it:

- the `q-extension` keyword in `node_modules/<extension>/package.json` (source: @lab43/q conventions/extensions.md)
- the same keyword read from the registry (`npm view <extension> keywords`), for one pinned but not installed
- a `reconciledAgainst` entry (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md)

A target none of these identify has nothing here to remove — report that and stop.

## Step 2: Settle delivery

Ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). Then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Remove the extension's records

Remove without asking — each item a no-op when already absent:

1. When the extension is pinned: `npm uninstall --ignore-scripts <extension>` (via the project's package manager when it isn't npm).
2. When the pin is already gone: run the package manager's dependency install, catching up any lockfile and `node_modules` remnants the removal left.
3. Remove the extension's group from the agent briefing's docs index — its heading and every line under it. An extension that shipped no `conventions/` has no group to remove.
4. Drop the extension's `reconciledAgainst` entry, per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`.

## Step 4: Rule on references

Grep the docs the documentation policy owns (see: @lab43/q conventions/documentation.md, Taxonomy) for the extension's name. Every hit lost its backing with the extension: an overrides marker's target, a restatement's home, a cross-reference's destination. On a clean grep, skip the step.

Recommend a resolution for each hit, grounded in the documentation policy, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes) — one AskUserQuestion batch. The user rules. Apply the rulings.

## Step 5: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting:
   - The extension removed, or the out-of-band removal reconciled.
   - The index lines and watermark entry dropped, and any lockfile catch-up applied.
   - Each reference surfaced and the user's ruling on it.
