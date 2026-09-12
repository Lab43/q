---
name: review
description: Review anything ad hoc — the session's change, a diff, a file or directory, a doc's prose, a feature, a plan doc — through the project's conventions-grounded adversarial reviewer. The user rules on the findings; approved fixes are applied, and delivery is the user's choice — shipped as their own PR, or left in the working tree for later delivery. Given no target, reviews the session's outstanding change. A finding can indict a convention rather than the artifact — either side may change. Planned work is reviewed inside its own run.
---

# Review

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Resolve the target

The target comes from the invocation. Map it to an artifact the adversarial reviewer takes:

- **Nothing given**: the session's outstanding change. That is the uncommitted diff plus the changed-file list, untracked files included — or, with a clean tree, the branch's diff against the default branch. Say which was picked.
- **A diff, file, or directory**: as given.
- **A feature or area named in words**: locate its files (an Explore subagent for breadth) and confirm the file list with the user before reviewing.
- **A plan doc in `docs/plans/`**: a plan review when its status is `pending`. Review any other plan as prose.

## Step 2: Launch the review

Launch `adversarial-reviewer` subagents over the artifact, passing what the agent's description names: the artifact — a diff command or file list, or the plan path — and the lenses, plus what the work is meant to deliver when the invocation stated it. Lenses follow the artifact: **feasibility** and **rigor** for a plan review, **correctness** and **conventions** for everything else, prose included. Default to two single-lens reviewers in parallel. One reviewer with both lenses suffices for a minor target — a few files, no new surface.

## Step 3: Rule with the user

A conversational stretch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes). Triage the findings:

- **Fix outright**: a finding that is clearly right, with a fix that reopens nothing. Apply it and present it as applied, where the user can veto it.
- **Reject outright**: a finding the session's context refutes. Present it with its reason — never drop one silently, since the refuting context may itself be wrong.
- **Rule**: everything contestable goes to the user (AskUserQuestion), ranked — blocking, nits, follow-ups — each with a recommendation. Group documentation gaps on their own, so they can't hide among the other findings. A finding whose evidence indicts a cited rule is always ruled, never fixed or rejected outright: the user decides which side changes, and an approved amendment is executed in Step 4.

Fixes to an outstanding change another run owns stay uncommitted with it — don't commit, and don't ask about delivery. For any other target, ask in the same batch how the work is delivered: local or ship (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes), or leave it uncommitted in the working tree — a session may run several reviews and deliver the accumulated work once. When the target was the user's own uncommitted work, delivery covers that work and the fixes together: they can't be separated.

## Step 4: Apply

1. When delivering the fixes as their own change, create a branch unless the session is already on one.
2. The rulings are the agreement — apply the approved fixes autonomously, approved convention amendments included. Fixes and amendments that land in policy-governed docs go through `/q:update-docs`, the documentation surface's single write path. Run the project's checks covering what changed. In ship mode, commit.
3. Sweep the rulings for lessons the docs should carry: a rejected finding whose reason is a rule nobody wrote down, or a correction the next reviewer would have to re-derive. Draft each new lesson through `/q:update-docs`, held to its gates. A drafted rule lands in the uncommitted change as a diff hunk the user can keep or delete — never as a suggestion buried in output. A sweep-derived lesson that would amend an existing rule or recorded decision is suggested instead and listed on its own in the closing report. Standing law changes only by the user's ruling.

## Step 5: Adversarial review

When delivering now, validate the whole diff being delivered (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation): both lenses — the target's review found the defects, but the fixes themselves have not been reviewed until now. Work joining an owned outstanding change, or left in the tree, is validated by the run that delivers it.

## Step 6: Deliver

1. Fixes not delivered now — joining the session's outstanding change, or left in the tree — stay uncommitted for the run that delivers them. Skip to the report.
2. **Local review's gate**: run the gate over the uncommitted fixes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
3. **Open the PR**: push the branch and open the PR; body per the writing rules (see: q conventions/writing.md) and the project's PR conventions where it records any.
4. Close the session by reporting: findings and rulings including what was dropped, the check results, the drafted doc entries, and the suggested amendments, listed on their own. When work was left in the tree, say that it is unvalidated until delivered, and that a later bare `/q:review` reviews and delivers the accumulation.
