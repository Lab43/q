---
name: release
description: Release q — move the version, push the bump to main, and publish the GitHub release that triggers the npm publish. Use when q is ready to ship, or when merged work needs to reach consuming projects. Invoke it bare, or name a level (major, minor, patch) to settle that up front. Otherwise it settles the level with the user against what changed since the last tag. Publishing is irreversible. The version number is burned whether or not npm unpublishes it, and answering a permission prompt is what releases it.
---

# Release

Follow the run contract — `@lab43/q references/run-contract.md`. A release goes straight to `main` and opens no pull request, so this run has no branch and no review mode. The level the user settles in Step 2 and the permission prompt in Step 4 are its gates.

`docs/guides/releasing.md` is the procedure. Read it before Step 1 and take every command from it, so a release never runs a copy that has drifted.

## Step 1: Check the tree

1. Run `git fetch origin`.
2. Require the session on `main`, with a clean tree, level with `origin/main`. Stop and show the user whichever of the three fails. Releasing from anywhere else publishes a tree nobody reviewed, and the release workflow rejects a commit that is not on `main` (source: .github/workflows/release.yml).

## Step 2: Settle the level

Settle it with the user, in conversational mode (see: `@lab43/q references/run-contract.md`, Collaboration modes).

1. Read the last released tag — `git tag --sort=-v:refname | head -1`.
2. Read what ships — `git log <tag>..HEAD --oneline` and `git diff <tag>..HEAD --stat`.
3. Stop when nothing has landed since the tag. There is no release to make.
4. Recommend a level against the guide's rules for choosing one, and say what in the diff puts it there. The user settles it. An invocation that named a level has settled it already — show what ships and go on to Step 3.

The settled level is the agreement. Steps 3 to 5 execute it autonomously.

## Step 3: Bump and push

Run the guide's steps 1 and 2 without asking again. The commit runs `npm run check` through the pre-commit hook, so a tree that fails a check never reaches `main`.

## Step 4: Publish

1. Confirm `HEAD` is still the bump commit, and that `origin/main` points at it. A commit someone else pushed in between would go out under a version that does not account for it.
2. Run the guide's step 3, passing the full SHA that `git rev-parse HEAD` prints.
3. Answering the permission prompt is what publishes (source: .claude/settings.json). Never reach for another form of the command when the user declines it.

A declined prompt ends the run with the bump on `main` and nothing published. Say so, and say that publishing later means running the guide's step 3 against that commit. Never bump a second time.

## Step 5: Report

1. Read the run the release started — `gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId'`.
2. Watch it to its end — `gh run watch <id>`. Pass the id. Bare `gh run watch` asks which run to watch, and fails outright where nothing can answer.
3. Report the release URL and what the workflow did.
4. Route a failure to the guide's rules for a failed release, which turn on whether the publish itself had started.
