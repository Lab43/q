# Specs

Rules for how a project's specs are written and how the code is held to them. A spec states what the product commits to. Whether a rule is a spec's or a convention's is the taxonomy's call (see: @lab43/q conventions/documentation.md, Taxonomy).

## Format

One feature or domain per doc. Every spec opens with a title and an intro stating the feature's purpose, which is the territory the doc commits to. Sections group commitments. A section heading is what a marker cites, so it names the commitment's subject and stays stable across edits. Refine a spec in place. Delete the spec of a retired feature.

Specs are the project's own. An extension ships conventions and a plugin, never specs. A library's commitments to the code using it are conventions, and the conventions tier already carries them.

## What a spec holds

Every statement is a commitment: what the product must do or must never do. A statement belongs when a future change breaking it should stop for the user's ruling. Cut what fails that test. Rationale sits inline wherever a decision would otherwise be reopened. What does not belong is a description of how the implementation works today, the screens, fields, and internals the code already shows.

## Enforcement

Mark the code that enforces a commitment: the validation that rejects the bad input, a guard in the UI, a database constraint, the test that proves the rule. Each carries a spec marker naming the spec and the section, in that file's own comment syntax (see: @lab43/q conventions/documentation.md, Markers). Code that merely relies on the commitment carries nothing. Almost everything downstream relies on a commitment in some way, so marking relying code would put markers everywhere and the count would stop meaning anything. When enforcing and relying are hard to tell apart, ask what happens without the code. Without enforcing code the product can break the commitment. Without relying code it cannot.

Rejected: a marker on every site a spec binds. "Bound by" has no edge a reviewer could hold, so the boundary would be litigated on every diff.

The marker makes discovery a grep in both directions. To find the specs a change is bound by, grep the changed files and their tests for markers. To find the code a spec amendment must visit, grep the repo for markers naming the amended section. Every marked site moves with the amendment. That grep is the floor of the search, not the whole of it. Enforcing code that missed its marker, and code that relied on the old commitment, are found only by reading the territory. Mark the enforcing code the reading finds.

Rejected: a spec naming the files or tests that enforce it. That enumeration rots when code moves. The marker carries the same fact in the one place that moves with the code.

A statement stays in the spec after a test holds it. That is a carve-out from the last-rung rule, which deletes prose once a stronger rung holds it (see: @lab43/q conventions/conventions.md, Documentation is the last rung). The spec records the intent behind the test, so the test cannot drift from the commitment without the drift being visible.

## Disagreement

A change that contradicts a spec ships with the amendment or does not ship. It has two exits: revert the change, or amend the spec in the same change. Only the user picks which, because amending a spec is a product decision. A run that finds its agreed work contradicts a spec has stepped outside its agreement, and stops for the user's ruling.

A plan that changes committed behavior edits the spec in the phase that ships the behavior.
