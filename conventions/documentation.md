# Documentation Policy

Rules for what belongs in a project's documentation, where it lives, and how it stays accurate. Follow them over any instinct. Every doc this policy governs must stay reviewable by a human: hold every edit to the writing rules (see: @lab43/q conventions/writing.md).

## Three tiers of conventions

- **Framework conventions** — `@lab43/q`'s own `conventions/`, pinned in the project's `package.json`. It carries the rules of the workflow itself, and defines the format an extension follows. Every q project installs it, and none can remove it.
- **Extension conventions** — the installed extensions (see: @lab43/q conventions/extensions.md), each pinned the same way, so rule improvements reach the project on pin updates. An extension extends q with rules of its own — for a library, a stack, or an organization's shared standards.
- **Project conventions** — `docs/conventions/` in the consuming repo (a fixed contract path). Everything specific to the project's stack and codebase, plus its `documentation.md` mirror of this policy, where documentation rulings and deviations are recorded. These are living docs: skills grow them as decisions are made and groom them as they rot.

**Precedence: project conventions win over any extension's rule, whichever extension carries it. An extension's rule in turn wins over q's.** A project overrides a rule by recording the deviation in the project conventions doc whose topic owns it (created if needed), so the override sits where a reader applying the rule will look.

- A deviation is written as an ordinary rule: the decision and the rationale, plus an overrides marker (see: Markers) naming the rule it replaces.
- A deviation is refined in place or deleted as the decision evolves, never appended as a log entry.
- An override outlived by its target — updated to agree, or gone — is spent and comes out.
- Overriding a rule needs no other mechanism — the readers are agents, so stating the deviation is enough.

A refinement that reaches beyond this project — one that would improve a q rule, or an extension's — is a candidate to upstream. Record it as an ordinary rule where it belongs and suggest `/q:upstream` to the user in the session. Never annotate the doc with its upstream candidacy.

Conventions graduate into an extension when their audience grows beyond one project (source: @lab43/q conventions/extensions.md, Graduation).

## Conventions docs

Rules for whoever is about to write or evaluate code — the unit this workflow reads and grows.

**One topic per doc, broadly targeted until proven otherwise**: a doc is about "tests", not about "mocking data in Jest". Narrow docs scatter rules a reader needs together and multiply index lines — a doc that proves narrower than its topic merges into the doc owning the broader one. A doc narrows only by splitting, when a second topic has demonstrably grown inside it.

**Every statement is a rule** — something to follow, a constraint to check, or a decision that binds future code, phrased that way. A sentence that wouldn't change what a reader writes or flags gets cut.

- Descriptions of how the system currently works are not conventions — the code and exemplars carry those.
- Never facts readable from the code: directory listings, dependency lists, schema enumerations, config values, and model/version names rot the moment code moves, and the code already answers them.
- Record decisions and rejected alternatives only when they're highly likely to come up again: the alternative is the first thing a reader would reach for, or something deliberately ignored reads as an oversight. Each rejection names the alternative and the reason, nothing more.
- The rationale stands inline — never cite the repo's issues or PRs as provenance; git history is the paper trail. Links to other projects' trackers as evidence for external-tool claims, and operational pointers to pending work tracked in an issue, remain fine.

**A rule lands in the doc whose topic owns it**, integrated into the section it belongs to (see: @lab43/q conventions/writing.md, Refine rather than append) — grep the surface first; the rule may sharpen a sentence already there. A new doc is created only when no existing topic owns the rule.

## Taxonomy

The policy owns what this taxonomy names — the `docs/` directories below, the README, and the briefing — plus an authored extension's `conventions/` and its description in its authoring repo (source: @lab43/q conventions/extensions.md, Authoring). Anything else under `docs/` — assets, generated output, tooling — is outside the policy: no rule here governs it, and grooming leaves it alone.

File names are kebab-case. Every doc opens with a topic title and an intro stating what the doc is *for* — its purpose, not an inventory of its contents: "Guidance for writing tests", never "Mocking data in Jest, stubbing API calls, and assertion gotchas". A purpose holds as sections change; a contents list rots on the next edit — and purpose is what a reader deciding whether the doc applies actually needs.

The intro is the authoritative description of its doc. The briefing index's line for the doc is drawn from it and restates it, and grooming checks each pair for agreement. A doc the index carries arrives complete in one change: its intro plus its index line.

- **`docs/conventions/`** — the project's conventions docs (see: Conventions docs).
- **`docs/plans/`** — feature plans across their whole lifecycle — upcoming, in flight, and shipped; format and lifecycle rules live in their own doc (see: @lab43/q conventions/plans.md). Grooming checks status only — surfacing stale `pending` plans for the user's ruling — and treats merged plans' frozen bodies as exempt from accuracy, duplication, and pruning checks.
- **`docs/guides/`** — guides: instructions for using and operating the product, not for writing its code (deployment walkthroughs, feature guides, operational procedures). Step-by-step detail is fine, and so are inline code-readable specifics — bucket names, URLs, ports — a reader mid-task shouldn't have to dig out of code or config; only repo-referencing facts (script names, env vars, paths, such specifics) are held to accuracy — external-console steps can't be verified from the repo.
- **`README.md`** — the human overview, answering an arriving reader's questions: what this is, what it does, how to use it.
  - **Summarizing facts owned elsewhere is its normal mode**, not a violation — the obligation is checkability: a summary that mirrors one identifiable home carries a source marker; free-form overview prose is held accurate against the things it describes by grooming. Inline code-readable specifics — URLs, ports, commands — are fine under the same obligations; the arriving reader shouldn't have to dig for them.
  - **Interface, not internals**: enumerating the product's interface (commands, skills, entry points) serves the reader and belongs; inventorying the repo's internals (directory layout, file lists) restates what browsing already shows — an internal detail earns mention only when it explains something non-obvious.
  - **Prose is evergreen**: a sentence describing the current moment ("being migrated to…") rots silently once the moment passes — describe what the product is, and let git history carry the journey.
- **`CLAUDE.md`** — the always-loaded agent briefing. Rejected: `AGENTS.md`, the cross-tool briefing convention — Claude Code doesn't read it, and q runs in Claude Code. Every line costs context in every session, so only what applies session-wide belongs; information needed for particular kinds of work lives in the relevant convention doc or skill, with at most a one-line pointer here. Two things are required:
  - **The standing instructions** that make the conventions bind: all three tiers of conventions apply (see: Three tiers of conventions) — check them before writing code, before design decisions and reviews, and before changing docs — and doc changes go through `/q:update-docs`, the README and the briefing itself included.
  - **The docs index** — one line per doc, restating its intro: every conventions doc, whether q's, an installed extension's, or the project's own, and every guide. Group the lines by where the docs come from. Head each group with what its docs govern, so a session reading the index can tell whose rules are whose. An installed extension's heading is its description (see: @lab43/q conventions/extensions.md, Description). An index line is routing, not content. A guide a session can't act on is still one it should know exists. Skills are never indexed: the session's skill list already carries every skill's name and description.

## Single source of truth

Every fact has exactly one home; every other doc links to it, never restates it. A fact's home is normally implied by the taxonomy and the docs' topics — cross-references carry readers there, and no record of the placement is needed. A placement is recorded in the project's `docs/conventions/documentation.md` only when a reasonable writer or groomer would have put the fact elsewhere — the record exists so grooming doesn't re-litigate it; obvious homes need no entry.

**Restatements**: a doc may restate a rule or fact it operationally depends on — a skill's procedure executing it, the briefing orienting every session with it, a README table presenting it to humans — provided the restatement carries a source marker (see: Markers). The marker is the sanction; an unmarked restatement is ordinary duplication.

Rejected: a standing central registry of all shared facts and their homes. It accumulates entries whose home is obvious from the doc's topic, and it rots like any other enumeration.

## Package doc paths

`q` names the workflow itself — in prose, in the plugin and marketplace a project publishes, and as what a user types to name it. `@lab43/q` is the npm package: use it wherever npm has to recognize the name — a path into the package, an install command, a `package.json` field.

Reference q's docs and an extension's by package name plus path from the package root — `@lab43/q conventions/documentation.md`, `@acme/q-ext-x conventions/retries.md`. The name resolves to the installed copy in `node_modules/`, or to the package's working tree in the repo that authors it. Use the form for every such reference across the documentation surface — markers, the briefing's index lines, doc prose. Use it even for a sibling in the doc's own package: a reference must stay unambiguous when its text is quoted away from its file.

Rejected: abbreviating `@lab43/q` to `q` in the path form. `q` is a different package on the public registry, so the abbreviated reference resolves to whatever `node_modules/q/` holds.

## Markers

Inline cross-references tying a statement to the doc it depends on. They are the documentation surface's own routing, and must suffice for a reader arriving with no skill running — the skills reinforce the routing but can't be assumed. Agents follow them to the related detail; `/q:groom-docs` reads them as recorded intent — a marked restatement or deviation is checked against its target rather than re-flagged as duplication or drift on every run, and marked exceptions are counted by the rule they name.

All share one grammar — `(verb: target)` or `(verb: target, section)`, the section naming a heading within the target. The target is one of:

- a heading in the current doc (`see: Markers`)
- a repo file or directory, by path from the repo root — a project doc (`docs/conventions/testing.md`), any other file a fact is read from (`source: config.yml`), or a directory when the text summarizes its files (`source: migrations/`)
- one of q's docs or an extension's, by its path form (see: Package doc paths)

A marker may sit in a comment, in whatever form its file type offers — an HTML comment in docs rendered for humans (README, guides), a code comment in a script. The comment's own delimiters stand in for the parentheses, so a marker inside one reads `source: docs/conventions/testing.md`. A comment carrying prose as well gives the marker its own line. Agents and grep read the raw file either way. Comments are otherwise ordinary (see: @lab43/q conventions/principles.md, Comments carry constraints, not justification).

Four markers, all ordinary language:

- **`(see: X)`** — cross-reference. Nothing is copied; detail lives at X. No obligations attach.
- **`(source: X)`** — provenance. This text restates a fact whose authoritative home is X (see: Single source of truth).
- **`(overrides: X)`** — precedence. This rule deliberately replaces the named rule — a q rule (`overrides: @lab43/q conventions/documentation.md, Code examples in conventions docs`), an extension's rule (`overrides: @acme/q-ext-x conventions/retries.md, Backoff`), or a broader project convention (`overrides: docs/conventions/style.md, Magic numbers`).
- **`(exception: X)`** — excuse. This one site sits outside the named rule, and the rule itself stands (`exception: docs/conventions/logging.md, Structured fields`). Several exceptions against one rule are evidence the rule wants revisiting.

An exception names both a doc and a section, unlike the other three, and a heading in the current doc is not a target it can take. Only a marker naming the rule can be counted against that rule. Its reason is the text the marker sits in — the sentence in a doc, or the comment in a code file. A marker carrying no reason excuses nothing, and neither does one naming no section.

An exception is spent once its site no longer needs excusing: the rule is gone, or it changed to admit the site. A spent exception comes out. One whose rule merely moved is retargeted, because the site still needs it.

## Code examples in conventions docs

Prose rules carry the conventions; code carries itself:

- Each pattern names a **living exemplar** — a real file in the repo — and says which of its lines are load-bearing for the pattern, so an imitator doesn't copy the incidental along with the essential. Exemplar references and these notes are carved out of the no-code-readable-facts rule as a class; they exist to point *into* the code.
- Short shape-only snippets are allowed where a rule is illegible without one. Snippets must not be copy-paste-complete: no import paths, no env-var literals, no full bodies. Anything an agent would paste verbatim must come from the exemplar.
- Symbols, files, and helpers named in prose must exist — `/q:groom-docs` greps for them.

Rejected: full copy-paste code templates, even compile-checked ones — doc inaccuracies cluster inside template code and code-readable fact restatements, not prose rules, and a stale template actively produces failing code.

## Documentation is the last rung

Documentation is the weakest enforcement rung (source: @lab43/q conventions/principles.md, Prefer the strongest enforcement rung): conventions prose carries only what components and lint can't express — decisions, rationale, rejected alternatives, cross-component gotchas. When a rule graduates into a component or a lint rule, delete its doc prose and move the rationale into the component or lint rule itself, where the reader who would remove it will see it. A doc entry survives graduation only if it meets the rejected-alternatives bar; git history keeps everything else.
