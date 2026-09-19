# Releasing

How q is versioned and released. Releasing is separate from merging and is the maintainer's act: PRs never touch a `version` field, and an agent driving a release confirms the scope — what ships, at which version level — with the user before running any step here.

q has one version. Three files carry it:

- `package.json`
- `.claude-plugin/plugin.json`
- `package-lock.json`

`npm run check-versions` holds the two manifests equal. A lockfile left at the old version fails `npm ci`, which CI runs.

A `v<version>` tag anchors each release to the tree it shipped from. The published tarball can't serve as that anchor, because its `files` whitelist ships only what consumers load.

## Making a release

Dispatch the **Release** workflow from the repository's Actions tab, on `main`. Choose a level (see: Choosing the version). Nothing else is run by hand.

The workflow then:

- Runs `npm run check` over the tree being released.
- Moves the version in all three files, and runs `npm run check-versions`.
- Commits the bump and tags it `v<version>`.
- Publishes to npm with provenance.
- Pushes `main` and the tag.

Nothing reaches `origin` until npm carries the version. A failed publish leaves `origin` untouched, so a broken release is re-dispatched rather than unpicked. A dispatch from any branch but `main` fails on the first step.

## Choosing the version

Projects pin exact versions, so no range semantics apply — every bump reaches a project the same way, through `/q:update` diffing the release and reconciling. The version is a signal of expected churn, not a compatibility gate. **Major**: changes that will result in significant churn in consuming projects. **Minor**: changes some consuming projects will have to react to — a moved heading their markers target, an amended rule demanding reconciliation. **Patch**: changes consuming projects won't react to at all — rewordings, typo fixes.

Consuming projects pick up the release with `/q:update`.

## What the workflow depends on

Two settings live outside the repository. Both have to be in place before a dispatch can succeed.

- **npm trusted publishing**, configured on the package's settings at npmjs.com against the `Lab43/q` repository and the workflow filename `release.yml`. It is what lets the workflow publish without a stored token. Renaming the workflow file breaks publishing until that setting names the new filename.
- **A bypass for `github-actions[bot]`** on `main`'s ruleset. `main` requires the `check` status, and a required status check governs direct pushes as well as merges. The release commit is created inside the workflow run, so no earlier run can have recorded that status against it. The check still gates the release: the workflow runs `npm run check` itself, on the bumped tree, before it commits anything.
