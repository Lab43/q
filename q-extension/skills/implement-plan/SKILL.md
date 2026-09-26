---
name: implement-plan
description: Implement a plan from docs/plans end-to-end and open the PR or stacked PRs its delivery call names, with every commit, push, and PR gated by the review mode the user picks up front. Name the plan or give its path.
---

# Implement Plan

Given no plan, list the `pending` plans in `docs/plans/` and ask which one.

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **Keep the run note** (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The run note). Its review resolutions feed the PR's Callouts and Caveats, stated as facts about the change.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.
- **Plan doc amendments**: when execution deviates from the plan or a verification step contradicts it, fold the outcome into the plan doc as a marked amendment per the lifecycle rules (see: @lab43/q conventions/plans.md, Lifecycle), alongside the work of the phase that surfaced it.
- **Doc updates**: make the doc changes the plan schedules through `/q:update-docs`, alongside the phase that carries them.

## Step 1: Understand

1. Read the plan in full.
2. Announce the plan, and the items its `tracks` frontmatter names, before going further (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Working alongside a peer). Release them if the run ends without delivering.
3. Read the conventions and specs governing the plan's territory, found from the agent briefing's docs index.
4. Explore the affected code — use an Explore subagent for broad reconnaissance.
5. Plans can predate refactors: check every plan step against the current codebase and note steps that are already done, obsolete, or in conflict with current structure.
6. The plan's external facts were verified at planning time. If the plan has aged — the dependency manifests, lockfile, or files the plan cites changed since the doc was last written (its last commit, or mtime if uncommitted) — re-verify the load-bearing ones before building on them; a plan executed fresh skips this.

## Step 2: Clarify

Clarify the plan with the user, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes) — everything asked here is a question the run won't have to stop for once it is autonomous. One batch, via AskUserQuestion:

- The ambiguities, plan/codebase conflicts, scope questions, and any spec the plan's work contradicts without scheduling the amendment, as Step 1 surfaced them — when none need the user's attention, state your working assumptions instead. If consequential questions keep accumulating, the plan is underspecified — say so and suggest revising it with `/q:create-plan` before implementing.
- The review mode, always asked (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes): in this run, ship covers every commit (a stacked run's `gh stack` operations included), push, and PR; local commits nothing until the user has reviewed it, each PR's content at that PR's boundary.

What emerges completes the agreement: the plan, as clarified, authorizes the rest of the run as autonomous.

## Step 3: Branch

Settle the branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). A plan is its own delivery unit, so the call is fresh branching. Require a clean working tree first, the plan doc itself excepted — it may be untracked or modified. Stop and ask the user what to do with anything else. Branch per the plan's `delivery` frontmatter (absent means single-PR). `<plan-name>` below is the plan's filename without its date prefix (source: @lab43/q conventions/plans.md, Filename). A single-PR run skips the command below when the contract's peer check already put it on a worktree's branch; a stacked run's `gh stack init` adopts that branch or creates its first layer:

**Single PR:**

```bash
git fetch origin && git checkout -b <plan-name> origin/<default-branch>
```

**Stacked PRs** — one branch per PR group from the plan's Phases section, chained bottom-up. Requires the `gh stack` extension (install with `gh extension install github/gh-stack` if `gh extension list` lacks it):

```bash
git fetch origin
git rev-parse <default-branch> origin/<default-branch>
gh stack init <plan-name>/01-<group-slug> --base <default-branch>
```

`--base` takes a branch name. `gh stack` records it verbatim and hands it to GitHub as every layer's PR base, and GitHub rejects a remote-tracking ref: `--base origin/main` pushes the branches and then fails each PR with "Base ref must be a branch". That is why the `rev-parse` above runs first — it must print the same SHA twice, because a local branch behind its remote silently becomes the stack's base. Fast-forward it before initializing when it isn't. Each later group's branch is created in Step 4 as work reaches it; only the first group's is created here. When the run lives in a worktree, the whole stack lives in that one worktree — later layers as branches inside it, never new worktrees.

Either way, in ship mode record the group-start SHA (`git rev-parse HEAD`) as soon as the branch exists, before anything commits to it. It scopes this PR's final review in Step 5. Each later group records its own when its branch opens in Step 4.

A plan doc not yet in merged history — new, or changed since it merged — becomes the run's first commit, at the bottom of the stack in a stacked run — exactly as planning left it. Material Step 2 clarification answers are folded in as a second commit on top, so the diff between the two records what clarification changed. Both commits land in local mode too. The plan as planning left it is already the user's reviewed work, so committing it holds back nothing local mode protects, and every amendment the run adds then shows as a diff against it.

## Step 4: Implement in phases

In a stacked run, this step and Step 5 alternate: implement a group's phases here, wrap its PR there, and return for the next group.

Derive phases from the plan's Phases section — a boundary problem visible up front was Step 2's to settle and fold in. The plan's breakdown is not yours to redesign; when implementation reveals a phase that can't stand alone as a commit that builds and passes its tests, merge or split at that seam and record the change as a plan amendment.

In local mode, commits wait for the user's review at each PR boundary (Step 5): phases accumulate uncommitted, and a phase's adversarial review takes the uncommitted diff plus the phase's file list.

Then work phase by phase. In a stacked run, a phase that starts a new PR group first opens the group's branch — `gh stack add <plan-name>/<NN>-<group-slug>`, the first group using Step 3's branch — so the group's phases commit to their own branch. A new group records its group-start SHA as Step 3 describes.

In ship mode, record the phase-start SHA (`git rev-parse HEAD`) at the start of each phase. It scopes the phase's review diff.

For each phase:

1. **Implement** the phase's steps, following the governing conventions and matching surrounding code.
2. **Verify**: run the project's checks — lint, typecheck, and the tests covering what the phase touched, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine). When the phase produced a newly drivable surface — an endpoint, a screen — drive it through `/q:drive`, naming that surface as what to exercise. This is a cheap incremental check so later phases don't build on something broken, not the full verification pass; fix what it catches before moving on.
3. **Commit the implementation**, in ship mode, before review — so the review history is inspectable in git.
4. **Adversarial review**: launch a single `adversarial-reviewer` subagent over the phase's diff with **both lenses** (correctness + conventions). Give it: the plan path, the full derived phase breakdown (which plan steps are in this phase, which came earlier, which are deferred), and the diff scope — `git diff <phase-start-sha>..HEAD` in ship mode; the uncommitted diff plus the phase's file list in local mode. The lenses and those inputs are the whole prompt (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation). One review per phase — there is no per-phase re-review loop; the PR's final review (Step 5) is the backstop that verifies the fixes.
5. **Fix**: fix all BLOCKING findings (apply your judgment on NITS), re-run the checks covering the fixed code — re-driving the phase's surface only when a fix could change what driving showed — and, in ship mode, commit the fixes. A review with no accepted findings gets no commit.

## Step 5: Wrap up each PR

When a group's last phase lands, finish that PR before starting the next group:

1. **Verify its work in the running product**: drive what the PR delivers through `/q:drive`, naming the flows to exercise. Derive the scope from the group's content — a judgment that can land on nothing at all, when Step 4's checks fully characterize the work. The final PR is the exception. Drive the plan's Verification section: the integrated state exists now, and its end-to-end proof belongs ahead of this last review. Run the project's full test suite too — the run's only unscoped check. Fix what verification catches and re-verify. In ship mode, commit what this step produced: the fixes, plus anything driving recorded. Record for the PR's Testing section what was exercised and what it demonstrated. The standing suite goes unlisted (source: @lab43/q conventions/pull-requests.md, Sections).
2. **Final review**: validate the PR's diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses. Hand the reviewers the plan path, which plan steps this PR delivers (and that the rest live in other PRs), and the diff scope — `git diff <group-start-sha>..HEAD` in ship mode; the uncommitted diff plus the group's file list (every file its phases touched) in local mode. Per loop round, re-drive a flow from item 1 only when a fix could change what driving showed. Surviving findings become Caveats in the PR description.
3. **The local gate**: run it over the PR's uncommitted diff (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate); commits land onto the PR's layer.
4. **Mark the plan completed** — last or only PR: set `status: completed` in the plan doc's frontmatter and commit it (in a stacked run the lower PRs still show `pending`; the flip lands when the whole stack merges). In local mode this flip rides the go-ahead just given. That is a deliberate exception to the gate: the go-ahead already covers this bookkeeping. Don't ask again.
5. **Open the PR**, so the user can start reviewing while later groups build. Author every PR's title, body, and diff comments per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).

   Single PR: `git push -u origin <plan-name>`, then `gh pr create`, then post the diff comments.

   Stacked: `gh stack submit --auto` pushes the layers built so far and creates the new PR as a draft. GitHub links the stack, runs CI on every layer as if it targeted the default branch, and cascade-merges bottom-up from whichever PR the user merges. `--auto` is required, because the interactive editor the command otherwise opens cannot be driven. It names the PR from the branch and writes no body. Write the title and body with `gh pr edit`, post the diff comments, then take it out of draft with `gh pr ready`, unless the project's PRs open as drafts (see: @lab43/q conventions/pull-requests.md, Draft). Never hand the user a PR marked ready before its body and diff comments are written.

   Either way, `gh pr create` and `gh pr edit` carry only the title and body. Post each diff comment on its line of the PR's head commit, writing the comment to a file and passing it by path so apostrophes in the prose can't break the command:

   ```bash
   gh api --method POST repos/<owner>/<repo>/pulls/<n>/comments -F body=@<comment-file> -f commit_id=<head-sha> -f path=<path> -F line=<line>
   ```

6. **Hand the PR over**: give the user its URL and what it delivers. In a stacked run this hand-off is not the closing report, however much it reads like one. Return to Step 4 and open the next group's branch in the same turn.

## Step 6: Report

Reached once a run: after the only PR, or after the stack's last. Every earlier group returns to Step 4 instead.

Close the session by reporting the PR URL(s), the phase list, any caveats, any amendment raised instead of applied, and any follow-up work — filed in the tracker on the user's agreement (source: @lab43/q conventions/issue-tracking.md, Ask before filing).
