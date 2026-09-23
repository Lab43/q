# Driving Manual

How to bring q up and exercise it. q runs inside Claude Code, so driving it means getting it loaded into a session and checking that the session got what the change intended.

## Driving q as an installed plugin

Exercise a change to the hooks, to `/q:install`, or to the marketplace it scaffolds against a throwaway fixture rather than this checkout. A fixture gets q the way a consuming project does — from a packed tarball under `node_modules/`.

1. From the checkout, run `npm pack --pack-destination <dir>`.
2. Give the fixture directory its own `package.json`.
3. Install the tarball there: `npm install --save-dev --ignore-scripts ./lab43-q-<version>.tgz`. q lands at `node_modules/@lab43/q`. The manifest records `file:lab43-q-<version>.tgz`, which nothing minds: the hook reads versions from the lockfile and `node_modules`, and the tarball install writes q's real version to both.
4. Start a session there: `claude --plugin-dir ./node_modules/@lab43/q/q-extension`. That loads q for the session and registers nothing, which is how a consumer's first install reaches it.
5. Run `/q:install` in that session to finish the setup. Until it does, the fixture has no `.claude/q-state.json`. The session-start hook reports that as drift on every session. That is the hook working rather than a broken fixture. Once the run writes the state file, the lockfile, the installed copy and the watermark agree, and the hook falls silent.

q ships no dependencies, so a fixture needs nothing installed beyond the tarball. This checkout is different: `npm install` here installs q's own devDependencies and the pre-commit hook.

A hook change alone needs no session: spawn the hook directly against the fixture and read its stdout. A session shows nothing the hook's own output doesn't.

```sh
root=<fixture>/node_modules/@lab43/q/q-extension
CLAUDE_PROJECT_DIR=<fixture> CLAUDE_PLUGIN_ROOT="$root" bash "$root"/hooks/session-start.sh
```

## Proving a session loads it

Run `claude -p` in the target directory and ask it to count the skills whose names start with `q:`. The count to expect is the number of directories in `q-extension/skills/`.

A headless session loads a marketplace the CLI's registry already holds. It will not register one declared only in tracked `.claude/settings.json`, which is something an interactive session does for itself. Pass `--plugin-dir` to drive a fixture that has not been through `/q:install` yet.

## Driving a skill headless

A skill runs in a `claude -p` session, and what it reports is the session's last message.

```sh
claude -p "/q:review" --plugin-dir <root> --allowedTools "Read,Grep,Glob,Agent,Task,Bash(git *),Bash(npm test*)" < /dev/null
```

- Put the prompt directly after `-p`, before `--allowedTools`. That flag takes a list, and a prompt placed after it is swallowed into the list. The session then fails with "Input must be provided either through stdin or as a prompt argument".
- Pass every tool the skill's run needs. A headless session denies what it cannot ask about. A review run needs the reviewer agent's tools, git, and the project's test command for the reviewers' narrow checks. The example grants npm's.
- A step that asks the user cannot complete headless. The skill reports what it found and stops at the question, which is the evidence a drive wants from it.

To follow edits to the payload as they are made, `npm install <path to this checkout>` in the fixture symlinks q instead of packing it, so every edit reaches the fixture's `@lab43/q` paths without a repack. The tarball is what a consumer gets, so drive the install and the hooks from a tarball (see: Driving q as an installed plugin). A fixture exercising specs needs a `docs/specs/` doc, a site carrying its marker, and a `CLAUDE.md` whose index lists the spec in a Specs group. The reviewer finds specs from that index and from the markers.

## Taking turns over the marketplace name `q-dev`

The CLI's registry holds one entry per marketplace name, machine-wide. This checkout and every worktree of it publish the name `q-dev`, so only one of them owns it at a time. Every session resolving `q@q-dev` follows whichever registered last, this checkout's own sessions included. Fixtures contend for nothing: they load q through `--plugin-dir` until `/q:install` gives them a marketplace name of their own.

Announce to peers before repointing it (see: @lab43/q references/run-contract.md, Working alongside a peer). Release it when you are done: run `claude plugin marketplace add --scope local <path to this checkout>`. Write the main checkout's path in full. A relative `./` resolves against the session's own directory, so a session running in a worktree takes the name for the worktree instead of releasing it.

Nothing else driving q binds. There are no ports, databases, or services to contend over.

## When a session has no `q:` skills

The `q@q-dev` key in `.claude/settings.json` resolves to nothing. Run `claude plugin marketplace list` and read the `q-dev` entry to tell which repair applies.

The entry names a directory that is gone. A removed worktree that held the name leaves this behind. Register this checkout again: `claude plugin marketplace add --scope local <path to this checkout>`. The add repoints the entry, because the name matches.

There is no `q-dev` entry at all, because the registry holds this directory under another name. Remove that entry with `claude plugin marketplace remove <name>`, then register the directory again. `claude plugin marketplace remove` also strips the marketplace from the repo's tracked `.claude/settings.json`, so check that file afterwards and put the declaration back. Re-adding alone does not fix this one, because `claude plugin marketplace add` compares the registry by path:

- An entry whose path matches, under a different name, is left alone.
- An entry whose name matches, pointing at a different path, is repointed.

That second behavior is what lets the release step above take the name back, and what makes the first repair work.
