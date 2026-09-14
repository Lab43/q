---
name: update
description: Update q and the project's doc packs — move pins to the latest releases with the user's go-ahead, reconcile the project's docs with what each release changed, and catch up any pin that moved out of band, writing the watermarks that record reconciliation. Invoked bare it checks the plugin, the framework pack, and every installed pack; a named target — q or a pack — scopes the run. Use after a release ships, or whenever pins may be behind. To audit docs without updating, use groom-docs; to repair this machine without touching docs, use sync. A pin move or catch-up ships as a PR.
---

# Update

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Take stock — four versions per artifact

Bare invocation covers the plugin, the framework pack, and every installed third-party pack; a named target scopes the run — `q` means the plugin and the framework pack, which move together, and a pack name means that pack. The installed doc packs are the direct `devDependencies` whose own `package.json` carries the `q-docs` keyword (source: q conventions/doc-packs.md).

- **Plugin**: pinned — the `ref` in `.claude/q-marketplace/.claude-plugin/marketplace.json`, its version the tag less the `q--v` prefix; installed — `version` in `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`; latest — the highest `q--v*` tag on `Lab43/q` (`gh api repos/Lab43/q/git/matching-refs/tags/q--v`); watermark — `scaffoldedAgainst` in `.claude/q-state.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).
- **Framework pack**: pinned — `@lab43/q-conventions` in `package.json` `devDependencies`, which in a pack-authoring repo is the pack's own `package.json` (source: q conventions/doc-packs.md); installed — `version` in `node_modules/@lab43/q-conventions/package.json`; latest — `npm view @lab43/q-conventions version`; watermark — its `reconciledAgainst` entry.
- **Every other pack**: pinned — `package.json`; installed — `version` in `node_modules/<pack>/package.json`; latest — `npm view <pack> version`; watermark — its `reconciledAgainst` entry.

Alongside, hold each third-party pack's framework declaration — its `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md) — against the project's framework pin. A declaration ahead of the pin is closed by updating the framework here; one behind only by a pack release that moves it. Flag either mismatch.

An artifact whose pin is missing has nothing to update — propose `/q:install`, which scaffolds the declarations (bare for the plugin or framework pack, with the pack name for a third-party pack), and stop. Otherwise report the versions, then sort each artifact:

- **Installed ≠ pinned** → enforce without asking: run `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`. If a pin is also behind latest, settle the pin-move question first — taking the update lands the enforcement on the new pins; declining it is when this runs.
- **Pinned ≠ watermark, or an artifact with no watermark entry** → the pin moved out of band, or was never reconciled: due for a catch-up (Step 4), without moving any pin.
- **A `reconciledAgainst` entry for a pack no longer in `package.json`** (bare runs) → due for pruning in Step 4's watermark write.
- **Pinned behind latest** → diff pinned against latest for each artifact that moved: the plugin via `gh api repos/Lab43/q/compare/<pinned-tag>...<latest-tag>` (no clone or install needed); a pack by downloading both tarballs (`npm pack <pack>@<version>` into a scratch directory, extracted) and diffing their `conventions/`. Summarize what the releases change and what reconciliation they would demand of this project. Pins are recorded decisions — only the user moves them.
- **Nothing due** → report and stop: the pins are in force and reconciled.

When anything is due, ask once, one batch: move the pins that are behind latest (or stay on the current pins), and which review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). A run with only catch-ups or pruning asks the review mode alone. The go-ahead makes the rest of the run autonomous — declined pin moves drop out, catch-ups and pruning stay in. When the answers leave nothing due — every move declined, nothing else scheduled — report and stop.

## Step 2: Branch

Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

## Step 3: Move the pins

For each pin the user agreed to move:

1. Plugin: update the `ref` in the project's marketplace file to the new release tag, then apply it — run `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.
2. A pack: `npm install --save-dev --save-exact --ignore-scripts <pack>@<latest>`.

## Step 4: Reconcile what the diff touched

Work only from the diffs — for a moved pin, Step 1's pinned-to-latest diff; for a catch-up, the same diff computed from watermark to pinned. Per artifact:

- **A pack's `conventions/`** — framework or third-party — hold the project's docs against each changed rule:
  - an override whose target updated to agree or disappeared is spent and comes out (source: q conventions/documentation.md, Two tiers of conventions)
  - a "(source: …)" restatement is re-checked against its changed home
  - a project rule the new text now owns is duplication to prune
  - a project rule the new text contradicts is the one call the go-ahead didn't settle — ask: keep it as a recorded deviation (add the overrides marker) or adopt the incoming rule. Adopting can leave code non-conforming — suggest `/q:review` on the affected area; code fixes are out of scope here

  A pack authored in this repo is part of that surface — its docs re-checked the same way — and the moved pin is the pack's written-against declaration: this re-check is what moving it certifies (source: q conventions/doc-packs.md).

  Then sync the briefing's index lines for the pack — a doc added or removed changes the list, a changed intro re-draws its blurb.
- **The plugin** — re-run `/q:install`, scoped to join this run's change: it is idempotent and adds only what the new plugin's scaffold expects.
- **An artifact with no watermark entry** — there is no diff base: run `/q:install` instead, scoped to join this run's change. Bare for the plugin — its scaffold catch-up writes `scaffoldedAgainst`. With the pack name for a pack — it indexes the pack as a fresh install and writes its watermark.

After each artifact's reconciliation, write its watermark per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: `reconciledAgainst` to the pack's pinned version, `scaffoldedAgainst` to the plugin's pinned version. On a bare run, drop `reconciledAgainst` entries for packs no longer in `package.json`.

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
