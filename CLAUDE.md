# q — Agent Briefing

q is an agentic coding workflow for Claude Code. This file briefs sessions working **on** q.

## Two tiers

(source: docs/conventions/documentation.md, The tier test)

What the `@lab43/q` package ships is framework payload — `conventions/`, the skills, the hooks, the agents, and the references they read: the law and workflow that reach every consuming project, and that q follows here too, as a consuming project of its own workflow. The payload is *addressed* solely to consumers: it never mentions this repo. `docs/conventions/` is q's own project tier — rules for developing q, including this repo's `documentation.md` mirror. Before adding a rule anywhere, apply the tier test in `docs/conventions/documentation.md`.

## Developing

- `claude` in this checkout auto-loads the working copy of the plugin — the repo declares itself as the `q` marketplace in `.claude/settings.json`. From any other project, `claude --plugin-dir <path to this checkout>` loads it ephemerally. SKILL.md edits apply immediately; `/reload-plugins` picks up hook and agent changes mid-session.
- When the `q:` skills don't load here, the repair is in `docs/guides/driving-manual.md`.
- `npm run check` runs every check this repo has: plugin validation, version agreement between the two manifests carrying one, markdown linting, and frontmatter parsing. `package.json` names them, so read it there rather than trusting a list in prose. CI runs it on every pull request and on pushes to `main` (source: .github/workflows/checks.yml).
- `npm install` installs the pre-commit hook that runs `npm run check`. A tree that has not been installed commits without checking anything.
- PRs never touch a `version`: releasing is the maintainer's act, separate from merging. A release is a workflow dispatch that runs the checks itself, because its own push starts no workflow (source: docs/guides/releasing.md).
- When another session is already working this checkout, take a worktree rather than sharing it. Run `npm install` in it (source: @lab43/q references/run-contract.md, The delivery branch). `.claude/settings.json` is tracked, so the plugin loads there.

## Documentation

q's rules live in this repo's documentation. Those rules are conventions: binding decisions about how q's code and docs get written, recorded as they are made. Guides sit alongside them — how to operate q, rather than rules for writing it.

Before writing code, before design decisions and reviews, and before changing docs, check both tiers of conventions (see: Two tiers). All doc changes — the README and this briefing itself included — go through `/q:update-docs`.

In path references, `@lab43/q` resolves here to the repo root, q's own working tree (source: docs/conventions/documentation.md, Working on the payload).

Framework payload (ships to consumers):

- `@lab43/q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `@lab43/q conventions/extensions.md` — the extension format: rules for authoring and publishing a q extension
- `@lab43/q conventions/plans.md` — format, sequencing, and lifecycle rules for `docs/plans/` documents
- `@lab43/q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `@lab43/q conventions/pull-requests.md` — rules for authoring a pull request
- `@lab43/q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read
- `@lab43/q conventions/principles.md` — cross-cutting rules for design decisions, plans, and reviews

This project's own:

- `docs/conventions/documentation.md` — rules for writing q's docs, the framework payload and this repo's own
- `docs/conventions/skills.md` — rules for writing q's skills

Guides:

- `docs/guides/driving-manual.md` — how to bring q up in a session and exercise it
- `docs/guides/releasing.md` — how q is versioned and released
