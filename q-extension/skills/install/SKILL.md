---
name: install
description: Set up q in a project the developer has already npm-installed it into, or repair a scaffold that has drifted. Invoke bare. Safe to re-run on a partially set-up project. An extension's arrival is /q:reconcile's. The changes ship as a PR.
---

# Install

The scaffold is deliberately near-empty — this skill creates the structure the other skills expect, not content.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. Scaffolding brings q's surfaces to the forms in Step 3: create what is absent, correct what has drifted. Any run therefore completes a partially set-up project. Never rewrite what the user owns — each item below marks its own boundary.

## Step 1: Survey current state

Hold the project against each of Step 3's scaffold items, noting what is absent and what has drifted from its form. Alongside, check:

- Convention-like docs living elsewhere — a `docs/` scan for rule-carrying files, a briefing bloated with per-task rules
- Content already in `docs/conventions/` that has drifted from the documentation policy
- Whether an earlier run's scaffold sits uncommitted in the working tree
- The GitHub CLI: `gh auth status`, and that the repo's `origin` is GitHub-hosted (`gh repo view` succeeds). q's workflow skills require both. If either fails, tell the user the fix (install via <https://cli.github.com> and authenticate with `gh auth login`; `gh repo view` failing with an authenticated CLI means `origin` is not GitHub-hosted) and continue — the scaffold still lands.

## Step 2: Settle delivery

Skip this step in any of these cases:

- A run where Step 1 found nothing missing or drifted, and no scaffold sitting uncommitted from an earlier run — there is nothing to change or deliver. An unpopulated `node_modules/` is machine state rather than drift: a fresh clone nobody has installed on. Enforce the declarations per `${CLAUDE_PLUGIN_ROOT}/references/enforce-declarations.md`, which populates it, then stop with the closing report (Step 5).
- Step 1 found no `@lab43/q` in `devDependencies` in the repo root's `package.json` — q's bytes have not arrived, and nothing scaffolds without them. Report the bootstrap for the developer to run — `npm install --save-dev --save-exact --ignore-scripts @lab43/q`, or their package manager's equivalent — and stop with the closing report (Step 5): this skill runs no package manager against a named package.
- Step 1's GitHub CLI check failed — there is no delivery to settle.
- Another skill's run invoked this one — the changes join that run's change.

Otherwise ask which review mode — local or ship — the run delivers under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). Then pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). Commit the q declaration the bootstrap left uncommitted in the root `package.json` and the lockfile with the scaffold, without asking. It is the input the bootstrap above prescribes, and the scaffold is broken without it (exception: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).

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

   This project's documentation rulings and deviations (see: @lab43/q conventions/conventions.md, Three tiers of conventions).
   ```

   No other conventions doc is scaffolded — `/q:update-docs` creates each topical doc when its first entry is recorded.
2. **The q dependency** — q arrives as one npm package, its conventions and its plugin together, and the developer installs it; Step 2 stopped any run where it is undeclared. Its declaration lives in `devDependencies` in the `package.json` at the repo root — the only place anything looks for it, whatever else the repo's layout holds (source: @lab43/q conventions/extensions.md, Pinning). Leave the recorded declaration alone.
3. **Agent briefing** — ensure the project's briefing carries the section the briefing template defines, adding what is missing and correcting drift, per that file's rules (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`).
4. **Plugin declaration** — the project publishes its own marketplace, sourcing the q it already has in `node_modules` and the plugin of each installed extension that ships one. Two files hold it, created if missing.

   `.claude-plugin/marketplace.json` at the project root is the conventional path for a project publishing a marketplace, so the file is shared territory rather than q's. Merge q's entry and the extensions' into an existing manifest: leave every other `plugins` entry and the recorded name untouched. Write the whole file only when creating it.

   The marketplace needs a name no other project on the machine will use. The registry the CLI resolves against holds one entry per marketplace name, machine-wide (source: ${CLAUDE_PLUGIN_ROOT}/references/enforce-declarations.md). Two projects sharing a name means the second one loads another project's q rather than its own.

   Name it `q-pin-<owner>-<repo>-<suffix>` — for example, `q-pin-acme-storefront-4f2ab9`. Owner and repo keep the name legible in that registry. The suffix is six random hex characters. It is what keeps the name unique. Read owner and repo from the repo's GitHub origin with `gh repo view --json nameWithOwner`. Use the project directory's name in their place when that command yields nothing. Lowercase the whole name and replace every character outside `a-z0-9-` with a hyphen.

   Generate that name only when creating the file. A project that already records one keeps it, whatever it is. Other clones have already registered that name locally. Regenerating it strands them.

   ```json
   {
     "name": "<marketplace>",
     "owner": { "name": "this project" },
     "metadata": { "description": "Pins the q this project's sessions load. The name must stay unique to this project. Sharing another project's name makes this one resolve to that project's q." },
     "plugins": [
       {
         "name": "q",
         "source": "./node_modules/@lab43/q/q-extension",
         "description": "The q workflow plugin, pinned for this project."
       }
     ]
   }
   ```

   An extension ships a plugin when its payload holds `.claude-plugin/` (source: @lab43/q conventions/extensions.md, Layout). Look for one across the installed extensions — the direct dependencies, in `dependencies` and `devDependencies` alike, whose installed copy carries both halves of an extension's identity (source: @lab43/q conventions/extensions.md, Identity). Each extension shipping a plugin gets an entry beside q's, sourced at `./node_modules/<package>/q-extension` and named by the `name` in its `q-extension/.claude-plugin/plugin.json`, with that manifest's `description` when it carries one. Tell entries apart by `source`, never by name — the name is the author's to choose. Bring an entry whose source is already present to this form in place. An extension whose plugin manifest names no plugin, or names one that another source's entry already holds, gets no entry: report it as the extension author's to fix. An entry already in the manifest keeps its name against a newcomer claiming it. Between two extensions arriving with the same name, neither gets an entry.

   Then merge into `.claude/settings.json`, leaving other keys untouched. Key the marketplace and every plugin entry to whatever name the manifest records, and correct any that has drifted from it:

   ```json
   {
     "extraKnownMarketplaces": {
       "<marketplace>": { "source": { "source": "directory", "path": "./" } }
     },
     "enabledPlugins": { "q@<marketplace>": true, "<plugin>@<marketplace>": true }
   }
   ```

   Write this settings entry by hand, its `path` the literal `./` shown — producing it with `claude plugin marketplace add` records an absolute path instead, which breaks every other checkout of the repo.
5. **Enforce the declarations** — make this machine match what the project now declares, per `${CLAUDE_PLUGIN_ROOT}/references/enforce-declarations.md`.
6. **State file** — write `.claude/q-state.json` per `${CLAUDE_PLUGIN_ROOT}/references/q-state.md`: a `reconciledAgainst` entry for `@lab43/q`, from the version in `node_modules/@lab43/q/package.json`. Write only absent watermarks — a present entry, stale or not, is reconciliation's to move (source: ${CLAUDE_PLUGIN_ROOT}/references/q-state.md).
7. **Ignore rules** — ensure `.gitignore` covers `node_modules/`, `.claude/settings.local.json`, and `.claude/worktrees/`, and that the committed scaffold files are not ignored: run `git check-ignore` on `.claude/settings.json`, `.claude-plugin/`, and `.claude/q-state.json`, fixing the rules until it reports nothing. A bare negation under an ignored `.claude/` does nothing — the directory rule itself must become `.claude/*` plus the negations. Leave every unrelated ignore rule alone.
8. **The README's q section** — when the README doesn't mention q, add this section verbatim:

   ```markdown
   ## Working with q

   This project uses [q](https://www.npmjs.com/package/@lab43/q), an agentic coding workflow that grounds Claude Code sessions in the project's own conventions. It arrives with the project's dependencies, and Claude Code loads it from the repo's tracked settings.

   The project's rules live in `docs/conventions/`, and q ships rules of its own inside the package. Sessions read both before writing code, and record new decisions into the project's docs as they are made — the docs assemble themselves out of the work.

   A session lists every `/q:` skill. Start with these:

   - `/q:implement` — take on a task or bug
   - `/q:create-plan`, then `/q:implement-plan` — plan bigger work, then execute the plan
   - `/q:review` — review anything against the project's conventions
   ```

   When the README already mentions q, keep its wording; correct only what it says about q that is no longer true. When the project has no README, create a minimal one holding just this section.
9. Scaffold nothing else. An empty taxonomy directory arrives when its first document does.

## Step 4: Deliver

Invoked from another skill's run, stop here — the changes are that run's to validate and deliver. When the run changed nothing tracked and no earlier run's scaffold awaits delivery: switch back to the prior branch, delete any branch this run created, and report that and stop. When Step 1's GitHub CLI check failed, stop here with the closing report (Step 5), adding:

- That the changes stay uncommitted — restate the `gh` fix.
- That a re-run delivers them once `gh` is in place.

Otherwise, in ship mode, commit. No adversarial review closes this run: the scaffold is deliberately deterministic — much of it is verbatim templates a reviewer would only second-guess — and the user reviews the delivered diff. Then:

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate) — minus the adversarial pass the gate otherwise adds after substantial iteration. The no-review ruling above covers the gate's too.
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).

## Step 5: Report

Close the session by reporting:

- What was created.
- What already existed and was left untouched.
- Each shipped plugin left without a marketplace entry, and why.
- Convention-like content Step 1 found outside `docs/conventions/` — migration candidates this run leaves alone. Moving a project's existing docs is its own delivery: suggest `/q:create-plan` for a docs tree, or `/q:implement` for a handful of rules.
- Content already in `docs/conventions/` that has drifted from the documentation policy — grooming's territory: suggest `/q:groom-docs`.
