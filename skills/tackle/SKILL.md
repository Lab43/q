---
name: tackle
description: Take on unplanned work — an issue, a bug, a task at any fidelity. Ground it in the code, then route it on the user's go-ahead — fix it here in a single adversarially reviewed PR, escalate to /q:create-plan when it's plan-worthy, or show with evidence that nothing needs doing. The expected entry point for work without a plan; planned work runs under /q:implement-plan.
---

# Tackle

The work comes from the invocation, at any fidelity — an issue number or URL, a pasted error, a phrase ("the export button 404s"); given nothing, ask what to tackle.

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **One reviewable PR is the boundary**: never stack or split PRs here — PR divisions are designed and reviewed in a plan, not improvised mid-run. Work that won't fit is plan-worthy, whenever that surfaces.
- **Track resolutions**: keep a scratchpad note of each review round's BLOCKING findings and how each was resolved (fixed / rejected with reason) — it feeds the PR body's Decisions & deviations and Caveats sections.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.
- **Doc updates**: make doc updates through `/q:update-docs` as they surface: fixes to docs the diff falsifies; a single-site gotcha as a code comment where it bites (source: q conventions/principles.md, Colocate knowledge with its next reader); a new cross-cutting lesson as a conventions entry, held to the documentation policy's gates and flagged under Decisions & deviations. Don't amend or contradict an existing rule or recorded decision — that is the user's, surfaced as a Follow-up or, when the run can't proceed without the answer, an interrupt.

## Step 1: Understand

1. Read the work item at its source — its description, comments, and related items, when the source carries them — and whatever it cites: stack traces, linked discussions, named files.
2. Read the conventions governing the affected territory, found from the agent briefing's docs index.
3. Explore the affected code — use an Explore subagent for breadth; read the load-bearing files yourself.
4. Check `docs/plans/` (if it exists) for collisions: surface a `pending` plan in the same territory in Step 2 rather than silently working around it.

The outcome is a verdict: what the work actually is, whether the item's claims hold against the code, and how big the real change is.

## Step 2: Agree

Settle the run with the user, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes). One batch: the verdict and a recommended route, the approach where the fix is genuinely forked, and — when fixing here — the review mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes). In this run, ship covers commit, push, and the PR; local commits nothing until the user has reviewed the diff.

Answers settle decisions; they are not the agreement. Close the conversation by summarizing the agreed scope and asking for the go-ahead — that green light, not the last answer, is what makes the rest of the run autonomous.

The routes:

- **Fix here** — the work fits one reviewable PR. The agreed scope and approach authorize Steps 3–6.
- **Plan-worthy** — the work won't fit one reviewable PR, needs its PR divisions designed, or turns on forks the batch can't settle. On the go-ahead, continue into `/q:create-plan` in this session, handing over what this run established: the verdict, what Step 1 found, and the decisions already settled.
- **Nothing to do** — the code already behaves as asked, the report doesn't reproduce, or the behavior is intended. Present the evidence (`file:line`) and stop. When the item lives in a tracker, offer to record the verdict there; closing it is the user's call.

## Step 3: Branch

If the project's conventions govern where parallel work lives (worktrees, session rules), apply them first. Then require a clean working tree — if anything is uncommitted, stop and show the user — and branch:

```bash
git fetch origin && git checkout -b <work-slug> origin/<default-branch>
```

## Step 4: Implement

1. Implement the agreed fix, following the governing conventions and matching surrounding code.
2. Verify: run the project's checks — lint, typecheck, and the tests covering what changed, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine). If the change produced a newly drivable surface — an endpoint, a screen — exercise it briefly (a curl, a page load). If the environment can't be brought up — here or at any later driving — interrupt and ask the user instead of skipping silently.
3. In ship mode, commit — before review, so the review history is inspectable in git.

When implementation reveals the work is deeper than the agreement — a redesign, more than one reviewable PR's worth of change — interrupt: present the discovery and recommend `/q:create-plan`. Planning starts only on the user's go-ahead; what this run learned and built goes into its scope.

## Step 5: Adversarial review

Validate the diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses. Hand the reviewers the agreed scope and the diff scope: `git diff origin/<default-branch>...HEAD` in ship mode, or the uncommitted diff plus the changed-file list in local review. Per loop round, re-exercise any drivable surface a fix touched. Surviving findings become Caveats in the PR description. Record each finding's resolution in the scratchpad note.

## Step 6: Open the PR

1. **Local review's gate**: run the gate over the session's uncommitted work (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: `git push -u origin <work-slug>`, then `gh pr create`. Title from the work; body per the writing rules (see: q conventions/writing.md) and the project's PR conventions where it records any, with these sections:
   - **Summary** — what this PR delivers and why, linking the issue (`Fixes #N`) when one exists (source: q conventions/issue-tracking.md, Work links back)
   - **Decisions & deviations** — autonomous choices, a toned-down review, findings rejected with their reasons; omit when empty
   - **Caveats** — findings that survived the review cap, known flakes hit; omit when empty
   - **Follow-ups** — out-of-scope improvements this work surfaced, candidates for future plans; omit when empty
   - **Testing** — what ran and the results
3. Close the session by reporting the PR URL and any caveats.
