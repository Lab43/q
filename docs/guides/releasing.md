# Releasing

How q is versioned and released. Releasing is separate from merging and is the maintainer's act: PRs never touch a `version` field, and an agent driving a release confirms the scope — what ships, at which version level — with the user before starting.

q has one version. Two manifests carry it — `package.json` and `.claude-plugin/plugin.json` — and `npm run check-versions` holds them equal. `package-lock.json` carries it as well. A lockfile left at the old version fails `npm ci`, which CI runs.

A `v<version>` tag anchors each release to the tree it shipped from. The published tarball can't serve as that anchor, because its `files` whitelist ships only what consumers load.

## Making a release

Choose a level first (see: Choosing the version). Then, on `main`:

```sh
node scripts/set-version.mjs <level>
npm install
```

Commit both manifests and the lockfile, and push to `main`.

Then publish a GitHub release against that commit, tagged `v<version>`. Publishing the release is what releases q (source: .github/workflows/release.yml). The workflow confirms the tag names the version in `package.json`, runs `npm run check` over the tagged tree, and publishes to npm with provenance.

Nothing reaches npm until both pass, and nothing happens after the publish. A release that fails anywhere leaves npm untouched: delete the release and its tag, fix what failed, and release again.

## Choosing the version

Projects pin exact versions, so no range semantics apply — every bump reaches a project the same way, through `/q:update` diffing the release and reconciling. The version is a signal of expected churn, not a compatibility gate.

- **Major**: changes that will result in significant churn in consuming projects.
- **Minor**: changes some consuming projects will have to react to — a moved heading their markers target, an amended rule demanding reconciliation.
- **Patch**: changes consuming projects won't react to at all — rewordings, typo fixes.

Consuming projects pick up the release with `/q:update`.

## What a release depends on

Two settings live outside the repository.

- **npm trusted publishing**, configured on the package's settings at npmjs.com against the `Lab43/q` repository and the workflow filename `release.yml`. It is what lets the workflow publish without a stored token. Renaming the workflow file breaks publishing until that setting names the new filename, and npm reports the mismatch only as a bare `401`.
- **A bypass for repository admin** on `main`'s ruleset. `main` requires the `check` status, and a required status check governs direct pushes as well as merges, so the bump commit cannot be pushed without it.
