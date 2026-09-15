# Doc Packs

The format behind the pack conventions tier — rules for authoring and publishing a doc pack.

## Identity

A doc pack is an npm package whose `package.json` carries the `q-docs` keyword, containing documentation and nothing executable — no scripts, no code. The keyword is the identity: how tooling tells packs from a project's other dependencies, and how packs are found on the registry. Nothing without it is a pack — a project's own `docs/conventions/` included.

## Layout

The layout is a fixed contract: a `conventions/` directory at the package root, each doc written to the documentation policy (see: q conventions/documentation.md). Conventions are the only docs a pack ships.

Rejected: a `q` metadata key in `package.json` (configurable paths, a per-doc manifest) — every job it would do is already covered by the fixed layout, the keyword, and the doc intros, and an enumeration of docs rots against its own contents.

## Pinning

A pack is authored in a project that itself uses q, with `@lab43/q-conventions` pinned in the pack's own `package.json` — an exact devDependency that is also the authoring project's live install (in a monorepo, the pack as a workspace), so pin and declaration are one field, never two to drift apart. Shipped in the tarball, the pin declares the framework version the pack's docs are written against; the skills hold it against a consuming project's own pin and flag drift. The framework pack alone carries no pin: its version is the thing declared against.

## Authoring

In its authoring project, a pack's `conventions/` joins the documentation surface — groomed and reconciled against framework updates like the project's own docs. Moving the framework pin asserts that reconciliation happened: the moved pin declares the docs written against the new version (see: Pinning). Don't record a deviation from a convention you ship — edit it. Deviations, overrides, and upstreaming are for rules you consume, not rules you author. In the authoring repo, references to the pack's docs resolve to its working tree (source: q conventions/documentation.md, Pack doc paths).

A pack doc may deviate from a framework rule the same way a project doc does, stating the deviation with an overrides marker (see: q conventions/documentation.md, Markers); the project's own rulings still win over any pack's (source: q conventions/documentation.md, Two tiers of conventions).

## Graduation

Conventions graduate into a pack when their audience grows beyond one project — org-wide rules, or rules for code that uses a product. Graduating docs move out of the authoring project's `docs/conventions/` into the pack, never copied into both homes; the authoring project keeps only its project-specific rulings local.

## Publishing

The format says nothing about repositories: publishing the pack from a subdirectory of the authoring repo works as well as a dedicated repo. A pack published from a subdirectory sets `repository.directory` so registry links resolve to it. Use a `files` whitelist limiting the tarball to `conventions/` — npm adds `package.json`, the README, and the license itself.
