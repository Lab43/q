# Agent Briefing

The shape of a project's agent briefing — `CLAUDE.md`. `/q:install` scaffolds it, `/q:update-docs` extends it, and `/q:groom-docs` checks it.

The documentation policy decides what the briefing must carry (see: @lab43/q conventions/documentation.md, Taxonomy). This file gives that a shape.

## The template

```markdown
## Documentation

This project follows q, an agentic coding workflow. Its rules live in the project's own documentation. Those rules are conventions: binding decisions about how this project's code and docs get written, recorded as they are made. Two other kinds of doc sit alongside them. Specs state what the product commits to, as behavior the code must honor. Guides say how to use and operate the product, rather than how to write it (source: @lab43/q conventions/documentation.md, Taxonomy).

If the session's skill list has no `/q:` skills, this machine is missing the q plugin — ask the user to install the project's dependencies (`npm install`, or the project's package manager's equivalent), then run `/q:reconcile`.

When another session is already working this repo, take a worktree rather than sharing the checkout (source: @lab43/q references/run-contract.md, The delivery branch).

Conventions come in three tiers: q's own, the conventions of any installed extensions, and this project's own `docs/conventions/` (source: @lab43/q conventions/conventions.md, Three tiers of conventions). q and the extensions are dependencies in `package.json`. Project rules win over an extension's rule, and an extension's rule wins over q's. Check all three tiers before writing code, before design decisions and reviews, and before changing docs. Doc changes — the README and this briefing itself included — go through `/q:update-docs`.

Package doc paths are package name plus path from the package's `q-extension/` payload directory, resolved under `node_modules/`: `@lab43/q conventions/principles.md` is `node_modules/@lab43/q/q-extension/conventions/principles.md` (source: @lab43/q conventions/documentation.md, Package doc paths).

`@lab43/q` — <its `q.description`>

- `@lab43/q conventions/principles.md` — cross-cutting rules for any design decision, plan, or review
- `@lab43/q conventions/documentation.md` — what belongs in a project's documentation, where it lives, and how it stays accurate
- `@lab43/q conventions/conventions.md` — how a project's conventions are tiered, written, and enforced
- `@lab43/q conventions/extensions.md` — the extension format: rules for authoring and publishing a q extension
- `@lab43/q conventions/plans.md` — how a project's plans are written, sequenced, and carried to completion
- `@lab43/q conventions/specs.md` — how a project's specs are written and how the code is held to them
- `@lab43/q conventions/issue-tracking.md` — rules for working a project's issue tracker from any session
- `@lab43/q conventions/pull-requests.md` — rules for authoring a pull request
- `@lab43/q conventions/writing.md` — rules for writing prose: docs, plans, PR bodies, anything a human or agent will read

`<package>` — <its `q.description`>

- `<package> conventions/<name>.md` — one line per doc, restating its intro

`<this package>` — <its `q.description`>

- `<this package> conventions/<name>.md` — one line per doc, restating its intro

This project's own:

- `docs/conventions/principles.md` — cross-cutting rules, including deviations from q's
- `docs/conventions/documentation.md` — documentation rulings and deviations

Specs — what this product commits to, stated as behavior the code must honor (source: @lab43/q conventions/documentation.md, Taxonomy):

- `docs/specs/<name>.md` — one line per spec, restating its intro

Guides — how to use and operate this product, rather than how to write its code (source: @lab43/q conventions/documentation.md, Taxonomy):

- `docs/guides/<name>.md` — one line per guide, restating its intro
```

## Maintaining it

- **Write into `CLAUDE.md`**, creating it when it doesn't exist. Leave any `AGENTS.md` the project keeps for other tools alone. Linking the two is the project's call, not q's.
- **Conform to the structure**: the section heading, the groups in the order they run here, one line per doc. Name each group for what it actually holds.
- **Head each group with what its docs govern** (source: @lab43/q conventions/documentation.md, Taxonomy). A package's group is headed by its name, an em dash, and the `q.description` from its `package.json`, q's own group included (see: @lab43/q conventions/extensions.md, Description). A package shipping no `q.description` gets a heading of its name alone, never its `description` — that field answers the registry's readers. The Specs and Guides groups are headed by what their docs are for, in the template's words, so a reader arriving from the conventions groups meets a change of kind and not more conventions.
- **Give the payload this repo ships its own group.** When the repo's own `q-extension/` holds `conventions/`, it ships those rules and consumes them too: index them in the same form as an installed extension's, read from the working tree rather than `node_modules/` (see: @lab43/q conventions/extensions.md, Authoring).
- **Treat the prose as a floor, not a script.** Carry at least what the template's prose carries. Leave the project's own wording where it says the same thing. Where a statement isn't true of the project — it authors an extension rather than installing one, or loads the plugin some other way — say what is true instead.
- **Keep what the project put there** — its own standing instructions, notes, and index entries beyond the required ones. Work missing information into what is already written rather than bolting a sentence alongside it. Rewrite freely to do that, but drop nothing the project said.
- **Drop an extension group with no entries.** A fresh project has no extensions, so those groups arrive with the first one. The q group, the Specs group, and the Guides group are always there, because the heading and its statement of purpose are what tell a session and its user that the doc type exists and where it goes. When a project has no specs or no guides yet, that group's list is the single line `- none yet`.
- **Index every doc the policy requires, and nothing stale** — every conventions doc, from q, from an installed extension, from this repo's own payload, or the project's own, every spec, and every guide (source: @lab43/q conventions/documentation.md, Taxonomy). Drop the line for a doc that is gone. An extension the project no longer installs loses every line and its heading with them. The installed extensions are the direct dependencies — `dependencies` and `devDependencies` alike — whose installed copy carries both the `q-extension` keyword and a payload directory (source: @lab43/q conventions/extensions.md, Identity). An extension shipping no conventions docs contributes no lines, and so no group.
- **Write each line as a path plus a blurb restating the doc's intro** — q's docs, an installed extension's, and this repo's own payload by their path form (see: @lab43/q conventions/documentation.md, Package doc paths), the project's own by repo-relative path.
