# Agent Briefing

The shape of a project's agent briefing — `CLAUDE.md`. `/q:install` scaffolds it, `/q:update-docs` extends it, and `/q:groom-docs` checks it.

The documentation policy decides what the briefing must carry (see: q conventions/documentation.md, Taxonomy). This file gives that a shape.

## The template

```markdown
## Documentation

This project follows q, an agentic coding workflow. Its rules live in the project's own documentation. Those rules are conventions: binding decisions about how this project's code and docs get written, recorded as they are made. Guides sit alongside them — how to operate the project, rather than rules for writing it.

If the session's skill list has no `/q:` skills, this machine is missing the q plugin — ask the user to install the project's dependencies (`npm install`, or the project's package manager's equivalent), then run `/q:sync`.

When another session is already working this repo, take a worktree rather than sharing the checkout.

Conventions come in two tiers: the installed extensions' (pinned in `package.json`, `@lab43/q` always among them) and this project's `docs/conventions/` (project rules — on conflict, the project wins) (source: q conventions/documentation.md, Two tiers of conventions). Check both tiers before writing code, before design decisions and reviews, and before changing docs; doc changes — the README and this briefing itself included — go through `/q:update-docs`.

Extension doc paths are package name plus path from the package root, resolved under `node_modules/`. `q` abbreviates `@lab43/q`: `q conventions/principles.md` is `node_modules/@lab43/q/conventions/principles.md` (source: q conventions/documentation.md, Extension doc paths).

Installed extensions:

- `q conventions/principles.md` — cross-cutting rules for any design decision, plan, or review
- `q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `q conventions/extensions.md` — the extension format: rules for authoring and publishing a q extension
- `q conventions/plans.md` — format, sequencing, and lifecycle rules for `docs/plans/` documents
- `q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `q conventions/pull-requests.md` — rules for authoring a pull request
- `q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read

This project's own:

- `docs/conventions/principles.md` — cross-cutting rules, including deviations from the framework's
- `docs/conventions/documentation.md` — documentation rulings and deviations

Guides:

- `docs/guides/<name>.md` — one line per guide, restating its intro
```

## Maintaining it

- **Write into `CLAUDE.md`**, creating it when it doesn't exist. Leave any `AGENTS.md` the project keeps for other tools alone. Linking the two is the project's call, not q's.
- **Conform to the structure**: the section heading, the groups in the order they run here, one line per doc. Name each group for what it actually holds.
- **Treat the prose as a floor, not a script.** Carry at least what the template's prose carries. Leave the project's own wording where it says the same thing. Where a statement isn't true of the project — it authors an extension rather than installing one, or loads the plugin some other way — say what is true instead.
- **Keep what the project put there** — its own standing instructions, notes, and index entries beyond the required ones. Work missing information into what is already written rather than bolting a sentence alongside it. Rewrite freely to do that, but drop nothing the project said.
- **Drop a group with no entries.** A fresh project has no guides, so the guides group arrives with the first one.
- **Index every doc the policy requires, and nothing stale** — every conventions doc, from an installed extension or the project's own, and every guide (source: q conventions/documentation.md, Taxonomy). Drop the line for a doc that is gone, including every line of an extension the project no longer installs. The installed extensions are the direct dependencies whose own `package.json` carries the `q-extension` keyword (source: q conventions/extensions.md). An extension shipping no `conventions/` contributes no lines.
- **Write each line as a path plus a blurb restating the doc's intro** — an extension's docs by package name plus path from the package root (see: q conventions/documentation.md, Extension doc paths), the project's own by repo-relative path.
