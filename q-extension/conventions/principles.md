# Principles

Cross-cutting rules that apply to any design decision, plan, or review — not tied to a layer, package, or stack.

## Tooling limitations never dictate content

Product and design decisions are made on their merits. If a design choice would break a test helper, e2e spec, CI step, or script, fix the tooling to accommodate the design — never bend the design to accommodate the tooling.

Example: an e2e helper that can only extract the first link in an email body is not a reason to require emails to contain a single link — the helper grows a way to target the link the test wants, and email content stays a pure design choice.

When a plan or review catches this pattern, the fix belongs on the tooling side, scheduled in the same plan or change as the design decision that exposed it.

## Copying is the signal to extract

Before copying code from one file into another — a test stub, a helper function, a repeated component or hook shape — extract instead: the copy you're about to make is the second use. Move the shared code to one home and import it from both call sites. Duplication is created one copy at a time, and the act of copying is the cheapest place to stop it.

Two guards:

- Extract sameness, not resemblance: extract only mechanical duplicates that must change together. Keep code that merely looks similar but diverges in semantics separate (a link styled to mimic a button's visuals is still a link — two components, not one).
- Don't treat imitating an exemplar as copying: the rule targets verbatim plumbing and scaffolding, not structural similarity to the file a convention doc holds up as the model.

When tooling genuinely forces a copy (an environment that can't import shared modules), mark both copies with a keep-in-sync note so the duplication reads as intent, not oversight. A plain note, not a `(source:)` marker (see: @lab43/q conventions/documentation.md, Markers): neither copy is the authority it would name.

## Colocate knowledge with its next reader

The test is where the next reader who needs the fact will be standing. A fact needed only when touching one specific site — a lint rule's rationale, why this workaround exists, a keep-in-sync note, why a doc's markup takes the shape it does — lives as a comment at that site: the comment reaches exactly that reader and moves with what it describes, while a conventions entry for it taxes every reader and rots independently. But a lesson that binds code not yet written — a gotcha the next person would re-trip writing similar code elsewhere — is cross-cutting even with one current instance, and goes to the conventions doc, where its future reader will actually look. When the future is genuinely uncertain, start with the comment; a second occurrence is the promotion signal (see: Copying is the signal to extract).

A private note only the agent reads — a memory file, a stored preference — is not a home. Its next reader is one agent on one project, while the lesson binds every session running the same workflow. Friction with a skill, a convention, or an agent's instructions is a defect in that surface, so the correction belongs there.

## Comments carry constraints, not justification

A comment, in code or in a doc's markup, states what its file cannot show: the constraint, the gotcha, the reason a workaround must stay. The test: does the comment change how the next reader edits this site? If not, cut it.

An exception marker's reason passes the test (see: @lab43/q conventions/documentation.md, Markers). It stops the next reader pulling the site back into line with a rule it is excused from. A spec marker passes it too: it tells the next reader the site enforces a commitment, which they would otherwise remove as an ordinary check.

What fails the test is the author addressing someone other than that reader, in two shapes:

- **Justification** — defending the chosen design, weighing alternatives, narrating how the solution was arrived at. That addresses the reviewer, and it's noise once merged; git history and the PR carry it.
- **Pointers to unmaintained artifacts** — plan docs (frozen after merge) (source: @lab43/q conventions/plans.md, Lifecycle), tickets, PRs, external trackers. State the constraint in the comment itself, or point at the convention doc that owns it. The one sanctioned link: a ticket tracking work that will change this code when it lands — a workaround awaiting an upstream fix, a shim awaiting a migration. The dependency is stated inline so the comment stands alone; the link exists only to check the pending work's status.

## Prefer the strongest enforcement rung

When establishing a rule or pattern, put it on the strongest rung that can hold it: bake it into a component or API so violations are impossible, else lint it so they're mechanical to catch, and only as the last rung document it. Prose enforcement depends on a reader noticing; components and lint don't.
