# Releasing

How q's two artifacts — the Claude Code plugin and the `@lab43/q-conventions` doc pack — are versioned and released. Releasing is separate from merging and is the maintainer's act: PRs never touch a `version` field, and an agent driving a release confirms the scope — what ships, at which version level — with the user before running any step here.

The artifacts version independently; release the one whose content changed — the plugin carries `skills/` and `hooks/`, the pack carries `packages/q-conventions/conventions/`. When one change moves both, publish the pack before tagging the plugin: the new plugin's skills may depend on the new pack content, and `/q:update-q` moves consuming projects to the latest of both in one run.

## Plugin

1. On main, bump `version` in `.claude-plugin/plugin.json` and commit.
2. `claude plugin tag --push` — this pushes the `q--v{version}` tag that project pins and `/q:update-q` resolve against. Updates only ship on a version bump.

## Pack

1. Bump `version` in `packages/q-conventions/package.json` and commit.
2. From `packages/q-conventions/`, run `npm publish`. Its `publishConfig` pins the destination to the public npm registry with public access, so no flags are needed — but the logged-in account must own the `@lab43` scope; check with `npm whoami --registry https://registry.npmjs.org`.

## Choosing the version

Projects pin exact versions, so no range semantics apply — every bump reaches a project the same way, through the update skills diffing the release and reconciling. The version is a signal of expected churn, not a compatibility gate. **Major**: changes that will result in significant churn in consuming projects. **Minor**: changes some consuming projects will have to react to — a moved heading their markers target, an amended rule demanding reconciliation. **Patch**: changes consuming projects won't react to at all — rewordings, typo fixes.

Consuming projects pick up either release with `/q:update-q`.
