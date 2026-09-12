---
name: install-pack
description: Install a third-party doc pack and index its docs in the agent briefing. Use when the user names a documentation package to add; q's own conventions pack arrives with /q:install-q, not here.
---

# Install Pack

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`; the named pack is the agreement — proceed autonomously throughout.

## Step 1: Install

The pack name comes from the prompt — ask when missing. If the project has no root `package.json` or the briefing has no docs index, propose `/q:install-q` first and stop. Then:

```
npm install --save-dev --save-exact --ignore-scripts <pack>
```

Verify what arrived is a doc pack: `node_modules/<pack>/package.json` carries the `q-docs` keyword and the package root a `conventions/` directory (source: q conventions/doc-packs.md). If not, `npm uninstall` it and report — never index it.

## Step 2: Index

Add one line per doc in the pack's `conventions/` to the agent briefing's docs index, under its packs group and contiguous with any lines the pack already has: package name plus path from the package root (see: q conventions/documentation.md, Markers), blurb restating the doc's intro (source: q conventions/documentation.md, Taxonomy).

## Step 3: Report

The pack and version installed, the index lines added, and any overrides markers the pack's docs carry against framework rules — deviations the project now lives under, though its own rulings still win on conflict. Also the pack's framework declaration — its `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md) — held against the project's own pin: a pack written against a newer framework than the project runs is the signal to suggest `/q:update-q`; one written against an older framework, or carrying no declaration, is noted as-is — no update closes it. Committing is the user's call.
