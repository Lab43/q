# Releasing

How q is versioned and released. Releasing is separate from merging and is the maintainer's act: PRs never touch a `version` field, and an agent driving a release confirms the scope — what ships, at which version level — with the user before starting.

q has one version. Three files carry it: `package.json`, `.claude-plugin/plugin.json` and `package-lock.json`. `npm run check-versions` holds all three equal.

A `v<version>` tag anchors each release to the tree it shipped from. The published tarball can't serve as that anchor, because its `files` whitelist ships only what consumers load.

## Making a release

Choose a level first (see: Choosing the version). Then, on `main`:

1. Move the version in all three files:

   ```sh
   node scripts/set-version.mjs <level>
   ```

2. Commit those three files and push to `main`:

   ```sh
   git commit -m "Release <version>" package.json .claude-plugin/plugin.json package-lock.json
   git push origin main
   ```

3. Publish a GitHub release tagged `v<version>` against the commit from step 2:

   ```sh
   gh release create "v<version>" --target "$(git rev-parse HEAD)" --title "v<version>" --generate-notes
   ```

   `--target` takes the full commit SHA. An abbreviated one is rejected with `Release.target_commitish is invalid`.

   The web form works too. Check its target rather than accepting the default, which is `main`'s tip. A release ships whatever commit it targets. Anything merged since step 2 would otherwise go out under a version that does not account for it.

Publishing the release is what starts the workflow (source: .github/workflows/release.yml). It checks that the release commit is on `main`, that the tag names the version in `package.json`, and that `npm run check` passes over the tagged tree. Then it publishes to npm with provenance.

## When a release fails

Anything that fails before the publish leaves npm untouched.

- For a transient failure — a flaky install, or a tag the checkout can't see yet — re-run the job from the Actions tab.
- For anything else, delete the release and its tag, fix what failed, and release again.

A failure inside the publish itself is the one case neither covers. npm may already hold the version, and it will reject a second attempt at it. Release the next version instead.

## Choosing the version

Projects pin exact versions, so no range semantics apply — every bump reaches a project the same way, through `/q:update` diffing the release and reconciling. The version is a signal of expected churn, not a compatibility gate.

- **Major**: changes that will result in significant churn in consuming projects.
- **Minor**: changes some consuming projects will have to react to — a moved heading their markers target, an amended rule demanding reconciliation.
- **Patch**: changes consuming projects won't react to at all — rewordings, typo fixes.

Consuming projects pick up the release with `/q:update`.

## What a release depends on

Two settings live outside the repository.

- **npm trusted publishing**, configured on the package's settings at npmjs.com against the `Lab43/q` repository and the workflow filename `release.yml`. It is what lets the workflow publish without a stored token. Renaming the workflow file breaks publishing until that setting names the new filename. npm reports the mismatch only as a bare `401`.
- **A bypass for repository admin** on `main`'s ruleset, without which step 2 cannot push. `main` requires the `check` status, and a required status check governs direct pushes as well as merges. A ruleset standing beside classic branch protection lifts nothing, because the most restrictive rule wins — the classic rule has to be deleted.

The push in step 2 proves the bypass. Trusted publishing is only exercised by a real release, so confirm it before a release day rather than on one.
