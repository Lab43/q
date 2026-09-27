---
name: parallelize
description: Give a repo's parallel sessions their own copies of what they contend over while driving — ports, databases, caches, devices. Use when sessions collide over something the repo holds only one of, or to prepare a repo before parallel work starts. Invoke it bare to sweep the repo, or name a resource to scope it. Isolates what can be isolated, names what sessions must take turns over instead, and records both in the driving manual. Changes the repo and ships a PR, escalating to /q:create-plan when the build is plan-sized.
---

# Parallelize

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **Isolation is an optimization, never a precondition**: sessions take turns over whatever stays shared, which works in any repo today. A resource left un-isolated is a fact to record, not a failure.
- **Keep the run note** (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The run note). Its review resolutions feed the PR's Callouts and Caveats, stated as facts about the change.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.

## Step 1: Read the repo

Find what this repo runs and what those things bind. An unfamiliar repo shape is the normal case, so read what is there rather than looking for a shape you recognize. Read whatever declares it:

- service and container definitions
- scripts, and the tasks the package manager or build tool exposes
- test and build configuration
- CI workflows
- environment templates, and the defaults they carry
- the driving manual, which may already name what a session must take turns over

Use an Explore subagent for breadth; read the load-bearing files yourself. An invocation that named a resource scopes the step to that one: establish what binds it and what would collide, and skip the sweep.

The outcome is one list: everything this repo holds exactly one of that a session needs while working. Each entry names what binds it, what would collide, and where the repo declares it (`file:line`).

## Step 2: Agree what to isolate

Every entry on the list goes one of two ways:

- **Isolated** — each session gets its own. A port derived per session rather than fixed, a database or schema named per session, a cache or scratch directory keyed per session.
- **Shared** — there can only be one, so sessions take turns over it. A licensed device, a staging environment, an external account. Say how a session claims it and how it releases it. Something that could be isolated, but not within one reviewable PR, is not shared — that is the escalation below.

Settle the run with the user, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes). One batch: the list, which way each entry goes, and the review mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). In this run, ship covers commit, push, and the PR; local commits nothing until the user has reviewed the diff.

Answers settle decisions. They are not the agreement. Close the conversation by summarizing the agreed scope and asking for the go-ahead. That go-ahead, not the last answer, is what makes the rest of the run autonomous.

When the agreed isolation won't fit one reviewable PR, continue into `/q:create-plan` in this session on the go-ahead, handing over what Step 1 found and what the batch already settled. This run ends there; the plan carries the build.

## Step 3: Build it

1. Settle the branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). This work is its own delivery unit, so the call is a fresh branch. Require a clean working tree first — if anything is uncommitted, stop and show the user. Branch, unless the contract's peer check already put this run on a worktree's branch:

   ```bash
   git fetch origin && git checkout -b <work-slug> origin/<default-branch>
   ```

2. Implement the agreed isolation, following the governing conventions and matching surrounding code.
3. Verify: run the project's checks — lint, typecheck, and the tests covering what changed, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine).
4. In ship mode, commit — before review, so the review history is inspectable in git.

When building reveals the work is deeper than the agreement — a redesign, more than one reviewable PR's worth of change — interrupt: present the discovery and recommend `/q:create-plan`. Planning starts only on the user's go-ahead; what this run learned and built goes into its scope.

## Step 4: Record it

Drive what you built through `/q:drive`. What to exercise: each resource the run isolated, with two copies running at once, plus each one Step 2 left shared. The build never touched the shared ones, and a driving session still has to take its turn over them.

## Step 5: Adversarial review

Validate the diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses. Hand the reviewers the agreed scope and the diff scope: `git diff origin/<default-branch>...HEAD` in ship mode, or the uncommitted diff plus the changed-file list in local mode. Per loop round, re-drive a resource only when a fix could change what driving showed. Surviving findings become Caveats in the PR description.

## Step 6: Open the PR

1. **The local gate**: run it over the session's uncommitted work (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: `git push -u origin <work-slug>`, then `gh pr create`, per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting the PR URL, every resource left shared, any caveats, any amendment raised instead of applied, and any follow-up work — filed in the tracker on the user's agreement (source: @lab43/q conventions/issue-tracking.md, Ask before filing).
