---
status: pending
---

# Specs

## Goal

Give q a doc type that holds what a product commits to, indefinitely: `docs/specs/`. A spec states behavior the code must honor. When a change contradicts it, the change reverts or the spec is amended in the same change, and only the user picks which.

Today no doc holds a product commitment. A plan's decisions bind its own review and then freeze at merge. Conventions govern how code is written. Guides and the README follow the code. A commitment such as "a task is never dated into the past" lives only in whatever test happens to hold it, and a session that removes the test removes the commitment with nothing left to say it was one.

## Context

### No doc type holds a product commitment

- The policy names three `docs/` directories: `q-extension/conventions/documentation.md:45-47`. None holds what a product commits to, which is the gap Decision 1 fills.
- A plan's body is frozen history after merge: `q-extension/conventions/plans.md:58`. A plan's Context section inherits "invariants" as givens (`q-extension/conventions/plans.md:24`) with no doc type to draw them from. A spec is where they come from (see: Decision 1).
- A conventions doc excludes descriptions of how the system works: `q-extension/conventions/documentation.md:30`. A guide is held to accuracy against the repo (`:47`). A statement of behavior is therefore descriptive in every doc type today, which is why a commitment needs a home of its own (see: Decision 1).
- A doc arrives with its intro and its index line in one change: `q-extension/conventions/documentation.md:43`. The index carries every conventions doc and every guide, one line per doc: `:54`. Specs follow both rules (see: Decision 6).

### No existing marker reaches an enforcing site

- Four markers share one grammar: `q-extension/conventions/documentation.md:88`. `see:`, `source:` and `overrides:` live in the documentation surface. Only `exception:` reaches any file: `:95`. A marker at a test needs that same reach (see: Decision 4).
- An exception must name a section, so it can be counted by rule, and its reason is the text it sits in: `:105`. The spec marker requires a section on the same ground (see: Decision 4).
- `source:` obliges grooming to check that the restating text still agrees with its home: `q-extension/conventions/documentation.md:74`, and the README's markers table at `README.md:178-179`. That obligation has no meaning for a test, which is why `source:` is not stretched to cover one (see: Decision 4).
- The site-exceptions plan added the fourth marker rather than stretching `overrides:`, because the two assert opposite things and one skill harvests `overrides:` as evidence (`docs/plans/site-exceptions-and-test-enforcement.md:79`). It made the section mandatory for the same countability reason (`:85`), let one form serve prose and code (`:91`), and put the count in grooming and the answer in the reviewer with no fixed threshold (`:93`). Those grounds still hold, and Decisions 4, 5 and 7 follow them.
- The mechanical check that plan built was dropped in review, so the marker's only reader today is grooming's grep (`docs/plans/site-exceptions-and-test-enforcement.md:13`). The spec marker gets the same reader and no check (see: Decision 7).

### The last-rung rule would delete a spec's prose

- Documentation is the last rung, and a rule that graduates into a component or lint loses its prose: `q-extension/conventions/documentation.md:119-121`, resting on `q-extension/conventions/principles.md:41`. Applied to a spec, it would delete a commitment's sentence the moment a test held it (see: Decision 3).
- A comment may point at the convention doc that owns a constraint. Pointers to unmaintained artifacts are banned: `q-extension/conventions/principles.md:39`. An exception marker's reason passes the comment test: `:34`. A spec marker passes on the same ground, which Phase 1 records beside that sentence.

### The reviewer and the skills find law only through the index

- The reviewer's conventions lens reads "this project's recorded law", found from the briefing's docs index, and presumes the rule right over the code: `q-extension/agents/adversarial-reviewer.md:33`. Its plan review's rigor lens reads the conventions governing the plan's territory: `:43`. A marker the diff introduces gets no deference: `:27`. Its description names the conventions as its grounding: `:3`. Specs join that reading under the same lens (see: Decision 5), and each of these lines is a site Phase 2 edits.
- `create-plan` reads the territory's conventions and prior plans: `q-extension/skills/create-plan/SKILL.md:23-24`. `implement` reads conventions and checks plans for collisions: `q-extension/skills/implement/SKILL.md:21-23`. `implement-plan` reads conventions and routes scheduled doc changes through `/q:update-docs`: `q-extension/skills/implement-plan/SKILL.md:16-22`. Each is a site Phase 3 extends to specs.
- `update-docs` classifies a change into conventions, a reader-facing surface, a plan change, or a skill change: `q-extension/skills/update-docs/SKILL.md:16-19`. Its conventions path holds a lesson to four gates, the third of which sends a rule to a stronger rung than prose: `:25-32`. The spec route Phase 3 adds must skip that gate (see: Decision 3) and must never fire from a sweep (see: Decision 11).
- `groom-docs` inventories the surface by directory with a mode per directory, using single-level globs such as `docs/conventions/*.md`: `q-extension/skills/groom-docs/SKILL.md:21-24`. A doc in a subdirectory of any taxonomy directory escapes grooming today, which Decision 10 ends. Nothing else in the payload assumes a flat directory: the policy fixes file names as kebab-case and says nothing about directories (`q-extension/conventions/documentation.md:41`), the checks walk the tree (see: The checks need no change), and every skill that takes a doc takes its path. Its accuracy check verifies each claim against the source (`:32`) and its exception check greps the repo and groups hits by rule (`:38`). The marker audit is modelled on the latter (see: Decision 7).
- `review` maps a target to an artifact, with a plan doc as the one doc type that gets its own mapping: `q-extension/skills/review/SKILL.md:15-17`. A spec doc gets a mapping of its own in Phase 3.
- The briefing template groups the index into the q group, extension groups, the project's own, and guides: `q-extension/references/agent-briefing.md:22-47`. This repo's briefing follows it: `CLAUDE.md:28-47`. A specs group joins the template in Phase 1 (see: Decision 6).

### The chart and the scaffold already anticipate specs

- The workflow chart already draws a `docs/specs/` column, dimmed and labelled "WIP" (`docs/workflow-chart/chart.html:266-269`), and its maintenance notes say to un-dim it when the specs surface ships (`:314`). Phase 1 does that. The README's chart images are regenerated by hand with `docs/workflow-chart/screenshot.py`, which needs Chromium that nothing in the repo installs (`:1-9`), which is why that step carries a fallback.
- `install` scaffolds no taxonomy directory: an empty one arrives with its first document, `q-extension/skills/install/SKILL.md:114`. Specs are no different, so nothing there changes (see: Out of scope).

### The checks need no change

- `scripts/check-frontmatter.mjs` walks every markdown file in the tree (`:21-28`) and skips a file whose first line is no delimiter (`:49`). A spec carries no frontmatter, so it is walked and passes.
- No test or script names a `docs/` directory beyond `docs/plans/` in one comment and `docs/guides/releasing.md` in two. Verified by grep over `tests/` and `scripts/`. Nothing there names the new directory.

### Rules this plan works under

- Mandated structure, a new marker included, is added only for a demonstrated need, and markers earn their keep by being greppable and countable: `docs/conventions/documentation.md:17`. Decision 4 has to clear that bar.
- The payload is addressed solely to consumers and never names this repo (source: @lab43/q conventions/extensions.md, Which rules ship). The specs convention Phase 1 writes is payload.
- A skill step that launches the reviewer passes what the agent's description names and nothing beyond it (source: docs/conventions/skills.md, Body). Spec awareness therefore lands in the agent in Phase 2, not in the launching steps' prompts.

## Decisions

1. **A new doc type, not a conventions doc.** A statement of what the product does is descriptive everywhere else in the taxonomy: a guide or the README follows the code, and grooming corrects it. In a spec the same sentence is a commitment the code follows. The doc type is what tells a reader which force a sentence carries, so commitments need a home of their own. Conventions are the wrong home for a different reason: they govern how code is written in general, and their own rules cut a statement of system behavior as a non-rule.

   Rejected: holding product commitments in `docs/conventions/`. A reader looking for what the product commits to would not look there, and the conventions rules would cut the statement.

2. **Every statement is a commitment.** A spec states what the product must do or must never do, with rationale inline where the decision would otherwise be reopened. The admission test: a statement belongs when a future change breaking it should stop for the user's ruling. Descriptive prose fails the test and is cut, as it is from conventions. One feature or domain per doc, kebab-case, a title and a purpose intro naming the territory. Sections group commitments, and a section heading is what a marker cites, so it names the commitment's subject and stays stable. No frontmatter and no status. A spec is refined in place, and a retired feature's spec is deleted.

   Rejected: numbered requirement identifiers. Headings already anchor a citation, and identifiers rot on reorganization.

   Rejected: given-when-then scenarios. That is a test's shape, and the test holds it. *(deviation: the convention states neither rejection, and drops "no frontmatter and no status". How a project writes its specs is its own call, as long as q can consume them: a title, an intro for the index line, and section headings a marker can cite. Ruled at the local gate.)*

3. **The spec stays after a test holds it.** This is a stated carve-out from the last-rung rule. The rule deletes prose once a stronger rung holds it, on the ground that a doc reader might not notice a rule and a test cannot be missed. A spec is read at a different moment: by a planner before code exists, and by a reviewer holding a plan against it. It also records the intent behind the test, so the test cannot drift from the commitment without the drift being visible. The carve-out is stated in the specs convention and the last-rung section points at it.

4. **A fifth marker, `spec:`, at the enforcing site.** The test, the validation, or the guard that enforces a commitment carries `spec: docs/specs/<doc>.md, <section>` in its file's own comment syntax. It never sits in the documentation surface, which restates a commitment with `source:` instead. The section is required, as with `exception:`, because a site enforces a statement rather than a doc and the audit counts per section. Every site whose removal would let the commitment be broken carries the marker: a validation, a guard in the UI, a database constraint, the test that proves the commitment. That is an obligation, and the reviewer holds each diff to it, because an unmarked enforcing site is the one an amendment's grep never finds. Code that merely relies on the commitment carries nothing. It does not move when the spec changes, and a marker there would only dilute the count. *(deviation: the convention does not claim relying code never moves. An amendment that loosens a commitment can change what relying code may assume, so the marker grep is stated as the floor of an amendment's search, with the territory read for unmarked enforcing code and relying code. Ruled at the local gate.)*

   Rejected: requiring a marker on every site a spec binds. "Bound by" has no edge a reviewer could hold, so the boundary would be litigated on every diff.

   The marker makes discovery a grep in both directions. Given a diff, the changed files and the tests covering them are grepped for `spec:` markers, and every hit names a governing spec. Given a spec amendment, its section is grepped for, and every hit is a site that must move with it.

   Rejected: stretching `source:` into code. A test does not restate the spec's text. It enforces it. The two carry different obligations: `source:` obliges grooming to check that restating text still agrees with its home, which has no meaning for a test, and `spec:` obliges the site to keep enforcing the statement and obliges an amendment to visit every marked site. Overloading one marker would make its meaning depend on where it sits.

   Rejected: a spec naming the files or tests that enforce it, or a line listing the directories it governs. Both are enumerations that rot when code moves. The marker carries the same fact in the one place that moves with the code.

5. **Spec violations are the conventions lens's to find.** That lens already means "this project's recorded law", and a spec is recorded law. Three hunts join it. Under a work review: code that contradicts a spec statement, a diff that amends a spec section while a site marked with that section did not move, and an enforcing site the diff adds without its marker, under Decision 4's test, since an unmarked enforcing site is one an amendment's grep will never find. Under a plan review's rigor lens: a plan whose phases would contradict a spec without scheduling the amendment. A violation is BLOCKING with two exits, revert or amend, and the reviewer names both without choosing. Deviating code never indicts a spec: the sibling-site reasoning that can indict a convention does not apply, because amending a spec is a product decision only the user makes.

   Rejected: a third lens. The reviewer's lenses are what the launching skills name, and every skill would change to name it for a hunt the existing lens already owns.

6. **Discovery runs forward by the index and backward by the marker.** Each spec doc gets an index line in the briefing, in a group of its own, one line restating its intro. The reviewer and the planning skills find conventions through the index, and specs route the same way. The marker is the mechanical direction and narrows the judgment-based one over time: every violation found by judgment leaves a marker behind.

   Rejected: one index line naming the directory. The reviewer reads the index to pick the docs whose territory covers the artifact, and a directory line gives it nothing to pick by.

7. **Grooming gives specs full checks with accuracy inverted, plus a marker audit.** Every other check applies as it does to conventions: duplication, dead references, consistency, organization. The accuracy check reverses: a commitment the code does not honor is surfaced for the user's ruling, never fixed as a doc. A spec may run ahead of its code, so the sweep cannot tell work in progress from work that was missed or a regression. It names what it found without calling it a violation, and the user says which it is. Every reading is worth their attention. The marker audit greps for `spec:` markers and reports each marker naming a doc or section that does not exist, and each spec section no marker names. An unmarked section is reported and not required: not every commitment is testable.

   The match shape is the keyword followed by a path under `docs/specs/`, and never the bare keyword. `spec:` is an ordinary YAML key, at the top of every Kubernetes manifest a project carries, so the exception check's shape of a comment line beginning with the keyword would still be too loose here. The path is what no key carries.

   Rejected: requiring a marker per section. It would push untestable commitments out of the spec, or push hollow tests into the suite.

8. **A change that contradicts a spec ships with the amendment or does not ship.** Amending a spec is the user's call. A run that finds its agreed work contradicts a spec has stepped outside its agreement, which the run contract's autonomous mode already stops for, so the contract does not change. A plan that changes committed behavior edits the spec in the phase that ships the behavior, through `/q:update-docs`, so nothing needs graduating after the fact. The amendment is a change to standing law that the PR's purpose does not explain, which the PR rules already send to Callouts.

9. **Project tier only.** Specs live in the consuming project's `docs/specs/`. An extension ships conventions and a plugin, and its payload gains no specs directory.

   Rejected: extension-shipped specs, on the ground that a component library might commit to behavior. That is a convention for code using the library, and the conventions tier already carries it.

10. **Every taxonomy directory is read whole, subdirectories included.** A project groups its docs into subdirectories as it likes, and file names stay kebab-case. Specs make the need visible, since a large product groups them by domain, but the rule is the same for conventions, guides and plans, so it lands once in the taxonomy rather than per doc type. Grooming's inventory is the one mechanism that has to change to honor it.

11. **Specs are written deliberately.** A run never writes or amends a spec on its own initiative. A spec changes in two ways: the user's explicit instruction naming the change, or a plan the user approved that schedules the edit. A lesson that surfaces mid-run and reads as a commitment is a candidate the user hears about, never an entry. Conventions grow out of corrections as they surface, because a convention records practice. A commitment is a product decision, and recording one in passing would commit the product to whatever the code happened to do.

    Rejected: a dedicated authoring skill, for now. The conversation that produces a spec is not yet known well enough to script, and the two routes above cover authoring until it is.

12. **One pull request.** The change is prose across a dozen files and a few hundred lines, which a reviewer holds in one sitting. The three phases are seams for review, not for shipping: the reviewer and the skills are useless without the law, and the law is inert without them, so no phase delivers anything on its own.

    Rejected: stacking on the precedent of the site-exceptions plan, which spread comparable breadth over three pull requests. That plan carried four test suites and a new check beside its prose, which is what put it past one sitting.

## Out of scope

- **A mechanical check for `spec:` markers** — deferred. Grooming's grep is the count, as it is for exceptions, and the last such check was dropped in review (see: No existing marker reaches an enforcing site).
- **Extension-shipped specs** — declined (see: Decision 9).
- **A spec authoring skill** — deferred (see: Decision 11).
- **Scaffolding `docs/specs/` in `/q:install`** — declined. Specs are no different from the other taxonomy directories (see: The chart and the scaffold already anticipate specs).

## Phases

### Phase 1: The law

1. In `q-extension/conventions/documentation.md`, Taxonomy: add a `docs/specs/` bullet directly after the conventions bullet, so the two rule-bearing doc types sit together and the order agrees with the chart's first two columns. It states that a spec holds what the product commits to, that format and enforcement rules live in the specs convention (see: @lab43/q conventions/specs.md), and how grooming treats specs per Decision 7. It also carries the routing test a writer applies between the two rule-bearing doc types: a convention governs how code is written, a spec what a feature does, and a spec is written on purpose rather than recorded as a lesson surfaces (see: Decision 11). This bullet is where `/q:update-docs` and a reader deciding where a rule goes both look. Beside the kebab-case sentence at `:41`, state Decision 10: a taxonomy directory is read whole, subdirectories included.
2. Same doc, the docs index bullet at `:54`: the index carries every spec doc too, in a group of its own.
3. Same doc, Markers: "Four markers" becomes five. Add the `spec:` definition after `exception:`, per Decision 4. It states:
   - what the marker asserts
   - that the section is required
   - that it sits at the enforcing site, in that file's comment syntax
   - that it never sits in the documentation surface

   Then rewrite the three sentences that say only an exception reaches other files, so each names both markers: the placement sentence at `:95`, the comment-syntax sentence at `:100`, and the section-required sentence at `:105`. Keep the asymmetry: an exception may also sit in prose, and a spec marker never does.
4. Same doc, Documentation is the last rung: state that a spec's prose stays after a test holds it, pointing at the specs convention for the reason.
5. In `q-extension/conventions/principles.md`, Comments carry constraints, not justification: beside the exception sentence at `:34`, state that a spec marker passes the test because it tells the next reader the site enforces a commitment.
6. Write `q-extension/conventions/specs.md`: a title, a purpose intro, and the rules of Decisions 2, 3, 4 and 8, stated as rules to the consumer and never as decisions. Sections: the format, what a spec holds, enforcement, and disagreement. Name the two exits and who picks. State that amending a section means visiting every site marked with it. *(deviation: the Format section also states Decision 9, that specs are the project's own and an extension ships none. Without it, nothing in the payload told an extension author where specs may live.)*
7. In `q-extension/references/agent-briefing.md`: add the specs convention's index line to the template's q group. Add a `Specs:` group after the project's own, one line per spec doc, and the maintenance rule that indexes every spec doc and drops a line for a doc that is gone.
8. In `CLAUDE.md`: add the specs convention's index line to the q group. This repo has no `docs/specs/`, so no specs group.
9. In `README.md`, Markers: add a `(spec: X)` row after the exception row, in the table's raw-cell form (source: docs/conventions/documentation.md, Table cells that must not wrap). In the overview, after the paragraph headed "Decisions become conventions as you make them" at `:144`, add this paragraph, with a source marker to the taxonomy. This is where a human decides whether a rule is a convention or a spec:

   > **A convention records practice. A spec records a promise.** A convention says how code here gets written, and it grows out of the decisions you make while working. A spec says what a feature does, and you write it on purpose, before the code or as a deliberate change to it. Break a convention and the code is wrong. Break a spec and the product is wrong, unless you meant to change the promise, in which case the spec changes with it.
10. In `docs/workflow-chart/chart.html`: remove the opacity group and the "WIP" suffix from the specs column at `:266-269`, and delete the maintenance note at `:314`. Regenerate `light.png` and `dark.png` with `docs/workflow-chart/screenshot.py`, installing Playwright and Chromium locally as its docstring says. When that install is not possible on the implementing machine, ship the HTML change and record the stale images as a Caveat.

### Phase 2: The reviewer

1. In `q-extension/agents/adversarial-reviewer.md`, the description at `:3`: ground the reviewer in the project's conventions and specs.
2. Work review, conventions lens at `:33`: the lens reads the specs governing the artifact's territory beside the conventions, found from the index and from `spec:` markers in the changed files and the tests covering them. Add the three hunts of Decision 5. For the second, when the diff touches a spec section, grep the whole repo for markers naming it, since the sites that must move sit outside the diff. For the third, hold each site the diff adds against the governing specs the lens already read, asking whether removing it would let a commitment be broken. Add the BLOCKING shape with two exits, and the rule that deviating code never indicts a spec.
3. Plan review, rigor lens at `:43`: the lens reads the specs governing the plan's territory, and hunts a plan that would contradict one without scheduling the amendment.

### Phase 3: The skills

1. `q-extension/skills/create-plan/SKILL.md`, Step 1 item 2: read the specs governing the territory beside the conventions. Step 3: a plan's Context cites the governing spec sections as givens, and a plan that changes committed behavior schedules the spec edit in the phase that ships it (see: Decision 8).
2. `q-extension/skills/implement/SKILL.md`, Step 1 item 3, and `q-extension/skills/implement-plan/SKILL.md`, Step 1 item 3: read the specs governing the territory beside the conventions. *(deviation: `q-extension/skills/address-feedback/SKILL.md` Step 2 reads the same territory the same way and was changed too. Final review found it. A fix made for PR feedback would otherwise never read the governing spec.)*
3. `q-extension/skills/update-docs/SKILL.md`, Step 1: add a route for a spec change, taken only when the invocation names it, from the user or from a plan's scheduled step (see: Decision 11). A bare sweep never routes a lesson to a spec: a swept lesson that reads as a product commitment is reported to the user as a spec candidate and left unwritten. Add the spec path as its own step after Step 3: hold each statement to the admission test, find the spec doc whose feature owns it or create one with its intro and index line, and never send a spec statement to a stronger rung in place of the prose (see: Decision 3). Renumber the later steps.
4. `q-extension/skills/groom-docs/SKILL.md`, Step 1: rewrite the three inventory globs at `:21-24` as every markdown file under the directory, subdirectories included (see: Decision 10), and add `docs/specs/` on the same footing in spec mode. Step 2: extend the accuracy check with the inverted treatment of Decision 7, and add the marker audit as its own numbered check, matching the shape Decision 7 fixes and walking that same tree. Step 3: a commitment the code does not honor always goes to the user, reported as unmet rather than violated, since only the user knows whether it is in progress, missed, or regressed.
5. `q-extension/skills/review/SKILL.md`, Step 1: a spec doc in `docs/specs/` maps to a work review over the files carrying its `spec:` markers plus the spec itself, under both lenses.

## Verification

Load the plugin from this checkout into a scratch project with `claude --plugin-dir`, and in it write a one-section spec, a test carrying its marker, and code the test passes against. Then, through `/q:drive`:

- Break the code so it contradicts the spec, and confirm a bare `/q:review` reports the violation as BLOCKING, names the section, and names both exits. *(result: confirmed. Both lenses reported the one violation as BLOCKING against the Due dates section, named revert and amend as the exits, and left the ruling to the user.)*
- Amend the spec section and leave the test as it was, and confirm `/q:review` over the diff reports the marked test as a site that did not move. *(result: confirmed. The review reported the marked test and the marked guard as unmoved sites, BLOCKING, and moved both to the amended rule as the amendment's obligation.)*
- Confirm `/q:review docs/specs/<doc>.md` resolves to the marked test plus the spec, and reviews both. *(result: confirmed. The review resolved to the spec, the marked test, and the marked guard, and reviewed them under both lenses.)*
- Delete the spec section the marker names, and confirm grooming's marker audit reports the marker as dangling. The audit is exercised as the grep Step 2 of the skill specifies, since a full grooming run delivers a pull request of its own. *(result: confirmed. The grep reported the marker as naming a section the doc no longer holds.)*
