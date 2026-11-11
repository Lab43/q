# Extensions

The format behind the extension conventions tier — rules for authoring and publishing a q extension.

## Identity

A q extension is an npm package that carries the `q-extension` keyword in its `package.json`. The keyword is how tooling tells extensions from a project's other dependencies and how they are found on the registry. It promises a `q-extension/` payload directory (see: Layout), so never carry the keyword without shipping one. q's skills trust that promise and identify an extension by the keyword alone. The session-start check is the exception: it reports an unrecorded extension only when the payload is there too.

Look for extensions across a project's direct `dependencies` as well as its `devDependencies`. A package can ship rules and code together — a component library carrying the conventions for using it — and a project that imports such a package holds it as a regular dependency. Carrying the keyword means q's machinery:

- discovers the package
- indexes what it documents
- registers the plugin it ships, for the project's sessions to load
- reconciles the project against its releases

q is not an extension but what extensions extend: the framework whose rules they add to and whose format they follow (source: @lab43/q conventions/conventions.md, Three tiers of conventions). `@lab43/q` carries no keyword, and is named outright wherever a rule reaches it.

## Which rules ship

A repo that publishes rules has two homes for a rule it writes, and every rule goes to one of them. A repo that publishes none has one home, `q-docs/conventions/`, and becoming a publisher is the user's call rather than a session's.

- **The payload** — everything under the package's `q-extension/` directory, which is what reaches its consumers (see: Layout).
- **`q-docs/conventions/`** — rules for developing the repo itself: its own code, its docs, its repo mechanics. Consumers are never bound by these and never routed to them.

The test is one question: would this change what a session in a consuming repo writes or flags? Yes puts it in the payload. No keeps it local.

A rule can pass that test later, as its audience outgrows one project — org-wide rules, or rules for code that uses a product. Move it then: out of `q-docs/conventions/` into the payload, never copied into both, its index line crossing from the project's group to the payload's rather than disappearing (see: Authoring).

**Payload is addressed solely to consumers.** Payload docs never name the repo that authors them, its development practices, or its internal layout. Even acknowledging that they might be read from inside that repo muddies them for the audience they speak to. A repo still follows the payload it ships, as a consuming project of its own rules.

Rejected: shipping the payload's conventions at the contract path, `q-docs/conventions/`, so that one path means conventions everywhere. It conflates what the package ships with the repo's own working rules, so a consumer reading the shipped docs would meet repo-local rulings as law.

## Description

`package.json`'s `q.description` states the territory the extension's docs cover. A consuming project's briefing heads each of the extension's groups of index lines with it (source: @lab43/q conventions/documentation.md, Taxonomy). Name that territory, not the package's shape.

## Layout

A package's payload is a `q-extension/` directory at its package root. Everything the package ships for q lives inside it. Name `q-extension` in the `files` whitelist: without it the package ships no rules at all, announces itself as an extension anyway, and nothing warns.

What it holds depends on what the extension carries:

- `conventions/` when it ships conventions docs, each written to the documentation policy (see: @lab43/q conventions/documentation.md).
- `guides/` when it ships guides to using what the package provides. Each is written to the policy's rules for guides (see: @lab43/q conventions/documentation.md, Taxonomy).
- `.claude-plugin/` when it ships a plugin, beside whatever that plugin loads — its skills, agents and hooks. `q-extension/` is then the plugin root, and `${CLAUDE_PLUGIN_ROOT}` resolves to it. A consuming project registers the plugin in its own marketplace under the `name` in the plugin's `plugin.json`, so that name is the namespace its sessions type: `/<name>:<skill>`. Choose one no other extension is likely to carry. `q` is taken. What else a plugin may hold is Claude Code's to decide; q fixes only where its root sits.

Every extension ships at least one of the three, which is what identifies a payload (see: Identity). Anything else the package ships for q sits beside them.

An extension shipping a plugin alone is watermarked but never indexed, having nothing for a briefing's docs index to carry. Watermarking and indexing are separate for that reason.

Rejected: a `q` metadata key in `package.json` naming paths or listing docs — the payload directory and the keyword already answer where everything is, and an enumeration of docs rots against its own contents.

## Pinning

Declare `@lab43/q` as a devDependency in the `package.json` at the repo root. That declaration is the project's pin, whatever else the repo holds. Keep it a devDependency: q is tooling rather than code a project imports, and a project holding it in `dependencies` goes unvalidated at session start, silently.

Declare each extension the project consumes in that same root manifest, in `dependencies` or `devDependencies` (see: Identity). q looks for consumed extensions in no other manifest. In a monorepo, an extension that only a workspace package declares is one q never sees: declare it at the root too, even when only that package uses it. Its rules then bind the whole repo, like every rule in the briefing. The specifier's form is the project's own choice: q reads versions from the lockfile and `node_modules`, never from the manifest.

A package that publishes rules declares `@lab43/q` exactly in its own `package.json`. That manifest goes into the tarball, and the declaration tells consumers which q version the rules were written against. Only an exact version can state that, since the lockfile that would resolve a range never ships. At the repo root this declaration is also the project's pin. In a workspace package it must equal the version the root lockfile resolves. The declaration stays inert in consumers — npm installs no dependency's devDependencies — so extensions declaring different q versions never collide; the gap is surfaced at reconciliation and closes through releases.

## Authoring

A repo authors each extension whose working tree it holds: any package carrying the `q-extension` keyword, at the repo root or in a workspace package (see: Identity). Find them among the manifests git lists: `git ls-files --cached --others --exclude-standard -- ':(glob)**/package.json'`.

In its authoring project, an extension's conventions docs, its guides, and its `q.description` join the documentation surface (see: Description). They are groomed and reconciled against q's updates like the project's own docs, and so is its `@lab43/q` declaration (see: Pinning).

They are indexed there too. The authoring repo's briefing gives them groups of their own, shaped like a consumed extension's and headed the same way, and says where the extension's name resolves (see: @lab43/q conventions/documentation.md, Package doc paths). The groups carry no pin, because a repo does not depend on itself, and no watermark, because a watermark certifies that changed rules have been absorbed and there is nothing to absorb in rules you are editing.

A root that lists one of its own workspace packages as a dependency is depending on the extension it authors, not installing one. npm and pnpm install such a dependency as a link, whatever its specifier: its installed copy's real path lies inside the repo's, with no `node_modules` segment between them. A copy resolving outside the repo, or under any `node_modules/`, is an install. A workspace link takes no watermark, no installed extension's index group, and no marketplace entry under `node_modules/`.

An extension's doc may deviate from a q rule the same way a project doc does, stating the deviation with an overrides marker (see: @lab43/q conventions/documentation.md, Markers); the project's own rulings still win over any extension's (source: @lab43/q conventions/conventions.md, Three tiers of conventions).

The plugin the extension ships loads from the working tree too. `/q:install` adds its entry to the project's own marketplace, beside q's: sourced at the extension's own `q-extension/` and named by the `name` in its `plugin.json`, and enables it the way q's entry is enabled.
