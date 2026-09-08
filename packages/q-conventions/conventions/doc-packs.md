# Doc Packs

The format behind the pack conventions tier — rules for authoring and publishing a doc pack.

- A doc pack is an npm package whose `package.json` carries the `q-docs` keyword, containing documentation and nothing executable — no scripts, no code. The keyword is the identity: how tooling tells packs from a project's other dependencies, and how packs are found on the registry. Nothing without it is a pack — a project's own `docs/conventions/` included.
- The layout is a fixed contract: a `conventions/` directory at the package root, each doc written to the documentation policy (see: q conventions/documentation.md). Conventions — rules for the consuming project's code — are the only docs a pack ships.
- A pack is authored in a project that itself uses q, with `@lab43/q-conventions` pinned in the pack's own `package.json` — an exact devDependency that is also the authoring project's live install (in a monorepo, the pack as a workspace), so pin and declaration are one field, never two to drift apart. Shipped in the tarball, the pin declares the framework version the pack's docs are written against; the skills hold it against a consuming project's own pin and flag drift. The framework pack alone carries no pin: its version is the thing declared against.
- In its authoring project, a pack's `conventions/` joins the documentation surface: held to the documentation policy, groomed, and reconciled against framework updates like the project's own docs — that reconciliation is what the moved declaration certifies. A lesson a pack doc owns is edited directly into it there; overrides, deviations, and upstreaming are the consumer's mechanism, not the author's.
- A pack doc may deviate from a framework rule the same way a project doc does, stating the deviation with an overrides marker (see: q conventions/documentation.md, Markers); the project's own rulings still win over any pack's (see: q conventions/documentation.md, Two tiers of conventions).

Rejected: a `q` metadata key in `package.json` (configurable paths, a per-doc manifest) — every job it would do is already covered by the fixed layout, the keyword, and the doc intros, and an enumeration of docs rots against its own contents.

Graduating conventions (see: q conventions/documentation.md, Two tiers of conventions) move out of the authoring project's `docs/conventions/` into the pack, never copied into both homes, and the authoring project installs its own pack like any consumer, keeping only its project-specific rulings local.

The format says nothing about repositories: publishing the pack from a subdirectory of the authoring repo works as well as a dedicated repo. A pack published from a subdirectory sets `repository.directory` so registry links resolve to it. Use a `files` whitelist so the tarball carries only `conventions/`, the README, and `package.json`.
