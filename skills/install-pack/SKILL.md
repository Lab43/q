---
name: install-pack
description: Install a third-party doc pack and index its docs in the agent briefing. Use when the user names a documentation package to add; q's own conventions pack arrives with /q:install-q, not here. Idempotent, safe to re-run. The install ships as a PR.
---

# Install Pack

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The named pack is the agreement — after Step 1's one question batch, proceed autonomously throughout.

## Step 1: Take stock

If the project has no root `package.json` or the briefing has no docs index, propose `/q:install-q` first and stop. Ask which review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes), along with the pack name when the prompt lacks it. A pack already pinned, installed, and indexed, with no install sitting uncommitted from an earlier run, leaves nothing to do — report that and stop.

## Step 2: Branch

Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch); here the connected-work case is the pack arriving with the dependency that ships it.

## Step 3: Install

```
npm install --save-dev --save-exact --ignore-scripts <pack>
```

Verify what arrived is a doc pack: `node_modules/<pack>/package.json` carries the `q-docs` keyword and the package root a `conventions/` directory (source: q conventions/doc-packs.md). If not, `npm uninstall` it, delete any branch this run created, and report — never index it.

## Step 4: Index

Add one line per doc in the pack's `conventions/` that the agent briefing's docs index doesn't already carry, under its packs group and contiguous with any lines the pack already has: package name plus path from the package root (see: q conventions/documentation.md, Pack doc paths), blurb restating the doc's intro (source: q conventions/documentation.md, Taxonomy). In ship mode, commit.

## Step 5: Adversarial review

Validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **Local review's gate**: run the gate over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: q conventions/pull-requests.md).
3. Close the session by reporting:
   - The pack and version installed.
   - The index lines added.
   - Any overrides markers the pack's docs carry against framework rules. These are deviations the project now lives under. The project's own rulings still win on conflict.
   - The pack's framework declaration — its `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md) — held against the project's own pin. A pack written against a newer framework than the project runs is the signal to suggest `/q:update-q`. One written against an older framework, or carrying no declaration, is noted as-is — no update closes it.
