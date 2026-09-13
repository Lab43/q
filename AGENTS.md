# q — Agent Briefing

q is a Claude Code plugin packaging an agentic coding workflow. This file briefs sessions working **on** q. A plugin install copies the whole repo to the consumer's machine, but nothing here auto-loads into their sessions — consumers encounter only what the plugin routes them to: skills, hooks, and the framework conventions the skills read.

## Two tiers

(source: `docs/conventions/documentation.md`, The tier test)

`packages/q-conventions/conventions/` and `skills/` are framework payload — the law and workflow that ship to every consuming project, and that q follows here too, as a consuming project of its own workflow. The payload is *addressed* solely to consumers: it never mentions this repo. `docs/conventions/` is q's own project tier — rules for developing q, including this repo's `documentation.md` mirror. Before adding a rule anywhere, apply the tier test in `docs/conventions/documentation.md`.

## Developing

- `claude` in this checkout auto-loads the working copy of the plugin — the repo declares itself as a local marketplace in `.claude/settings.json`, and each new session syncs from the working tree (a new machine confirms once at the folder-trust prompt). From any other project, `claude --plugin-dir <path to this checkout>` loads it ephemerally. `/reload-plugins` picks up mid-session changes (SKILL.md edits apply immediately; hooks/agents/MCP need the reload).
- `claude plugin validate --strict .` before considering any structural change done.
- Releasing — the plugin or the `@lab43/q-conventions` pack — is separate from merging and is the maintainer's act; PRs never touch a `version`. Steps in `docs/guides/releasing.md`.

## Conventions

Before writing code, before design decisions and reviews, and before changing docs, check both tiers of conventions — `packages/q-conventions/conventions/` and `docs/conventions/`. All doc changes — the README and this briefing itself included — go through `/q:update-docs`.

In path references, `q` abbreviates the `@lab43/q-conventions` pack (source: q conventions/documentation.md, Pack doc paths) — here resolving to `packages/q-conventions/`, the pack's working tree (source: docs/conventions/documentation.md, Working on the payload).

Framework payload (ships to consumers):

- `q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `q conventions/doc-packs.md` — the doc pack format: rules for authoring and publishing a pack
- `q conventions/plans.md` — format, sequencing, and lifecycle rules for `docs/plans/` documents
- `q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything written for a human reader
- `q conventions/principles.md` — cross-cutting rules for design decisions, plans, and reviews

This project's own (rules for developing q):

- `docs/conventions/documentation.md` — rules for writing q's docs, the framework payload and this repo's own
- `docs/conventions/skills.md` — rules for writing q's skills
- `docs/guides/releasing.md` — how q's two artifacts, the plugin and the conventions pack, are versioned and released
