# Releasing

How q is versioned and released. Releasing is separate from merging and is the maintainer's act: PRs never touch a `version` field, and an agent driving a release confirms the scope — what ships, at which version level — with the user before running any step here.

q has one version. Two manifests carry it — `package.json` and `.claude-plugin/plugin.json` — and `npm run check-versions` holds them equal. `package-lock.json` carries it as well, refreshed by `npm install` rather than by hand. A lockfile left behind at the old version fails `npm ci`, which CI runs.

A `v<version>` tag anchors each release to the tree it shipped from. The published tarball can't serve as that anchor, because its `files` whitelist ships only what consumers load.

## Steps

1. On main, bump `version` in `package.json` and `.claude-plugin/plugin.json`. Run `npm install` so the lockfile records the new version. Run `npm run check-versions`. Commit, then push to `origin`.
2. From the repo root, run `npm publish`. Its `publishConfig` pins the destination to the public npm registry with public access, so no flags are needed. The logged-in account must own the `@lab43` scope. Check with `npm whoami --registry https://registry.npmjs.org`.
3. Once the publish has succeeded, tag the release commit and push the tag:

   ```sh
   git tag -a v<version> -m "v<version>"
   git push origin v<version>
   ```

   A tag pushed ahead of the publish can end up naming a version npm never carried.

## Choosing the version

Projects pin exact versions, so no range semantics apply — every bump reaches a project the same way, through `/q:update` diffing the release and reconciling. The version is a signal of expected churn, not a compatibility gate. **Major**: changes that will result in significant churn in consuming projects. **Minor**: changes some consuming projects will have to react to — a moved heading their markers target, an amended rule demanding reconciliation. **Patch**: changes consuming projects won't react to at all — rewordings, typo fixes.

Consuming projects pick up the release with `/q:update`.
