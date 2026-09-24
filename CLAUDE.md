# q — Agent Briefing

q is an agentic coding workflow for Claude Code. This file briefs sessions working **on** q.

## Two tiers

(source: @lab43/q conventions/extensions.md, Which rules ship)

Everything under `q-extension/` is framework payload — the law and workflow that reach every consuming project, and that q follows here too, as a consuming project of its own workflow. The payload is *addressed* solely to consumers: it never mentions this repo. `docs/conventions/` is q's own project tier — rules for developing q, including this repo's `documentation.md` mirror. Before adding a rule anywhere, decide which home it belongs in (see: @lab43/q conventions/extensions.md, Which rules ship).

## Developing

- `claude` in this checkout auto-loads the working copy of the plugin — the repo declares itself as the `q-dev` marketplace in `.claude/settings.json`. From any other project, `claude --plugin-dir <path to this checkout>/q-extension` loads it ephemerally. SKILL.md edits apply immediately; `/reload-plugins` picks up hook and agent changes mid-session.
- When the `q:` skills don't load here, the repair is in `docs/guides/driving-manual.md`.
- `npm run check` runs every check this repo has, `npm test` among them. `package.json` names them; this line deliberately doesn't, because a list here goes stale the next time one is added. CI runs it on every pull request and on pushes to `main` (source: .github/workflows/checks.yml).
- `npm install` installs the pre-commit hook that runs `npm run check`. A tree that has not been installed commits without checking anything.
- PRs never touch a `version`: releasing is the maintainer's act, separate from merging (source: docs/guides/releasing.md).
- When another session is already working this checkout, take a worktree rather than sharing it. Run `npm install` in it (source: @lab43/q references/run-contract.md, The delivery branch). `.claude/settings.json` is tracked, so the plugin loads there.

## Documentation

q's rules live in this repo's documentation. Those rules are conventions: binding decisions about how q's code and docs get written, recorded as they are made. Two other kinds of doc sit alongside them. Specs state what q commits to, as behavior the code must honor. Guides say how to use and operate q, rather than how to write it (source: @lab43/q conventions/documentation.md, Taxonomy).

Before writing code, before design decisions and reviews, and before changing docs, check both tiers of conventions (see: Two tiers). All doc changes — the README and this briefing itself included — go through `/q:update-docs`.

In path references, `@lab43/q` resolves here to `q-extension/`, q's own payload working tree (source: docs/conventions/documentation.md, Working on the payload).

`@lab43/q` — The rules of the q workflow, governing how a project's work gets planned, decided, documented, and shipped.

- `@lab43/q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `@lab43/q conventions/conventions.md` — how a project's conventions are tiered, written, and enforced
- `@lab43/q conventions/extensions.md` — the extension format: rules for authoring and publishing a q extension
- `@lab43/q conventions/plans.md` — how a project's plans are written, sequenced, and carried to completion
- `@lab43/q conventions/specs.md` — how a project's specs are written and how the code is held to them
- `@lab43/q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `@lab43/q conventions/pull-requests.md` — rules for authoring a pull request
- `@lab43/q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read
- `@lab43/q conventions/principles.md` — cross-cutting rules for design decisions, plans, and reviews

This project's own:

- `docs/conventions/documentation.md` — rules for writing q's docs, the framework payload and this repo's own
- `docs/conventions/skills.md` — rules for writing q's skills
- `docs/conventions/testing.md` — rules for testing q's own executables

Specs — what q commits to, stated as behavior the code must honor (source: @lab43/q conventions/documentation.md, Taxonomy):

- none yet

Guides — how to use and operate q, rather than how to write its code (source: @lab43/q conventions/documentation.md, Taxonomy):

- `docs/guides/driving-manual.md` — how to bring q up in a session and exercise it
- `docs/guides/releasing.md` — how q is versioned and released
