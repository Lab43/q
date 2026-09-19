# Agent Briefing

The shape of a project's agent briefing — `CLAUDE.md`. `/q:install` scaffolds it, `/q:update-docs` extends it, and `/q:groom-docs` checks it.

The documentation policy decides what the briefing must carry (see: @lab43/q conventions/documentation.md, Taxonomy). This file gives that a shape.

## The template

```markdown
## Documentation

This project follows q, an agentic coding workflow. Its rules live in the project's own documentation. Those rules are conventions: binding decisions about how this project's code and docs get written, recorded as they are made. Guides sit alongside them — how to operate the project, rather than rules for writing it.

If the session's skill list has no `/q:` skills, this machine is missing the q plugin — ask the user to install the project's dependencies (`npm install`, or the project's package manager's equivalent), then run `/q:sync`.

When another session is already working this repo, take a worktree rather than sharing the checkout.

Conventions come in three tiers: q's own, the conventions of any installed extensions, and this project's own `docs/conventions/` (source: @lab43/q conventions/documentation.md, Three tiers of conventions). q and the extensions are pinned in `package.json`. Project rules win over an extension's rule, and an extension's rule wins over q's. Check all three tiers before writing code, before design decisions and reviews, and before changing docs. Doc changes — the README and this briefing itself included — go through `/q:update-docs`.

Package doc paths are package name plus path from the package root, resolved under `node_modules/`: `@lab43/q conventions/principles.md` is `node_modules/@lab43/q/conventions/principles.md` (source: @lab43/q conventions/documentation.md, Package doc paths).

`@lab43/q` — the rules of the q workflow, governing how a project's work gets planned, decided, documented, and shipped:

- `@lab43/q conventions/principles.md` — cross-cutting rules for any design decision, plan, or review
- `@lab43/q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `@lab43/q conventions/extensions.md` — the extension format: rules for authoring and publishing a q extension
- `@lab43/q conventions/plans.md` — format, sequencing, and lifecycle rules for `docs/plans/` documents
- `@lab43/q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `@lab43/q conventions/pull-requests.md` — rules for authoring a pull request
- `@lab43/q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read

`<package>` — the extension's description, restated:

- `<package> conventions/<name>.md` — one line per doc, restating its intro

This project's own:

- `docs/conventions/principles.md` — cross-cutting rules, including deviations from q's
- `docs/conventions/documentation.md` — documentation rulings and deviations

Guides:

- `docs/guides/<name>.md` — one line per guide, restating its intro
```

## Maintaining it

- **Write into `CLAUDE.md`**, creating it when it doesn't exist. Leave any `AGENTS.md` the project keeps for other tools alone. Linking the two is the project's call, not q's.
- **Conform to the structure**: the section heading, the groups in the order they run here, one line per doc. Name each group for what it actually holds.
- **Head each group with what its docs govern** (source: @lab43/q conventions/documentation.md, Taxonomy). q's group takes the heading spelled out above. Each installed extension gets a group of its own, headed by its package name and the `description` from its `package.json` (see: @lab43/q conventions/extensions.md, Description). Restate that description as written. Shortening an unwieldy one is the extension author's job. An extension shipping no description gets a heading of its name alone.
- **Treat the prose as a floor, not a script.** Carry at least what the template's prose carries. Leave the project's own wording where it says the same thing. Where a statement isn't true of the project — it authors an extension rather than installing one, or loads the plugin some other way — say what is true instead.
- **Keep what the project put there** — its own standing instructions, notes, and index entries beyond the required ones. Work missing information into what is already written rather than bolting a sentence alongside it. Rewrite freely to do that, but drop nothing the project said.
- **Drop a group with no entries.** A fresh project has no extensions and no guides, so those groups arrive with the first one of each. The q group is always there.
- **Index every doc the policy requires, and nothing stale** — every conventions doc, from q, from an installed extension, or the project's own, and every guide (source: @lab43/q conventions/documentation.md, Taxonomy). Drop the line for a doc that is gone. An extension the project no longer installs loses every line and its heading with them. The installed extensions are the direct dependencies whose own `package.json` carries the `q-extension` keyword (source: @lab43/q conventions/extensions.md). An extension shipping no `conventions/` contributes no lines, and so no group.
- **Write each line as a path plus a blurb restating the doc's intro** — q's docs and an extension's by package name plus path from the package root (see: @lab43/q conventions/documentation.md, Package doc paths), the project's own by repo-relative path.
