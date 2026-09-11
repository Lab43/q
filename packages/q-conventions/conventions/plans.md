# Plans

Format, sequencing, and lifecycle rules for `docs/plans/` documents. `/q:create-plan` writes to this rubric and its adversarial plan reviews enforce it; `/q:implement-plan` executes the delivery shape the plan records.

## Audience and length

The plan documents the work, not the conversation that produced it, at minimum length for a fresh context: the reader is `/q:implement-plan` with none of that conversation. Every sentence must either direct work or prevent a wrong decision — cut anything else. State each fact in one section only; other sections reference it, never restate it. Rationale is the shortest argument that keeps a decision from being reopened — usually a sentence, more only when the evidence needs it; rejected alternatives appear only when a reviewer would plausibly re-propose them. Out of scope lists only work a reader would otherwise assume was included.

## Frontmatter

- `status: pending | completed | abandoned` — when each applies and who flips it are lifecycle rules (see: Lifecycle).
- `delivery: single | stacked` — absent means single; the choice is a sizing call (see: Delivery shape).

## Sections

In order. A section with nothing load-bearing to say for this plan is omitted, never padded — and what already binds every session (the conventions docs, the project's standing tooling) goes without saying:

- **Goal** — what the plan delivers and why it's worth doing.
- **Context** — the givens the plan inherits rather than chooses: what is true today, with `file:line` references, and any constraints the solution must respect — invariants, compatibility, external realities. A fact the code can't witness states how it was verified — the source read, or the check run — as evidence reviewers audit instead of repeating the verification. A given needs no defending rationale; anything that could have gone another way is a Decision instead.
- **Decisions** — numbered, each carrying its rationale from the discussion (the why, not just the what) and its rejected alternatives inline.
- **Out of scope** — each item marked deferred or declined, with why. Not a parking lot: adjacent ideas the discussion surfaced but the plan doesn't need stay out entirely.
- **Phases** — the implementation sequence, per Phases below.
- **Verification** — how to prove the integrated result works: the end-to-end flows to exercise, and any proof beyond the phases' own tests. Phases prove themselves (see: Phases) — this section covers what no single phase's tests can. Only checks that prove *this plan's* changes: generic process steps (baseline runs, extra suite passes, added review rounds) belong in the workflow skills, decided once, not re-imposed per plan.

## Phases

A phase is the unit of work and of review; the PR is the unit of shipping. A single-PR delivery ships every phase as one PR; a stacked delivery groups them into several (see: Delivery shape).

- **Green boundaries**: every phase ends with the repo green (lint, typecheck, tests) and shippable. Each phase ideally delivers a visible improvement on its own; at minimum it is inert (machinery landed dark), never a broken in-between state.
- **Cutovers stay small**: when the plan replaces an existing path, the switch is its own small phase — not bundled into a machinery diff — and the old path retires in a later phase, so the riskiest change stays reviewable and revertable on its own. This is a rule for replacements, never an argument for building dark what could ship working.
- **Phases split at seams, not line counts**: a phase boundary falls only where a natural seam exists — an independent subsystem, the cutover from an old path to its replacement. Size is a smell, not a rule: a phase running far past a few hundred changed lines (lockfiles and generated files excluded) is a prompt to look for a seam that was missed, never a mandate to cut at an unnatural place. A phase with no internal seam stays whole, whatever its size.
- **Steps are concrete**: a phase's steps name the files and functions they touch — a step the implementer must first re-derive is planning left undone.
- **Tests ride with their phase**: each phase carries the tests of the behavior it adds — never a trailing tests phase.

## Delivery shape

The `delivery` call:

- **Single PR** — the default when the whole change is a scope a reviewer can hold in one sitting (roughly a few hundred changed lines).
- **Stacked PRs** — for anything larger, using GitHub's stacked-PR support (`gh stack`): per-layer CI and review, cascading bottom-up merge. A stacked plan's Phases section groups its phases into PRs, each group one or more phases making a reviewable scope; `/q:implement-plan` carries the mechanics.

When in doubt, ask the user. A genuinely borderline call records its rationale as a Decision.

## Lifecycle

Plans are written as `pending`, flipped to `completed` when their implementation ships, and flipped to `abandoned` only by the user.

Deviations discovered while the implementation runs are recorded as amendments — added during the run, never after it ships. An amendment is an italicized parenthetical appended directly to the text it amends; the agreed text stays as written, quoted inside the amendment if it must be contradicted rather than extended. Two forms:

- *(deviation: …)* — reality diverged from the text: a step done differently, a decision or given that shifted mid-run. States what happened instead, and what forced it.
- *(result: …)* — the outcome of a step the plan could only pose as a question — a check, a measurement, a re-verified fact.

After merge, a plan's body is frozen history: it describes the world at planning time, and readers treat plan age (git history) as the recency signal. How grooming treats plans is the documentation policy's rule (see: q conventions/documentation.md, Taxonomy).

Rejected: an `archive/` directory for terminal plans (moves break links; status is machine-readable in place) and a `superseded` status (chain-tracking costs more than it returns; a plan implemented then reversed stays `completed` — both plans are accurate history).
