---
name: implement
description: Take on unplanned work — an issue, a bug, a task at any fidelity. Ground it in the code, then route it on the user's go-ahead — fix it here in a single adversarially reviewed PR, escalate to /q:create-plan when it's plan-worthy, or show with evidence that nothing needs doing. The expected entry point for work without a plan; planned work runs under /q:implement-plan.
---

# Implement

The work comes from the invocation, at any fidelity — an issue number or URL, a pasted error, a phrase ("the export button 404s"); given nothing, ask what the work is.

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **One reviewable PR is the boundary**: never stack or split PRs here — PR divisions are designed and reviewed in a plan, not improvised mid-run. Work that won't fit is plan-worthy, whenever that surfaces.
- **Track resolutions**: keep a scratchpad note of each review round's BLOCKING findings and how each was resolved (fixed / rejected with reason) — it feeds the PR's Callouts and Caveats, stated as facts about the change.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.

## Step 1: Understand

1. Announce the item to the peers before reading it — investigating it is already work a peer should not duplicate (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Working alongside a peer). A run continued from `/q:triage` arrives with the item already announced. Release it whenever this run stops working the item, whether it turns out unavailable or the verdict is nothing to do.
2. Read the work item at its source — its description, comments, and related items, when the source carries them — and whatever it cites: stack traces, linked discussions, named files. Read it fresh even when a caller just read it: a tracker moves for reasons no peer announces. An item no longer available to pick up goes back to the user before any further work (source: @lab43/q conventions/issue-tracking.md, Respect existing claims).
3. Read the conventions governing the affected territory, found from the agent briefing's docs index.
4. Explore the affected code — use an Explore subagent for breadth; read the load-bearing files yourself.
5. Check `docs/plans/` (if it exists) for collisions: surface a `pending` plan in the same territory in Step 2 rather than silently working around it.

The outcome is a verdict: what the work actually is, whether the item's claims hold against the code, and how big the real change is.

## Step 2: Agree

Settle the run with the user, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes). One batch: the verdict and a recommended route, the approach where the fix is genuinely forked, and — when fixing here — the review mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). In this run, ship covers commit, push, and the PR; local commits nothing until the user has reviewed the diff.

Answers settle decisions. They are not the agreement. Close the conversation by summarizing the agreed scope and asking for the go-ahead. That go-ahead, not the last answer, is what makes the rest of the run autonomous.

The routes:

- **Fix here** — the work fits one reviewable PR. The agreed scope and approach authorize Steps 3–6.
- **Plan-worthy** — the work won't fit one reviewable PR, needs its PR divisions designed, or turns on forks the batch can't settle. On the go-ahead, continue into `/q:create-plan` in this session, handing over what this run established: the verdict, what Step 1 found, and the decisions already settled.
- **Nothing to do** — the code already behaves as asked, the report doesn't reproduce, or the behavior is intended. Present the evidence (`file:line`) and stop. When the item lives in a tracker, offer to record the verdict there; closing it is the user's call.

## Step 3: Branch

Settle the branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). The work item is its own delivery unit, so the call is a fresh branch. Require a clean working tree first — if anything is uncommitted, stop and show the user. Branch, unless the contract's peer check already put this run on a worktree's branch:

```bash
git fetch origin && git checkout -b <work-slug> origin/<default-branch>
```

## Step 4: Build

1. Implement the agreed fix, following the governing conventions and matching surrounding code.
2. Verify: run the project's checks — lint, typecheck, and the tests covering what changed, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine). When the change produced a newly drivable surface — an endpoint, a screen — drive it through `/q:drive`, naming that surface as what to exercise.
3. In ship mode, commit — before review, so the review history is inspectable in git.

When implementation reveals the work is deeper than the agreement — a redesign, more than one reviewable PR's worth of change — interrupt: present the discovery and recommend `/q:create-plan`. Planning starts only on the user's go-ahead; what this run learned and built goes into its scope.

## Step 5: Adversarial review

Validate the diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses. Hand the reviewers the agreed scope and the diff scope: `git diff origin/<default-branch>...HEAD` in ship mode, or the uncommitted diff plus the changed-file list in local mode. Per loop round, re-drive a surface only when a fix could change what driving showed. Surviving findings become Caveats in the PR description.

## Step 6: Open the PR

1. **The local gate**: run it over the session's uncommitted work (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: `git push -u origin <work-slug>`, then `gh pr create`, per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting the PR URL, any caveats, any amendment raised instead of applied, and any follow-up work — filed in the tracker on the user's agreement (source: @lab43/q conventions/issue-tracking.md, Ask before filing).
