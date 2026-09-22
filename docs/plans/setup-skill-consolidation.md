---
status: completed
delivery: stacked
tracks: Lab43/q#116
---

# Setup Skill Consolidation

## Goal

Leave a developer two setup skills to choose between instead of four, and make q's version checks read what the project actually has.

`/q:install` bootstraps q into a project. `/q:reconcile` folds in everything that happens afterward. Nothing else is directly invocable, because nothing else is a choice a developer should have to make.

Underneath that, q stops installing, updating and removing packages. The developer runs npm. q reconciles the project's records with what npm did. The rule holds with no carve-out once q's version comparisons stop reading `package.json`, which is the second half of this plan.

## Context

### The flow the skills were shaped for no longer happens

Each of `/q:install`, `/q:update` and `/q:uninstall-extension` is shaped as "do the npm thing, then reconcile the records". A package that ships rules can also ship code the project imports, so the developer installs it themselves and npm has already run by the time q hears about it. Every npm step in those three skills is a no-op on the path a run actually takes.

The routing already resolves every case. `skills/sync/SKILL.md:31-33` sends a moved pin to `/q:update`, an orphaned watermark to `/q:uninstall-extension`, and a missing record to `/q:install`. Nothing is broken. What is wrong is that three skills present as typical a case their runs no longer meet.

### What each skill holds today

- `skills/install/SKILL.md` (160 lines). A bare run bootstraps q through Steps 3–4. An extension run adds Step 5. The bootstrap is not npm work: a machine-unique marketplace name (Step 3.4), `extraKnownMarketplaces` and `enabledPlugins` merged into `.claude/settings.json`, the two seeded mirror docs, the briefing and its index, `.gitignore` repair, README setup instructions, and the migration proposals at Step 4.
- `skills/sync/SKILL.md` (45 lines). Step 1 enforces the pins. Step 2 checks the GitHub CLI. Step 3 compares pins against watermarks in both directions. Step 4 reports and hands off, ordering the `/q:install` and `/q:uninstall-extension` runs before any `/q:update` run so that update starts from repaired records.
- `skills/update/SKILL.md` (86 lines). Step 1 reads four versions per package and sorts by state. Step 3 moves pins. Step 4 is the substance: reconcile what the diff touched.
- `skills/uninstall-extension/SKILL.md` (54 lines). Step 3 removes the records. Step 4 rules on the doc references the departure orphaned, in one AskUserQuestion batch.

### Every version comparison reads `package.json`

`hooks/session-start.mjs:85` reads the `@lab43/q` pin. Lines 117-123 compare each watermarked package's pin against its watermark, then its installed version against that pin. `skills/sync/SKILL.md:27` and `skills/update/SKILL.md:18-22` read the same pin.

`conventions/extensions.md:57` requires every extension be pinned exactly, because "every version comparison q makes is between exact versions, so a ranged pin never reads as reconciled". `skills/install/SKILL.md:123` enforces that by narrowing a range to the installed version on arrival.

Four runs against npm 10 in a scratch project establish what that anchor is worth (verified 2026-09-21):

| command | `package.json` | lockfile | installed |
| --- | --- | --- | --- |
| `npm install --save-exact semver@7.5.0` | `7.5.0` | 7.5.0 | 7.5.0 |
| edit to `^7.5.0`, wipe `node_modules`, `npm install` | `^7.5.0` | 7.5.0 | 7.5.0 |
| `npm ci` | `^7.5.0` | 7.5.0 | 7.5.0 |
| `npm update semver` | `^7.5.0` | 7.8.5 | 7.8.5 |

Latest at the time was 7.8.5. Two facts follow. The lockfile decides what gets installed, so an exact pin is not what makes an install deterministic. And `npm update` moves the installed version and the lockfile while leaving `package.json` untouched, so against a ranged pin `package.json` is blind to a change that happened.

`npm install <pkg>` writes `^7.8.5` by default — `save-exact` is `false` and `save-prefix` is `^`. Ranged pins are rare today only because `/q:install` passed `--save-exact` on the developer's behalf. Once the developer installs packages themselves, a ranged pin is the normal arrival state.

### The four lockfile formats

Generated and read directly (verified 2026-09-21). Each names the version of a direct dependency somewhere a dependency-free reader can reach:

| manager | file | where a direct dependency's version sits |
| --- | --- | --- |
| npm 10 | `package-lock.json`, `lockfileVersion: 3` | `packages["node_modules/<name>"].version` |
| pnpm 10 | `pnpm-lock.yaml`, `lockfileVersion: '9.0'` | `importers['.'].dependencies.<name>.version` |
| yarn berry 4 | `yarn.lock`, carrying a `__metadata` block | the `"<root>@workspace:."` block's `dependencies` map gives the specifier; that package's own block gives `version` |
| yarn classic 1 | `yarn.lock` | the block keyed `<name>@<specifier>` gives `version "x.y.z"` |

npm, pnpm and berry each mark their direct dependencies. Yarn classic does not distinguish direct from transitive, so finding a package there means matching the specifier `package.json` records for it. pnpm writes peer-dependency suffixes into the version, as `7.5.0(peer@1.0.0)`. Berry prefixes specifiers with the `npm:` protocol. Berry's `__metadata.version` moves between yarn releases, so tell berry from classic by that key's presence rather than its value.

### Constraints the change must respect

- `hooks/hooks.json` gives the session-start hook a 10-second timeout, and it runs on every session start. `hooks/session-start.mjs:135-136` records that the hook must never exit on a stack trace.
- `tests/session-start.test.mjs:14-17` commits the hook's message as a literal rather than importing it, so that changing the message fails the suite and is updated deliberately. `hooks/session-start.sh:26` holds a third copy for the no-node path.
- `references/agent-briefing.md:14` ships into every consuming project's `CLAUDE.md` and names the skill to run when a session has no `q:` skills.
- `skills/install/SKILL.md:137` already stops an install run before validation when another skill's run invoked it, so the caller delivers the changes.
- q declares no `@lab43/q` dependency, so `hooks/session-start.mjs:84` keeps this repo silent. Every change here must preserve that.
- `references/enforce-pins.md` is read by `skills/install`, `skills/update` and `skills/sync`, and by `references/run-contract.md:47` for installing dependencies in a worktree. That last reader survives any consolidation.

## Decisions

1. **Two directly-invocable setup skills: `/q:install` and `/q:reconcile`.** `/q:install` is the one nothing can prompt for, because it runs before q is set up. Everything after arrives through the session-start hook, which reports one uniform finding and names one remedy. A developer choosing between four skills is choosing between routes q can derive itself.

2. **`skills/sync/` survives as the reconciler, renamed to `reconcile`.** The hook message and `references/agent-briefing.md:14` already point at that skill, and its Step 3 detection is the entry point every run passes through. Rejected: building on `skills/update/`, which carries the richer procedure but none of the entry points, so every referrer would move regardless.

   Renamed because the noun must be accurate about the object (source: docs/conventions/skills.md, Naming). The skill's object becomes the project's records rather than this machine, and q's docs already name that operation reconciliation — `references/q-state.md:7`, `skills/update/SKILL.md`'s Step 4 heading. Keeping `sync` would leave a synonym standing for a concept that has a name (source: @lab43/q conventions/writing.md, One name per concept).

3. **An arrival, a version move and a departure are one procedure in three directions.** Nothing → `2.1.0`, `2.0.0` → `2.1.0`, `2.1.0` → nothing. Each indexes or de-indexes the package's group in the briefing, re-checks the project's overrides, restatements and exception markers against the rules that changed, and writes or drops the watermark. Three skills exist today because three npm commands did; with the npm commands gone, one procedure covers all three.

4. **q's version anchor is the lockfile for what the project intends, and `node_modules` for what is actually installed.** `package.json`'s pin stops being read as a version.

   The lockfile is exact whatever the pin looks like, it is committed, and `npm update` moves it even when it leaves `package.json` alone (see: Context). So it records intent that has not reached the developer's disk yet, which is what catches a merged Dependabot PR before anyone installs it. The installed version answers the different question of what rules this session is actually bound by.

   Rejected: keeping `package.json`'s pin, which goes blind against a range and forces q to edit the manifest to stay usable. Rejected: anchoring on the installed version alone, which needs no lockfile reader but stays silent when a version moved, nobody reconciled, and the developer has not installed yet.

5. **The hook reads all four lockfile formats.** `references/enforce-pins.md:6` and `skills/install/SKILL.md:57` already promise pnpm and yarn support, and narrowing the framework to npm on the strength of one hook check inverts that. The formats need scanning, not a YAML library (see: Context). Rejected: npm only, with the other managers falling back to the installed version — it makes the warning a developer gets depend on their package manager, for a saving of two readers.

6. **q never writes `package.json`.** No install, no uninstall, no pin move, and no narrowing a range. Decision 4 is what makes this possible: a ranged pin becomes harmless rather than permanently unreconcilable, so nothing forces q to correct the manifest. Rejected: narrowing a ranged pin to the installed version, as `skills/install/SKILL.md:123` does today — under Decision 4 it buys nothing, and it puts q in the business of rewriting a file npm owns.

   Running the project's dependency install without arguments stays in scope. It realizes what the manifest already declares, writes no manifest entry, and changes no version (source: references/enforce-pins.md).

   A consuming project's pins therefore stop having a required form. `conventions/extensions.md:55` and `:57` lose their exactness requirements. What line 55 keeps is `@lab43/q` sitting in `devDependencies`, which `hooks/session-start.mjs:84` reads to tell a q project from any other. Exactness survives in one place: the `@lab43/q` pin an extension author publishes, which declares the q version its rules were written against (`conventions/extensions.md:59`). Reconcile compares that declaration against the project's own q, and a ranged declaration would demand semver resolution where a string comparison does today.

7. **Nothing looks up the latest published version.** The `npm view <package> version` lookup at `skills/update/SKILL.md:22` and the take-it-or-stay offer that consumes it both go. Learning that a release exists is npm's job, through `npm outdated` or Dependabot. The `npm pack` diff survives, because reconciliation needs it — it runs from the watermark to the installed version instead of from the pin to latest.

8. **Reconcile hands off to `/q:install` only when there is no scaffold. It invokes install scoped-to-join when a release changed one that exists.** The two cases differ in what is in flight. With no scaffold there is nothing to reconcile, and install's migration proposals need their own conversation. With a scaffold there is already a branch, a review mode and a PR, so splitting one npm change across two PRs costs the developer a second review mode they already settled. `skills/update/SKILL.md:69` invokes install this way today. Rejected: reconcile owning scaffold repair itself, which duplicates install's Step 3 into a second skill and lets the two drift.

9. **The absorbed procedure goes inline in reconcile's body.** Extraction into `references/` earns its lookup when the sharers multiply (source: docs/conventions/skills.md, Body). After consolidation there is one sharer. Reconcile lands near install's current 160 lines.

10. **One PR per reconcile run.** A run finding an arrival, a version move and a departure at once reconciles all three into one change, because all three are the same project catching up with the same `npm install`. `skills/sync/SKILL.md:45`'s ordering rule goes with the separate runs it was ordering.

11. **Delivery is stacked, in four PRs.** The work splits at four seams a reviewer can hold separately: the version anchor, reconcile taking over version moves, reconcile taking over arrivals and departures, and the framing pass over what survives.

## Out of scope

- **Loading the skills, agents and hooks an extension ships** — deferred to issue #115. `skills/install/SKILL.md:133` records that q scaffolds only its own marketplace entry. This plan moves who owns indexing an extension, not what indexing reaches.
- **Rewriting the README** — deferred to issue #95. Each phase here corrects the README rows and prose its own change falsifies. Nothing more.
- **Declining an extension's rules while keeping its code** — deferred, per `docs/plans/extension-packaging.md:172`. It needs an opt-out the session-start hook can read, which is a mechanism to design rather than a step to add.

## Phases

Each PR below is one reviewable scope. Its phases land in order, and each phase ends green on its own.

### PR 1 — The version anchor

#### Phase 1: Read the lockfiles

Machinery landed dark. Nothing calls it yet.

1. `hooks/session-start.mjs`: add `lockedVersion(projDir, name, specifier)`, returning the version the project's lockfile resolves for a direct dependency, or `undefined` when no lockfile is readable. Dispatch on which file exists, in the order `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`. Read the formats per Context:
   - npm: `JSON.parse`, then `packages["node_modules/" + name].version`.
   - pnpm: scan `importers`, the `.` importer, and its `dependencies` and `devDependencies` maps for `name`, then its `version`. Strip a trailing `(…)` peer suffix.
   - yarn: `__metadata` distinguishes berry from classic. For berry, find the block whose key ends `@workspace:.`, read `name`'s specifier from its `dependencies`, strip the `npm:` prefix, then read `version` from the block keyed `"<name>@npm:<specifier>"`. For classic, match `specifier` against the comma-separated keys of each block and read its quoted `version`.

   *(deviation: `lockedVersion` lands in its own module, `hooks/locked-version.mjs`, which `session-start.mjs` imports in Phase 2. Every execution path of `session-start.mjs` ends in `process.exit`, so this phase's tests can neither import it nor reach an uncalled function by spawning it, and testing a copy of the logic is what docs/conventions/testing.md rejects. An export-only module is the import exception `tests/helpers.mjs` already records.)*
2. Return `undefined` rather than throwing on every malformed input — a missing file, unparseable JSON, an absent package, an unexpected shape. The caller in Phase 2 decides what silence means. Nothing here may exit on a stack trace (source: hooks/session-start.mjs, header comment).
3. `tests/helpers.mjs`: let a staged fixture carry a lockfile of each kind.
4. `tests/session-start.test.mjs`: cover each format against the real files this plan's Context was read from — a direct dependency found, a pnpm peer suffix stripped, a berry `npm:` specifier resolved, a yarn classic multi-specifier key matched, and each malformed input returning `undefined`. Break each reader in turn and confirm the suite goes red (source: docs/conventions/testing.md, Show the suite failing).

Green when `npm run check` passes and every reader has a failing-mutation demonstration.

#### Phase 2: Move the anchor

The cutover. Small, and on its own.

1. `hooks/session-start.mjs`: replace the pin comparisons.
   - Keep the `devDependencies` check for `@lab43/q` at line 84 as the "is this a q project" gate, and stop reading its value as a version.
   - Compare the loaded q (line 95) against the lockfile's `@lab43/q`.
   - In the watermark loop at lines 115-124, keep dependency-map membership as the removed-out-of-band check, compare the lockfile's version against the watermark, and compare the installed version against the lockfile's. Drop the installed-against-pin comparison.
   - A watermarked package the lockfile cannot resolve fails like any other unreadable input.
2. `hooks/session-start.mjs:1-16`: rewrite the header comment to describe the checks as they now stand.
3. `tests/session-start.test.mjs`: move the existing pin-drift cases onto the lockfile, and add a case for each new finding — an unreconciled lockfile move with `node_modules` untouched, and a stale `node_modules` against an agreeing lockfile and watermark. Confirm a ranged pin with an agreeing lockfile and watermark is silent, which is the state Decision 6 depends on.
4. `references/q-state.md:7`: a watermark records the version last reconciled against, and drift is the lockfile or the installed version disagreeing with it. Remove "pin ≠ watermark".
5. `references/enforce-pins.md:6`: run the package-manager install when `node_modules` is missing a declared dependency or holds a version other than the lockfile's.
6. `conventions/extensions.md:53-59`, Pinning: apply Decision 6's ruling on pin form. Line 55 keeps `@lab43/q` in `devDependencies` and the session-start reasoning behind it, and loses "exact". Line 57 loses the requirement that a consuming project pin each extension exactly, along with the "every version comparison q makes is between exact versions" rationale that carried it. Line 59 keeps exactness for the pin an extension author publishes, and states the reader that still needs it.
7. `skills/sync/SKILL.md:27` and `skills/update/SKILL.md:18-22`: read versions the way the hook now does. Update's four-version table loses `Pinned` and `Latest` together, since Decision 7 removes the second.
8. Remove every instruction that rests on the exact-pin rule this phase just deleted. Each cites a Pinning section that no longer makes the claim, and each would otherwise stand through PR3:
   - `skills/install/SKILL.md:123-127`, Step 5.3: delete it. Settling a pin is what Decision 6 rejects, and its "an extension carries no valid ranged pin" rationale is gone. Step 5's remaining items stay until Phase 6.
   - `skills/update/SKILL.md:49-52`, Step 3: the `--save-exact` commands and the `--save-dev` warning beneath them.
   - `skills/update/SKILL.md:24` and `:65`: each reads a pin as a version. Keep `:24`'s comparison of an extension's shipped q declaration, which Decision 6 leaves standing, and point it at the project's installed q.
9. `docs/guides/driving-manual.md:12`: the fixture's `file:` dependency no longer has to be hand-edited to a literal version. State what the hook now reports for a fixture, and what makes it silent.

Green when `npm run check` passes and a fixture with a ranged pin, an agreeing lockfile and an agreeing watermark starts a session in silence.

### PR 2 — Reconcile takes over version moves

#### Phase 3: Rename sync to reconcile

Mechanical. No behavior changes.

1. `git mv q-extension/skills/sync q-extension/skills/reconcile`, and set `name: reconcile` in its frontmatter.
2. `hooks/session-start.mjs:29`, `hooks/session-start.sh:27`, `tests/session-start.test.mjs:18`: the message names `/q:reconcile`. All three carry the same literal, and a comment at each site says so.
3. `hooks/session-start.mjs:2` and `:10`, `tests/session-start.test.mjs:2`: the header comments describing where the hook routes a session. Phase 2 rewrites the first of these and leaves the old name standing in it.
4. `references/agent-briefing.md:14`: the briefing template tells a session with no `q:` skills to run `/q:reconcile`.
5. `references/q-state.md:15` and `:29`: the note string written into every consumer's state file, and the writer rule.
6. `skills/update/SKILL.md:28`, `skills/install/SKILL.md:122`, `skills/uninstall-extension/SKILL.md:14`: each names the skill in its own text.
7. `README.md:60` and `:150`: the skills table row, and the prose naming the fix a session is given.
8. `docs/guides/driving-manual.md:12`: the fixture instructions.

Green when `npm run check` passes and no file outside `docs/plans/` names `/q:sync`.

#### Phase 4: Fold in the version-move direction

1. `skills/reconcile/SKILL.md`: give the skill a delivery shape. It settles a review mode and a branch after taking stock, never before — a run with nothing to reconcile asks nothing and stops, the way `skills/install/SKILL.md:23-27` skips its own delivery step. Add the adversarial review and the PR steps, under the correctness and conventions lenses. Step 4's closing sentence at `skills/sync/SKILL.md:45` orders hand-offs that no longer happen separately; it goes with them, per Decision 10.
2. `skills/reconcile/SKILL.md`: absorb `skills/update/SKILL.md`'s Step 4 as the version-move direction — the `npm pack` diff from watermark to installed version, the overrides, restatements and exception markers re-checked against each changed rule, the project rule the new text now owns pruned, the contradicted project rule asked about, the briefing's index lines and group heading redrawn, and the watermark written. Carry `skills/update/SKILL.md:14`'s handling of a package that stopped shipping a payload. Carry `:24`'s comparison of each third-party extension's shipped `@lab43/q` declaration against the project's own q, which Decision 6 leaves as the one pin still read as a version. Carry `:69`'s scoped `/q:install` call for a changed plugin, per Decision 8.
3. `skills/reconcile/SKILL.md`: rewrite only the version-move line of the routing table Phase 3 inherited from `skills/sync/SKILL.md:31-33`. It hands off to `/q:update` today; it now names the direction this skill reconciles itself. Leave the other two lines alone. The departure hand-off at `:32` stands until Phase 5 and the arrival hand-off at `:33` until Phase 6, because reconcile cannot serve either yet and Step 3 goes on detecting both. A finding with no remedy is the broken in-between state phases exist to avoid (source: @lab43/q conventions/plans.md, Phases).
4. `skills/reconcile/SKILL.md:3`: rewrite the frontmatter description to what the skill now does. Today it promises the opposite of this phase — "Never moves pins and never reconciles docs; the only tracked file it may touch is a lockfile a dependency install rewrites". The description is the only thing a session has before invoking (source: docs/conventions/skills.md, Description), so it cannot wait for Phase 7. Say that the run reconciles a version move and ships a PR, and that arrivals and departures still route elsewhere.
5. Delete `q-extension/skills/update/`.
6. `references/q-state.md`: rewrite the writer rules at `:26-29` for two skills, and line `:7`'s "`/q:update` performs it" for the skill that performs it now. This doc ships into every consuming project and is read there to understand what a watermark means, so it cannot name a deleted skill even briefly.
7. `skills/install/SKILL.md:160`: an extension declaring a newer q than the project runs points at `/q:reconcile`.
8. `docs/guides/releasing.md:58` and `:64`: consuming projects pick up a release by installing it and running `/q:reconcile`. Line 58's "Projects pin exact versions, so no range semantics apply" is false after Phase 2 — state instead that the lockfile decides the version a project runs.
9. `README.md`: drop the `/q:update` row at `:63-66` and set the Setup rowgroup's `rowspan` at `:55` to 3, and rewrite the `/q:sync` row's text to the description step 4 wrote.

Green when `npm run check` passes.

### PR 3 — Reconcile takes over arrivals and departures

#### Phase 5: Fold in the departure direction

1. `skills/reconcile/SKILL.md`: absorb `skills/uninstall-extension/SKILL.md`'s Steps 3 and 4 as the departure direction — the briefing group and its lines removed, the watermark dropped, and the orphaned doc references and exception markers put to the user in one AskUserQuestion batch. Keep the refusal at `:12` for `@lab43/q`.
2. Drop the refusal at `skills/uninstall-extension/SKILL.md:14` for an extension held as a regular dependency. It guards against two things, and neither survives. The `npm uninstall` it refused to run is gone under Decision 6. The records-only removal it also refused is now unreachable: reconcile detects a departure by the package being absent from both dependency maps, so it never drops records for a package still installed. Reaching that state takes a hand-edit of `.claude/q-state.json`, which `references/q-state.md:15` already tells the reader not to make.
3. Delete `q-extension/skills/uninstall-extension/`.
4. `skills/reconcile/SKILL.md:3`: the description now covers departures. Only the arrival hand-off is left to name.
5. `references/q-state.md`: fold the dropped entry into reconcile's writer rule.
6. `README.md`: drop the `/q:uninstall-extension` row at `:67-70`, set the Setup rowgroup's `rowspan` at `:55` to 2, and match the reconcile row to the description step 4 wrote. Both line ranges shift when Phase 4 drops its own row — locate each by its `<samp>` cell rather than by line.

Green when `npm run check` passes.

#### Phase 6: Fold in the arrival direction

1. `skills/reconcile/SKILL.md`: absorb what is left of install's extension path as the arrival direction — verify both halves of the package's identity, index its conventions docs as a group in the briefing, and write its watermark. A package failing the identity check is reported and left alone, never watermarked. Phase 2 already deleted the pin-settling step that sat between them, so nothing here settles a pin.
2. `skills/install/SKILL.md`: delete Step 5 and the extension path. Step 3.2 stops running `npm install` for `@lab43/q`. It checks instead that the dependency is declared, and where it is not, reports the command for the user to run and stops — the bootstrap `README.md:14` documents. The skill runs no package manager against a named package (Decision 6). Step 2's `dependencies` or `devDependencies` question goes, because npm has already placed the package. Step 1's extension survey item and Step 8's extension reporting go with them.
3. `skills/reconcile/SKILL.md`: drop the arrival hand-off left standing at `skills/sync/SKILL.md:33`, and update the description at `:3` to cover all three directions with no hand-off but Decision 8's.
4. `skills/install/SKILL.md:3`: the description covers bootstrapping and scaffold repair, and names no extension path.
5. `conventions/extensions.md:17`: "Installing an extension runs no code. The install passes `--ignore-scripts`" is q's guarantee only while q runs the install, which step 2 ends. Rest the guarantee on the half that survives — an extension declares no lifecycle scripts — and drop the `--ignore-scripts` clause. Phase 7's grep does not reach this sentence, so it is fixed here or not at all.
6. `README.md:56-57`: the install row matches.

Green when `npm run check` passes and the README table matches the frontmatter it restates.

### PR 4 — Lead with the case that happens

#### Phase 7: Reframe both skills

1. `skills/reconcile/SKILL.md` and `skills/install/SKILL.md`: order each body's steps, and the clauses of each frontmatter description, so the case a run actually meets comes first (source: docs/conventions/skills.md, Description). Phases 4 through 6 keep both descriptions true as each capability lands; this step is what makes them lead correctly. Reconcile's typical run reacts to an npm change the developer made. Install's typical run is a project's first.
2. `README.md:145`: q is not installed by `/q:install`; the developer installs it and the skill scaffolds around it. `README.md:150`: state the checks Phase 2 left. `README.md:158`: "pins move only when you approve an update" is false after Decision 7 — the project's dependency tooling moves versions and q reconciles.
3. Sweep what the phases left, excluding `docs/plans/`, which is frozen history (source: @lab43/q conventions/plans.md, Lifecycle). Grep for `q:update`, `q:uninstall-extension`, `q:sync`, `--save-exact`, `npm install`, and `pin`. Fix every hit that names a skill that is gone, an npm command q no longer runs, or a `package.json` pin q no longer reads as a version.

Green when `npm run check` passes.

## Verification

Phases prove themselves. What no single phase proves:

- Pack the repo and bootstrap a fixture from the tarball, per `docs/guides/driving-manual.md`. Run `/q:install` and confirm it scaffolds without installing anything, then confirm the hook falls silent.
- In that fixture, `npm install` a second package carrying the `q-extension` keyword and a `q-extension/conventions/` doc, at a default `^` range. Confirm the hook reports it, `/q:reconcile` indexes and watermarks it, `package.json` is unchanged, and the hook then falls silent — the end-to-end case Decisions 4 and 6 exist for.
- In that fixture, `npm install` the extension at a newer version and confirm one `/q:reconcile` run diffs, reconciles and rewatermarks it in a single PR.
- `npm uninstall` it and confirm one `/q:reconcile` run de-indexes it, drops its watermark, and puts its orphaned references to the user.
- Edit the lockfile to a version `node_modules` does not hold, and confirm the hook reports it before any install runs. This is the finding Decision 4 chose the lockfile for, and no phase's unit tests exercise it against a real project.
- Repeat the arrival case in a pnpm fixture and a yarn fixture, confirming the hook reports and falls silent the same way. Phase 1 tests the readers against staged files; this tests them against lockfiles the managers wrote.

  *(result: yarn classic passed both sides against its manager-written lockfile. pnpm reported the arrival, but records `file:` specifiers as the version for local-tarball installs, so a tarball fixture can never fall silent; the silent side was confirmed after editing the two version fields to the semver a registry install writes — the shape this plan's Context table verified.)*
- Confirm this repo stays silent at session start throughout, since it declares no `@lab43/q` dependency.
