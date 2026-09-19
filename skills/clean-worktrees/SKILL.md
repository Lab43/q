---
name: clean-worktrees
description: Clear the git worktrees that finished parallel sessions leave behind. Use when worktrees have piled up in a repo, or before starting parallel work in a cluttered one. Invoke it bare — it sweeps the repo itself. It reports what each worktree holds and whether that work has reached the remote, and the user rules on the list before anything is removed. Never deletes a branch, and delivers no repo change or PR.
---

# Clean Worktrees

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. This run changes no tracked file, so there is no branch, review mode, or PR.

## Step 1: Sweep

1. Run `git fetch origin`. Never add `--prune`. It drops the tracking ref for a branch the remote deleted on merge. That worktree's commits then look like they never reached a remote, which blocks the cleanup this skill exists for.
2. Run `git worktree prune`. It clears the registrations whose directory is already gone. A locked worktree keeps its registration either way, because locking is what protects a registration from pruning.
3. Run `git worktree list --porcelain` for the worktrees. Then list the directories under `.claude/worktrees/`. One that git does not list is not a worktree. Never delete it.

Two worktrees are never candidates. Rule them out first:

- the main worktree, which `git worktree list` names first. Git refuses to remove it.
- the worktree this session is running in, which `git rev-parse --show-toplevel` names. It reports the worktree's root from any depth, so it matches the path `git worktree list` reports however deep the session has moved.

Ask the peers what they hold, before probing anything. `ListAgents` lists the live candidates (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The delivery branch). With none listed, every worktree is leftovers. Otherwise send one message asking which worktrees they are working in. Ownership is the one thing looking cannot settle (source: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Working alongside a peer). A session that made a worktree and stepped out of it leaves nothing behind to show that it did. A worktree a peer claims is never removable.

Never wait on a reply. Finish the sweep. Name every candidate that has not answered in Step 2's go-ahead. A claim that arrives before Step 3 takes that worktree off the list.

Then establish what each of the rest holds:

- whether it is locked, which `git worktree list --porcelain` reports. A locked worktree is never removable. Its directory may be gone, which fails every command below. Report it and probe no further.
- whether its tree is clean — `git -C <path> status --porcelain`
- whether every commit it carries has reached a remote — `git -C <path> log --oneline HEAD --not --remotes` prints the ones that have not

Then establish whether its work has landed. Run `gh pr list --head <branch> --state all` for each branch's pull requests. Never use `git branch --merged` for this. A squash-merged branch is not an ancestor of the default branch, so that test reports long-merged work as unmerged. A detached worktree has no branch, so it has no pull requests to read.

A worktree is removable when it holds nothing the remote does not already have:

- its tree is clean
- no commit it carries is missing from a remote
- it is not locked
- no live peer holds it

Removing one costs only the checkout. It deletes no ref, and by the test above every commit the worktree carries is already on a remote.

## Step 2: Agree what goes

Settle the list with the user, in conversational mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Collaboration modes). How a removable worktree reaches the user depends on what its pull requests say:

- Merged or closed — the work is done with. Name it in the go-ahead below, for the user to veto. Asking them to pick it spends attention and settles nothing.
- Open, or no pull request at all — the work is still in flight. Put it in a batch of choices (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Batch questions), and say the work is unfinished. The user may be coming back to the checkout.

A sweep that turns up nothing in flight asks no questions at all.

Close with the go-ahead, in plain text. State what it removes. State what it leaves out, and why:

- the worktrees ruled out before probing
- the worktrees that failed the removable test
- the live peers that never answered
- the directories git does not list

The go-ahead is the agreement.

## Step 3: Clear it

Remove what the user agreed to, without asking again.

1. Remove each agreed worktree with `git worktree remove <path>`. Never `--force` (source: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The delivery branch). A removal that refuses means something changed since the sweep — show the user what it reports instead of forcing past it.
2. Leave every branch alone. Deleting the branch a removed worktree held is the user's call.
3. Report what was removed, what was left and why, and each directory under `.claude/worktrees/` that git does not list.
