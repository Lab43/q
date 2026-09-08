# q — Agent Briefing

q is a Claude Code plugin packaging an agentic coding workflow. This file briefs sessions working **on** q. A plugin install copies the whole repo to the consumer's machine, but nothing here auto-loads into their sessions — consumers encounter only what the plugin routes them to: skills, hooks, and the framework conventions the skills read.

## Extraction

q is being extracted piece-by-piece from the workflow developed in the earmarks project (`github.com/Lab43/earmarks` — its `.claude/skills/`, `.claude/agents/`, and `docs/conventions/`). When porting a piece:

- **Generalize, don't copy**: strip earmarks-specific paths, tools, and facts; make surface checks conditional on what exists in a consuming project (`AGENTS.md` *or* `CLAUDE.md`, `docs/plans/` only if present).
- **Split interleaved docs** by the policy/rulings rule: framework-general policy ships here in `packages/q-conventions/conventions/`; project-specific data (rulings, deviations, exemplars) belongs to the consuming project's `docs/conventions/`, with its schema defined by the framework doc.
- After a port is verified, the earmarks original should be deleted (in earmarks, by the user or a session there) — un-namespaced local skills otherwise keep getting used over the plugin's.
- **Skill naming and descriptions** follow `docs/conventions/skills.md`. Earmarks names carry over where they already conform (`create-plan`, `triage-issue`, `check`, `verify`); non-conforming ones are renamed at port time (`pr-feedback` is noun-noun — port as e.g. `address-feedback`).
- **When the plan skills port**, the Plan lifecycle section moves from the payload's `documentation.md` into a new sibling `plans.md` shipped with those skills — plans become their own topic once authoring and workflow rules join the lifecycle rules. documentation.md keeps only what the documentation policy owns: the `docs/plans/` taxonomy bullet (pointing `see: q plans.md`) and the Grooming section's treatment rule (status check only, bodies exempt).

This section is scaffolding for the extraction, not part of q. When the last piece is ported, delete it and scrub every remaining earmarks mention from this repo — q is its own thing, and its history lives in git, not its docs.

## Two tiers

(source: `docs/conventions/documentation.md`, The tier test)

`packages/q-conventions/conventions/` and `skills/` are framework payload — the law and workflow that ship to every consuming project, and that q follows here too, as a consuming project of its own workflow. The payload is *addressed* solely to consumers: it never mentions this repo. `docs/conventions/` is q's own project tier — rules for developing q, including this repo's `documentation.md` mirror. Before adding a rule anywhere, apply the tier test in `docs/conventions/documentation.md`.

## Developing

- `claude --plugin-dir <path to this checkout>` from any project loads the plugin ephemerally for testing; `/reload-plugins` picks up mid-session changes (SKILL.md edits apply immediately; hooks/agents/MCP need the reload).
- `claude plugin validate --strict .` before considering any structural change done.
- Releasing is separate from merging and is the maintainer's act — PRs never touch `version`. To release: bump `version` in `.claude-plugin/plugin.json` on main and run `claude plugin tag --push`; updates only ship on a version bump, and the pushed `q--v{version}` tag is what project pins and `/q:update-q` resolve against.
- The framework conventions also publish as the `@lab43/q-conventions` npm doc pack, released from `packages/q-conventions/` with `npm publish --access public`. Its `version` moves independently of the plugin's, and publishing is likewise the maintainer's act.

## Conventions

Before writing code, before design decisions and reviews, and before changing docs, check both tiers of conventions — `packages/q-conventions/conventions/` and `docs/conventions/`. All doc changes — the README and this briefing itself included — go through `/q:update-docs`.

Framework payload (ships to consumers):

- `packages/q-conventions/conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `packages/q-conventions/conventions/principles.md` — cross-cutting rules for design decisions, plans, and reviews

This project's own (rules for developing q):

- `docs/conventions/documentation.md` — rules for writing q's docs, the framework payload and this repo's own
- `docs/conventions/skills.md` — rules for writing q's skills
