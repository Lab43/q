---
name: update-docs
description: Create or update any project documentation — conventions, README, guides, the agent briefing, plan amendments. The argument can be a spelled-out change (applied as given), a rough topic, or nothing — bare invocation sweeps the session for changes worth recording. Invoked directly, the changes ship as a PR; invoked from another skill's run, they join that run's change unless the caller asks for full delivery. Use for any doc change, including a lesson or gotcha worth recording mid-session, even mid-investigation or mid-debugging.
---

# Update Docs

The single write path for documentation changes. Whatever the change, this skill classifies it against the documentation taxonomy and applies that category's rules, so callers never need to pre-sort "conventions" from other docs. Other q skills that record new or amended rules delegate here.

Follow the run contract — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.

## Step 1: Classify the change

The change comes from the invocation: named in the prompt, surfaced by the session's own work, or handed over by a delegating skill. On a bare invocation, sweep the session for candidates — decisions made, gotchas hit, corrections taken. Route each by what it is:

- **A lesson, pattern, or decision to record — including a decision to change an existing convention** → the conventions path, Step 3.
- **A fact, instruction, or overview change for the product's readers** → the surface the taxonomy assigns it — a guide, the README, or the briefing, whether or not the invocation named one (see: @lab43/q conventions/documentation.md, Taxonomy).
- **A spec change — a commitment the product makes, which the invocation names: the user's instruction, or a plan's scheduled step** → the spec path, Step 4. A bare sweep never takes this route: report a swept lesson that reads as a product commitment to the user as a spec candidate, and leave it unwritten (source: @lab43/q conventions/documentation.md, Taxonomy).
- **A plan change** → the lifecycle's rules — status flips and marked amendments; authoring new plans belongs to `/q:create-plan`, and amendments during an implementation run to `/q:implement-plan`, not here (see: @lab43/q conventions/plans.md, Lifecycle).
- **A change that belongs in a q skill's instructions** → not a doc change; flag it as an upstream candidate — suggest `/q:upstream`. (A change that belongs in an extension's doc stays on the conventions path — Step 3 records it locally as a deviation first.)

## Step 2: Read the policy

Read q's documentation policy (see: @lab43/q conventions/documentation.md), its conventions rules (see: @lab43/q conventions/conventions.md), and its writing rules (see: @lab43/q conventions/writing.md), plus any installed extension's doc whose topic governs documentation, and the project's `docs/conventions/documentation.md` — its recorded rulings and deviations win on conflict.

## Step 3: The conventions path — qualify the lesson

Read q's principles (see: @lab43/q conventions/principles.md), plus any installed extension's doc whose topic governs cross-cutting principles, and the project's `docs/conventions/principles.md`. Then hold the lesson to four gates, in order:

1. **Is it a rule?** Would it change what a future reader writes or flags? Narrative, descriptions of current behavior, and code-readable facts don't qualify — the code carries those. What qualifies is the binding form: the constraint, the do/don't, the decision with rationale. No rule in it ends the path — report that, don't force an entry.
2. **Where will its next reader be standing?** A fact needed only when touching one specific site becomes a comment there, in code or in a doc's markup, not a conventions entry. A lesson the next person would re-trip writing similar code elsewhere is cross-cutting even with one current instance — that one goes in the doc. Genuinely uncertain: comment now, promote on second occurrence (source: @lab43/q conventions/principles.md, Colocate knowledge with its next reader). When the lesson is that this one site sits outside a rule, the comment carries an exception marker naming that rule (see: @lab43/q conventions/documentation.md, Markers).
3. **Is prose the right rung?** A rule that a component or lint could hold shouldn't settle for documentation (source: @lab43/q conventions/principles.md, Prefer the strongest enforcement rung). If a stronger rung exists, propose *that* as the fix (or schedule it), with the rationale colocated in the component or lint rule.
4. **Which tier?** A lesson about the project's code belongs in its `docs/conventions/`. A lesson that seems to belong elsewhere — about the q workflow itself, or a topic an installed extension owns — is recorded in the project's `docs/conventions/` too, as a marked project deviation where it contradicts that rule, and flagged to the user in the session as an upstream candidate — suggest `/q:upstream`. Workflow-general versus project-specific is hard to call from inside one project: record and flag, don't withhold (source: @lab43/q conventions/conventions.md, Three tiers of conventions). One case differs: a repo that publishes rules of its own. Decide whether the lesson belongs in what it publishes or in its own `docs/conventions/` (see: @lab43/q conventions/extensions.md, Which rules ship).

A lesson through the gates gets a home: the topically-owning doc — grep the surface first, q's conventions and every installed extension's included: a project rule may already exist to refine, and a rule q or an extension already carries is already law — record it only as a marked deviation if the lesson disagrees, never as a copy. A new doc is created only when no existing topic owns the rule (source: @lab43/q conventions/conventions.md, Conventions docs). It arrives with its intro and its index line in the same change (source: @lab43/q conventions/documentation.md, Taxonomy).

## Step 4: The spec path — hold each statement

Read the specs rules (see: @lab43/q conventions/specs.md). Hold each statement to the admission test: it belongs when a future change breaking it should stop for the user's ruling, and it is cut otherwise (source: @lab43/q conventions/specs.md, What a spec holds). Put each statement in the spec doc whose feature owns it, or create that doc, arriving with its intro and its index line in the same change (source: @lab43/q conventions/documentation.md, Taxonomy). When the change amends a section, visit every site marked with it (source: @lab43/q conventions/specs.md, Enforcement). A stronger rung is still preferred for the commitment itself: propose the test, the validation, or the constraint that would enforce it, each carrying the spec marker. The statement stays in the spec regardless, because a spec's prose survives a test holding it (source: @lab43/q conventions/specs.md, Enforcement).

## Step 5: Confirm the scope

Confirm what the session derived, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes) — candidates a sweep surfaced, a genuinely contestable home or treatment: state each change, its home, and its treatment — what gets rewritten, deleted, or added. A change the invocation spelled out — the user's prompt or a calling skill's — is already agreed and skips this step: state its classification's small calls rather than asking.

In a run invoked directly by the user, ask which review mode — local or ship — the delivery runs under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes), even when a spelled-out change skips the rest of this step.

## Step 6: Apply per policy

Act autonomously once the scope is agreed. In a run that delivers here (Steps 7–8), first pick the delivery branch (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The delivery branch). Then edit the docs directly rather than proposing wording and waiting for approval — the user reviews the applied changes as a git diff. Draft to each surface's own taxonomy rules (see: @lab43/q conventions/documentation.md, Taxonomy) and the writing rules (see: @lab43/q conventions/writing.md). Keep the briefing's docs index in sync if membership or a gloss changed, to the shape the briefing template defines (see: `${CLAUDE_PLUGIN_ROOT}/references/agent-briefing.md`). In a delivering run's ship mode, commit.

## Step 7: Adversarial review

Changes made for a calling skill end at Step 6: they join the calling run's change, which validates and delivers them. The exception is a caller that asks for full delivery: those changes continue here like a direct run's, under the review mode the calling run settled. Validate the applied changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Validation) with the **correctness** and **conventions** lenses.

## Step 8: Open the PR

1. **The local gate**: run it over the uncommitted changes (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, The local gate).
2. **Open the PR**: push the branch and open the PR per the PR-authoring rules (see: @lab43/q conventions/pull-requests.md).
3. Close the session by reporting each change and its home, plus anything swept but not recorded and why.
