---
name: setup
description: Initialize a project for the q workflow — declare the q plugin in project settings, scaffold docs/conventions/, and index it in the agent briefing. Idempotent, safe to re-run on a partially set-up project.
---

# Setup

Prepares a consuming project to use the q skills. The scaffold is deliberately near-empty — setup creates the structure the skills expect, not content.

## Step 1: Survey current state

Check what already exists, so every action below is create-if-missing:

- `docs/conventions/` and its two mirror docs, `principles.md` and `documentation.md`
- `.claude/settings.json` and whether it already declares the q plugin
- The agent briefing: `AGENTS.md` or `CLAUDE.md` (either counts; never create one when the other exists)
- Convention-like docs living elsewhere (a `docs/` scan for rule-carrying files, a briefing bloated with per-task rules) — candidates for migration

## Step 2: Scaffold

1. **The two mirror docs** — create each if missing, with exactly this content; if present, leave it untouched — never rewrite existing entries. `docs/conventions/principles.md`:

   ```markdown
   # Principles

   This project's cross-cutting rules, including any deviations from the framework's (see: q principles.md).
   ```

   `docs/conventions/documentation.md`:

   ```markdown
   # Documentation

   This project's documentation rulings and deviations (see: q documentation.md, Two tiers of conventions).
   ```

   No other conventions doc is scaffolded — `/q:update-docs` creates each topical doc when its first entry is recorded.
2. **Agent briefing** — in the existing `AGENTS.md`/`CLAUDE.md` (create a minimal `AGENTS.md` only if neither exists), ensure this section, adding it or its missing parts (source: q documentation.md, Taxonomy):

   ```markdown
   ## Conventions

   Conventions come in two tiers: the q plugin's `conventions/` (framework rules, read-only) and this project's `docs/conventions/` (project rules — on conflict, the project wins) (source: q documentation.md, Two tiers of conventions). Check both tiers before writing code, before design decisions and reviews, and before changing docs; doc changes — the README and this briefing itself included — go through `/q:update-docs`.

   - `q principles.md` — cross-cutting rules for any design decision, plan, or review
   - `q documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
   - `docs/conventions/principles.md` — this project's cross-cutting rules, including deviations from the framework's
   - `docs/conventions/documentation.md` — this project's documentation rulings and deviations
   ```

   The list is the docs index: one line per doc, blurb drawn from the doc's intro — framework docs by their `q `-prefixed name, which sessions resolve against the session-start path line. In a project with existing conventions docs, or guides useful to agent sessions, extend it accordingly; `/q:groom-docs` checks it for drift.
3. **Plugin declaration** — the repo declares q as a dependency at a pinned version, via a project-owned marketplace. Two files, created if missing; when they exist, leave the recorded pin alone. First `.claude/q-marketplace/.claude-plugin/marketplace.json`:

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

   Write the path by hand, relative to the project root — `claude plugin marketplace add` records an absolute path, which breaks every other checkout of the repo. The `"q@lab43": false` keeps a user-scope install of q from loading alongside the pin. Claude Code doesn't auto-install from the declaration — each collaborator runs `claude plugin install q@q-pin --scope project` once; say so in the report.
4. Do **not** create `docs/plans/` — it arrives with the plan workflow.

## Step 3: Migration proposals (existing projects only)

If Step 1 found convention-like content outside `docs/conventions/` — rules in the briefing that apply only to particular kinds of work, rule-carrying docs elsewhere in `docs/` — read `${CLAUDE_PLUGIN_ROOT}/conventions/documentation.md` and propose moving the content per its taxonomy, via AskUserQuestion. Propose only; the user decides. Apply approved moves, leaving a one-line pointer behind where the policy calls for one.

## Step 4: Report

State what was created, what already existed and was left untouched, and what was proposed and the user's decisions. Committing is the user's call — propose it, don't do it.
