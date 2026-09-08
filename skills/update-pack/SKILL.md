---
name: update-pack
description: Sync an installed third-party doc pack to its pin, and optionally move the pin to the latest release, reconciling the project with what changed; invoked bare, it checks every installed pack. The framework conventions pack moves with /q:update-q, not here.
---

# Update Pack

## Step 1: Take stock

The installed doc packs are the direct `devDependencies` whose own `package.json` carries the `q-docs` keyword — `@lab43/q-conventions` excepted, its pin being `/q:update-q`'s. For the named pack, or each pack on a bare invocation, three versions: pinned — `package.json`; installed — `version` in `node_modules/<pack>/package.json`; latest — `npm view <pack> version`. Alongside, hold each pack's framework declaration — its `@lab43/q-conventions` devDependency (source: q conventions/documentation.md, Doc packs) — against the project's framework pin: a declaration ahead of the pin is closed by `/q:update-q`, one behind only by a pack release that moves it. Flag either mismatch.

Report them, then:

- **Installed ≠ pinned** → sync with `npm install`, without asking — the pin is the project's recorded decision, and this merely enforces it. If the pin is also behind latest, settle the next branch's question first.
- **Pinned behind latest** → diff the two versions' `conventions/` (download both with `npm pack <pack>@<version>` into a scratch directory and extract), summarize what changed and what reconciliation it demands of this project, then ask: move the pin (Steps 2–4), or stay and sync. The pin is a recorded decision — only the user moves it.
- **Everything equal** → report the pack is current and stop.

## Step 2: Reconcile what the diff touched

Hold the project's docs against each changed rule — a spent override comes out, a "(source: …)" restatement re-checks against its changed home, a project rule the new text owns is duplication to prune (source: q conventions/documentation.md, Two tiers of conventions). A project rule the new text contradicts is the one call the go-ahead didn't settle — ask: keep it as a recorded deviation or adopt the pack's rule. Then sync the briefing's index lines for the pack — a doc added or removed changes the list, a changed intro re-draws its blurb. The go-ahead in Step 1 covered the rest of this reconciliation — apply it without re-asking.

## Step 3: Move the pin

```
npm install --save-dev --save-exact --ignore-scripts <pack>@<latest>
```

## Step 4: Report

Old and new pin per pack; what each release changed; each reconciliation applied and any follow-up suggested. Committing is the user's call.
