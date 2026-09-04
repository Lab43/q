# Principles

Cross-cutting rules that apply to any design decision, plan, or review — not tied to a layer, package, or stack.

## Tooling limitations never dictate content

Product and design decisions are made on their merits. If a design choice would break a test helper, e2e spec, CI step, or script, fix the tooling to accommodate the design — never bend the design to accommodate the tooling.

Example: an e2e helper that can only extract the first link in an email body is not a reason to require emails to contain a single link — the helper grows a way to target the link the test wants, and email content stays a pure design choice.

When a plan or review catches this pattern, the fix belongs on the tooling side, scheduled in the same plan or change as the design decision that exposed it.

## Copying is the signal to extract

Duplicated boilerplate isn't found by audits — it's created, one copy at a time. So the rule triggers on the act: if you're about to copy code from one file into another — a test stub, a helper function, a repeated component or hook shape — that copy is the second use. Extract it to a shared home instead (per the project's organization conventions) and import it from both call sites.

Two guards:

- Extract sameness, not resemblance. The test is whether the copies are mechanical duplicates that must change together. Code that looks similar but diverges in semantics stays separate (a link styled to mimic a button's visuals is still a link — two components, not one).
- Imitating an exemplar's patterns is not copying boilerplate — the rule targets verbatim plumbing and scaffolding, not structural similarity to the file a convention doc holds up as the model.

When tooling genuinely forces a copy (an environment that can't import shared modules), mark both copies with a keep-in-sync note so the duplication reads as intent, not oversight — a note, not a `(source:)` marker, because the copies are symmetric peers with no authoritative home.

## Colocate knowledge with its next reader

The test is where the next reader who needs the fact will be standing. A fact needed only when touching one specific site — a lint rule's rationale, why this workaround exists, a keep-in-sync note — lives as a code comment at that site: the comment reaches exactly that reader and moves with the code, while a conventions entry for it taxes every reader and rots independently. But a lesson that binds code not yet written — a gotcha the next person would re-trip writing similar code elsewhere — is cross-cutting even with one current instance, and goes to the conventions doc, where its future reader will actually look. When the future is genuinely uncertain, start with the comment; a second occurrence is the promotion signal — the knowledge twin of "Copying is the signal to extract."

## Prefer the strongest enforcement rung

When establishing a rule or pattern, put it on the strongest rung that can hold it: bake it into a component or API so violations are impossible, else lint it so they're mechanical to catch, and only as the last rung document it. Prose enforcement depends on a reader noticing; components and lint don't.
