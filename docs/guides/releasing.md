# Releasing

How q is versioned and released. Releasing is separate from merging and is the maintainer's act: PRs never touch a `version` field, and an agent driving a release confirms the scope — what ships, at which version level — with the user before dispatching.

q has one version. Two manifests carry it — `package.json` and `.claude-plugin/plugin.json` — and `npm run check-versions` holds them equal. `package-lock.json` carries it as well. A lockfile left at the old version fails `npm ci`, which CI runs.

A `v<version>` tag anchors each release to the tree it shipped from. The published tarball can't serve as that anchor, because its `files` whitelist ships only what consumers load.

## Making a release

(source: .github/workflows/release.yml)

Dispatch the **Release** workflow from the repository's Actions tab, on `main`. Choose a level (see: Choosing the version).

The workflow then:

- Bumps the version in both manifests and the lockfile.
- Runs `npm run check` over the bumped tree.
- Commits the bump and tags it `v<version>`.
- Publishes to npm with provenance.
- Pushes the commit and the tag in one atomic push.

Anything that fails before the publish leaves both npm and `origin` untouched. Dispatch it again.

## When a release strands

(source: .github/workflows/release.yml)

A publish can be neither undone nor repeated, so a failure after one has to be finished by hand. The workflow narrows when that can happen. It refuses to publish once `origin/main` has moved under the run, and it pushes the commit and the tag together, so neither can land without the other.

What remains is a run that publishes and then cannot push at all. npm carries the version while `origin` has neither the bump commit nor the tag. Dispatching again fails, because the version already exists.

Finish it on `main` yourself:

1. Bump both manifests to the version npm already carries.
2. Run `npm install` to refresh the lockfile.
3. Commit.
4. Tag that commit `v<version>`.
5. Push the commit and the tag.

## Choosing the version

Projects pin exact versions, so no range semantics apply — every bump reaches a project the same way, through `/q:update` diffing the release and reconciling. The version is a signal of expected churn, not a compatibility gate.

- **Major**: changes that will result in significant churn in consuming projects.
- **Minor**: changes some consuming projects will have to react to — a moved heading their markers target, an amended rule demanding reconciliation.
- **Patch**: changes consuming projects won't react to at all — rewordings, typo fixes.

Consuming projects pick up the release with `/q:update`.

## What the workflow depends on

Two settings live outside the repository. Both have to be in place before a dispatch can succeed.

- **npm trusted publishing**, configured on the package's settings at npmjs.com against the `Lab43/q` repository and the workflow filename `release.yml`. It is what lets the workflow publish without a stored token. Renaming the workflow file breaks publishing until that setting names the new filename, and npm reports the mismatch only as a bare `401` on publish.
- **Bypasses on `main`'s ruleset**, for `github-actions[bot]` and for repository admin. `main` requires the `check` status, and a required status check governs direct pushes as well as merges. The release commit is created inside the workflow run, so no earlier run can have recorded that status against it. The bot's bypass is what lets the workflow push. The admin's is what lets a maintainer finish a stranded release (see: When a release strands).

Bypassing that gate costs nothing here, because the workflow runs `npm run check` on the bumped tree before it commits anything (source: .github/workflows/release.yml).

Neither setting can be tested without a real release. Confirm both before a release day rather than on one.
