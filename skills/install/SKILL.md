---
name: install
description: Install q into a project, or add an extension to one. Invoke bare to set q up; name an extension to install it. Idempotent, safe to re-run on a partially set-up project. The changes ship as a PR.
---

# Install

The scaffold is deliberately near-empty — this skill creates the structure the other skills expect, not content.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. The invocation picks the path: a bare run bootstraps q (Steps 3–4); an extension run adds the extension install (Step 5) after them. A run naming `q` or `@lab43/q` is a bare run, because q is the framework rather than an extension (source: @lab43/q conventions/extensions.md, Identity). Scaffolding brings q's surfaces to the forms in Step 3: create what is absent, correct what has drifted. Any run therefore completes a partially set-up project. Never rewrite what the user owns — each item below marks its own boundary.

## Step 1: Survey current state

Hold the project against each of Step 3's scaffold items, noting what is absent and what has drifted from its form. Alongside, check:

- Where q belongs pinned, whenever the project's own `package.json` declares no `@lab43/q` — a repo authoring an extension pins q in that extension's own manifest, which the working tree identifies by the `q-extension` keyword its `package.json` carries (source: @lab43/q conventions/extensions.md)
- Convention-like docs living elsewhere (a `docs/` scan for rule-carrying files, a briefing bloated with per-task rules) — candidates for migration
- Whether an earlier run's scaffold sits uncommitted in the working tree
- On an extension run: whether the named extension is already pinned, installed, indexed, and watermarked
- The GitHub CLI: `gh auth status`, and that the repo's `origin` is GitHub-hosted (`gh repo view` succeeds). q's workflow skills require both. If either fails, tell the user the fix (install via <https://cli.github.com> and authenticate with `gh auth login`; `gh repo view` failing with an authenticated CLI means `origin` is not GitHub-hosted) and continue — the scaffold still lands.

## Step 2: Settle delivery

Skip this step in any of these cases:

- A bare run where Step 1 found nothing missing or drifted beyond an unpopulated `node_modules/`, no migration candidates, and no scaffold sitting uncommitted from an earlier run — there is nothing to change or deliver. Enforce the pins per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md` (machine state, not a repo change), then stop with the closing report (Step 8).
- An extension run where the named extension is already pinned, installed, indexed, and watermarked, Step 1 found nothing missing from the q scaffold, and no install sits uncommitted from an earlier run — report that and stop.
- Step 1's GitHub CLI check failed — there is no delivery to settle.
- Another skill's run invoked this one — the changes join that run's change.

Otherwise, ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). Then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch); on an extension run the connected-work case is the extension arriving with the dependency that ships it.

## Step 3: Scaffold

The invocation is the agreement — scaffold autonomously; on a fully set-up, undrifted project the whole step is a no-op:

1. **The two mirror docs** — create each if missing, with exactly this content; if present, leave it untouched. A seeded doc is the user's from creation, intro and entries alike — never corrected on a re-run. `docs/conventions/principles.md`:

   ```markdown
   # Principles

   This project's cross-cutting rules, including any deviations from q's (see: @lab43/q conventions/principles.md).
   ```

   `docs/conventions/documentation.md`:

   ```markdown
   # Documentation

   This project's documentation rulings and deviations (see: @lab43/q conventions/documentation.md, Three tiers of conventions).
   ```

   No other conventions doc is scaffolded — `/q:update-docs` creates each topical doc when its first entry is recorded.
2. **The q dependency** — q installs as one pinned npm package, carrying its conventions and its plugin together:
   - Ensure a root `package.json` — create `{"private": true}` if the project has none.
   - If the manifest Step 1 located already declares `@lab43/q` in `devDependencies`, leave the recorded pin alone.
   - Otherwise install it into that manifest: `npm install --save-dev --save-exact --ignore-scripts @lab43/q`, via the project's package manager when it isn't npm. Add `-w <workspace>` when Step 1 located a workspace of the root manifest, and run the install from the package's own directory when it is not a workspace. Step 1 locating nothing means the root manifest takes the pin.

   That pin is the only place a q version appears. Never add a second one beside it. Moving it and installing is the whole of an update.
3. **Agent briefing** — ensure the project's briefing carries the section the briefing template defines, adding what is missing and correcting drift, per that file's rules (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`).
4. **Plugin declaration** — the project publishes its own marketplace, sourcing the q it already has in `node_modules`. Two files hold it, created if missing.

   `.claude-plugin/marketplace.json` at the project root is the conventional path for a project publishing a marketplace, so the file is shared territory rather than q's. Merge the `q` entry into an existing manifest: leave every other `plugins` entry and the recorded name untouched. Write the whole file only when creating it.

   The marketplace needs a name no other project on the machine will use. The registry the CLI resolves against holds one entry per marketplace name, machine-wide (source: ${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md). Two projects sharing a name means the second one loads a q version it never pinned.

   Name it `q-pin-<owner>-<repo>-<suffix>` — for example, `q-pin-acme-storefront-4f2ab9`. Owner and repo keep the name legible in that registry. The suffix is six random hex characters. It is what keeps the name unique. Read owner and repo from the repo's GitHub origin with `gh repo view --json nameWithOwner`. Use the project directory's name in their place when that command yields nothing. Lowercase the whole name and replace every character outside `a-z0-9-` with a hyphen.

   Generate that name only when creating the file. A project that already records one keeps it, whatever it is. Other clones have already registered that name locally. Regenerating it strands them. Keeping a name the project chose gives up guaranteed uniqueness, which is the better trade against renaming a marketplace the project owns.

   ```json
   {
     "name": "<marketplace>",
     "owner": { "name": "this project" },
     "metadata": { "description": "Pins this project's q version. The name must stay unique to this project. Sharing another project's name makes this one resolve to that project's pinned q." },
     "plugins": [
       {
         "name": "q",
         "source": "./node_modules/@lab43/q",
         "description": "The q workflow plugin, pinned for this project."
       }
     ]
   }
   ```

   Then merge into `.claude/settings.json`, leaving other keys untouched. Key both entries to whatever name the manifest records, and correct either if it has drifted from it:

   ```json
   {
     "extraKnownMarketplaces": {
       "<marketplace>": { "source": { "source": "directory", "path": "./" } }
     },
     "enabledPlugins": { "q@<marketplace>": true, "q@q": false }
   }
   ```

   Write the path by hand, relative to the project root — `claude plugin marketplace add` records an absolute path, which breaks every other checkout of the repo.

   `"q@q": false` retires the bootstrap marketplace the package ships. Its name is the same in every copy of q, so leaving it enabled means loading whichever copy registered that name last. Disabling it is what makes the project's own pin authoritative.
5. **Enforce the declarations** — make this machine match the pins just declared, per `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.
6. **State file** — write `.claude/q-state.json` per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: a `reconciledAgainst` entry for `@lab43/q`, from the version in `node_modules/@lab43/q/package.json`. Read that copy from beside the manifest holding the pin before the project root, since npm need not hoist a workspace's copy. Write only absent watermarks — a present entry, stale or not, is reconciliation's to move (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md). Record the `manifest` key when Step 3 pinned q outside the root manifest, and drop it when the pin is the root manifest's (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md). That key is what the session-start hook and `/q:sync` follow to the pin.
7. **Ignore rules** — ensure `.gitignore` covers `node_modules/`, `.claude/settings.local.json`, and `.claude/worktrees/`, and that the committed scaffold files are not ignored: run `git check-ignore` on `.claude/settings.json`, `.claude-plugin/`, and `.claude/q-state.json`, fixing the rules until it reports nothing. A bare negation under an ignored `.claude/` does nothing — the directory rule itself must become `.claude/*` plus the negations. Leave every unrelated ignore rule alone.
8. **README setup instructions** — ensure the README tells a collaborator using Claude Code how to bring up a fresh clone: install the project's dependencies, which is what delivers q. Fold that into the project's existing setup instructions or setup script — a dependency install the project already documents (`npm install`, a pnpm or yarn equivalent, a bootstrap script) covers it, and a README already carrying the information needs nothing. Present the q steps as applying to collaborators who use Claude Code, never as requirements for working in the repo. Create a minimal README with just these instructions when the project has none.
9. Scaffold nothing else. An empty taxonomy directory arrives when its first document does.

## Step 4: Migration proposals (existing projects only)

On an extension run, skip this step unless Step 3 just bootstrapped a previously q-less project. If Step 1 found convention-like content outside `docs/conventions/` — rules in the briefing that apply only to particular kinds of work, rule-carrying docs elsewhere in `docs/` — read `node_modules/@lab43/q/conventions/documentation.md` and propose moving the content per its taxonomy, via AskUserQuestion — in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes). Apply approved moves, leaving a one-line pointer behind where the policy calls for one.

## Step 5: Install the extension (extension runs only)

The named extension is the agreement — install it autonomously. If it is not yet in `devDependencies` (via the project's package manager when it isn't npm):

```sh
npm install --save-dev --save-exact --ignore-scripts <extension>
```

If it is, leave the recorded pin alone and make this machine match through `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`.

Verify what arrived is an extension: `node_modules/<extension>/package.json` carries the `q-extension` keyword, and the package root holds a `conventions/` directory, a `.claude-plugin/` directory, or both (source: @lab43/q conventions/extensions.md). If not, `npm uninstall` it and report — never index it. When the run changed nothing else, switch back to the prior branch and delete any branch this run created; when Step 3 bootstrapped the project, keep that scaffold, carry on to Step 6, and report the extension failure in the close.

An extension shipping `conventions/` gets its own group in the briefing's docs index, headed by the package name and the extension's description (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). Under that heading goes one line per doc the index doesn't already carry: package name plus path from the package root (see: @lab43/q conventions/documentation.md, Package doc paths), blurb restating the doc's intro (source: @lab43/q conventions/documentation.md, Taxonomy). One shipping no `conventions/` is watermarked without being indexed, having no docs to index (source: @lab43/q conventions/extensions.md, Layout).

When the extension has no `reconciledAgainst` entry, write one from the version in `node_modules/<extension>/package.json` (see: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md) — an extension Step 1 found pinned and installed by hand included. Never overwrite a present entry, stale or not — it is reconciliation's to move (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).

Installing an extension's plugin is not yet part of this step: q scaffolds only its own marketplace entry.

## Step 6: Adversarial review

Invoked from another skill's run, stop here — the changes are that run's to validate and deliver. When the run changed nothing tracked — every proposal declined on an otherwise complete project — and no earlier run's scaffold awaits delivery: switch back to the prior branch, delete any branch this run created, and report that and stop. When Step 1's GitHub CLI check failed, stop here with the closing report (Step 8), adding:

- That the changes stay uncommitted — restate the `gh` fix.
- That a re-run delivers them once `gh` is in place.

Otherwise: in ship mode, commit first. In both modes, validate the changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 7: Open the PR

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).

## Step 8: Report

Close the session by reporting:

- What was created.
- What already existed and was left untouched.
- What was proposed, and the user's decisions.
- On an extension run:
  - The extension and version installed, and the index lines added.
  - Any overrides markers its docs carry against q's rules. These are deviations the project now lives under. The project's own rulings still win on conflict.
  - Its q declaration — its `@lab43/q` devDependency (source: @lab43/q conventions/extensions.md) — held against the project's own pin. An extension written against a newer q than the project runs is the signal to suggest `/q:update`. One written against an older q, or carrying no declaration, is noted as-is — no update closes it.
