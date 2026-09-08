---
name: groom-docs
description: Audit the project's whole documentation surface against the documentation policy and consolidate what has drifted. Use when docs feel inflated or stale, after a stretch of merged changes, or on a docs-cleanup request.
---

# Groom Docs

**Read the rubric first, and follow it over any instinct:**

1. The framework policy — `node_modules/@lab43/q-conventions/conventions/documentation.md` — plus any other installed pack's doc whose topic governs documentation: pack rules bind like the framework's.
2. The project's recorded rulings and deviations: `docs/conventions/documentation.md` plus any "(overrides: …)" markers across `docs/conventions/` — grep for them. On conflict with any pack, these win.

If the project has no `docs/conventions/` directory, or `node_modules/@lab43/q-conventions/` is absent (a fresh clone may just need `npm install`), stop and suggest the fix — without both there is no surface or rubric to groom against.

## Step 1: Inventory

Build the grooming surface, taking each item only if it exists in this project:

- `docs/conventions/*.md`, `README.md`, `AGENTS.md`/`CLAUDE.md` (the agent briefing) — full checks.
- The `conventions/` of any doc pack this repo authors — a working-tree `package.json` carrying the `q-docs` keyword — full checks, like the project's own conventions (source: q conventions/doc-packs.md).
- `docs/*.md` loose files — **guide mode**, per the policy's Taxonomy rules.
- `docs/plans/*.md` — **status check only**, per the policy's Plan lifecycle rules.

Project-local `.claude/` skills and agents are outside the surface — q doesn't govern them. Installed doc packs (the framework's included) and the q plugin's skills are read-only — never groomed.

## Step 2: Fan out verification (read-only subagents)

Launch read-only subagents in parallel — one per check below, except accuracy, which fans out per doc cluster; the duplication and consistency sweeps each hold the whole surface, since cross-file checks can't be sharded. Each reads the rubric first and returns findings with `file:line` citations:

1. **Accuracy, per doc cluster** (conventions docs grouped by area; guides clustered separately, in guide mode): every checkable claim — file paths, symbol names, behavior descriptions, commands — verified against current source. Exemplar references get a deeper check: the file exists and still exhibits the rules its doc attaches to it.
2. **Duplication sweep**, cross-surface: facts stated in more than one place. For each, name the home — implied by the taxonomy, or assigned by a recorded ruling; where the call is genuinely contestable, flag it for the user, whose decision becomes a new ruling. The sweep also runs **cross-tier**, comparing project docs against every installed pack's: a project statement matching a pack rule in substance is duplication to prune; one differing from a pack rule without an overrides marker naming it is drift or an unrecorded deviation — escalate to the user; a marked override whose target updated to agree or disappeared is spent — propose deleting it (source: q conventions/documentation.md, Two tiers of conventions). The packs themselves are read-only: a pack's stale override of a framework rule, or two packs in conflict, can't be edited here — escalate; the remedy is a project ruling or the pack author's.
3. **Dead references**: every file, symbol, helper, script, and skill named anywhere on the surface exists. Greps must exclude build artifacts (`dist/`, `node_modules/`, and the like) — stale generated files resurrect deleted symbols.
4. **Consistency**: the agent briefing's docs index matches `docs/conventions/` exactly — membership *and* each entry still matching its doc's intro; the index also carries every installed doc pack's docs and no lines for packs no longer installed (packs are the direct dependencies in `package.json` whose own `package.json` carries the `q-docs` keyword); guide entries are optional, but each present one is held to the same intro match; any README skills/conventions table matches its home (skill tables drift-check against `SKILL.md` frontmatter descriptions); cross-references between docs resolve.
5. **Organization**: each doc's structure — topic scope, intro, section placement, and splits or merges across docs — conforms to the policy. Findings here become reorganization proposals.
6. **Plan statuses** (if `docs/plans/` exists): every plan has valid `status` frontmatter (`pending | completed | abandoned`); list every `pending` plan with its age (last git commit date).

## Step 3: Consolidate with the user

Merge the findings into proposed edits, each stating its remedy and citing its finding.

- Apply autonomously: wording-level fixes, replacing a single restated sentence or bullet with a cross-reference to its home, and dead-reference corrections. List them all in the report.
- **Batch everything else to the user via AskUserQuestion before applying** — including larger deletions and rewrites, any reorganization, any `pending` plan proposed as `abandoned` (only the user flips a status), and any fact that couldn't be verified either way.
- When a user ruling sets a precedent, record it in the same run: project-specific rulings go in the project's `docs/conventions/documentation.md`; a ruling that would apply to every q project is recorded as a project deviation and flagged in the report as a candidate to upstream (via `/q:upstream`).

## Step 4: Apply, re-check, report

1. Apply the approved edits.
2. Re-run the dead-reference and consistency checks over the result — approved edits can break each other's targets.
3. Report: what changed per doc, what was deduped and into where, every autonomous fix, every user decision and its outcome, any upstream-to-q candidates, and anything that couldn't be verified (named explicitly — never silently dropped).
4. **Committing is the user's call.** Propose a commit structure and ask; never commit or push unprompted.
