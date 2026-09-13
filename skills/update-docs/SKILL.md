---
name: update-docs
description: Create or update any project documentation — conventions, README, guides, the agent briefing, plan amendments. The argument can be a spelled-out change (applied as given), a rough topic, or nothing — bare invocation sweeps the session for changes worth recording. Invoked directly, the changes ship as a PR; invoked from another skill's run, they join that run's change. Use for any doc change, including a lesson or gotcha worth recording mid-session, even mid-investigation or mid-debugging.
---

# Update Docs

The single write path for documentation changes. Whatever the change, this skill classifies it against the documentation taxonomy and applies that category's rules, so callers never need to pre-sort "conventions" from other docs. Other q skills that record new or amended rules delegate here.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Classify the change

The change comes from the invocation: named in the prompt, surfaced by the session's own work, or handed over by a delegating skill. On a bare invocation, sweep the session for candidates — decisions made, gotchas hit, corrections taken. Route each by what it is:

- **A lesson, pattern, or decision to record — including a decision to change an existing convention** → the conventions path, Step 3.
- **A fact, instruction, or overview change for the product's readers** → the surface the taxonomy assigns it — a guide, the README, or the briefing, whether or not the invocation named one (see: q conventions/documentation.md, Taxonomy).
- **A plan change** → the lifecycle's rules — status flips and marked amendments; authoring new plans belongs to `/q:create-plan`, and amendments during an implementation run to `/q:implement-plan`, not here (see: q conventions/plans.md, Lifecycle).
- **A change that belongs in a q skill's instructions** → not a doc change; flag it as an upstream candidate — suggest `/q:upstream`. (A change that belongs in a pack's doc stays on the conventions path — Step 3 records it locally as a deviation first.)

## Step 2: Read the policy

Read the framework policy (see: q conventions/documentation.md) and the writing rules (see: q conventions/writing.md), plus any other installed pack's doc whose topic governs documentation, and the project's `docs/conventions/documentation.md` — its recorded rulings and deviations win on conflict.

## Step 3: The conventions path — qualify the lesson

Read the framework principles (see: q conventions/principles.md), plus any other installed pack's doc whose topic governs cross-cutting principles, and the project's `docs/conventions/principles.md`. Then hold the lesson to four gates, in order:

1. **Is it a rule?** Would it change what a future reader writes or flags? Narrative, descriptions of current behavior, and code-readable facts don't qualify — the code carries those. What qualifies is the binding form: the constraint, the do/don't, the decision with rationale. No rule in it ends the path — report that, don't force an entry.
2. **Where will its next reader be standing?** A fact needed only when touching one specific site becomes a code comment there, not a conventions entry. A lesson the next person would re-trip writing similar code elsewhere is cross-cutting even with one current instance — that one goes in the doc. Genuinely uncertain: comment now, promote on second occurrence (source: q conventions/principles.md, Colocate knowledge with its next reader).
3. **Is prose the right rung?** A rule that a component or lint could hold shouldn't settle for documentation (source: q conventions/principles.md, Prefer the strongest enforcement rung). If a stronger rung exists, propose *that* as the fix (or schedule it), with the rationale colocated in the component or lint rule.
4. **Which tier?** A lesson about the project's code belongs in its `docs/conventions/`. A lesson that seems to belong to a pack — about the q workflow itself, or a topic another installed pack owns — is recorded in the project's `docs/conventions/` too, as a marked project deviation where it contradicts the pack's rule, and flagged to the user in the session as an upstream candidate — suggest `/q:upstream`. Pack-general versus project-specific is hard to call from inside one project: record and flag, don't withhold (source: q conventions/documentation.md, Two tiers of conventions). The exception is a pack this repo authors: a lesson its docs own is edited directly into them — the author changes the rule; overrides and upstreaming are the consumer's mechanism (source: q conventions/doc-packs.md).

A lesson through the gates gets a home: the topically-owning doc — grep the surface first, installed packs' docs included: a project rule may already exist to refine, and a rule a pack already carries is already law — record it only as a marked deviation if the lesson disagrees, never as a copy. A new doc only when no existing topic owns the rule, arriving with its intro and briefing-index line in the same change (source: q conventions/documentation.md, Conventions docs).

## Step 4: Confirm the scope

Confirm what the session derived, in a conversational stretch — candidates a sweep surfaced, a genuinely contestable home or treatment: state each change, its home, and its treatment — what gets rewritten, deleted, or added. A change the invocation spelled out — the user's prompt or a calling skill's — is already agreed and skips this step: state its classification's small calls rather than asking.

In a run invoked directly by the user, ask which review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes), even when a spelled-out change skips the rest of this step.

## Step 5: Apply per policy

Act autonomously once the scope is agreed: edit the docs directly rather than proposing wording and waiting for approval — the user reviews the applied changes as a git diff. Draft to each surface's own taxonomy rules (see: q conventions/documentation.md, Taxonomy) and the writing rules (see: q conventions/writing.md). Keep the briefing's docs index in sync if membership or a gloss changed. In a user-invoked run, create a branch when the session isn't already on one, and commit in ship mode.

## Step 6: Adversarial review

Changes made for a calling skill end at Step 5: they join the calling run's change, which validates and delivers them. Otherwise validate the applied changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 7: Open the PR

1. **Local review's gate**: run the gate over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR; body per the writing rules (see: q conventions/writing.md) and the project's PR conventions where it records any.
3. Close the session by reporting each change and its home, plus anything swept but not recorded and why.
