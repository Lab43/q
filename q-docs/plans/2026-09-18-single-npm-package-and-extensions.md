---
status: completed
delivery: stacked
tracks: https://github.com/Lab43/q/issues/53
---

# Single npm Package and Extensions

## Goal

Ship q as one npm package, `@lab43/q`, carrying its conventions and its plugin together. The package version becomes the only version q has.

Three things follow. Anything built on q can read `references/run-contract.md`, because the package root is a stable project-relative path. A package can declare which q version it was written against, because "q" is one version number. Installing q stops requiring q, because npm delivers the bytes before Claude Code is involved.

Doc packs become extensions in the same change. The category absorbs q rather than excluding it, which removes the special-casing of "the framework pack" across the conventions. *(deviation: the category excludes q, which is the framework rather than an extension. The special-casing it removes is the layout clause, not the category membership — see Decision 6.)*

## Context

### The two artifacts today

- The plugin carries `version` in `.claude-plugin/plugin.json` and is distributed by git tag. The pack carries `version` in `packages/q-conventions/package.json` and is distributed by npm.
- `docs/guides/releasing.md` makes the split a standing rule: release the artifact whose content changed, and publish the pack before tagging the plugin when one change moves both.
- Every skill reads the run contract through `${CLAUDE_PLUGIN_ROOT}`. All 15 `skills/*/SKILL.md` files reference it, as do `hooks/hooks.json:8`, `hooks/session-start.sh:11`, and `hooks/session-start.mjs:21`. That variable resolves to the calling plugin's own root, so a skill in another plugin can never reach q's references.
- Pack identity is the `q-docs` keyword plus a fixed `conventions/` directory (`packages/q-conventions/conventions/doc-packs.md`, Identity and Layout). The same rule requires "documentation and nothing executable — no scripts, no code".
- `hooks/session-start.mjs:72` reads the plugin pin from a `q--v` ref regex against `.claude/q-marketplace/.claude-plugin/marketplace.json`. Line 126 identifies packs by the `q-docs` keyword.
- Three places treat `.claude/q-marketplace/` as the signal that a project uses q. `hooks/session-start.sh:9` exits before starting node when that marketplace file is absent. `skills/sync/SKILL.md:12` proposes `/q:install` and stops when the directory is absent. `references/enforce-pins.md:5` reads the marketplace name from the file. Moving the manifest leaves all three matching nothing, which fails silently rather than loudly.
- `references/q-state.md` defines `qReconciledAgainst` as a field separate from the `docsReconciledAgainst` map.
- `references/enforce-pins.md:6` records that the machine-global marketplace registry holds one entry per name, so two checkouts of one repo resolve to whichever registered last. Worktrees are checkouts for this purpose: they carry the tracked marketplace file, and `references/run-contract.md:47` has each one install its own dependencies. Distinct projects never collide, because their names differ.
- q has no installs outside this repo (the user's ruling, 2026-09-13). No migration or deprecation path is needed for the rename.
- Twelve files outside `docs/plans/` carry a `q conventions/doc-packs.md` marker. Renaming that doc without them dangles every one.
- `.claude-plugin/marketplace.json` names this repo's development marketplace `q-dev`, sourcing the plugin at `"./"`. `.claude/settings.json` declares that name and enables `q@q-dev`.
- `CLAUDE.md:14` names the three `claude plugin validate --strict` invocations that gate a structural change.
- Pack language runs well past the compound term. Seven skills, `references/agent-briefing.md`, `references/q-state.md` and `references/run-contract.md:47` all use a bare "pack" that a search for "doc pack" never reaches.
- `docs/workflow-chart/chart.html` draws the conventions as three stacked rows: project docs, doc packs, q docs. `docs/workflow-chart/screenshot.py` renders it to `light.png` and `dark.png`, which `README.md:111` embeds and describes in its `alt` text. The script needs Python Playwright with Chromium.
- `README.md:14` tells a reader to add q by registering a public marketplace and installing the plugin, before any npm step.

### Verified Claude Code behavior

Established with throwaway fixtures, because none of it is readable from this repo. The Claude Code facts were checked against CLI 2.1.236, the npm ones against `npm pack`.

- A plugin `source` may not contain `..`. `claude plugin validate --strict` rejects both the string form and the object form with an explicit path-traversal error. An absolute path in the object form is rejected too.
- A marketplace manifest at a project's root, whose plugin `source` is `"./node_modules/@lab43/q"`, passes `validate --strict`. `claude plugin marketplace add --scope local ./` then registers it, and the package's skills load under full plugin namespacing.
- The marketplace name comes from the manifest. `marketplace add` records that name and ignores a differently-named key already in settings. Installing under a name that does not match the manifest fails.
- A session resolves a directory-sourced plugin live from its source directory, not from `~/.claude/plugins/cache/`. `CLAUDE_PLUGIN_ROOT` is that source directory.
- A version bump inside `node_modules` reaches a new session with no `claude plugin` command run at all. The CLI's recorded install version goes stale, and nothing load-bearing reads it.
- `/reload-plugins` picks up a change to the source directory mid-session.
- An interactive session registers a marketplace declared only in tracked `.claude/settings.json`, then loads it. It writes the registry entry but no installed-plugin record and no cache copy. A headless `claude -p` session does neither.
- `claude plugin marketplace add ./` fails when the named directory holds no `.claude-plugin/marketplace.json`, so nothing can register q before a scaffold exists.
- A plugin `source` pointing at a symlink warns under `validate --strict`, because validation never follows one. The CLI dereferences only symlinks that stay inside the marketplace, so one reaching outside it is not a supported route.
- Two marketplaces offering a plugin of the same name, both enabled in `enabledPlugins`, resolve by key order. The first key wins, and neither scope nor specificity overrides that. A project that leaves the bootstrap's `q@q` enabled therefore loads whichever q the key order happens to select.
- One marketplace manifest may carry several plugins. A manifest holding q's entry beside a project's own plugin passes `validate --strict`, installs either by name, and loads both under their own namespaces.
- npm ships `.claude-plugin/` when `files` names it, and preserves the executable bit on `hooks/session-start.sh`.

### Constraints

- q's skills require a user. They ask `AskUserQuestion` batches, wait on go-aheads, and gate commits on review modes. Headless is not a mode q serves, so headless plugin loading is not a case to design for.
- `hooks/hooks.json` invokes `session-start.sh` directly rather than through `bash`, so the file must stay executable in the tarball.
- Doc path references survive this change untouched. `q conventions/writing.md` expands against a different package root, and the alias itself does not move.

## Decisions

1. **The repo root becomes the package.** Add `package.json` at the root, move `packages/q-conventions/conventions/` up to `conventions/`, and delete `packages/`. A `files` whitelist scopes the tarball, which keeps `docs/`, `.claude/` and editor directories out. Skills, agents, hooks, references and `.claude-plugin/` never move.

   Merging the package costs q neither of its own surfaces. `docs/conventions/` stays its project tier, and a skill used only to develop q has a home in `.claude/skills/`, which Claude Code loads as project skills. The whitelist excludes both. Verified by `npm pack --dry-run` against a fixture of the proposed root, and by loading a skill from `.claude/skills/` in a session.

   Rejected: a package under `packages/q/`. It makes the publish boundary structural rather than declarative, which is a real advantage, but it relocates every skill, hook, agent and reference to buy it.

2. **The package ships its own marketplace manifest, named `q`.** `.claude-plugin/marketplace.json` declares one plugin sourced at `"./"`. This is what makes the first install possible. Straight after `npm install`, the package's own manifest is the only one on disk — the project's own is what `/q:install` has yet to write — and `marketplace add` against a directory holding no manifest fails.

   This manifest replaces the current `q-dev` marketplace. q's own `.claude/settings.json` moves from `q@q-dev` to `q@q`, because a settings key that does not match the manifest name never resolves.

   The name `q` is the same in every copy of the package, and this repo's own checkout claims it too. The machine-global registry holds one entry per name, so whichever session registered last owns `q` for every project on that machine. A project still resolving through `q@q` can therefore load some other checkout's q.

   What closes that is `/q:install` disabling `q@q` once it scaffolds the project's own uniquely-named marketplace, not the scaffolding alone. Until a project is bootstrapped it stays exposed, which is the window this design accepts.

   Rejected: a `bin` that scaffolds the project on `npx @lab43/q`. It puts executable code in the package for a job the manifest already does.

3. **The consumer's marketplace manifest sits at the project root.** `/q:install` scaffolds `.claude-plugin/marketplace.json` with the project's unique name and `"source": "./node_modules/@lab43/q"`. The unique name survives from issue #50, because the registry still holds one entry per name machine-wide.

   `.claude-plugin/marketplace.json` is the conventional path for a project publishing its own marketplace, so the file is shared territory rather than q's. A project may list its own plugins there beside q's entry, and both load (see: Verified Claude Code behavior). q owns the `q` entry and leaves the rest of the file alone, the way it already owns one `package.json` script and no other.

   A project that already records a marketplace name keeps it, so q's generated name applies only when q creates the file. That gives up guaranteed uniqueness in the case #50 guards against, because the project's chosen name may not be unique on the machine. Renaming a marketplace the project owns is the worse trade.

   Rejected: keeping the manifest under `.claude/q-marketplace/`. No source path reaches `node_modules` from there, since `..` is rejected, and a symlink out of the marketplace is not a route the CLI supports (see: Verified Claude Code behavior).

4. **`npm install` is the whole update mechanism.** Sessions read the plugin live from `node_modules/@lab43/q`, so moving the pin and installing is all that reaches a session. `references/enforce-pins.md` drops its `marketplace update`, `plugin install`, `plugin update`, and uninstall-and-reinstall steps.

   The consumer's dependency install needs nothing q-specific. `/q:install` stops scaffolding a `q:install` script, and the README setup line names the project's ordinary install.

   `enforce-pins.md` keeps `marketplace add --scope local ./` as repair, for a declined trust prompt or a registry entry another checkout repointed. It keeps `/reload-plugins` after any change. *(result: the add matches the registry by directory path, not by name. Verified live in Phase 2 — with an entry already pointing at the directory under a different name, it reported the old name as "already on disk" and never re-read the manifest, so `claude plugin marketplace remove <name>` then re-adding was required. The repointed-entry case this repair rests on is the mirror of that: name matching, path differing. Established in Phase 6's fixture bootstrap — registering the fixture's copy under the name `q`, which another directory already held, repointed the entry to the fixture. The repair works.)*

5. **`plugin.json` keeps a version, and a check holds it equal to `package.json`'s.** One version is not available: `claude plugin validate --strict` warns when `plugin.json` names none, and this repo gates structural changes on that command, which treats warnings as errors. The duplication is the CLI's price, not a design choice.

   Nothing breaks when the two drift, because no load-bearing reader consults `plugin.json`'s version — sessions read the plugin live, and the hook reads npm's record (see: Phase 5). What drifts is what `claude plugin list` reports and how the plugin cache is keyed, so a stale copy misleads anyone diagnosing an install. Add `scripts/check-versions.mjs`, and run it wherever `validate --strict` already runs.

   Rejected: generating `plugin.json`'s version at release. It adds a build step to a repo that has none, and stops `plugin.json` being readable as committed.

6. **Extensions replace doc packs.** A q extension is an npm package carrying a `conventions/` directory, a plugin, or both. The keyword becomes `q-extension`, and it means that q's machinery discovers, indexes, and reconciles the package.

   - The layout contract loosens from fixed to conditional: `conventions/` when present, `.claude-plugin/` when the package carries a plugin, at least one of the two.
   - An extension with no conventions is watermarked but not indexed, so watermarking decouples from briefing indexing.
   - The executability rule is restated on its real terms. Installing an extension runs no code, which `--ignore-scripts` and the absence of lifecycle scripts enforce. The old wording is false once `hooks/session-start.sh` ships in the package.
   - The two tiers become extension conventions and project conventions. Precedence is unchanged. *(deviation: the tiers are three — framework, extension, project — with precedence project > extensions > q. q is not an extension: extensions extend, and q is what they extend. The category bought no uniformity in practice — the hook still needed a dedicated `@lab43/q` branch, `/q:uninstall-extension` still refused q by name, and Pinning still exempted q from carrying a q pin. The conditional layout below, not the noun, is what removes the per-rule clause for the package that also ships skills, hooks and agents, and it stands. `@lab43/q` drops the `q-extension` keyword, and q's payload-grooming warrant moves to `docs/conventions/documentation.md`, Working on the payload.)*

   Rejected: keeping pack terminology and special-casing q inside it. That is the cheaper edit, and it preserves the thing worth removing — every rule about packs then needs a clause for the one pack that also ships skills, hooks and agents. The category either covers q or it does not. *(deviation: the category covers neither q nor the rules q shares with extensions. The conditional layout removed the need for it to.)*

7. **q is an ordinary entry in the watermark map.** `.claude/q-state.json` holds one `reconciledAgainst` map with `@lab43/q` alongside any other extension. `qReconciledAgainst` disappears. Watermarks stay necessary, because pin against watermark is what catches an out-of-band bump.

8. **Stacked delivery.** The change spans the package restructure, a rewritten conventions doc, the install machinery, and a sweep across every skill. Each phase is a reviewable scope on its own, and the machinery phases depend on the terminology landing first.

## Out of scope

- **Installing a third-party extension's plugin** — deferred. The format describes what an extension may ship without q installing anyone else's. `extensions.md` states the format plainly, with no note about what is unimplemented.
- **Precedence between extensions** — deferred, and untracked. Nothing here creates the conflict: a project installing one extension beside q has the same two-tier precedence it has today, and the rule for ordering three or more needs a case to reason from. *(deviation: precedence is project > extensions > q, per Decision 6. Ordering among extensions stays deferred and untracked.)*
- **Extension descriptions** — deferred. Issue #52 is written in pack terms and needs a wording pass once this lands. So does issue #26, on keeping a shipped declaration equal to the live framework pin.
- **Publishing `@lab43/q` for the first time** — declined for these PRs, because releasing is the maintainer's act and a PR never touches a `version`. The phases make the repo publishable and rewrite the release guide; the publish that follows is what lets a consumer install q the new way. The name is free on the public registry, checked against `registry.npmjs.org`. Verification bootstraps from a packed tarball so it runs before that publish exists.
- **Deprecating `@lab43/q-conventions` on npm** — deferred to issue #56, for the same reason.
- **Retiring the `Lab43/claude-plugins` marketplace** — deferred to issue #55, for the same reason. No file references it once this lands, and it serves q from `Lab43/q`'s default branch with no `ref`, so it is an unpinnable second channel.
- **A rule that keeps the workflow chart current** — deferred to issue #54. Phase 8 redraws the chart, which fixes this instance and not the gap that allowed it. The rule belongs to q's own tier rather than the payload's documentation policy.

## Phases

### PR 1 — One package

#### Phase 1: Merge the two artifacts into one package

1. Write `package.json` at the repo root: name `@lab43/q`, version matching `.claude-plugin/plugin.json`, keyword `q-extension` *(deviation: no keyword — q is not an extension, per Decision 6)*, `files` listing `conventions`, `skills`, `agents`, `hooks`, `references` and `.claude-plugin`, plus the `publishConfig`, `repository`, `license` and `author` fields from `packages/q-conventions/package.json`. Drop `repository.directory`. Take `description` from `.claude-plugin/plugin.json`, so the registry blurb and the plugin's own description agree.
2. Move `packages/q-conventions/conventions/` to `conventions/`.
3. Fold `packages/q-conventions/README.md` into the root `README.md`, which becomes the package's registry page. Delete `packages/`. *(deviation: nothing in the pack README survives the fold. It exists to say the pack is not installed by hand and that the rest of q lives in the q repo, both of which the root README already covers. The item reduces to the delete.)*
4. Write the version-agreement check from Decision 5 as `scripts/check-versions.mjs`, which exits non-zero when `package.json` and `.claude-plugin/plugin.json` disagree. Leave `scripts` out of the `files` whitelist, since it is a development tool rather than payload. Add a `package.json` script that runs it.
5. Add that script to the gate at `CLAUDE.md:14`, beside the three `claude plugin validate --strict` invocations. A check nothing runs is not a rung.
6. Update every literal `@lab43/q-conventions` reference outside `docs/plans/`. Find them with `grep -rn '@lab43/q-conventions' --include='*.md' --include='*.json' --include='*.mjs' .`, excluding `node_modules/`. Change the package name only, leaving pack terminology for Phase 3.
7. Update every `packages/q-conventions/` path to the repo root. Find them the same way. They reach `CLAUDE.md`, `README.md`, `docs/guides/releasing.md` and `docs/conventions/documentation.md`, so work from the grep rather than a fixed list.

Green when the three `validate --strict` invocations and `scripts/check-versions.mjs` pass, a session in this checkout still loads the `q:` skills through the unchanged `q-dev` marketplace, `npm pack --dry-run` shows the six whitelisted paths and neither `docs/`, `.claude/` nor `scripts/`, an unpacked tarball keeps `hooks/session-start.sh` executable, and `check-versions.mjs` fails when the two manifests are set to disagree.

#### Phase 2: The marketplace cutover

1. Replace `.claude-plugin/marketplace.json` with the shipped manifest from Decision 2: name `q`, one plugin named `q` sourced at `"./"`.
2. Point `.claude/settings.json` at the new name — `extraKnownMarketplaces` keyed `q`, and `enabledPlugins` holding `q@q`.

Green when a session in this checkout loads the `q:` skills through the `q` marketplace. This is the one step that changes how q loads for anyone developing it, so it stays its own phase and its own commit — reviewable and revertable without the restructure it rides with.

### PR 2 — The extension format

#### Phase 3: extensions.md

1. Rename `conventions/doc-packs.md` to `conventions/extensions.md`. Rewrite its intro, Identity, Layout, Pinning, Authoring, Graduation and Publishing sections per Decision 6. Keep the rejected alternative about a `q` metadata key, whose grounds still hold — but restate it, because it credits "the fixed layout" for covering the same ground and Decision 6 makes that layout conditional.
2. Rewrite the Identity rule's executability sentence on the terms Decision 6 names.
3. Change the keyword to `q-extension` in the doc's prose.
4. Repoint every `q conventions/doc-packs.md` marker at the renamed doc, so the rename lands with its referrers. Find them with `grep -rn 'conventions/doc-packs\.md' --include='*.md' .`, excluding `node_modules/` and `docs/plans/`. Change the path only. The surrounding prose still says pack until Phases 7 and 8, and rewriting it here would pull those phases forward.

Green when `extensions.md` states the format on Decision 6's terms, `grep -rn 'doc-packs\.md'` finds nothing outside `docs/plans/`, and `claude plugin validate --strict skills` still passes.

#### Phase 4: documentation.md

1. Rewrite `conventions/documentation.md`'s "Two tiers of conventions" as extension conventions and project conventions. State that q is the extension always installed, and drop the framework-pack special case. *(deviation: states q as the framework tier the other two sit above, per Decision 6.)*
2. Rename "Pack doc paths" to "Extension doc paths". Keep the rule, which is already package name plus path from the package root. Update its examples. *(deviation: the rename carries its referrers with it. `conventions/extensions.md`, `CLAUDE.md`, `references/agent-briefing.md`, `docs/conventions/documentation.md` and `skills/install/SKILL.md` each carry a marker naming the old heading. Phase 3's review established that a marker names the heading existing when it lands, so these move with the heading rather than ahead of it.)* *(deviation: the heading ends as "Package doc paths". Once q is the framework rather than an extension, the section governs q's docs and an extension's alike, and "Extension" named only half of what it covers. Its referrers moved again with it.)*
3. Update the `(overrides: X)` example on line 83 and the Taxonomy sentence that names an authored pack's `conventions/`.
4. Update `README.md:155`, which restates the markers table for humans.
5. Rewrite the two briefing index lines in `CLAUDE.md`. Line 29's blurb still reads "the doc pack format" after Phase 3 repointed its path, and line 28's must restate `documentation.md`'s changed intro. An index line restates its doc's intro, so both follow the rewrites above rather than waiting for Phase 8's sweep. *(deviation: "both follow the rewrites above" held for line 29 alone. `documentation.md`'s intro never mentioned packs and this phase did not change it, so line 28 already restates its doc's intro.)*

Green when `conventions/`, `CLAUDE.md`'s index lines and `README.md`'s markers table name extensions throughout, and no marker points at a file that does not exist. The skills and references still say pack until Phases 7 and 8.

### PR 3 — Install and machinery

#### Phase 5: The state file and the hook

1. Rewrite `references/q-state.md` for Decision 7: one `reconciledAgainst` map, `@lab43/q` an ordinary entry, `qReconciledAgainst` gone. Update the writer rules for the renamed skills.
2. Rewrite `hooks/session-start.mjs`. Read the pin from `package.json`'s `@lab43/q` devDependency instead of the `q--v` regex at line 72. Read the installed version from `${CLAUDE_PLUGIN_ROOT}/package.json` — npm's own record, written by the install that produced this copy, rather than `plugin.json`'s hand-maintained one. That path is also wherever the plugin actually loaded from, so comparing it against the project's pin reports a session running some other checkout's q whenever the two versions differ. Identify extensions by the `q-extension` keyword at line 126. Treat q as an ordinary map entry. Keep the silent exit for a project that declares no `@lab43/q` devDependency, which is what keeps this repo quiet.
3. Carry the comment block at the top of the file, which describes checks that are changing.
4. Change the gate in `hooks/session-start.sh:8-9`. It currently exits when `.claude/q-marketplace/.claude-plugin/marketplace.json` is absent, a path Decision 3 removes. Gate on `package.json` declaring `@lab43/q` under `devDependencies` instead, matching what the rewritten `.mjs` reads. Match the quoted key exactly, so a package whose name merely starts with `@lab43/q` does not satisfy the gate.
5. Rewrite that file's comment at lines 2 to 5. It claims the wrapper exists so non-q projects skip node startup, which this change largely retires: the plugin now loads from `node_modules/@lab43/q`, so it barely runs anywhere the gate would fire. State the reason that survives — a missing node on `PATH` gets the same routing message as any other failure, rather than a cryptic exec error. The gate stays because q's own checkout declares no `@lab43/q` devDependency and must keep quiet.

Green when the hook stays silent for a project declaring no `@lab43/q` devDependency and for one whose versions all agree, and emits the `/q:sync` message for each of: pin ahead of watermark, an extension installed at a version other than its pin, and a `q-extension` devDependency with no watermark entry. Prove it fires rather than only that it stays quiet — the gate this phase replaces keyed on a path that is about to disappear, and a wrapper exiting early fails silently.

#### Phase 6: Enforcement and install

1. Rewrite `references/enforce-pins.md` per Decision 4. Keep the node and npm checks, the dependency install, the `marketplace add` repair, and `/reload-plugins`. Drop the four plugin steps. Read the marketplace name from `.claude-plugin/marketplace.json` at the project root. *(deviation: no step left in the file addresses the marketplace by name. The repair is `claude plugin marketplace add --scope local ./`, which takes the name from the manifest it registers. The name-reading paragraph at `references/enforce-pins.md:5` is deleted rather than repointed.)*
2. Rewrite `skills/install/SKILL.md` end to end, rather than by numbered item — the pack-run fork runs through its every step, and Decision 6 renames the category it forks on. Within that rewrite:
   - Step 3 item 2 installs `@lab43/q` as the one exact devDependency, replacing the framework-pack item.
   - Step 3 item 4 scaffolds `.claude-plugin/marketplace.json` at the project root per Decision 3. Merge the `q` entry into an existing manifest rather than replacing the file: leave every other `plugins` entry and the recorded name untouched, and generate the unique name only when creating the file. Key `.claude/settings.json` to whatever name the manifest records. Its `enabledPlugins` sets `q@q` to `false` beside the project's own key set to `true`, replacing the `q@lab43` entry at `skills/install/SKILL.md:93`. This is what retires the bootstrap marketplace, whose shared name otherwise keeps resolving to whichever checkout registered it last. Drop the `q:install` script.
   - Step 3 item 6 writes the single watermark map.
   - Step 3 item 7's ignore rules cover `.claude-plugin/` as a committed path.
   - Step 3 item 8's README setup line names the project's ordinary dependency install.
   - Step 5's verification checks the `q-extension` keyword and the conditional layout.
3. Rewrite both README setup sections, which mirror what this phase changes.
   - "Adding q to a project" at line 14 registers a public marketplace and installs the plugin before any npm step. Decision 2 replaces it with the three-command bootstrap: the dependency install, `claude plugin marketplace add --scope local ./node_modules/@lab43/q`, then `claude plugin install q@q --scope project`. Keep `/q:install` as the step that follows.
   - "Joining a project that uses q" at lines 19 to 30 tells a collaborator to run `npm run q:install` and then `npm install`. Decision 4 removes that script, leaving the project's ordinary dependency install. The block carries a `(source: skills/install/SKILL.md)` marker, so it must agree with the Step 3 item 8 rewritten above it.
4. Update `skills/sync/SKILL.md` in three places. Step 1 at line 12 decides a project uses q by the presence of `.claude/q-marketplace/`, which Decision 3 removes — switch it to the `@lab43/q` devDependency. The pin comparisons at lines 22 and 23 take the new pin source and keyword. Line 29's routing names `qReconciledAgainst`, which Decision 7 removes.

Green when `/q:install` scaffolds a fresh fixture project that a session then loads q from, and `/q:sync` against that fixture with every pin correct enforces and reports rather than proposing `/q:install` as though the project were unpinned.

### PR 4 — Terminology and remaining skills

#### Phase 7: The extension skills

1. Rename `skills/uninstall-pack/` to `skills/uninstall-extension/`. Update its description, body, and the rule that it never removes `@lab43/q`. Repoint its referrers in the same phase: `README.md:49` and `README.md:56`, `references/q-state.md:30`, and `skills/sync/SKILL.md` at lines 3, 28 and 41.
2. Restructure `skills/update/SKILL.md` around q being an ordinary extension. *(deviation: restructured around q being the framework, per Decision 6. The skill defines *package* as the noun covering q and an extension, and uses it wherever a step must reach both.)* Four places branch plugin against pack, and Decision 7 collapses the distinction:
   - Line 12's sweep uses the new keyword.
   - Line 18's take-stock table loses the `q--v` row and reads the pin from `package.json`. Its `qReconciledAgainst` column folds into the one map.
   - Step 3's two branches at lines 44 and 45 become one dependency install, since moving any pin is now the same act.
   - Step 4's reconciliation at lines 51 to 62 keeps two branches, because an extension's `conventions/` and its plugin scaffold reconcile differently. Rewrite them as conditions on what the extension carries rather than on whether it is q. Line 62's watermark write targets the single map.
   - Line 29 diffs the plugin with `gh api repos/Lab43/q/compare/<pinned-tag>...<latest-tag>`, which has no tags to compare once git-tag distribution goes. Diff two published versions of the package instead, the way the same line already diffs a pack. Widen what it extracts beyond `conventions/`: an extension's release can change its skills, hooks, agents and references too, and both Step 4's reconciliation and the closing report at line 76 summarize from that diff. Phase 8's retirement grep cannot catch this line, because it names no retired term.
3. Sweep the bare word "pack" out of every skill and reference, not only the compound term. It reaches `skills/install/SKILL.md`, `skills/update/SKILL.md`, `skills/update-docs/SKILL.md`, `skills/groom-docs/SKILL.md`, `skills/upstream/SKILL.md`, `references/agent-briefing.md` and `references/run-contract.md:47`. Find it with `grep -rn '\bpacks\?\b' --include='*.md' skills/ references/`.
4. Update `references/agent-briefing.md` lines 14, 18, 20, 22, 26, 46, 49 and 50. Line 14 tells a session to run the `q:install` script, which Decision 4 removes — name the project's ordinary dependency install instead. The rest carry the two tiers, the alias expansion, the index group heading, and the keyword.

Green when no skill or reference names a pack, `claude plugin validate --strict skills` passes against the renamed directory, and the briefing template describes the install a consumer now runs.

#### Phase 8: The repo's own docs

1. Rewrite `docs/guides/releasing.md` for one artifact and one version. Keep the version-choosing rules, which are unchanged. Drop the two-artifact ordering rule and the `claude plugin tag --push` step. *(deviation: Phase 1 did the one-version rewrite, including the two-artifact ordering rule. The version check Phase 1 adds forbids the independent versioning that guide stated, so deferring the rewrite would have ended Phase 1 with a guide contradicting the repo's own check. Dropping the `claude plugin tag --push` step is what remains here — the tag stays a live pin target until Phase 6 moves pins into `node_modules`.)* *(deviation: the guide also loses the sentence naming npm as the only channel. The Steps carry one publish command and no other, so the sentence restated an absence the reader can already see.)*
2. Rewrite both halves of `docs/conventions/documentation.md`. The tier test names the payload as the package rather than the pack plus what the plugin routes to. Working on the payload, at lines 16 to 20, still calls the payload a doc pack this repo authors and cites the renamed heading — rewrite it around q being an extension, which is also what the Goal's claim to drop the framework-pack special case rests on. *(deviation: rewritten around q being the framework rather than an extension, per Decision 6. Working on the payload states the authoring rules' warrant as this repo's own ruling instead of deriving it from membership, and that ruling is what puts `conventions/` on the grooming surface.)*
3. Update `docs/conventions/skills.md`, whose Body section names the framework docs path and `${CLAUDE_PLUGIN_ROOT}`.
4. Update `README.md` and `CLAUDE.md` for the renamed skill and the extension category.
5. Redraw the conventions stack in `docs/workflow-chart/chart.html`. It shows three rows — project docs, doc packs, q docs — and this plan leaves two, with q an extension among extensions. *(deviation: it keeps three, relabelled — project docs, extensions, q — per Decision 6. The 462 viewBox, the three rects and the third upstream arc are unchanged from before this plan; the bottom row is relabelled q, the middle row keeps its blurb and loses `@lab43/q` from its paths, and the `aria-label` and precedence note follow.)* The change is to the diagram's meaning, not only its labels, so it also covers the `aria-label` at line 89 and the precedence note at line 222. Then regenerate `light.png` and `dark.png` with `docs/workflow-chart/screenshot.py`, and rewrite the `alt` text at `README.md:114` to match. Install Python Playwright with Chromium if this machine lacks it, rather than shipping the change without the images.
6. Grep for each term this plan retires, outside `docs/plans/`: `doc pack`, `doc-pack`, `\bpacks\?\b`, `q-docs`, `q-conventions`, `uninstall-pack`, `q--v`, `q-marketplace`, `qReconciledAgainst`, `docsReconciledAgainst`, `q:install"`, `npm run q:install` and `packages/`. Cover `docs/workflow-chart/chart.html` as well as the markdown. No hits remain. Search `q:install` as the script name rather than the skill, which keeps its own `/q:` form. *(deviation: "No hits remain" holds for every term but `\bpacks\?\b`, which keeps one class. `npm pack` is the npm command that builds a tarball, and `/q:update` runs it to diff two published versions. The retired term is the noun for an installed package of docs, not the command.)*

Green when every skill, reference and doc names extensions, the chart and its images match, and the three `validate --strict` invocations and the version check pass.

## Verification

The phases carry their own checks. These prove the integrated result.

- Bootstrap a fixture project with no q: `npm install` the packed tarball, `claude plugin marketplace add --scope local ./node_modules/@lab43/q`, `claude plugin install q@q --scope project`. A session loads the `q:` skills. *(deviation: the tarball install takes one more step. It records the pin as `file:lab43-q-<version>.tgz` rather than the version, which is not an exact pin, so the hook reports drift on every session until the devDependency is set to the literal version by hand. Run no dependency install after that edit — the pin names a version the registry does not have yet. The steps are in `docs/guides/driving-manual.md`.)*
- Run `/q:install` in that fixture. It scaffolds the project-root marketplace, the settings, the state file and the mirror docs. Its `.claude/settings.json` disables `q@q`. A fresh session loads q through the project's own marketplace name.
- Prove the bootstrap marketplace is retired rather than merely unused. Re-register the global `q` name against a different directory holding its own q, then confirm the scaffolded fixture still loads its own pinned copy. Reorder `enabledPlugins` so `q@q` sits first and confirm the result does not change.
- Simulate a pin move in the fixture: bump the installed package's version in both manifests, run the dependency install, and confirm a new session loads the new content with no `claude plugin` command run.
- Break one watermark in the scaffolded fixture and confirm the hook's `/q:sync` message reaches a session, then confirm `/q:sync` repairs it.
