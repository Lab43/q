---
name: clean-worktrees
description: Clear the git worktrees that finished parallel sessions leave behind. Use when worktrees have piled up in a repo, or before starting parallel work in a cluttered one. Invoke it bare — it sweeps the repo itself. It reports what each worktree holds and whether that work has reached the remote, and the user rules on the list before anything is removed. Never deletes a branch, and delivers no repo change or PR.
---

# Clean Worktrees

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. This run changes no tracked file, so there is no branch, review mode, or PR.

## Step 1: Sweep

1. Run `git fetch origin`.
2. Run `git worktree prune`. It clears the registrations whose directory is already gone. A locked worktree keeps its registration either way, because locking is what protects a registration from pruning.
3. Run `git worktree list --porcelain` for the worktrees. Then list the directories under `.claude/worktrees/`. One that git does not list is not a worktree. Never delete it.

Two worktrees are never candidates. Rule them out first:

- the main worktree, which `git worktree list` names first. Git refuses to remove it.
- the worktree this session is running in. Compare each path against the session's working directory.

Then establish what each of the rest holds:

- whether it is locked, which `git worktree list --porcelain` reports. A locked worktree is never removable, and its directory may be gone, which fails every command below. Report it and probe no further.
- whether its tree is clean — `git -C <path> status --porcelain`
- whether every commit it carries has reached a remote — `git -C <path> log --oneline HEAD --not --remotes` prints the ones that have not
- whether a live peer holds it (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Working alongside a peer)

Then establish whether its work has landed. Run `gh pr list --head <branch> --state all` for each branch's pull requests. Never use `git branch --merged` for this. A squash-merged branch is not an ancestor of the default branch, so that test reports long-merged work as unmerged. A detached worktree has no branch, so it has no pull requests to read.

A worktree is removable when it holds nothing the remote does not already have:

- its tree is clean
- no commit it carries is missing from a remote
- it is not locked
- no live peer holds it

Removing one costs only the checkout. Its branch survives, and the remote keeps the commits.

## Step 2: Agree what goes

Settle the list with the user, in conversational mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Collaboration modes). Put every removable worktree in one batch of choices (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Batch questions), each carrying what its pull requests say:

- Merged or closed — the work is done with. Recommend removing it.
- Open, or no pull request at all — the work is still in flight. Offer it, and say so. The user may be coming back to the checkout.

State what is not on the list and why: each worktree that failed the removable test, and each directory git does not list. The user's selection is the agreement.

## Step 3: Clear it

Remove what the user chose, without asking again.

1. Remove each chosen worktree with `git worktree remove <path>`. Never `--force` (source: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The delivery branch). A removal that refuses means something changed since the sweep — show the user what it reports instead of forcing past it.
2. Leave every branch alone. Deleting the branch a removed worktree held is the user's call.
3. Report what was removed, what was left and why, and each directory under `.claude/worktrees/` that git does not list.
