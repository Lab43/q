---
status: pending
---

# Move q's docs root to `q-docs/`

## Goal

Move the root that holds a project's q docs from `docs/` to `q-docs/`, in the payload every consuming project follows and in this repo's own tree. `docs/` is the folder other publishing tools already claim. A project using one of them gets its plans and conventions published into its site, or wiped by a build that empties the folder.

## Context

The collision this plan removes, each fact verified during planning:

- GitHub Pages publishes from a branch's root, from its `/docs` folder, or through a GitHub Actions workflow (source: docs.github.com, "Configuring a publishing source for your GitHub Pages site").
- Pages runs Jekyll with `jekyll-optional-front-matter` among its default plugins, so a `.md` file without front matter still becomes a page (source: `github/pages-gem`, `lib/github-pages/plugins.rb`, `DEFAULT_PLUGINS`).
- A Pages site can be made private only under GitHub Enterprise Cloud (source: docs.github.com, "Changing the visibility of your GitHub Pages site"). A private repo on any other plan that publishes from `/docs` serves its plans and conventions publicly.
- MkDocs reads `docs/` by default (source: mkdocs.org configuration docs, `docs_dir`).

What the move touches:

- No executable code, test, CI step, or check script reads a `docs/` path. The four hits in scripts and tests are comments: `scripts/check-frontmatter.mjs:3`, `scripts/set-version.mjs:10`, `tests/set-version.test.mjs:43`, and `docs/workflow-chart/screenshot.py:9`.
- `claude plugin validate --strict` never parses a plan's frontmatter, wherever the plan sits. Checked by validating two scratch repos that differed only in the plan's folder, `docs/plans/` or another root. Both reported only on the marketplace manifest. The `check-frontmatter.mjs:3` comment's claim that validate "skips docs/plans/" names a folder that played no part.
- Path references written in package form (`@lab43/q conventions/…`) resolve under the package's `q-extension/`. They are unaffected and stay as written.

## Decisions

1. **One fixed root, `q-docs/`.** The four taxonomy directories keep their names beneath it: `q-docs/conventions/`, `q-docs/specs/`, `q-docs/plans/`, and `q-docs/guides/`. The name stays visible at the top of a project's tree, where a reader looks for docs, and no publishing tool claims it. `q-docs` was also the keyword of q's retired doc-pack format, but that use survives only in merged plan bodies.

   Rejected:
   - A root each project configures. Every path the payload names would need a variable, and so would every `(source: docs/…)` marker in every consuming project.
   - A hidden `.q/`. It hides guides and specs, which are written for people to read.
   - `doc/`, which ExDoc writes its generated output into.
   - `handbook/` and `dev-docs/`. Neither names whose layout the folder follows, which `q-docs/` tells a reader meeting it in an unfamiliar repo.

2. **No migration machinery.** Three projects pin q today, each with a q tree under `docs/`: `Lab43/underdot`, `Lab43/taskmaster`, and `scriptdash/patients-team-playground` (source: GitHub code search for `"@lab43/q"` in `package.json`, 2026-10-09). They migrate by hand, and `/q:install` and `/q:reconcile` gain no step for it. A migration step would be permanent skill text serving a one-time move for three projects that can be migrated directly.

   Leave `q-extension/skills/install/SKILL.md:16` reading `docs/`. That scan looks for convention-like docs outside q's root. A project upgrading without migrating has its old q tree under `docs/`, so the scan reports it among the migration candidates.

3. **This repo moves its whole `docs/` tree, `workflow-chart/` included.** The policy already leaves non-taxonomy content under the root alone (`q-extension/conventions/documentation.md:7`). Splitting the chart off would keep a `docs/` folder in q's own repo for one asset.

4. **Merged plan bodies move unedited.** Their `docs/` paths describe the tree as it stood when they were written (source: @lab43/q conventions/plans.md, Lifecycle).

5. **The documentation policy records why `docs/` was rejected.** Without that record, a groomer or a future plan reads `q-docs/` as an arbitrary name and proposes the conventional one back.

## Out of scope

- **Migrating the three consuming projects** (deferred). Each migration needs a q release carrying this move to pin. Make one PR per project that does all of the following before `/q:reconcile` runs:
  - pins that release
  - `git mv`s `docs/conventions`, `docs/specs`, `docs/plans`, and `docs/guides` into `q-docs/`
  - rewrites the project's references to those paths: its briefing index, its markers, and the q section of its README

  Order matters. A reconcile run that comes first re-runs `/q:install`, which seeds empty mirror docs under `q-docs/conventions/` beside the project's real ones under `docs/`.

## Phases

Delivery: one PR. Both phases are prose edits plus renames, and a reviewer can hold them in one sitting. Between the phases the payload names `q-docs/` while this repo's tree is still `docs/`. The checks pass in that state, and the shared PR keeps it from shipping.

### Phase 1: The payload

Replace each `docs/` path below with its `q-docs/` form, leaving the rest of the sentence as written.

- `q-extension/conventions/documentation.md`
  - Line 7, both mentions, including "Anything else under `docs/`".
  - Lines 15–18, the four taxonomy entries.
  - Lines 29, 50, 65, 66, 67, and 75, a ruling's home and the marker examples.
  - Add the record from Decision 5 as a `Rejected:` paragraph closing the Taxonomy section. Place it unindented after the bullet list, before `## Single source of truth`, so it doesn't read as part of the `CLAUDE.md` bullet. It names `docs/` as the rejected root, and states the Pages and MkDocs facts from Context as the grounds.
- `q-extension/conventions/conventions.md:9`.
- `q-extension/conventions/extensions.md`, lines 20, 23, 27, and 31.
- `q-extension/conventions/plans.md:15`.
- `q-extension/references/agent-briefing.md`, lines 24, 48, 49, 55, and 71.
- `q-extension/agents/adversarial-reviewer.md`, lines 15, 48, and 69.
- `q-extension/skills/create-plan/SKILL.md`, lines 3, 13, 24, and 37. Line 3 is the frontmatter description users see in the skill listing.
- `q-extension/skills/implement-plan/SKILL.md`, lines 3 and 8.
- `q-extension/skills/implement/SKILL.md:23`.
- `q-extension/skills/review/SKILL.md`, lines 17 and 18.
- `q-extension/skills/drive/SKILL.md`, lines 18 and 58.
- `q-extension/skills/groom-docs/SKILL.md`, lines 11, 13, 19, 21, 22, 24, 25, 38, 40, and 48. Line 19 reads "each `docs/` directory", which becomes "each `q-docs/` directory".
- `q-extension/skills/update-docs/SKILL.md`, lines 24, 28, and 33.
- `q-extension/skills/upstream/SKILL.md:18`.
- `q-extension/skills/install/SKILL.md`, lines 17, 36, 44, 104, 136, and 137. Line 104 is the README text install writes into consuming projects. Line 16 stays (see: Decision 2).

### Phase 2: This repo's tree

1. `git mv docs q-docs`. This plan moves with the tree. Commit it before the move if it is still untracked, since `git mv` stages only tracked files. Continue from `q-docs/plans/2026-10-09-q-docs-root.md`, and flip its status there.
2. `CLAUDE.md`, lines 9, 14, 17, 24, 46–48, 60, and 61.
3. `README.md`:
   - Lines 17, 31, 33, 37–40, 100, 113, 130, and 177.
   - Lines 60–66, the chart's marker, its regeneration comment, and the image `href`, `srcset`, and `src`. These are live links, and the images fail to render until they point under `q-docs/workflow-chart/`.
4. `.claude/skills/release/SKILL.md:10`.
5. The code comments: `scripts/set-version.mjs:10`, `tests/set-version.test.mjs:43`, and `q-docs/workflow-chart/screenshot.py:9`. In `scripts/check-frontmatter.mjs:2–3`, replace the claim that `claude plugin validate` "skips docs/plans/ entirely" with the verified one: it never parses plan frontmatter (see: Context).
6. `q-docs/conventions/documentation.md:11`, `q-docs/conventions/skills.md:45`, and `q-docs/guides/driving-manual.md:42`.
7. `q-docs/workflow-chart/chart.html`: the four SVG labels at lines 265, 267, 269, and 271, and the script path at line 304. Then run `python3 q-docs/workflow-chart/screenshot.py` to regenerate `light.png` and `dark.png`. Look at both, because the labels sit in a fixed-width row and the longer text may overflow its box. Narrow the font or the label before shipping a clipped image.

## Verification

- Grep tracked files for `docs/` not preceded by `q-` (`git grep -nE '(^|[^-])docs/'`), excluding `q-docs/plans/` files up to and including this plan. The hits left are `q-extension/skills/install/SKILL.md:16` and the `Rejected:` line from Phase 1.
- `npm run check` passes.
- Drive `/q:install` from a packed tarball in a fresh fixture (see: q-docs/guides/driving-manual.md, Driving q as an installed plugin). The mirror docs land under `q-docs/conventions/`. The briefing index and the README section name `q-docs/` paths.
