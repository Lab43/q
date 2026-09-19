# q

An agentic coding workflow for Claude Code: skills for planning, implementing, verifying, and grooming, grounded in per-project conventions docs that each consuming project builds up over time.

Named for Q, the quartermaster who equips James Bond with his gadgets — q outfits your agents before they go into the field.

## Requirements

[Claude Code](https://claude.com/claude-code), [Node.js](https://nodejs.org) — the conventions install as an npm package — and an authenticated [GitHub CLI](https://cli.github.com) (`gh`).

## Adding q to a project

```sh
npm install --save-dev --save-exact --ignore-scripts @lab43/q
claude plugin marketplace add --scope local ./node_modules/@lab43/q
claude plugin install q@q --scope project
```

npm delivers q's bytes before Claude Code is involved, so installing q doesn't require already having q. Then run `/q:install` in the project, which:

<!-- source: skills/install/SKILL.md -->

- scaffolds your conventions
- gives the project its own marketplace, sourcing the q you just installed
- records the version your docs were reconciled against

## Joining a project that uses q

<!-- source: skills/install/SKILL.md -->

Install the project's dependencies, substituting your package manager where the project isn't on npm:

```sh
npm install
```

That is the whole of it — q arrives as a pinned dependency, and the project's tracked settings tell Claude Code to load it. `/q:install` folds this into the project's README, so a q-using repo carries it itself.

## Skills

<!-- source: skills/ -->
<!--
  Skill names must not wrap.
  Keep each name in <samp>. Keep nowrap on its cell.
  Do not switch a name in this column to <code>. GitHub gives <code> its own white-space: break-spaces. A value set on the element replaces the one inherited from the cell.
  Do not replace nowrap with a style attribute. GitHub strips style.
-->
<!-- markdownlint-disable MD033 -->
<table>
  <tr>
    <th>Type</th>
    <th>Skill</th>
    <th>What it does</th>
  </tr>
  <tr>
    <th rowspan="4" scope="rowgroup">Setup</th>
    <td nowrap><samp>/q:install</samp></td>
    <td>Install q into a project, or add an extension to one. Idempotent, safe to re-run on a partially set-up project.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:sync</samp></td>
    <td>Set up or repair this machine for a q-using project, handing off to <code>/q:install</code>, <code>/q:update</code>, or <code>/q:uninstall-extension</code> when the project's records don't match its pins.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:update</samp></td>
    <td>Update q and the project's installed extensions: move pins to the latest releases with your go-ahead, reconcile the project's docs with what each release changed, and catch up any pin that moved out of band.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:uninstall-extension</samp></td>
    <td>Remove an extension from a project, or reconcile a removal made out of band — the package, its group in the briefing's docs index, its watermark, and your ruling on each doc that references it.</td>
  </tr>
  <tr>
    <th rowspan="8" scope="rowgroup">Workflow</th>
    <td nowrap><samp>/q:triage</samp></td>
    <td>Choose what to work on next from a set of items — a Jira board, GitHub issues, a Notion doc — and hand each agreed pick to <code>/q:implement</code>.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:implement</samp></td>
    <td>Take on unplanned work — ground it in the code, then fix it in a single adversarially reviewed PR, escalate to planning, or show with evidence that nothing needs doing.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:create-plan</samp></td>
    <td>Collaboratively plan a feature into <code>docs/plans/</code> — grounded in the code, settled with you, hardened by adversarial review. Produces the plan doc, never code.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:implement-plan</samp></td>
    <td>Execute a plan end-to-end — phased implementation with adversarial review, then the PR (or stacked PRs) the plan calls for.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:review</samp></td>
    <td>Review anything ad hoc — a diff, file, directory, feature, or plan doc — through the adversarial reviewer; you rule on the findings, and a finding may fault a convention rather than the work.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:address-feedback</samp></td>
    <td>Work feedback on a PR — the reviewer's comments, or revisions you raise yourself. Every item gets a position and your ruling, then the agreed fixes are implemented, reviewed, and pushed to the PR, with replies posted when you want them.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:drive</samp></td>
    <td>Bring the product up and exercise it — to see a change working, or to settle a question only running something can. Records what launching and navigating it took, so the next session doesn't rediscover it.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:parallelize</samp></td>
    <td>Give parallel sessions their own copies of what they contend over while driving — ports, databases, caches, devices. Isolates what it can, and names what sessions must take turns over instead.</td>
  </tr>
  <tr>
    <th rowspan="3" scope="rowgroup">Docs</th>
    <td nowrap><samp>/q:update-docs</samp></td>
    <td>The single write path for doc changes — record a lesson, fix a guide, amend the briefing. Invoked directly, the changes ship as a PR.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:groom-docs</samp></td>
    <td>Audit the whole documentation surface against the documentation policy and consolidate what has drifted. Approved edits ship as a PR.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:upstream</samp></td>
    <td>Turn session friction and recorded deviations into PRs against the repos that own the rules — q's own, or an extension's.</td>
  </tr>
</table>
<!-- markdownlint-enable MD033 -->

## How it works

<!-- source: docs/workflow-chart/chart.html -->
<!-- regenerated by docs/workflow-chart/screenshot.py -->
<!-- markdownlint-disable MD033 -->
<a href="docs/workflow-chart/light.png">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/workflow-chart/dark.png">
    <img alt="The q workflow: work flows from triage and start through plan, implement, and human review to merge, with adversarial review gating plan and implement. Conventions documentation — project docs over the installed extensions over q — grounds each step; gotchas and corrections flow back down as rules on project docs, and rules that belong upstream leave as PRs." src="docs/workflow-chart/light.png">
  </picture>
</a>
<!-- markdownlint-enable MD033 -->

q's effect on your repo comes from context routing and documentation discipline — everything it produces lives in plain text files in your repo, and it works in one loop:

<!-- source: skills/install/SKILL.md -->
<!-- source: hooks/session-start.mjs -->

**Every session starts knowing where the rules are.** `/q:install` puts the routing in place:

- scaffolds `docs/conventions/` — your project's conventions, one doc per topic, seeded with a `principles.md` for your cross-cutting rules and a `documentation.md` for your documentation rulings
- installs q as the `@lab43/q` npm package, pinned exactly in your `package.json` — its conventions and its plugin arrive together, at one version
- indexes every tier in your agent briefing (`CLAUDE.md`)
- gives your project its own marketplace, sourcing the q it just pinned, so every teammate's machine runs the version the repo chose
- records watermarks in a committed `.claude/q-state.json` — the versions those pins were last reconciled against

Every session start validates that installed, pinned, and watermarked versions still agree — drift from any direction, a hand-run npm install or a Dependabot bump included, is flagged with its fix: run `/q:sync`. And every agent session, whether or not it ever invokes a q skill, is told to check every tier of conventions — q's, any extensions' you install, and yours — before writing code, making design decisions, or changing docs; your recorded decisions bind future sessions instead of living in one person's head.

**Decisions become conventions as you make them.** The scaffold is deliberately near-empty, because conventions are earned as decisions are made, not pre-written. When a session hits a decision, lesson, or gotcha worth binding, `/q:update-docs` records it under q's documentation policy — phrased as a rule, one home per fact, placed where its next reader will look.

**Grooming keeps the docs true.** `/q:groom-docs` periodically verifies the whole documentation surface against the code and the policy — accuracy, duplication, dead references — so the docs agents are routed to stay worth trusting, which is what makes the routing worth anything.

**You stay in charge.**

- Both halves of q install pinned, and pins move only when you approve an update, which reconciles your docs with what changed.
- Your project's rulings win on conflict — record the disagreement and it stands (see the markers below).
- Every run that delivers work settles its review mode with you up front. In local mode nothing is committed until you review it. In ship mode the work goes straight to a PR you review on GitHub. Merging is always yours.
- It's all plain text files in your repo — removing q leaves your docs intact and yours.

## Markers

<!-- source: @lab43/q conventions/documentation.md, Markers -->
<!-- source: @lab43/q conventions/documentation.md, Single source of truth -->

q's documentation keeps every fact in exactly one authoritative home, but text still needs to point at, copy, or disagree with facts that live elsewhere. Markers declare which of those relationships is in play — making them visible to readers and checkable by grep, with no central list to maintain:

| Marker | Meaning |
| --- | --- |
| `(see: X)` | Plain cross-reference — nothing copied, the detail lives at X. |
| `(source: X)` | This text is a copy and X is the authority — `/q:groom-docs` checks that the copy still agrees with X. |
| `(overrides: X)` | This rule deliberately replaces the named one — a q rule (`overrides: @lab43/q conventions/documentation.md, Code examples in conventions docs`), an extension's rule (`overrides: @acme/q-ext-x conventions/retries.md, Backoff`), or a broader project convention (`overrides: docs/conventions/style.md, Magic numbers`). `/q:groom-docs` respects it, and `/q:upstream` picks up overrides worth carrying to the rule's owner. |

## Developing q

<!-- source: docs/conventions/documentation.md, The tier test -->

This repo has two conventions directories, by design. `conventions/` is the framework policy: it ships in the `@lab43/q` npm package and binds every consuming project. `docs/conventions/` is q's own project tier — rules for developing q itself (skill authoring, for example) that are not framework law. The split exists because q is a consuming project of its own workflow: it keeps its working docs at the same contract path any consumer would, kept apart from the product it ships.

<!-- source: CLAUDE.md, Developing -->
<!-- source: docs/guides/driving-manual.md -->

To work on q:

- `claude` in your checkout auto-loads your working copy of the plugin (the repo declares itself as the `q` marketplace in `.claude/settings.json`); from any other project, `claude --plugin-dir <path to your checkout>` loads it. SKILL.md edits apply immediately; `/reload-plugins` picks up hook and agent changes mid-session.
- When the `q:` skills don't load in your checkout, the CLI's registry holds that directory under a name other than `q`, so `q@q` resolves to nothing. `claude plugin marketplace add` matches the registry by path, so re-adding `./` just reports the stale entry. Remove it with `claude plugin marketplace remove <name>`, then add `./` again.
- `npm run check` runs every check the repo has: plugin validation, version agreement between the two manifests carrying one, markdown linting, and frontmatter parsing. `package.json` names them, so read it there rather than trusting a list in prose. CI runs it on every pull request and on pushes to `main`.
- `npm install` installs the pre-commit hook that runs `npm run check`. A tree you have not installed commits without checking anything.
- Releasing is separate from merging, and PRs never touch a `version`; the steps live in `docs/guides/releasing.md`.
- When another session is already working your checkout, take a worktree rather than sharing it. Run `npm install` in it. `.claude/settings.json` is tracked, so the plugin loads there.
