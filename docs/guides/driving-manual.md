# Driving Manual

How to bring q up and exercise it. q runs inside Claude Code, so driving it means getting it loaded into a session and checking that the session got what the change intended.

## Driving q as an installed plugin

Exercise a change to the marketplace manifest, the hooks, or `/q:install` against a throwaway fixture rather than this checkout. A fixture gets q the way a consuming project does — from a packed tarball under `node_modules/`.

1. From the checkout, run `npm pack --pack-destination <dir>`.
2. Give the fixture directory its own `package.json`.
3. Install the tarball there: `npm install --save-dev --save-exact --ignore-scripts ./lab43-q-<version>.tgz`. q lands at `node_modules/@lab43/q`.
4. Set the `@lab43/q` devDependency to the literal version by hand. The tarball install records `file:lab43-q-<version>.tgz` instead. That is not an exact version pin, so it never matches the installed version. The session-start hook reports the mismatch, telling every session in the fixture to run `/q:sync`. The package still resolves from `node_modules` after the edit, which is what a session reads. Run no dependency install afterward: the pin now names a version the registry does not have.
5. Register it: `claude plugin marketplace add --scope local ./node_modules/@lab43/q`.
6. Install the plugin: `claude plugin install q@q --scope project`.
7. Run `/q:install` in the fixture to finish the setup. Until it does, the fixture has no `.claude/q-state.json`. The session-start hook reports that as drift on every session. That is the hook working rather than a broken fixture. It does mean the hook's silent branch stays unreachable until this step runs. Exercising a hook change needs it.

q declares no dependencies of its own, so nothing else needs installing — in a fixture or in this checkout.

## Proving a session loads it

Run `claude -p` in the target directory and ask it to count the skills whose names start with `q:`. The count to expect is the number of directories in `skills/`.

A headless session loads a marketplace the CLI's registry already holds. It will not register one declared only in tracked `.claude/settings.json`, which is something an interactive session does for itself. Run the `marketplace add` above before driving headlessly.

## Taking turns over the marketplace name `q`

The CLI's registry holds one entry per marketplace name, machine-wide. This checkout and every fixture all publish the name `q`, so only one of them owns it at a time. Every session resolving `q@q` follows whichever registered last, this checkout's own sessions included.

Announce to peers before repointing it (see: references/run-contract.md, Working alongside a peer). Release it when you are done with the fixture: run `claude plugin marketplace add --scope local ./` from the checkout.

Nothing else driving q binds. There are no ports, databases, or services to contend over.

## When a session has no `q:` skills

The registry holds that directory under a name other than `q`, so the `q@q` key in `.claude/settings.json` resolves to nothing. Remove the stale entry with `claude plugin marketplace remove <name>`, then register the directory again.

Re-adding on its own does not fix it, because `claude plugin marketplace add` compares the registry by path:

- An entry whose path matches, under a different name, is left alone.
- An entry whose name matches, pointing at a different path, is repointed.

That second behavior is what lets the release step above take the name back.
