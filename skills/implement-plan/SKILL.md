---
name: implement-plan
description: Implement a plan from docs/plans end-to-end and open the PR or stacked PRs its delivery call names, with every commit, push, and PR gated by the review mode the user picks up front.
---

# Implement Plan

The plan to execute comes from the invocation, as a name or path (`voice-selection`, `docs/plans/voice-selection.md`); given neither, list the `pending` plans in `docs/plans/` and ask which one.

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **Track resolutions**: keep a scratchpad note of each review round's BLOCKING findings and how each was resolved (fixed / rejected with reason) — it feeds the PR body's Decisions & deviations and Caveats sections.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.
- **Plan doc amendments**: when execution deviates from the plan or a verification step contradicts it, fold the outcome into the plan doc as a marked amendment per the lifecycle rules (see: q conventions/plans.md, Lifecycle), alongside the work of the phase that surfaced it.
- **Doc updates**: make doc updates through `/q:update-docs` as they surface: doc changes the plan schedules; fixes to docs the diff falsifies; a single-site gotcha as a code comment where it bites (source: q conventions/principles.md, Colocate knowledge with its next reader); a new cross-cutting lesson as a conventions entry, held to the documentation policy's gates and flagged under Decisions & deviations. Don't amend or contradict an existing rule or recorded decision — that is the user's, surfaced as a Follow-up or, when the run can't proceed without the answer, an interrupt.

## Step 1: Understand

1. Read the plan in full.
2. Read the conventions governing the plan's territory, found from the agent briefing's docs index.
3. Explore the affected code — use an Explore subagent for broad reconnaissance.
4. Plans can predate refactors: check every plan step against the current codebase and note steps that are already done, obsolete, or in conflict with current structure.
5. The plan's external facts were verified at planning time. If the plan has aged — the dependency manifests, lockfile, or files the plan cites changed since the doc was last written (its last commit, or mtime if uncommitted) — re-verify the load-bearing ones before building on them; a plan executed fresh skips this.

## Step 2: Clarify

Clarify the plan with the user, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes) — everything asked here is a question the autonomous stretch won't have to stop for. One batch, via AskUserQuestion:

- The ambiguities, plan/codebase conflicts, and scope questions Step 1 surfaced — when none need the user's attention, state your working assumptions in a short paragraph instead. If consequential questions keep accumulating, the plan is underspecified — say so and suggest revising it with `/q:create-plan` before implementing.
- The review mode, always asked (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes): in this run, ship covers every commit (a stacked run's `gh stack` operations included), push, and PR; local commits nothing until the user has reviewed it, each PR's content at that PR's boundary.

What emerges completes the agreement: the plan, as clarified, authorizes the rest of the run as autonomous.

## Step 3: Branch

If the project's conventions govern where parallel work lives (worktrees, session rules), apply them first. Then require a clean working tree — except the plan doc itself, which may be untracked or modified (stop and tell the user about anything else) — and branch per the plan's `delivery` frontmatter (absent means single-PR):

**Single PR:**

```bash
git fetch origin && git checkout -b <plan-name> origin/<default-branch>
```

**Stacked PRs** — one branch per PR group from the plan's Phases section, chained bottom-up. Requires the `gh stack` extension (install with `gh extension install github/gh-stack` if `gh extension list` lacks it):

```bash
git fetch origin
gh stack init <plan-name>/01-<group-slug> --base origin/<default-branch>
```

(`--base` takes an origin ref, never a local branch — a stale local silently becomes the stack's base.) Each later group's branch is created in Step 4 as work reaches it; only the first group's is created here. When the run lives in a worktree, the whole stack lives in that one worktree — later layers as branches inside it, never new worktrees.

A plan doc not yet in merged history — new, or changed since it merged — becomes the run's first commit, at the bottom of the stack in a stacked run — exactly as planning left it. Material Step 2 clarification answers are folded in as a second commit on top, so the diff between the two records what clarification changed. In local review, hold the commit; when the user's approval starts the committing, the plan doc — clarifications folded in — is committed first, the two-commit split being history local mode gives up.

## Step 4: Implement in phases

In a stacked run, this step and Step 5 alternate: implement a group's phases here, wrap its PR there, and return for the next group.

Derive phases from the plan's Phases section — a boundary problem visible up front was Step 2's to settle and fold in. The plan's breakdown is not yours to redesign; when implementation reveals a phase that can't stand alone as a commit that builds and passes its tests, merge or split at that seam and record the change as a plan amendment.

In local review, commits wait for the user's review at each PR boundary (Step 5): phases accumulate uncommitted, and a phase's adversarial review takes the uncommitted diff plus the phase's file list.

Then work phase by phase. In a stacked run, a phase that starts a new PR group first opens the group's branch — `gh stack add <plan-name>/<NN>-<group-slug>`, the first group using Step 3's branch — so the group's phases commit to their own branch. Record the phase-start SHA (`git rev-parse HEAD`); it scopes the phase's review diff. For each phase:

1. **Implement** the phase's steps, following the governing conventions and matching surrounding code.
2. **Verify**: run the project's checks — lint, typecheck, and the tests covering what the phase touched, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine). If the phase produced a newly drivable surface — an endpoint, a screen — exercise it briefly (a curl, a page load). This is a cheap incremental check so later phases don't build on something broken, not the full verification pass; fix what it catches before moving on. If the environment can't be brought up — here or at any later driving — interrupt and ask the user instead of skipping silently.
3. **Commit the implementation**, in ship mode, before review — so the review history is inspectable in git.
4. **Adversarial review**: launch a single `adversarial-reviewer` subagent over the phase's diff with **both lenses** (correctness + conventions). Give it: the plan path, the full derived phase breakdown (which plan steps are in this phase, which came earlier, which are deferred), and the diff scope — `git diff <phase-start-sha>..HEAD` in ship mode; the uncommitted diff plus the phase's file list in local review. One review per phase — there is no per-phase re-review loop; the PR's final review (Step 5) is the backstop that verifies the fixes.
5. **Fix**: fix all BLOCKING findings (apply your judgment on NITS), re-run the checks covering the fixed code — re-exercising the phase's drivable surface if the fixes touched it — and, in ship mode, commit the fixes. Record each finding's resolution in the scratchpad note. A review with no accepted findings gets no commit.

## Step 5: Wrap up each PR

When a group's last phase lands, finish that PR before starting the next group:

1. **Verify its work in the running product**: exercise what the PR delivers, using whatever run/verify path the project documents (a guide, a project skill, its scripts). Derive the scope from the group's content — a judgment that can land on nothing at all, when Step 4's checks fully characterize the work. The final PR is the exception: run the plan's Verification section — the integrated state exists now, and its end-to-end proof belongs ahead of this last review — plus the project's full test suite, the run's only unscoped check. Fix what verification catches, re-verify, and, in ship mode, commit the fixes. Record what ran and the results for the PR's Testing section.
2. **Final review**: validate the PR's diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses. Hand the reviewers the plan path, which plan steps this PR delivers (and that the rest live in other PRs), and the diff scope. Per loop round, re-exercise any flow from item 1 that a fix changed. Surviving findings become Caveats in the PR description.
3. **Local review's gate**: run the gate over the PR's uncommitted diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate); commits land onto the PR's layer.
4. **Mark the plan completed** — last or only PR: set `status: completed` in the plan doc's frontmatter and commit it (in a stacked run the lower PRs still show `pending`; the flip lands when the whole stack merges). In local review this commit rides the approval just given — don't ask again.
5. **Open the PR**, so the user can start reviewing while later groups build. Stacked: `gh stack submit --auto --open` pushes the layers built so far and opens the new PR ready for review — GitHub links the stack, runs CI on every layer as if it targeted the default branch, and cascade-merges bottom-up from whichever PR the user merges. Single PR: `git push -u origin <plan-name>`, then `gh pr create`. Title from the plan name; body per the writing rules (see: q conventions/writing.md) and the project's PR conventions where it records any, with these sections:
   - **Summary** — this PR's role in the plan, a line or two, linking `docs/plans/<name>.md`
   - **Phases** — one line per phase: what it delivered, and where its judgment calls live (what a reviewer should read slowly)
   - **Decisions & deviations** — this PR's autonomous choices, plan steps skipped as obsolete, review findings rejected with their reasons; omit when empty
   - **Caveats** — findings that survived this PR's review cap, known flakes hit; omit when empty
   - **Follow-ups** — out-of-scope improvements this PR's work surfaced, candidates for future plans; omit when empty
   - **Testing** — what ran for this PR and the results

## Step 6: Report

Close the session by reporting the PR URL(s), the phase list, and any caveats.
