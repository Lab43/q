---
name: groom-docs
description: Audit the project's whole documentation surface against the documentation policy and consolidate what has drifted. Approved edits ship as a PR. Use when docs feel inflated or stale, after a stretch of merged changes, or on a docs-cleanup request.
---

# Groom Docs

**Read the rubric first, and follow it over any instinct:**

1. q's documentation policy (see: @lab43/q conventions/documentation.md) and its writing rules (see: @lab43/q conventions/writing.md), plus any installed extension's doc whose topic governs documentation. An extension's rule beats q's where the two disagree (source: @lab43/q conventions/documentation.md, Three tiers of conventions).
2. The project's recorded rulings and deviations, which win over both: `docs/conventions/documentation.md` plus any "(overrides: …)" markers across `docs/conventions/` — grep for them. An exception marker is a recorded ruling of a different kind, excusing its one site rather than replacing a rule (see: @lab43/q conventions/documentation.md, Markers). Honour one where you meet it; the accumulation check is what counts them.

Stop and suggest the fix when the project has no `docs/conventions/` directory, or when q's `conventions/` don't resolve by their path form (see: @lab43/q conventions/documentation.md, Package doc paths). Without both there is no surface or rubric to groom against. A fresh clone missing q's `conventions/` may just need `npm install`.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Inventory

Build the grooming surface, taking each item only if it exists in this project:

- `docs/conventions/*.md`, `README.md`, `CLAUDE.md` (the agent briefing) — full checks.
- The `conventions/` of any extension this repo authors — a working-tree `package.json` carrying the `q-extension` keyword — full checks, like the project's own conventions (source: @lab43/q conventions/extensions.md). That manifest's `description` joins the surface with them (source: @lab43/q conventions/extensions.md, Description). Anything else the project's own `documentation.md` puts on the surface joins it, under rubric item 2.
- `docs/guides/*.md` — **guide mode**, per the policy's Taxonomy rules.
- `docs/plans/*.md` — **status check only**, per the policy's `docs/plans/` taxonomy rule.

Project-local `.claude/` skills and agents are outside the surface — q doesn't govern them. Everything installed under `node_modules/` is read-only, q's conventions and every extension's alike — never groomed.

## Step 2: Fan out verification (read-only subagents)

Launch read-only subagents in parallel — one per check below, except accuracy, which fans out per doc cluster; the duplication and consistency sweeps each hold the whole surface, since cross-file checks can't be sharded. Each reads the rubric first and returns findings with `file:line` citations:

1. **Accuracy, per doc cluster** (conventions docs grouped by area; guides clustered separately, in guide mode): every checkable claim — file paths, symbol names, behavior descriptions, commands — verified against current source. Exemplar references get a deeper check: the file exists and still exhibits the rules its doc attaches to it. An authored extension's `description` is checked with its docs: it must still name the territory they govern.
2. **Duplication sweep**, cross-surface: facts stated in more than one place. For each, name the home — implied by the taxonomy, or assigned by a recorded ruling; where the call is genuinely contestable, flag it for the user, whose decision becomes a new ruling. The sweep also runs **cross-tier**, comparing project docs against q's conventions and every installed extension's: a project statement matching one of their rules in substance is duplication to prune; one differing from such a rule without an overrides marker naming it is drift or an unrecorded deviation — escalate to the user; a site carrying an exception marker naming the rule is neither, being excused from it rather than in conflict with it; a marked override whose target updated to agree or disappeared is spent — propose deleting it (source: @lab43/q conventions/documentation.md, Three tiers of conventions). Docs installed under `node_modules/` are read-only: an extension's stale override of a q rule, or two extensions in conflict, can't be edited here — escalate; the remedy is a project ruling or the extension author's.
3. **Dead references**: every file, symbol, helper, script, and skill named anywhere on the surface exists. Greps must exclude build artifacts (`dist/`, `node_modules/`, and the like) — stale generated files resurrect deleted symbols.
4. **Consistency**: the agent briefing matches the briefing template (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`); any README skills/conventions table matches its home (skill tables drift-check against `SKILL.md` frontmatter descriptions); cross-references between docs resolve. One concept goes by one name across the surface. Report a synonym against the name its home doc establishes (source: @lab43/q conventions/writing.md, One name per concept).
5. **Organization**: each doc's structure — topic scope, intro, section placement, and splits or merges across docs — conforms to the policy. Findings here become reorganization proposals.
6. **Plan statuses** (if `docs/plans/` exists): every plan has valid `status` frontmatter (source: @lab43/q conventions/plans.md, Frontmatter); list every `pending` plan with its age (last git commit date).
7. **Exception accumulation**: grep the repo for exception markers, excluding `node_modules/` and build artifacts, and group the hits by the rule each names. Match the marker's shape rather than the bare word — `(exception:` where prose carries it, and a comment line beginning `exception:` where a comment does (source: @lab43/q conventions/documentation.md, Markers). Ordinary English use of the word matches neither, and a malformed target still matches, which is what lets the malformations below be seen at all. Skip the text that defines the marker and the examples illustrating it. Report every rule carrying more than one, for the user's ruling — several exceptions against one rule are evidence the rule wants revisiting. Report each of these too: a marker naming no doc or no section, one whose named doc or section does not exist, one carrying no reason, one whose reason the surrounding text no longer bears out, and one whose rule has changed to admit its site, which makes it spent. A file outside the grooming surface joins the run for its exceptions alone: nothing else in it is groomed, and a fix to one goes to the user rather than being applied autonomously.

## Step 3: Consolidate with the user

Merge the findings into proposed edits, each stating its remedy and citing its finding — in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes).

- Apply autonomously: wording-level fixes, replacing a single restated sentence or bullet with a cross-reference to its home, and dead-reference corrections.
- **Everything else goes to the user** (AskUserQuestion) — including larger deletions and rewrites, any reorganization, any `pending` plan proposed as `abandoned` (only the user flips a status), and any fact that couldn't be verified either way.
- When a user ruling sets a precedent, record it in the same run: project-specific rulings go in the project's `docs/conventions/documentation.md`; a ruling that would apply to every q project is recorded as a project deviation and flagged in the report as a candidate to upstream (via `/q:upstream`).
- In the same batch, ask which review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes).

## Step 4: Apply

1. Pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch).
2. Step 3's rulings are the agreement — apply the approved edits autonomously. In ship mode, commit them.
3. Re-run the dead-reference and consistency checks over the result — approved edits can break each other's targets.

## Step 5: Adversarial review

Validate the applied edits (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 6: Open the PR

1. **The local gate**: run it over the uncommitted edits (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting: what changed per doc, what was deduped and into where, every autonomous fix, every user decision and its outcome, any upstream-to-q candidates, and anything that couldn't be verified — named explicitly, never silently dropped.
