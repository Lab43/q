# Extensions

The format behind the extension conventions tier — rules for authoring and publishing a q extension.

## Identity

A q extension is an npm package that carries the `q-extension` keyword in its `package.json` and ships a `q-extension/` payload directory (see: Layout). Both halves identify it. The keyword is how tooling tells extensions from a project's other dependencies and how they are found on the registry. The payload is what the keyword promises. A package carrying the keyword and shipping nothing is not an extension, and q's machinery passes over it in silence rather than reporting a state no skill can repair.

Look for extensions across a project's direct `dependencies` as well as its `devDependencies`. A package can ship rules and code together — a component library carrying the conventions for using it — and a project that imports such a package holds it as a regular dependency. Meeting both halves means q's machinery:

- discovers the package
- indexes what it documents
- loads the plugin it ships
- reconciles the project against its releases

q is not an extension but what extensions extend: the framework whose rules they add to and whose format they follow (source: @lab43/q conventions/documentation.md, Three tiers of conventions). `@lab43/q` carries no keyword, and is named outright wherever a rule reaches it.

## Which rules ship

A repo that publishes rules has two homes for a rule it writes, and every rule goes to one of them. A repo that publishes none has one home, `docs/conventions/`, and becoming a publisher is the user's call rather than a session's.

- **The payload** — everything under the package's `q-extension/` directory, which is what binds its consumers (see: Layout).
- **`docs/conventions/`** — rules for developing the repo itself: its own code, its docs, its repo mechanics. Consumers are never bound by these and never routed to them.

The test is one question: would this change what a session in a consuming repo writes or flags? Yes puts it in the payload. No keeps it local.

A rule can pass that test later, as its audience outgrows one project — org-wide rules, or rules for code that uses a product. Move it then: out of `docs/conventions/` into the payload, never copied into both, its index line crossing from the project's group to the payload's rather than disappearing (see: Authoring).

**Payload is addressed solely to consumers.** Payload docs never name the repo that authors them, its development practices, or its internal layout. Even acknowledging that they might be read from inside that repo muddies them for the audience they speak to. A repo still follows the payload it ships, as a consuming project of its own rules.

Rejected: shipping the payload's conventions at the contract path, `docs/conventions/`, so that one path means conventions everywhere. It conflates what the package ships with the repo's own working rules, so a consumer reading the shipped docs would meet repo-local rulings as law.

## Description

`package.json`'s `q.description` states what the extension's rules govern. A consuming project's briefing heads the extension's group of index lines with it (source: @lab43/q conventions/documentation.md, Taxonomy). Name the territory the rules cover, not the package's shape.

## Layout

A package's payload is a `q-extension/` directory at its package root. Everything the package ships for q lives inside it. Name `q-extension` in the `files` whitelist: without it the package ships no rules at all, announces itself as an extension anyway, and nothing warns.

What it holds depends on what the extension carries:

- `conventions/` when it ships conventions docs, each written to the documentation policy (see: @lab43/q conventions/documentation.md).
- `.claude-plugin/` when it ships a plugin, beside whatever that plugin loads — its skills, agents and hooks. `q-extension/` is then the plugin root, and `${CLAUDE_PLUGIN_ROOT}` resolves to it. A consuming project loads the plugin from its own marketplace under the `name` in the plugin's `plugin.json`, so that name is the namespace its sessions type: `/<name>:<skill>`. Choose one no other extension is likely to carry. `q` is taken. What else a plugin may hold is Claude Code's to decide; q fixes only where its root sits.

Every extension ships at least one of the two, which is what identifies a payload (see: Identity). Anything else the package ships for q sits beside them.

An extension shipping no conventions docs is watermarked but never indexed, having nothing for a briefing's docs index to carry. Watermarking and indexing are separate for that reason.

Rejected: a `q` metadata key in `package.json` naming paths or listing docs — the payload directory and the keyword already answer where everything is, and an enumeration of docs rots against its own contents. The key carries the description and nothing else (see: Description).

## Pinning

Declare `@lab43/q` as a devDependency in the `package.json` at the repo root. That is the only place anything looks for it, whatever else the repo holds — a monorepo declares q at the root, never in a workspace manifest. Keep it a devDependency: q is tooling rather than code a project imports, and a project holding it in `dependencies` goes unvalidated at session start, silently.

Declare each extension in that same root manifest. `dependencies` and `devDependencies` both serve (see: Identity), but no other manifest does — a declaration in a workspace package is one nothing reads. The specifier's form is the project's own choice: q reads versions from the lockfile and `node_modules`, never from the manifest.

A repo that publishes rules already declares q at its root, like any q project, with one requirement of its own: the pin is exact. With the payload at that root, the published package is the repo itself — its `package.json` goes into the tarball, and the pin in it tells consumers which q version the rules were written against. That is a fact only an exact version can state, and the manifest is the author's only channel for it: the lockfile that would resolve a range never ships. The declaration stays inert in consumers — npm installs no dependency's devDependencies — so extensions declaring different q versions never collide; the gap is surfaced at reconciliation and closes through releases.

## Authoring

In its authoring project, an extension's conventions docs and its `q.description` join the documentation surface (see: Description). Both are groomed and reconciled against q's updates like the project's own docs.

They are indexed there too. The authoring repo's briefing gives them a group of their own, shaped like a consumed extension's and headed the same way. The group carries no pin, because a repo does not depend on itself, and no watermark, because a watermark certifies that changed rules have been absorbed and there is nothing to absorb in rules you are editing.

An extension's doc may deviate from a q rule the same way a project doc does, stating the deviation with an overrides marker (see: @lab43/q conventions/documentation.md, Markers); the project's own rulings still win over any extension's (source: @lab43/q conventions/documentation.md, Three tiers of conventions).

All of this assumes the payload sits at the repo's own root. Publish from a sub-package of a larger repo and consumers install it exactly the same way, but the authoring repo gets none of the above: no group in its briefing, and a root declaration that is not the pin the package ships (see: Pinning).
