# q

An agentic coding workflow for Claude Code: skills for planning, implementing, verifying, and grooming, grounded in conventions docs that each project builds up over time.

Named for Q, the quartermaster who equips James Bond with his gadgets — q outfits your agents before they go into the field.

## What your agent is missing

An agent starts each session knowing nothing about your project, and it trusts its own work. q supplies what it would otherwise go without:

<!-- source: @lab43/q conventions/documentation.md, Taxonomy -->
<!-- source: @lab43/q skills/drive/SKILL.md -->
<!-- source: @lab43/q conventions/pull-requests.md, Sections -->
<!-- source: @lab43/q references/run-contract.md, Validation -->
<!-- source: @lab43/q references/run-contract.md, Working alongside a peer -->

- **Context.** What you're building, and how your team writes code, lives in people's heads, Notion, and Jira, where an agent can't reliably find it. q keeps it in the repo, as conventions, specs, and guides under `docs/`, indexed in the `CLAUDE.md` every session loads. `/q:update-docs` records each decision as you make it, so it binds every session after.
- **Direction before code.** Once an agent has written code, it's hard to turn. `/q:create-plan` settles a plan with you before any code exists. `/q:implement` grounds smaller work in the code and waits for your go-ahead.
- **Eyes.** An agent won't look at its work running unless it's told to. `/q:drive` brings the product up and exercises the change. The PR then says what was exercised and what it showed, claim by claim, so "it works" arrives with evidence. `/q:drive` records what launching the product took in a driving manual, so the next session doesn't rediscover it.
- **Doubt.** An agent is confident about its own output. A q run that delivers work hands it to an adversarial reviewer: a subagent with fresh context, grounded in your conventions, trying to refute it. The run fixes what the reviewer finds and reviews again, up to three rounds, before a human sees it.
- **Parallel sessions.** Run several tasks in one repo at once without them colliding. q sessions tell each other what work they're taking up, so two never pick up the same task. A session takes its own git worktree when it learns another is working the checkout. `/q:parallelize` gives each session its own ports, databases, and anything else they would otherwise fight over.
- **Upkeep.** Docs drift as the code changes, and an agent follows stale docs as faithfully as true ones. `/q:groom-docs` checks the whole documentation surface against the code and consolidates what has drifted.

## How it works

Everything q produces lives in plain text files in your repo.

<!-- source: @lab43/q skills/install/SKILL.md -->
<!-- source: @lab43/q hooks/session-start.mjs -->

**Every session starts knowing where the rules are.** Your conventions sit in `docs/conventions/`, one doc per topic, beside q's own and those of any extension you install. Your `CLAUDE.md` indexes all of them. Every session is told to check them before writing code, making design decisions, or changing docs, whether or not it invokes a q skill.

**Your docs come in four kinds.** Each has its own directory under `docs/`:

<!-- source: @lab43/q conventions/documentation.md, Taxonomy -->

- **Conventions** (`docs/conventions/`) say how code here gets written. They start nearly empty, because conventions are earned as decisions are made, not pre-written. `/q:update-docs` records each decision as a rule, with one home per fact, placed where its next reader will look. Break a convention and the code is wrong.
- **Specs** (`docs/specs/`) say what a feature does. You write them on purpose, before the code or as a deliberate change to it. Break a spec and the product is wrong, unless you meant to change the promise, in which case the spec changes with it.
- **Guides** (`docs/guides/`) say how to use and operate the product, such as how to deploy it.
- **Plans** (`docs/plans/`) say how a feature will be built, phase by phase. `/q:create-plan` writes them with you, and `/q:implement-plan` carries them out. They stay in the repo after they ship.

**Every task runs the same loop.** Work enters through `/q:implement`, which takes a single task. `/q:triage` feeds it from a set of items, picking one task at a time. `/q:review` starts from work that already exists. From there:

1. Investigate the code and the docs.
2. Settle the approach with you. Larger work becomes a plan first, through `/q:create-plan`. A plan too big for one PR ships as a stack of PRs.
3. Do the work.
4. Put it through adversarial review.
5. Open a PR. You pick the review mode at the start of each run. In ship mode the PR opens straight away. In local mode nothing is committed until you've reviewed the work.
6. Review the PR and merge it. Merging is always yours. Changes you request go through `/q:address-feedback`.

**You stay in charge.**

<!-- source: @lab43/q references/run-contract.md, Collaboration modes -->

- Every run talks decisions through with you, and goes ahead only when you agree. Once you have, it does the work without asking. It stops to check with you only when the work would go beyond what you agreed.
- Your rules beat q's. When one of q's rules doesn't suit your project, write your own in your conventions, and it replaces q's there (see: Markers).
- q is an npm package, so its version is pinned in your repo like any other dependency. Every teammate runs the same version of q, and it changes only when you upgrade it. When you upgrade, `/q:reconcile` brings your docs in line with the new version.
- Removing q leaves your docs intact and yours.

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

## Getting started

[Claude Code](https://claude.com/claude-code), [Node.js](https://nodejs.org), and an authenticated [GitHub CLI](https://cli.github.com) (`gh`) are required.

<!-- source: @lab43/q skills/install/SKILL.md -->

```sh
# Add q as a dev dependency, pinned to this exact version.
npm install --save-dev --save-exact @lab43/q

# Load q manually the first time.
claude --plugin-dir ./node_modules/@lab43/q/q-extension

# Within Claude, set up q.
# This scaffolds the docs and auto-loads the skills in future sessions.
/q:install
```

You only do this once per project. Any later checkout, yours or a teammate's, just needs `npm install`. q arrives with the project's other dependencies, and Claude Code loads it automatically.

## Skills

<!-- source: @lab43/q skills/ -->

**Everyday work** — the workflow loop:

- `/q:implement` — Take on any work — ground it in the code, then fix it in a single adversarially reviewed PR. Escalate to planning for larger work.
- `/q:triage` — Choose what to work on next from a set of items (a Jira board, GitHub issues, a text doc, etc.) and hand each agreed pick to `/q:implement`.
- `/q:review` — Review anything ad hoc — a diff, file, directory, feature, or plan doc — through the adversarial reviewer. You rule on the findings and decide what to change.
- `/q:create-plan` — Collaboratively write a feature plan and save it to `docs/plans/`.
- `/q:implement-plan` — Execute a plan end-to-end, in a single PR or stacked PRs.
- `/q:address-feedback` — Review feedback on a PR. Implement the agreed fixes then push them to the PR, with replies posted when you want them.

**Docs:**

- `/q:update-docs` — Update the docs — record a lesson, fix a guide, update `CLAUDE.md`. Ships as its own PR, or stays in the working tree to go out with the work you're doing.
- `/q:groom-docs` — Check all your docs against the code and q's documentation rules, and consolidate what has drifted.
- `/q:upstream` — Turn problems with q's rules, and your overrides of them, into PRs against the repos that own the rules — q's own, or an extension's.

**Local environment:**

- `/q:parallelize` — Give parallel sessions their own copies of what they compete for while running the product — ports, databases, caches, devices. Isolates what it can, and names what sessions must take turns over instead.
- `/q:drive` — Bring the product up and exercise it — to see a change working, or to settle a question only running something can. Records what launching and navigating it took to `docs/guides/driving-manual.md`, so the next session doesn't rediscover it.
- `/q:clean-worktrees` — Clear the git worktrees that finished parallel sessions leave behind. Reports what each one holds and whether that work has reached the remote.

**Setup and upgrades:**

- `/q:install` — Set up q in a project you've already npm-installed it into, or repair a scaffold that has drifted. Safe to re-run on a partially set-up project.
- `/q:reconcile` — Reconcile the project's docs with the versions of q and extensions in package.json.

## Settings

<!-- source: @lab43/q conventions/pull-requests.md, Draft -->
<!-- source: @lab43/q conventions/extensions.md, Description -->

q's settings live under the `q` key of your root `package.json`. Everything else about how q behaves in your project is decided in your conventions docs.

<!--
  Keys must not wrap.
  see: docs/conventions/documentation.md, Table cells that must not wrap
-->
<!-- markdownlint-disable MD033 -->
<table>
  <tr>
    <th>Key</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td nowrap><samp>q.draftPullRequests</samp></td>
    <td>Set to <code>true</code> to open every PR as a draft, so its author reviews it before the team does.</td>
  </tr>
  <tr>
    <td nowrap><samp>q.description</samp></td>
    <td>Only required for repos that publish a q extension. One sentence saying what the extension's docs cover. Projects that install the extension show it in their agent briefing.</td>
  </tr>
</table>
<!-- markdownlint-enable MD033 -->

## Markers

<!-- source: @lab43/q conventions/documentation.md, Markers -->

q adds cross-references to your docs to help them stay in sync. Each fact has one home, and a marker records how other text relates to it. Readers can follow a marker to the detail, and `/q:groom-docs` keeps them accurate:

- `(see: X)` — the detail lives at X. Nothing is copied.
- `(source: X)` — this text copies X, which is the authority.
- `(overrides: X)` — this rule replaces X, whether X is one of q's rules, an extension's, or a broader rule of your own. `/q:upstream` picks up overrides worth proposing to the rule's owner.
- `(exception: X)` — this one spot is exempt from rule X, which still holds everywhere else. Several exceptions to one rule suggest the rule needs revisiting.
- `(spec: X)` — this code enforces spec X. It sits in a comment at the top of the file, function, or test.

The full rules are in [q's documentation policy](q-extension/conventions/documentation.md#markers).

## Developing q

<!-- source: CLAUDE.md, Developing -->

q is developed with q. To work on it:

1. Clone this repo and run `npm install`.
2. Start `claude` in your checkout. It loads your working copy of q rather than a published version, and picks up skill edits immediately.

<!-- source: @lab43/q conventions/extensions.md, Which rules ship -->

Rules live in two places:

- `q-extension/` is what the `@lab43/q` package ships: the skills, and the conventions every project using q follows.
- `docs/conventions/` holds the rules for developing q itself. They don't ship.

<!-- source: .claude/skills/release/SKILL.md -->

To release q, run `/release` in your checkout. It bumps the version, pushes the bump to `main`, and publishes the GitHub release that triggers the npm publish.
