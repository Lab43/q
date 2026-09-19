# Extensions

The format behind the extension conventions tier — rules for authoring and publishing a q extension.

## Identity

A q extension is an npm package whose `package.json` carries the `q-extension` keyword. The keyword is the identity: how tooling tells extensions from a project's other dependencies, and how they are found on the registry. Carrying it means q's machinery:

- discovers the package
- indexes what it documents
- reconciles the project against its releases

Nothing without it is an extension — a project's own `docs/conventions/` included.

q is not an extension but what extensions extend: the framework whose rules they add to and whose format they follow (source: q conventions/documentation.md, Three tiers of conventions). `@lab43/q` carries no keyword, and is named outright wherever a rule reaches it.

Installing an extension runs no code. The install passes `--ignore-scripts`, and an extension declares no lifecycle scripts. An extension may ship executable files — a plugin's hooks run inside a session — but nothing in it runs as a consequence of being installed.

## Layout

The layout is conditional on what the extension carries:

- `conventions/` at the package root when it ships conventions docs, each written to the documentation policy (see: q conventions/documentation.md).
- `.claude-plugin/` when it ships a plugin.

Every extension ships at least one of the two.

An extension with no `conventions/` is watermarked but never indexed, having nothing for a briefing's docs index to carry. Watermarking and indexing are separate for that reason.

Rejected: a `q` metadata key in `package.json` (configurable paths, a per-doc manifest) — every job it would do is already covered by the two directories above, the keyword, and the doc intros, and an enumeration of docs rots against its own contents.

## Pinning

An extension is authored in a project that itself uses q, with `@lab43/q` pinned in the extension's own `package.json` — an exact devDependency that is also the authoring project's live install (in a monorepo, the extension as a workspace), so pin and declaration are one field, never two to drift apart. Shipped in the tarball, the pin declares the q version the extension is written against; the skills hold it against a consuming project's own pin and flag drift. q carries no such pin: its version is the thing declared against.

## Authoring

In its authoring project, an extension's `conventions/` joins the documentation surface — groomed and reconciled against q's updates like the project's own docs. Moving the q pin asserts that reconciliation happened: the moved pin declares the docs written against the new version (see: Pinning). Don't record a deviation from a convention you ship — edit it. Deviations, overrides, and upstreaming are for rules you consume, not rules you author. In the authoring repo, references to the extension's docs resolve to its working tree (source: q conventions/documentation.md, Package doc paths).

An extension's doc may deviate from a q rule the same way a project doc does, stating the deviation with an overrides marker (see: q conventions/documentation.md, Markers); the project's own rulings still win over any extension's (source: q conventions/documentation.md, Three tiers of conventions).

## Graduation

Conventions graduate into an extension when their audience grows beyond one project — org-wide rules, or rules for code that uses a product. Graduating docs move out of the authoring project's `docs/conventions/` into the extension, never copied into both homes; the authoring project keeps only its project-specific rulings local.

## Publishing

The format says nothing about repositories: publishing an extension from a subdirectory of the authoring repo works as well as a dedicated repo. An extension published from a subdirectory sets `repository.directory` so registry links resolve to it. Use a `files` whitelist limiting the tarball to what the extension ships — npm adds `package.json`, the README, and the license itself.
