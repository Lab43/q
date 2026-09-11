# Documentation Policy

Rules for what belongs in a project's documentation, where it lives, and how it stays accurate. The q skills apply it as their rubric and follow it over any instinct.

## Reviewable by a human

**Every doc this policy governs must stay reviewable by a human.** Two standing corrections to the model bias toward long prose and accretion — when any rule in this policy leaves a close call, resolve it against that bias:

- **Deletion is the default**, and it is safe — git history keeps everything cut. When a judgment call between keeping and cutting is close, cut. When text is ambiguous or wrong, try deleting it before qualifying it.
- **Every change refines, never appends** — new rules, clarifications, and corrections alike, at every scale. A change is integrated by rewriting the sentence, paragraph, or section it lands in until the doc reads as if written that way from the start: a clause bolted onto a sentence is accretion in miniature, and a rulings changelog at the bottom of a doc is accretion in full — git history is the changelog.

## Two tiers of conventions

- **Pack conventions** — the installed doc packs (see: q conventions/doc-packs.md), pinned in the project's `package.json`, so rule improvements reach the project on pin updates. The framework pack — `@lab43/q-conventions`, this directory — is always among them: it carries the rules of the workflow itself and defines the format the rest follow.
- **Project conventions** — `docs/conventions/` in the consuming repo (a fixed contract path). Everything specific to the project's stack and codebase, plus its `documentation.md` mirror of this policy, where documentation rulings and deviations are recorded. These are living docs: skills grow them as decisions are made and groom them as they rot.

**Precedence: on conflict, project conventions win — over any pack's rule, whichever pack carries it.** A project overrides a pack rule by recording the deviation in the project conventions doc whose topic owns it (created if needed), so the override sits where a reader applying the rule will look. A deviation is written as an ordinary rule, a sentence or two: the decision and the rationale, plus an overrides marker (see: Markers) naming the rule it replaces. It is refined in place or deleted as the decision evolves, never appended as a log entry; an override outlived by its target — updated to agree, or gone — is spent and comes out. No other override mechanism exists or is needed — the readers are agents, so a stated deviation is the mechanism.

A refinement that reaches beyond this project — one that would improve a framework rule, or another pack's — is a candidate to upstream. Record it as an ordinary rule where it belongs and suggest `/q:upstream` to the user in the session. Never annotate the doc with its upstream candidacy.

Conventions graduate into a pack when their audience grows beyond one project — org-wide rules, or rules for code that uses a product (see: q conventions/doc-packs.md).

## Conventions docs

Rules for whoever is about to write or evaluate code — the unit this workflow reads and grows.

**One topic per doc, broadly targeted until proven otherwise**: a doc is about "tests", not about "mocking data in Jest". Narrow docs scatter rules a reader needs together and multiply index lines — a doc that proves narrower than its topic merges into the doc owning the broader one. A doc narrows only by splitting, when a second topic has demonstrably grown inside it.

**Every statement is a rule** — something to follow, a constraint to check, or a decision that binds future code, phrased that way; a sentence that wouldn't change what a reader writes or flags gets cut. Descriptions of how the system currently works are not conventions — the code and exemplars carry those. Record decisions and rejected alternatives only when they're highly likely to come up again (the alternative is the first thing a reader would reach for, or something deliberately ignored reads as an oversight) — and at a sentence or two per rejection, not an essay: name the alternative and the reason. The rationale stands inline — never cite the repo's issues or PRs as provenance (git history is the paper trail); links to other projects' trackers as evidence for external-tool claims, and operational pointers to pending work tracked in an issue, remain fine. Never facts readable from the code: directory listings, dependency lists, schema enumerations, config values, and model/version names rot the moment code moves, and the code already answers them.

**A rule lands in the doc whose topic owns it**, integrated into the section it belongs to (see: Reviewable by a human) — grep the surface first; the rule may sharpen a sentence already there. A new doc is created only when no existing topic owns the rule, and it arrives complete in one change: its intro (see: Taxonomy) plus its line in the agent briefing's index.

## Taxonomy

The policy owns exactly what this taxonomy names — the three `docs/` directories below, the README, and the briefing. Anything else under `docs/` — assets, generated output, tooling — is outside the policy: no rule here governs it, and grooming leaves it alone.

File names are kebab-case. Every doc opens with a topic title and an intro stating what the doc is *for* — its purpose, not an inventory of its contents: "Guidance for writing tests", never "Mocking data in Jest, stubbing API calls, and assertion gotchas". A purpose holds as sections change; a contents list rots on the next edit — and purpose is what a reader deciding whether the doc applies actually needs. The intro is the authoritative description of its doc: the briefing index's line for the doc is drawn from it and restates it, and grooming checks each pair for agreement.

- **`docs/conventions/`** — the project's conventions docs (see: Conventions docs).
- **`docs/plans/`** — feature plans across their whole lifecycle — upcoming, in flight, and shipped; format and lifecycle rules live in their own doc (see: q conventions/plans.md). Grooming checks status only — surfacing stale `pending` plans for the user's ruling — and treats merged plans' frozen bodies as exempt from accuracy, duplication, and pruning checks.
- **`docs/guides/`** — guides: instructions for using and operating the product, not for writing its code (deployment walkthroughs, feature guides, operational procedures). Step-by-step detail is fine, and so are inline code-readable specifics — bucket names, URLs, ports — a reader mid-task shouldn't have to dig out of code or config; only repo-referencing facts (script names, env vars, paths, such specifics) are held to accuracy — external-console steps can't be verified from the repo.
- **`README.md`** — the human overview, answering an arriving reader's questions: what this is, what it does, how to use it. The README and the agent briefing never point at each other — a pointer sends a reader to a document written for a different reader.
  - **Summarizing facts owned elsewhere is its normal mode**, not a violation — the obligation is checkability: a summary that mirrors one identifiable home carries a source marker; free-form overview prose is held accurate against the things it describes by grooming. Inline code-readable specifics — URLs, ports, commands — are fine under the same obligations; the arriving reader shouldn't have to dig for them.
  - **Interface, not internals**: enumerating the product's interface (commands, skills, entry points) serves the reader and belongs; inventorying the repo's internals (directory layout, file lists) restates what browsing already shows — an internal detail earns mention only when it explains something non-obvious.
  - **Prose is evergreen**: a sentence describing the current moment ("being migrated to…") rots silently once the moment passes — describe what the product is, and let git history carry the journey.
- **`AGENTS.md`** (or `CLAUDE.md`) — the always-loaded agent briefing. Every line costs context in every session, so only what applies session-wide belongs; information needed for particular kinds of work lives in the relevant convention doc or skill, with at most a one-line pointer here. Two things are required:
  - **The standing instructions** that make the conventions bind: both tiers of conventions apply (see: Two tiers of conventions) — check them before writing code, before design decisions and reviews, and before changing docs — and doc changes go through `/q:update-docs`, the README and the briefing itself included.
  - **The docs index** — one line per doc, restating its intro: every conventions doc, whether from an installed pack or the project's own, plus any guide useful to agent sessions. Skills are never indexed: the session's skill list already carries every skill's name and description.

## Single source of truth

Every fact has exactly one home; every other doc links to it, never restates it. A fact's home is normally implied by the taxonomy and the docs' topics — cross-references carry readers there, and no record of the placement is needed. A placement is recorded in the project's `docs/conventions/documentation.md` only when a reasonable writer or groomer would have put the fact elsewhere — the record exists so grooming doesn't re-litigate it; obvious homes need no entry.

**Restatements**: a doc may restate a rule or fact it operationally depends on — a skill's procedure executing it, the briefing orienting every session with it, a README table presenting it to humans — provided the restatement carries a source marker (see: Markers). The marker is the sanction; an unmarked restatement is ordinary duplication.

Rejected: a standing central registry of all shared facts and their homes. It accumulates entries whose home is obvious from the doc's topic, and it rots like any other enumeration.

## Markers

Inline cross-references tying a statement to the doc it depends on. Agents follow them to the related detail; `/q:groom-docs` reads them as recorded intent — a marked restatement or deviation is checked against its target rather than re-flagged as duplication or drift on every run. Three, all ordinary language:

All share one grammar — `(verb: target)` or `(verb: target, section)`, the section naming a heading within the target. The target is one of:

- a heading in the current doc (`see: Markers`)
- a repo file, by path from the repo root — a project doc (`docs/conventions/testing.md`) or any other file a fact is read from (`source: config.yml`)
- a pack doc, by package name plus path from the package root (`@acme/q-docs-x conventions/retries.md`), `q` being the alias for the framework pack, `@lab43/q-conventions` (`q conventions/documentation.md`). The name resolves to the installed copy in `node_modules/` — or to the pack's working tree in the repo that authors it. A pack doc uses this form even for a sibling in its own pack: a marker must stay unambiguous when its text is quoted away from its file.

In docs rendered for humans (README, guides), the marker may sit in an HTML comment — agents and grep read the raw file either way.

- **`(see: X)`** — cross-reference. Nothing is copied; detail lives at X. No obligations attach.
- **`(source: X)`** — provenance. This text restates a fact whose authoritative home is X (see: Restatements).
- **`(overrides: X)`** — precedence. This rule deliberately replaces the named rule — a framework rule (`overrides: q conventions/documentation.md, Code examples`), another pack's rule (`overrides: @acme/q-docs-x conventions/retries.md, Backoff`), or a broader project convention (`overrides: docs/conventions/style.md, Magic numbers`).

## Code examples in conventions docs

Prose rules carry the conventions; code carries itself:

- Each pattern names a **living exemplar** — a real file in the repo — and says which of its lines are load-bearing for the pattern, so an imitator doesn't copy the incidental along with the essential. Exemplar references and these notes are a sanctioned exception to the no-code-readable-facts rule; they exist to point *into* the code.
- Short shape-only snippets are allowed where a rule is illegible without one. Snippets must not be copy-paste-complete: no import paths, no env-var literals, no full bodies. Anything an agent would paste verbatim must come from the exemplar.
- Symbols, files, and helpers named in prose must exist — `/q:groom-docs` greps for them.

Rejected: full copy-paste templates, even compile-checked ones — doc inaccuracies cluster inside template code and code-readable fact restatements, not prose rules, and a stale template actively produces failing code.

## Documentation is the last rung

Conventions prose carries only what components and lint can't express — decisions, rationale, rejected alternatives, cross-component gotchas. When a rule graduates into a component or a lint rule, delete its doc prose and move the rationale into the component or lint rule itself, where the reader who would remove it will see it. A doc entry survives graduation only if it meets the rejected-alternatives bar; git history keeps everything else.

