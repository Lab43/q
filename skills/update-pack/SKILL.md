---
name: update-pack
description: Sync an installed third-party doc pack to its pin, and optionally move the pin to the latest release, reconciling the project with what changed; invoked bare, it checks every installed pack. The framework conventions pack moves with /q:update-q, not here. A pin move ships as a PR.
---

# Update Pack

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Take stock

The installed doc packs are the direct `devDependencies` whose own `package.json` carries the `q-docs` keyword — `@lab43/q-conventions` excepted, its pin being `/q:update-q`'s. For the named pack, or each pack on a bare invocation, three versions: pinned — `package.json`; installed — `version` in `node_modules/<pack>/package.json`; latest — `npm view <pack> version`. Alongside, hold each pack's framework declaration — its `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md) — against the project's framework pin: a declaration ahead of the pin is closed by `/q:update-q`, one behind only by a pack release that moves it. Flag either mismatch.

Report them, then:

- **Installed ≠ pinned** → sync with `npm install`, without asking — the pin is the project's recorded decision, and this merely enforces it. If the pin is also behind latest, settle the next branch's question first.
- **Pinned behind latest** → diff the two versions' `conventions/` (download both with `npm pack <pack>@<version>` into a scratch directory and extract), summarize what changed and what reconciliation it demands of this project, then ask: move the pin (Steps 2–6), or stay and sync — the go-ahead that makes the rest of the run autonomous. In the same ask, settle the review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). The pin is a recorded decision — only the user moves it.
- **No pin move** → report and stop: the pin is in force. Name any tracked file the sync rewrote (a lockfile) — that change stays in the tree as the user's.

## Step 2: Branch

Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Move the pin

```
npm install --save-dev --save-exact --ignore-scripts <pack>@<latest>
```

## Step 4: Reconcile what the diff touched

Hold the project's docs against each changed rule — a spent override comes out, a "(source: …)" restatement re-checks against its changed home, a project rule the new text owns is duplication to prune (source: q conventions/documentation.md, Two tiers of conventions). A project rule the new text contradicts is the one call the go-ahead didn't settle — ask: keep it as a recorded deviation or adopt the pack's rule. Then sync the briefing's index lines for the pack — a doc added or removed changes the list, a changed intro re-draws its blurb. The go-ahead in Step 1 covered the rest of this reconciliation — apply it without re-asking.

## Step 5: Adversarial review

In ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **Local review's gate**: run the gate over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: q conventions/pull-requests.md).
3. Close the session by reporting:
   - Old and new pin per pack.
   - What each release changed.
   - Each reconciliation applied and any follow-up suggested.
