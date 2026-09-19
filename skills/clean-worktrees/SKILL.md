---
name: clean-worktrees
description: Clear the git worktrees that finished parallel sessions leave behind. Use when worktrees have piled up in a repo, or before starting parallel work in a cluttered one. Invoke it bare — it sweeps the repo itself. It reports what each worktree holds and whether that work has reached the remote, and the user rules on the list before anything is removed. Never deletes a branch, and delivers no repo change or PR.
---

# Clean Worktrees

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. This run changes no tracked file, so there is no branch, review mode, or PR.

## Step 1: Sweep

1. Run `git fetch origin`. Everything below reads the local remote-tracking refs, which are only as current as the last fetch.
2. Run `git worktree prune`. It clears the registrations whose directory is already gone, so the listing that follows shows only worktrees that exist.
3. Run `git worktree list --porcelain` for the worktrees. Then list the directories under `.claude/worktrees/`. One that git does not list is not a worktree — report it in Step 3, and never delete it.

Establish what each worktree holds:

- whether its tree is clean — `git -C <path> status --porcelain`
- whether every commit on its branch has reached a remote — `git -C <path> log --oneline HEAD --not --remotes` prints the ones that have not
- whether it is locked, which `git worktree list --porcelain` reports
- whether a live peer holds it (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Working alongside a peer)

Then establish whether its work has landed. Run `gh pr list --head <branch> --state all` for each branch's pull requests. Never use `git branch --merged` for this. A squash-merged branch is not an ancestor of the default branch, so that test reports long-merged work as unmerged.

A worktree is removable when it holds nothing the remote does not already have:

- its tree is clean
- no commit on its branch is missing from a remote
- it is not locked
- no live peer holds it
- it is not this session's own worktree

Removing one costs only the checkout. Its branch survives, and the remote keeps the commits.

## Step 2: Agree what goes

Settle the list with the user, in conversational mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Collaboration modes). Put every removable worktree in one batch of choices (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Batch questions), each carrying what its pull requests say:

- Merged or closed — the work is done with. Recommend removing it.
- Open, or no pull request at all — the work is still in flight. Offer it, and say so. The user may be coming back to the checkout.

State what is not on the list and why: each worktree that failed the removable test, and each directory git does not list. The user's selection is the agreement.

## Step 3: Clear it

Remove what the user chose, without asking again.

1. Remove each chosen worktree with `git worktree remove <path>`. Never `--force`. A removal that refuses means something changed since the sweep — show the user what it reports instead of forcing past it.
2. Leave every branch alone. Deleting the branch a removed worktree held is the user's call.
3. Report what was removed, what was left and why, and each directory under `.claude/worktrees/` that git does not list.
