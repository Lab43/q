# q

A Claude Code plugin packaging an agentic coding workflow: skills for planning, implementing, verifying, and grooming, grounded in per-project conventions docs that each consuming project builds up over time.

Named for Q, the quartermaster who equips James Bond with his gadgets — q outfits your agents before they go into the field.

## Skills

<!-- source: each skill's SKILL.md frontmatter description -->

| Skill | What it does |
| --- | --- |
| `/q:setup` | Initialize a project: scaffold `docs/conventions/` and index it in the agent briefing. Idempotent, safe to re-run. |
| `/q:update-docs` | The single write path for doc changes — record a lesson, fix a guide, amend the briefing. |
| `/q:evaluate` | Evaluate code against the project's conventions, where either side may be the one to change. |
| `/q:groom-docs` | Verify and consolidate a project's documentation against the framework policy plus its recorded rulings. |
| `/q:improve-q` | From a consuming project, turn friction and flagged upstream candidates into a PR against the q repo. |

## How it works

q's effect on your repo comes from context routing and documentation discipline — everything it produces is plain markdown in your repo, and it works in one loop:

**Every session starts knowing where the rules are.** `/q:setup` scaffolds `docs/conventions/` — your project's conventions, one doc per topic, plus a `documentation.md` for your documentation rulings — and indexes it in your agent briefing (`AGENTS.md` or `CLAUDE.md`), while q announces its own location at session start. So every agent session, whether or not it ever invokes a q skill, is told to check your conventions before writing code and q's cross-cutting principles before design decisions — your recorded decisions bind future sessions instead of living in one person's head.

**Decisions become conventions as you make them.** The scaffold is deliberately near-empty, because conventions are earned as decisions are made, not pre-written. When a session hits a decision, lesson, or gotcha worth binding, `/q:update-docs` records it under q's documentation policy — phrased as a rule, one home per fact, placed where its next reader will look.

**Grooming keeps the docs true.** `/q:groom-docs` periodically verifies the whole documentation surface against the code and the policy — accuracy, duplication, dead references — so the docs agents are routed to stay worth trusting, which is what makes the routing worth anything.

**You stay in charge.** q's framework conventions (documentation policy, cross-cutting principles) ship read-only with the plugin and improve with updates, but your project's rulings win on conflict — record the disagreement and it stands (see the markers below). Deletions, reorganizations, commits, and PRs are proposed, never applied unilaterally. And since it's all markdown in your repo, removing the plugin leaves your docs intact and yours.

## Markers

<!-- source: conventions/documentation.md, Markers -->

q's documentation keeps every fact in exactly one authoritative home, but text still needs to point at, copy, or disagree with facts that live elsewhere. Markers declare which of those relationships is in play — making them visible to readers and checkable by grep, with no central list to maintain:

| Marker | Meaning |
| --- | --- |
| `(see: X)` | Plain cross-reference — nothing copied, the detail lives at X. |
| `(source: X)` | This text is a copy and X is the authority — `/q:groom-docs` checks that the copy still agrees with X. |
| `(overrides: X)` | This rule deliberately replaces the named one — `(overrides: q documentation.md, Code examples)` for a q framework rule, `(overrides: docs/conventions/style.md, Magic numbers)` for a broader project convention. `/q:groom-docs` respects it, and `/q:improve-q` picks up framework overrides worth upstreaming. |

## Developing q

<!-- source: docs/conventions/documentation.md, The tier test -->

This repo has two conventions directories, by design. `conventions/` is the framework: policy that ships with the plugin and binds every consuming project. `docs/conventions/` is q's own project tier — rules for developing q itself (skill authoring, for example) that are not framework law. The split exists because q is a consuming project of its own workflow: it keeps its working docs at the same contract path any consumer would, while the product it ships lives at the root.

<!-- source: AGENTS.md, Developing -->

To work on q:

- `claude --plugin-dir <path to your checkout>` from any project loads your working copy of the plugin; `/reload-plugins` picks up edits mid-session.
- `claude plugin validate --strict .` checks structure and manifest.
- Bump `version` in `.claude-plugin/plugin.json` to ship a change — installed consumers only receive updates on a version bump.
