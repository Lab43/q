---
name: install-q
description: Install q into a project — declare the plugin pin, install the conventions pack, scaffold docs/conventions/, and index both tiers in the agent briefing. Idempotent, safe to re-run on a partially set-up project.
---

# Install q

The scaffold is deliberately near-empty — this skill creates the structure the other skills expect, not content.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Survey current state

Check what already exists, so every action below is create-if-missing:

- `docs/conventions/` and its two mirror docs, `principles.md` and `documentation.md`
- A root `package.json`, whether it already declares `@lab43/q-conventions`, and whether `node_modules/@lab43/q-conventions/` is populated
- `.claude/settings.json` and whether it already declares the q plugin
- The agent briefing: `AGENTS.md` or `CLAUDE.md` (either counts; never create one when the other exists)
- Convention-like docs living elsewhere (a `docs/` scan for rule-carrying files, a briefing bloated with per-task rules) — candidates for migration
- The GitHub CLI: `gh auth status`, and that the repo's `origin` is GitHub-hosted (`gh repo view` succeeds). q's workflow skills require both — if either fails, tell the user (install via https://cli.github.com, then `gh auth login`) and continue the install; nothing below depends on them.

## Step 2: Scaffold

The invocation is the agreement — scaffold autonomously:

1. **The two mirror docs** — create each if missing, with exactly this content; if present, leave it untouched — never rewrite existing entries. `docs/conventions/principles.md`:

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
   - Ensure a root `package.json` — create `{"private": true}` if the project has none — and that `.gitignore` covers `node_modules/`.
   - If `@lab43/q-conventions` is not yet in `devDependencies`: `npm install --save-dev --save-exact --ignore-scripts @lab43/q-conventions`. If it is, leave the recorded pin alone; run plain `npm install` only when `node_modules/` is missing it.
3. **Agent briefing** — in the existing `AGENTS.md`/`CLAUDE.md` (create a minimal `AGENTS.md` only if neither exists), ensure this section, adding it or its missing parts (source: q conventions/documentation.md, Taxonomy):

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
   - `q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything written for a human reader

   This project's own:

   - `docs/conventions/principles.md` — cross-cutting rules, including deviations from the framework's
   - `docs/conventions/documentation.md` — documentation rulings and deviations
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

   Write the path by hand, relative to the project root — `claude plugin marketplace add` records an absolute path, which breaks every other checkout of the repo. The `"q@lab43": false` keeps a user-scope install of q from loading alongside the pin. Claude Code doesn't auto-install from the declaration — each collaborator runs `claude plugin install q@q-pin --scope project` once, and `npm install` on any fresh clone; say so in the report.
5. Do **not** create `docs/plans/` — it arrives with the plan workflow.

## Step 3: Migration proposals (existing projects only)

If Step 1 found convention-like content outside `docs/conventions/` — rules in the briefing that apply only to particular kinds of work, rule-carrying docs elsewhere in `docs/` — read `node_modules/@lab43/q-conventions/conventions/documentation.md` and propose moving the content per its taxonomy, via AskUserQuestion — a conversational stretch. Apply approved moves, leaving a one-line pointer behind where the policy calls for one.

## Step 4: Report

State what was created, what already existed and was left untouched, and what was proposed and the user's decisions. Committing is the user's call — propose it, don't do it.
