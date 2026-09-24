# q

An agentic coding workflow for Claude Code: skills for planning, implementing, verifying, and grooming, grounded in per-project conventions docs that each consuming project builds up over time.

Named for Q, the quartermaster who equips James Bond with his gadgets — q outfits your agents before they go into the field.

## Requirements

[Claude Code](https://claude.com/claude-code), [Node.js](https://nodejs.org) — the conventions install as an npm package — and an authenticated [GitHub CLI](https://cli.github.com) (`gh`).

## Adding q to a project

```sh
npm install --save-dev --save-exact --ignore-scripts @lab43/q
claude --plugin-dir ./node_modules/@lab43/q/q-extension
```

npm delivers q's bytes before Claude Code is involved, so installing q doesn't require already having q. `--plugin-dir` loads q for that one session, which is all it takes to run `/q:install` in it:

<!-- source: @lab43/q skills/install/SKILL.md -->

- scaffolds your conventions
- gives the project its own marketplace, sourcing the q you just installed
- records the version your docs were reconciled against

Start every session after that with plain `claude`. The marketplace `/q:install` wrote is the project's own, and your tracked settings point each session at it.

## Joining a project that uses q

<!-- source: @lab43/q skills/install/SKILL.md -->

Install the project's dependencies, substituting your package manager where the project isn't on npm:

```sh
npm install
```

That is the whole of it — q arrives with the project's dependencies, and the project's tracked settings tell Claude Code to load it. `/q:install` writes a q section into the project's own README, so contributors meet q without leaving the repo.

## Skills

<!-- source: @lab43/q skills/ -->
<!--
  Skill names must not wrap.
  see: docs/conventions/documentation.md, Table cells that must not wrap
-->
<!-- markdownlint-disable MD033 -->
<table>
  <tr>
    <th>Type</th>
    <th>Skill</th>
    <th>What it does</th>
  </tr>
  <tr>
    <th rowspan="2" scope="rowgroup">Setup</th>
    <td nowrap><samp>/q:install</samp></td>
    <td>Set up q in a project you've already npm-installed it into, or repair a scaffold that has drifted. Safe to re-run on a partially set-up project.</td>
  </tr>
  <tr>
    <td nowrap><samp>/q:reconcile</samp></td>
    <td>Reconcile the project's records with what npm already did — q or an extension updated, installed, or removed. Also sets up or repairs this machine.</td>
  </tr>
  <tr>
    <th rowspan="9" scope="rowgroup">Workflow</th>
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
    <td nowrap><samp>/q:clean-worktrees</samp></td>
    <td>Clear the git worktrees that finished parallel sessions leave behind. Reports what each one holds and whether that work has reached the remote. You rule on the list before anything is removed.</td>
  </tr>
  <tr>
    <th rowspan="3" scope="rowgroup">Docs</th>
    <td nowrap><samp>/q:update-docs</samp></td>
    <td>The single write path for doc changes — record a lesson, fix a guide, amend the briefing. Ships as a PR, or stays in the working tree with the work in flight.</td>
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
    <img alt="The q workflow. Entry points — /q:triage takes a set of work, /q:implement a single task, /q:review existing work — feed one workflow loop: investigate, discuss, execute, adversarial review, then a PR, opened directly in ship mode or after the human's local review in local mode, then human PR review and merge, with requested changes looping back into discuss. Docs ground every step: project docs — conventions, specs, guides, plans — over installed extensions over q, with plans, findings, and new rulings written back as work happens, and upstream PRs carrying overrides to the layers that own them." src="docs/workflow-chart/light.png">
  </picture>
</a>
<!-- markdownlint-enable MD033 -->

q's effect on your repo comes from context routing and documentation discipline — everything it produces lives in plain text files in your repo, and it works in one loop:

<!-- source: @lab43/q skills/install/SKILL.md -->
<!-- source: @lab43/q hooks/session-start.mjs -->

**Every session starts knowing where the rules are.** `/q:install` puts the routing in place:

- scaffolds `docs/conventions/` — your project's conventions, one doc per topic, seeded with a `principles.md` for your cross-cutting rules and a `documentation.md` for your documentation rulings
- builds on the `@lab43/q` npm package you installed — its conventions and its plugin arrive together, at one version, and the skill scaffolds around it
- indexes every tier in your agent briefing (`CLAUDE.md`)
- gives your project its own marketplace, sourcing the q you installed and the plugin of any extension that ships one, so every teammate's machine runs the versions the repo chose
- records watermarks in a committed `.claude/q-state.json` — the versions your docs were last reconciled against

Every session start validates that your lockfile, the installed copies, and the watermarks still agree — drift from any direction, a hand-run npm install or a Dependabot bump included, is flagged with its fix: run `/q:reconcile`. And every agent session, whether or not it ever invokes a q skill, is told to check every tier of conventions — q's, any extensions' you install, and yours — before writing code, making design decisions, or changing docs; your recorded decisions bind future sessions instead of living in one person's head.

**Decisions become conventions as you make them.** The scaffold is deliberately near-empty, because conventions are earned as decisions are made, not pre-written. When a session hits a decision, lesson, or gotcha worth binding, `/q:update-docs` records it under q's documentation policy — phrased as a rule, one home per fact, placed where its next reader will look.

**A convention records practice. A spec records a promise.** A convention says how code here gets written, and it grows out of the decisions you make while working. A spec says what a feature does, and you write it on purpose, before the code or as a deliberate change to it. Break a convention and the code is wrong. Break a spec and the product is wrong, unless you meant to change the promise, in which case the spec changes with it.
<!-- source: @lab43/q conventions/documentation.md, Taxonomy -->

**Grooming keeps the docs true.** `/q:groom-docs` periodically verifies the whole documentation surface against the code and the policy — accuracy, duplication, dead references — so the docs agents are routed to stay worth trusting, which is what makes the routing worth anything.

**You stay in charge.**

- Versions are yours to move — npm and your lockfile decide what runs, and `/q:reconcile` folds each move into your docs.
- Your project's rulings win on conflict — record the disagreement and it stands (see the markers below).
- Every run that delivers work settles its review mode with you up front. In local mode nothing is committed until you review it. In ship mode the work goes straight to a PR you review on GitHub. Merging is always yours.
- It's all plain text files in your repo — removing q leaves your docs intact and yours.

## Markers

<!-- source: @lab43/q conventions/documentation.md, Markers -->
<!-- source: @lab43/q conventions/documentation.md, Single source of truth -->

q's documentation keeps every fact in exactly one authoritative home. Text still has to point at, copy, or disagree with what lives elsewhere, and one site sometimes has to sit outside a rule the rest of the project follows. A marker declares which of those is in play — making it visible to readers and checkable by grep, with no central list to maintain:

<!--
  Markers must not wrap.
  see: docs/conventions/documentation.md, Table cells that must not wrap
-->
<!-- markdownlint-disable MD033 -->
<table>
  <tr>
    <th>Marker</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td nowrap><samp>(see: X)</samp></td>
    <td>Plain cross-reference — nothing copied, the detail lives at X.</td>
  </tr>
  <tr>
    <td nowrap><samp>(source: X)</samp></td>
    <td>This text is a copy and X is the authority — <code>/q:groom-docs</code> checks that the copy still agrees with X.</td>
  </tr>
  <tr>
    <td nowrap><samp>(overrides: X)</samp></td>
    <td>This rule deliberately replaces the named one — a q rule (<code>overrides: @lab43/q conventions/conventions.md, Code examples in conventions docs</code>), an extension's rule (<code>overrides: @acme/q-ext-x conventions/retries.md, Backoff</code>), or a broader project convention (<code>overrides: docs/conventions/style.md, Magic numbers</code>). <code>/q:groom-docs</code> respects it, and <code>/q:upstream</code> picks up overrides worth carrying to the rule's owner.</td>
  </tr>
  <tr>
    <td nowrap><samp>(exception: X)</samp></td>
    <td>This site is exempt from the named rule, which still stands everywhere else (<code>exception: docs/conventions/logging.md, Structured fields</code>). It always names both a doc and a section, and the reason is the text it sits in, in prose or in a comment — without either part it excuses nothing. <code>/q:groom-docs</code> counts them by rule, so several against one rule surface as a signal the rule wants revisiting.</td>
  </tr>
  <tr>
    <td nowrap><samp>(spec: X)</samp></td>
    <td>This marker heads the file or unit that enforces the named spec (<code>spec: docs/specs/tasks.md</code>). It sits once at the head of enforcing code — a file, a function, a test block — in that file's comment syntax, never in prose, and names the doc alone. Amending a spec means reading every unit marked with it. <code>/q:groom-docs</code> reports a marker naming a doc that no longer exists, and a spec no marker names.</td>
  </tr>
</table>
<!-- markdownlint-enable MD033 -->

## Developing q

<!-- source: @lab43/q conventions/extensions.md, Which rules ship -->

This repo has two conventions directories, by design. `q-extension/` is the payload the `@lab43/q` npm package ships, and its `conventions/` are the framework policy that binds every consuming project. `docs/conventions/` is q's own project tier — rules for developing q itself (skill authoring, for example) that are not framework law. The split exists because q is a consuming project of its own workflow: it keeps its working docs at the same contract path any consumer would, kept apart from the product it ships. Every extension gets the same two homes, and the rule deciding between them ships with the rest.

<!-- source: CLAUDE.md, Developing -->
<!-- source: docs/guides/driving-manual.md -->

To work on q:

- `claude` in your checkout auto-loads your working copy of the plugin (the repo declares itself as the `q-dev` marketplace in `.claude/settings.json`); from any other project, `claude --plugin-dir <path to your checkout>/q-extension` loads it without registering anything. SKILL.md edits apply immediately; `/reload-plugins` picks up hook and agent changes mid-session.
- When the `q:` skills don't load in your checkout, read the `q-dev` entry in `claude plugin marketplace list`. An entry naming a directory that is gone — usually a worktree that held the name and was then removed — takes registering your checkout again, with its path written in full. No `q-dev` entry at all means the registry holds your directory under another name: remove that entry with `claude plugin marketplace remove <name>`, then register your checkout again. That remove also strips the marketplace from the repo's tracked `.claude/settings.json`, so check that file afterwards and put the declaration back.
- `npm run check` runs every check the repo has, `npm test` among them. `package.json` names them; this line deliberately doesn't, because a list here goes stale the next time one is added. CI runs it on every pull request and on pushes to `main`.
- `npm install` installs the pre-commit hook that runs `npm run check`. A tree you have not installed commits without checking anything.
- Releasing is separate from merging, and PRs never touch a `version`. The steps live in `docs/guides/releasing.md`.
- When another session is already working your checkout, take a worktree rather than sharing it. Run `npm install` in it. `.claude/settings.json` is tracked, so the plugin loads there.
