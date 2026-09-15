---
name: install
description: Install q into a project, or add a doc pack to one. Invoke bare to set q up; name a doc pack to install it. Idempotent, safe to re-run on a partially set-up project. The changes ship as a PR.
---

# Install

The scaffold is deliberately near-empty — this skill creates the structure the other skills expect, not content.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation picks the path: a bare run bootstraps q (Steps 3–4); a pack run adds the pack install (Step 5) after them. Scaffolding brings q's surfaces to the forms in Step 3: create what is absent, correct what has drifted. Any run therefore completes a partially set-up project, and a re-run delivers the plugin catch-up. Never rewrite what the user owns — each item below marks its own boundary.

## Step 1: Survey current state

Hold the project against each of Step 3's scaffold items, noting what is absent and what has drifted from its form. Alongside, check:

- Convention-like docs living elsewhere (a `docs/` scan for rule-carrying files, a briefing bloated with per-task rules) — candidates for migration
- Whether an earlier run's scaffold sits uncommitted in the working tree
- On a pack run: whether the named pack is already pinned, installed, indexed, and watermarked
- The GitHub CLI: `gh auth status`, and that the repo's `origin` is GitHub-hosted (`gh repo view` succeeds). q's workflow skills require both. If either fails, tell the user the fix (install via https://cli.github.com and authenticate with `gh auth login`; `gh repo view` failing with an authenticated CLI means `origin` is not GitHub-hosted) and continue — the scaffold still lands.

## Step 2: Settle delivery

Skip this step in any of these cases:

- A bare run where Step 1 found nothing missing or drifted beyond an unpopulated `node_modules/`, no migration candidates, and no scaffold sitting uncommitted from an earlier run — there is nothing to change or deliver. Enforce the pins per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md` (machine state, not a repo change), then stop with the closing report (Step 8).
- A pack run where the named pack is already pinned, installed, indexed, and watermarked, Step 1 found nothing missing from the q scaffold, and no install sits uncommitted from an earlier run — report that and stop.
- Step 1's GitHub CLI check failed — there is no delivery to settle.
- Another skill's run invoked this one — the changes join that run's change.

Otherwise, ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). Then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch); on a pack run the connected-work case is the pack arriving with the dependency that ships it.

## Step 3: Scaffold

The invocation is the agreement — scaffold autonomously; on a fully set-up, undrifted project the whole step is a no-op:

1. **The two mirror docs** — create each if missing, with exactly this content; if present, leave it untouched. A seeded doc is the user's from creation, intro and entries alike — never corrected on a re-run. `docs/conventions/principles.md`:

   ```markdown
   # Principles

   This project's cross-cutting rules, including any deviations from the framework's (see: q conventions/principles.md).
   ```

   `docs/conventions/documentation.md`:

   ```markdown
   # Documentation

   This project's documentation rulings and deviations (see: q conventions/documentation.md, Two tiers of conventions).
   ```

   No other conventions doc is scaffolded — `/q:update-docs` creates each topical doc when its first entry is recorded.
2. **Framework conventions pack** — the framework conventions install as a pinned npm package:
   - Ensure a root `package.json` — create `{"private": true}` if the project has none.
   - If `@lab43/q-conventions` is not yet in `devDependencies`: `npm install --save-dev --save-exact --ignore-scripts @lab43/q-conventions` (via the project's package manager when it isn't npm). If it is, leave the recorded pin alone.
3. **Agent briefing** — in the existing `AGENTS.md`/`CLAUDE.md` (create a minimal `AGENTS.md` only if neither exists), ensure this section: add it or its missing parts, and correct drift — q's prose to the text below, index lines to their docs' intros. Lines the user added — their index entries, their notes — stay as written (source: q conventions/documentation.md, Taxonomy):

   ```markdown
   ## Conventions

   Conventions come in two tiers: the installed doc packs' (pinned in `package.json`, the q framework's `@lab43/q-conventions` always among them) and this project's `docs/conventions/` (project rules — on conflict, the project wins) (source: q conventions/documentation.md, Two tiers of conventions). Check both tiers before writing code, before design decisions and reviews, and before changing docs; doc changes — the README and this briefing itself included — go through `/q:update-docs`.

   Doc-pack paths are package name plus path from the package root, resolved under `node_modules/`. `q` abbreviates the `@lab43/q-conventions` pack: `q conventions/principles.md` is `node_modules/@lab43/q-conventions/conventions/principles.md` (source: q conventions/documentation.md, Pack doc paths).

   Installed doc packs:

   - `q conventions/principles.md` — cross-cutting rules for any design decision, plan, or review
   - `q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
   - `q conventions/doc-packs.md` — the doc pack format: rules for authoring and publishing a pack
   - `q conventions/plans.md` — format, sequencing, and lifecycle rules for `docs/plans/` documents
   - `q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
   - `q conventions/pull-requests.md` — rules for authoring a pull request
   - `q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read

   This project's own:

   - `docs/conventions/principles.md` — cross-cutting rules, including deviations from the framework's
   - `docs/conventions/documentation.md` — documentation rulings and deviations

   If the session's skill list has no `/q:` skills, this machine is missing the q plugin — ask the user to run `claude plugin install q@q-pin --scope project`, then `/q:sync`.
   ```

   The list is the docs index, grouped by tier as shown: one line per doc, blurb drawn from the doc's intro — doc-pack docs by package name plus path from the package root (see: q conventions/documentation.md, Pack doc paths). In a project with existing conventions docs, other installed doc packs, or guides useful to agent sessions, extend it accordingly; `/q:groom-docs` checks it for drift.
4. **Plugin declaration** — the repo declares q as a dependency at a pinned version, via a project-owned marketplace. Two files, created if missing; when they exist, leave the recorded pin alone. First `.claude/q-marketplace/.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "q-pin",
     "owner": { "name": "this project" },
     "metadata": { "description": "Pins this project's q version." },
     "plugins": [
       {
         "name": "q",
         "source": { "source": "github", "repo": "Lab43/q", "ref": "q--v<version>" },
         "description": "The q workflow plugin, pinned for this project."
       }
     ]
   }
   ```

   Pin the version currently installed (read `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`). Then merge into `.claude/settings.json`, leaving other keys untouched:

   ```json
   {
     "extraKnownMarketplaces": {
       "q-pin": { "source": { "source": "directory", "path": "./.claude/q-marketplace" } }
     },
     "enabledPlugins": { "q@q-pin": true, "q@lab43": false }
   }
   ```

   Write the path by hand, relative to the project root — `claude plugin marketplace add` records an absolute path, which breaks every other checkout of the repo. The `"q@lab43": false` keeps a user-scope install of q from loading alongside the pin.
5. **Enforce the declarations** — make this machine match the pins just declared, per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.
6. **State file** — write `.claude/q-state.json` per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: `qReconciledAgainst` from the installed plugin's version (`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`), and the framework pack's `docsReconciledAgainst` entry from the version in `node_modules/@lab43/q-conventions/package.json`. Write only absent watermarks — a present entry, stale or not, is reconciliation's to move (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).
7. **Ignore rules** — ensure `.gitignore` covers `node_modules/` and `.claude/settings.local.json`, and that the committed scaffold files are not ignored: run `git check-ignore` on `.claude/settings.json`, `.claude/q-marketplace/`, and `.claude/q-state.json`, fixing the rules until it reports nothing. A bare negation under an ignored `.claude/` does nothing — the directory rule itself must become `.claude/*` plus the negations. Leave every unrelated ignore rule alone.
8. **README setup instructions** — ensure the README tells a collaborator using Claude Code how to bring up a fresh clone: register the project's marketplace and install the pinned plugin (`claude plugin marketplace add --scope local ./.claude/q-marketplace && claude plugin install q@q-pin --scope project`), and install dependencies. Fold the steps into the project's existing setup instructions or setup script — a dependency install the project already documents (`npm install`, a pnpm or yarn equivalent, a bootstrap script) covers that step, and a README already carrying the information needs nothing. Present the q steps as applying to collaborators who use Claude Code, never as requirements for working in the repo. Create a minimal README with just these instructions when the project has none.
9. Scaffold nothing else. An empty taxonomy directory arrives when its first document does.

## Step 4: Migration proposals (existing projects only)

On a pack run, skip this step unless Step 3 just bootstrapped a previously q-less project. If Step 1 found convention-like content outside `docs/conventions/` — rules in the briefing that apply only to particular kinds of work, rule-carrying docs elsewhere in `docs/` — read `node_modules/@lab43/q-conventions/conventions/documentation.md` and propose moving the content per its taxonomy, via AskUserQuestion — a conversational stretch. Apply approved moves, leaving a one-line pointer behind where the policy calls for one.

## Step 5: Install the pack (pack runs only)

The named pack is the agreement — install it autonomously. If the pack is not yet in `devDependencies` (via the project's package manager when it isn't npm):

```
npm install --save-dev --save-exact --ignore-scripts <pack>
```

If it is, leave the recorded pin alone and make this machine match through `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

Verify what arrived is a doc pack: `node_modules/<pack>/package.json` carries the `q-docs` keyword and the package root a `conventions/` directory (source: q conventions/doc-packs.md). If not, `npm uninstall` it and report — never index it. When the run changed nothing else, switch back to the prior branch and delete any branch this run created; when Step 3 bootstrapped the project, keep that scaffold, carry on to Step 6, and report the pack failure in the close.

Add one line per doc in the pack's `conventions/` that the agent briefing's docs index doesn't already carry, under its packs group and contiguous with any lines the pack already has: package name plus path from the package root (see: q conventions/documentation.md, Pack doc paths), blurb restating the doc's intro (source: q conventions/documentation.md, Taxonomy).

When the pack has no `docsReconciledAgainst` entry, write one from the version in `node_modules/<pack>/package.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) — a pack Step 1 found pinned and installed by hand included. Never overwrite a present entry, stale or not — it is reconciliation's to move (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

## Step 6: Adversarial review

Invoked from another skill's run, stop here — the changes are that run's to validate and deliver. When the run changed nothing tracked — every proposal declined on an otherwise complete project — and no earlier run's scaffold awaits delivery: switch back to the prior branch, delete any branch this run created, and report that and stop. When Step 1's GitHub CLI check failed, stop here with the closing report (Step 8), adding:

- That the changes stay uncommitted — restate the `gh` fix.
- That a re-run delivers them once `gh` is in place.

Otherwise: in ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 7: Open the PR

1. **Local review's gate**: run the gate over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: q conventions/pull-requests.md).

## Step 8: Report

Close the session by reporting:

- What was created.
- What already existed and was left untouched.
- What was proposed, and the user's decisions.
- On a pack run:
  - The pack and version installed, and the index lines added.
  - Any overrides markers the pack's docs carry against framework rules. These are deviations the project now lives under. The project's own rulings still win on conflict.
  - The pack's framework declaration — its `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md) — held against the project's own pin. A pack written against a newer framework than the project runs is the signal to suggest `/q:update`. One written against an older framework, or carrying no declaration, is noted as-is — no update closes it.
