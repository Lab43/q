# q — Agent Briefing

q is a Claude Code plugin packaging an agentic coding workflow. This file briefs sessions working **on** q.

## Two tiers

(source: docs/conventions/documentation.md, The tier test)

`conventions/` plus everything the plugin routes consumer sessions to are framework payload: the law and workflow that ship to every consuming project, and that q follows here too, as a consuming project of its own workflow. The payload is *addressed* solely to consumers: it never mentions this repo. `docs/conventions/` is q's own project tier — rules for developing q, including this repo's `documentation.md` mirror. Before adding a rule anywhere, apply the tier test in `docs/conventions/documentation.md`.

## Developing

- `claude` in this checkout auto-loads the working copy of the plugin — the repo declares itself as the `q` marketplace in `.claude/settings.json`. From any other project, `claude --plugin-dir <path to this checkout>` loads it ephemerally. SKILL.md edits apply immediately; `/reload-plugins` picks up hook and agent changes mid-session.
- When the `q:` skills don't load here, the CLI's registry holds this directory under a name other than `q`, so `q@q` resolves to nothing. `claude plugin marketplace add` matches that registry by path, so re-adding `./` reports the stale entry and changes nothing. Remove it with `claude plugin marketplace remove <name>`, then add `./` again.
- Before considering any structural change done: `claude plugin validate --strict .` (the marketplace manifest), `claude plugin validate --strict skills` and `claude plugin validate --strict agents` (the components), and `npm run check-versions` (the two manifests carrying a version agree).
- PRs never touch a `version`: releasing is the maintainer's act, separate from merging (source: docs/guides/releasing.md).
- When another session is already working this checkout, take a worktree rather than sharing it. A worktree needs no setup here: the repo has no dependencies to install. `.claude/settings.json` is tracked, so the plugin loads there.

## Documentation

q's rules live in this repo's documentation. Those rules are conventions: binding decisions about how q's code and docs get written, recorded as they are made. Guides sit alongside them — how to operate q, rather than rules for writing it.

Before writing code, before design decisions and reviews, and before changing docs, check both tiers of conventions (see: Two tiers). All doc changes — the README and this briefing itself included — go through `/q:update-docs`.

In path references, `q` abbreviates the `@lab43/q` pack (source: q conventions/documentation.md, Pack doc paths) — here resolving to the repo root, the pack's working tree (source: docs/conventions/documentation.md, Working on the payload).

Framework payload (ships to consumers):

- `q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `q conventions/doc-packs.md` — the doc pack format: rules for authoring and publishing a pack
- `q conventions/plans.md` — format, sequencing, and lifecycle rules for `docs/plans/` documents
- `q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `q conventions/pull-requests.md` — rules for authoring a pull request
- `q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read
- `q conventions/principles.md` — cross-cutting rules for design decisions, plans, and reviews

This project's own:

- `docs/conventions/documentation.md` — rules for writing q's docs, the framework payload and this repo's own
- `docs/conventions/skills.md` — rules for writing q's skills

Guides:

- `docs/guides/releasing.md` — how q is versioned and released
