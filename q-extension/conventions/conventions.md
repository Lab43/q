# Conventions

Rules for how a project's conventions are tiered, written, and enforced.

## Three tiers of conventions

- **Framework conventions** — the conventions docs `@lab43/q` ships, a dependency in the project's `package.json`. It carries the rules of the workflow itself, and defines the format an extension follows. Every q project installs it, and none can remove it.
- **Extension conventions** — the installed extensions (see: @lab43/q conventions/extensions.md), each a dependency the same way, so rule improvements reach the project as its versions move. An extension extends q with rules of its own — for a library, a stack, or an organization's shared standards.
- **Project conventions** — `docs/conventions/` in the consuming repo (a fixed contract path). Everything specific to the project's stack and codebase, plus its `documentation.md` mirror of the documentation policy, where documentation rulings and deviations are recorded. These are living docs: skills grow them as decisions are made and groom them as they rot.

**Precedence: project conventions win over any extension's rule, whichever extension carries it. An extension's rule in turn wins over q's.** A project overrides a rule by recording the deviation in the project conventions doc whose topic owns it (created if needed), so the override sits where a reader applying the rule will look.

- A deviation is written as an ordinary rule: the decision and the rationale, plus an overrides marker (see: @lab43/q conventions/documentation.md, Markers) naming the rule it replaces.
- A deviation is refined in place or deleted as the decision evolves, never appended as a log entry.
- An override outlived by its target — updated to agree, or gone — is spent and comes out.
- Overriding a rule needs no other mechanism — the readers are agents, so stating the deviation is enough.

A refinement that reaches beyond this project — one that would improve a q rule, or an extension's — is a candidate to upstream. Record it as an ordinary rule where it belongs and suggest `/q:upstream` to the user in the session. Never annotate the doc with its upstream candidacy.

Conventions move into what a repo publishes when their audience grows beyond one project, on the user's decision (source: @lab43/q conventions/extensions.md, Which rules ship).

## Conventions docs

Rules for whoever is about to write or evaluate code — the unit this workflow reads and grows.

**One topic per doc, broadly targeted until proven otherwise**: a doc is about "tests", not about "mocking data in Jest". Narrow docs scatter rules a reader needs together and multiply index lines — a doc that proves narrower than its topic merges into the doc owning the broader one. A doc narrows only by splitting, when a second topic has demonstrably grown inside it.

**Every statement is a rule** — something to follow, a constraint to check, or a decision that binds future code, phrased that way. A sentence that wouldn't change what a reader writes or flags gets cut.

- Descriptions of how the system currently works are not conventions — the code and exemplars carry those.
- Never facts readable from the code: directory listings, dependency lists, schema enumerations, config values, and model/version names rot the moment code moves, and the code already answers them.
- Record decisions and rejected alternatives only when they're highly likely to come up again: the alternative is the first thing a reader would reach for, or something deliberately ignored reads as an oversight. Each rejection names the alternative and the reason, nothing more.
- The rationale stands inline — never cite the repo's issues or PRs as provenance; git history is the paper trail. Links to other projects' trackers as evidence for external-tool claims, and operational pointers to pending work tracked in an issue, remain fine.

**A rule lands in the doc whose topic owns it**, integrated into the section it belongs to (see: @lab43/q conventions/writing.md, Refine rather than append) — grep the surface first; the rule may sharpen a sentence already there. A new doc is created only when no existing topic owns the rule.

## Code examples in conventions docs

Prose rules carry the conventions; code carries itself:

- Each pattern names a **living exemplar** — a real file in the repo — and says which of its lines are load-bearing for the pattern, so an imitator doesn't copy the incidental along with the essential. Exemplar references and these notes are carved out of the no-code-readable-facts rule as a class; they exist to point *into* the code.
- Short shape-only snippets are allowed where a rule is illegible without one. Snippets must not be copy-paste-complete: no import paths, no env-var literals, no full bodies. Anything an agent would paste verbatim must come from the exemplar.
- Symbols, files, and helpers named in prose must exist — `/q:groom-docs` greps for them.

Rejected: full copy-paste code templates, even compile-checked ones — doc inaccuracies cluster inside template code and code-readable fact restatements, not prose rules, and a stale template actively produces failing code.

## Documentation is the last rung

Documentation is the weakest enforcement rung (source: @lab43/q conventions/principles.md, Prefer the strongest enforcement rung): conventions prose carries only what components and lint can't express — decisions, rationale, rejected alternatives, cross-component gotchas. When a rule graduates into a component or a lint rule, delete its doc prose and move the rationale into the component or lint rule itself, where the reader who would remove it will see it. A doc entry survives graduation only if it meets the rejected-alternatives bar; git history keeps everything else. A spec's prose is the one carve-out: it stays after a test holds it, because it records the intent behind the test, and the test cannot drift from the commitment without the drift being visible (source: @lab43/q conventions/specs.md, Enforcement).
