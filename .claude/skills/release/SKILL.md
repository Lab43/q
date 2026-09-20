---
name: release
description: Release q — move the version, push the bump to main, and publish the GitHub release that triggers the npm publish. Use when q is ready to ship, or when merged work needs to reach consuming projects. Invoke it bare, or name a level (major, minor, patch) to settle that up front. Otherwise it settles the level with the user against what changed since the last tag. Publishing is irreversible. The version number is burned whether or not npm unpublishes it, and answering a permission prompt is what releases it.
---

# Release

Follow the run contract — `@lab43/q references/run-contract.md`. Every release runs in ship mode, so never ask which (see: `@lab43/q references/run-contract.md`, Review modes). Work on `main` rather than a new branch. Commit and push without pausing, and open no pull request. The level the user settles in Step 2 and the permission prompt in Step 4 are this run's gates.

`docs/guides/releasing.md` is the procedure. Read it before Step 1 and take every command from it, so a release never runs a copy that has drifted.

## Step 1: Check the tree

Run `git fetch origin`, then require all three of the following. Stop and show the user whichever fails.

- The session is on `main`. The release workflow rejects a commit that is not on it (source: .github/workflows/release.yml).
- The tree is clean. Anything uncommitted would ship unreviewed or be left behind.
- `main` is level with `origin/main`.

## Step 2: Settle the level

Settle it with the user, in conversational mode (see: `@lab43/q references/run-contract.md`, Collaboration modes).

1. Read the last released tag — `git tag --sort=-v:refname | head -1`.
2. Read what ships — `git log <tag>..HEAD --oneline` and `git diff <tag>..HEAD --stat`.
3. Stop when nothing has landed since the tag. There is no release to make.
4. Recommend a level against the guide's rules for choosing one, and say what in the diff puts it there. The user settles it. An invocation that named a level has settled it already — show what ships and go on to Step 3.

The settled level is the agreement. Execute it autonomously from here.

## Step 3: Bump and push

Run the guide's steps 1 and 2 without asking again. Stop on a failing check.

## Step 4: Publish

1. Confirm `HEAD` is still the bump commit, and that `origin/main` points at it. A commit someone else pushed in between would go out under a version that does not account for it.
2. Run the guide's step 3, passing the full SHA that `git rev-parse HEAD` prints.
3. Answering the permission prompt is what publishes (source: .claude/settings.json). Never reach for another form of the command when the user declines it.

A declined prompt ends the run with the bump on `main` and nothing published. Say so, and say that publishing later means running the guide's step 3 against that commit. Never bump a second time.

## Step 5: Report

1. Find the run this release started, by the SHA it was cut from — `gh run list --workflow=release.yml --json databaseId,headSha --jq "[.[] | select(.headSha == \"<sha>\")][0].databaseId"`. Never take the newest run instead. Publishing dispatches the run, so for a moment the newest one is the previous release's, and watching that reports a finished job as this release's outcome. Keep polling until the SHA matches.
2. Watch it to its end — `gh run watch <id>`. Pass the id. Bare `gh run watch` asks which run to watch, and fails outright where nothing can answer.
3. Report the release URL and what the workflow did.
4. Route a failure to the guide's rules for a failed release, which turn on whether the publish itself had started.
