---
status: pending
delivery: stacked
tracks:
  - https://github.com/Lab43/q/issues/91
  - https://github.com/Lab43/q/issues/94
---

# Site Exceptions and Test Enforcement

## Goal

Give q a way to excuse one site from a convention, and move the existence half of the testing rule onto `npm run check`.

A project can record that one rule replaces another. It cannot record that one site is legitimately outside a rule. The only moves available are to weaken the convention until the code fits, or to leave the deviation unmarked. A fourth marker, `(exception:)`, records the excuse where the next editor stands. It also makes exceptions countable by rule, so several exceptions to one rule become evidence the rule itself wants revisiting.

The mechanical check rides with the marker because it depends on it. `docs/conventions/testing.md` holds its existence rule in prose, the weakest enforcement rung. It holds it there because a check would fail on files legitimately outside the rule, and nothing could excuse them. Once the marker exists the check can honour an exception, and the prose keeps only the judgement.

## Context

### The marker set today

- `conventions/documentation.md:84` opens the list with "Three markers, all ordinary language:". The definitions follow at `:86-88`.
- The shared grammar is `(verb: target)` or `(verb: target, section)` (`conventions/documentation.md:76`). The permitted targets are a heading in the current doc, a repo file or directory, or a package doc path (`:78-80`).
- A marker may sit in an HTML comment in docs rendered for humans (`conventions/documentation.md:82`). No file type outside markdown is contemplated.
- `conventions/documentation.md:74` records what grooming owes a marker: "a marked restatement or deviation is checked against its target rather than re-flagged as duplication or drift on every run."
- `conventions/documentation.md:16` reads "No other override mechanism exists or is needed". It sits in the Three tiers section, which governs how a project overrides a q rule.
- `README.md:171-175` carries the marker table for humans. Its intro at `:169` names three relationships: point at, copy, disagree with. The table is a marked restatement of the policy (`README.md:166`).

### What reads markers today

- `skills/groom-docs/SKILL.md:11` greps `docs/conventions/` for `(overrides:` and nothing else.
- `skills/groom-docs/SKILL.md:33` reports a project statement differing from a q rule "without an overrides marker naming it" as drift or an unrecorded deviation.
- `skills/groom-docs/SKILL.md:21-26` builds the grooming surface from markdown only. Code files are not on it.
- `skills/upstream/SKILL.md:16` gathers candidates by grepping `docs/conventions/` for `(overrides:`. The grep names that marker literally.
- `agents/adversarial-reviewer.md:31` instructs the conventions lens to grep sibling sites on a code-versus-rule conflict: "many sites deviating the same way indicts the rule, one site indicts the code". Nothing tells it to read an in-file marker.
- `skills/update/SKILL.md:50-53` reconciles overrides and `(source:)` restatements when a pin moves.
- `skills/uninstall-extension/SKILL.md:37` greps "the docs the documentation policy owns" for a removed extension's name, naming an overrides marker's target as one kind of hit.
- `skills/install/SKILL.md:149` reports the overrides markers a newly installed extension's docs carry against q's rules, as deviations the project now lives under.

### Constraints the solution must respect

- `docs/conventions/documentation.md:24-26`, "Structure is earned", names "a new marker" among the structures it gates. The stated bar is that the structure do work plain prose cannot, and that markers earn their keep by being greppable.
- `conventions/principles.md:32` tests a comment by whether it changes how the next reader edits the site. `:36` bans comments that defend a design choice.
- `conventions/principles.md:39-41` puts a rule on the strongest rung that can hold it, and documentation last.
- `conventions/extensions.md:42` draws a line an extension author follows: "Deviations, overrides, and upstreaming are for rules you consume, not rules you author."
- The marker is framework payload, so it is addressed solely to consumers and never mentions this repo (source: docs/conventions/documentation.md, The tier test).

### The gap is already costing something

`.markdownlint-cli2.jsonc:6-9` disables MD041 across the whole repo. Its comment records why: "Scoping this to agents/ would need a config file inside agents/, which ships to consumers in the npm package." A rule was weakened repo-wide because no site-level excuse existed.

### What carries tests today

`docs/conventions/testing.md`, "What carries tests", states "Every executable this repo carries has committed tests."

Tracked files this repo executes, and their tests:

- `hooks/session-start.mjs` and `hooks/session-start.sh` — covered by `test/session-start.test.mjs`. The suite runs the wrapper through `test/helpers.mjs:97` and holds the two files' messages against each other at `test/session-start.test.mjs:295`.
- `scripts/check-frontmatter.mjs` — covered by `test/check-frontmatter.test.mjs`.
- `scripts/check-versions.mjs`, `scripts/manifests.mjs`, `scripts/set-version.mjs` — no tests.
- `docs/workflow-chart/screenshot.py` — no tests. It drives Playwright and Chromium to regenerate the chart images.
- `.husky/pre-commit` — no tests. It is one line running `npm run check`.

Verified by listing every tracked non-documentation file (`git ls-files`) and matching each against `test/`. No other executable is missing tests.

### Exemplars for the new check

- `scripts/check-frontmatter.mjs` is the model for a check script. Load-bearing: the walk with its skip sets (`:17-31`), the failure list carrying `file:line` strings (`:38`, `:53`), the exit-1 report (`:75-79`), and the summary line on success (`:81`).
- `test/helpers.mjs:122-138` is the model for staging a check. Load-bearing: copying the real script into a temporary tree rather than importing it, and the comment at `:116-120` explaining why `node_modules` is staged as a real directory.
- `test/check-frontmatter.test.mjs:15-25` is the model for the accept and reject assertions.

### The tree

`npm run check` passes: 64 tests, 12 suites, no failures. Every citation above is against `cb4fb7e`, verified there.

## Decisions

1. **Add a fourth marker rather than stretching an existing one.** `(overrides:)` asserts that this rule replaces that rule, and `skills/upstream/SKILL.md:16` harvests one as evidence the upstream rule may be wrong. A site exception asserts the opposite: the rule is right, this one case is unusual. Stretching `(overrides:)` across both would make upstream's job wrong.

   The marker clears the "Structure is earned" bar on countability. A plain colocated comment already carries a reason (see: @lab43/q conventions/principles.md, Colocate knowledge with its next reader), so a reason alone is not new work. What a comment cannot do is be counted by the rule it excuses, which is what turns a pile of individual excuses into a verdict on the rule.

   Rejected: resting the case on the exemplar carve-out at `conventions/documentation.md:94`. That carve-out excuses every exemplar reference everywhere, which is a class, not a site. A site marker could not replace it without stamping every exemplar reference individually. The carve-out is law scoping law, and it stays as written.

2. **The marker is `(exception: <doc>, <section>)`, and both parts are required.** The section is mandatory here, unlike the other three markers, because a doc-level target cannot be counted by rule. The reason is the sentence or comment the marker sits in, mirroring how a deviation carries its rationale today (`conventions/documentation.md:13`).

   The two requirements are enforced on different rungs, because only one of them is mechanical. `check-tests.mjs` rejects a marker that names no section. Whether a reason is present and still true is a judgement, so it falls to the readers: the conventions lens refuses to let a bare marker answer a finding, and `/q:groom-docs` reports one. A marker with no reason excuses nothing. *(deviation: the readers report a marker naming no section too. `check-tests.mjs` is this repo's own check and never ships, so in a consuming project nothing else would catch one.)*

   Rejected: carrying the reason inside the parenthetical. It breaks the `(verb: target, section)` shape the other three share.

3. **One marker serves prose and code alike.** A site excused from a rule may be a passage in a doc or a line in a script, and the marker reads the same in both. `conventions/documentation.md:82` already sanctions a marker inside an HTML comment, so a code comment is the same move for a different file type. One form also means one grep: two forms would split the count that Decision 1 rests on.

4. **`/q:groom-docs` counts, the adversarial reviewer answers, and no threshold is fixed.** Grooming already audits periodically and already escalates findings for the user's ruling, so the count belongs there. The reviewer already greps sibling sites for the same judgement (`agents/adversarial-reviewer.md:31`); the marker gives it a durable record instead of a re-derivation, and its existing FOLLOW-UP path carries a rule the count indicts. Grooming reports the grouped count and the user rules on it. A fixed number would be invented structure with nothing behind it.

   `/q:upstream` is not changed. Its grep at `skills/upstream/SKILL.md:16` already names `(overrides:` literally, so exceptions are never harvested. Rejected: adding prose to say so, which would defend against a future edit rather than serve the reader.

5. **Sharpen `conventions/documentation.md:16` rather than carve an opening in it.** The sentence rules on how a project overrides a rule, and an exception is not an override. Rewriting it to say what it governs removes a false absolute without weakening anything.

   `conventions/principles.md` gets one sentence, not an exemption. An exception's reason passes that doc's own test at `:32`: it stops the next reader removing the deviation. The sentence exists so a reviewer does not cite `:36` against it.

6. **The check discovers what this repo executes locally.** Covered: `.mjs`, `.sh` and `.py` files, plus every file under `.husky/` outside husky's own `.husky/_/`. Skipped: `test/`, `node_modules/`, `.git/`, `.claude/worktrees/` and `.github/`. A file passes when `test/<basename>.test.mjs` exists, or when it carries an exception naming a section of `docs/conventions/testing.md`. Basename matching already reflects how the repo works: `session-start.sh` and `session-start.mjs` share one suite.

   `.github/workflows/` is out because GitHub executes those files, not this repo, and no local harness runs one (see: Out of scope).

   Rejected: discovering through `git ls-files`. It would remove the skip sets, but every test would then have to `git init` its staged tree.

   Rejected: extracting a shared skip list from `scripts/check-frontmatter.mjs:17-18`. That list covers markdown files and tracks markdownlint's ignores; this one covers executables and adds `test/` and `.github/`. The two resemble each other without being the same (source: @lab43/q conventions/principles.md, Copying is the signal to extract).

7. **Both of the remaining untested sites take exceptions.** `docs/workflow-chart/screenshot.py` needs a browser that CI does not install, and a test could only assert that two images get written. `.husky/pre-commit` is one line delegating to `npm run check`, and a test could only assert the file contains that line. Testing either would bend the design around the tooling (source: @lab43/q conventions/principles.md, Tooling limitations never dictate content).

   This puts two exceptions against one rule the day the mechanism lands, which is the accumulation signal Decision 4 describes. That is left standing rather than pre-empted. Narrowing the rule now would settle by assumption what the mechanism exists to settle by evidence, and it would ship the marker with no first user.

8. **This plan writes the three version scripts' tests, absorbing issue #94.** The check fails on any untested executable, so it could not merge while `check-versions.mjs`, `manifests.mjs` and `set-version.mjs` lacked tests. Absorbing them removes the dependency. Issuing them exceptions instead was rejected by #94's own reasoning: a wrong version bump is not obvious when it happens, which is the case the testing rule exists for.

   `scripts/manifests.mjs` gets its own suite rather than coverage through its callers, so the check's discovery stays simple. It is written for import, so a test imports it — the rule against test-only seams (see: docs/conventions/testing.md, Test the shipped file, not a copy of its logic) targets executables that locate their inputs relative to themselves.

   That suite covers the module's pure export only. `helpers(script)` builds a `fail` that calls `process.exit(1)` (`scripts/manifests.mjs:26-30`), so an in-process call never returns and no assertion after it would run. Its failure output is observable only from outside the process, which is what the two script suites already do.

9. **Three stacked pull requests.** The whole change spans framework law, seven skill and agent files, four test suites and a new check. That is past one sitting. The divisions fall at seams: the mechanism, the absorbed tests, the check that needs both.

   Phases 1 and 2 share a pull request deliberately. Shipping the law alone would define a marker that `/q:groom-docs` still reports as drift.

## Out of scope

- **The CI workflows** — deferred. `.github/workflows/checks.yml` and `.github/workflows/release.yml` carry inline shell guards with no tests, and `release.yml` publishes to npm. Whether they belong under the testing rule is its own question, tracked in its own issue rather than settled here.
- **Grooming code files** — declined. Decision 4's count is a targeted grep for one marker, not a grooming pass. `/q:groom-docs` keeps the surface it has (`skills/groom-docs/SKILL.md:21-26`).
- **Amending `docs/conventions/testing.md`'s rule** — deferred. Decision 7 leaves the accumulation standing so the user rules on it with evidence.
- **Rescoping the repo-wide MD041 disable** — deferred. It is cited above as evidence the gap already costs something, which makes it look like a target. It is not one here. The marker records an excuse a reader or a q skill honours, and nothing teaches a third-party lint tool to read it, so narrowing that disable needs its own design.

## Phases

### Pull request 1 — the mechanism

#### Phase 1: Define the marker

1. In `conventions/documentation.md`, Markers: change "Three markers, all ordinary language:" to four and add the `(exception: X)` bullet after `(overrides: X)`. State that it excuses this one site from the named rule, that the rule itself stands, and that accumulation against one rule is a signal the rule wants revisiting.
2. In the same section, record that the exception marker requires its section, unlike the other three, and that its reason is the text it sits in.
3. Rewrite the HTML-comment sentence at `conventions/documentation.md:82` so it covers a marker in a code comment, in any file type. *(deviation: the code-comment home is granted to the exception marker alone. Granting it to all four would sanction a `(source:)` or `(overrides:)` marker in a script, where nothing reads it — the readers this plan teaches reach code for exceptions only, so the Markers section's promise that a marked restatement is checked against its target would have been false at a location the law itself invited.)*
4. Rewrite `conventions/documentation.md:16` per Decision 5, so it rules on overriding a rule rather than on every mechanism.
5. In `conventions/principles.md`, "Comments carry constraints, not justification": add the sentence from Decision 5.
6. In `conventions/extensions.md`, Authoring: extend the line at `:42` so an extension's own sites may carry an exception to a rule it consumes, while a rule it authors is edited instead.
7. In `README.md`, add the fourth row to the markers table and extend the intro at `:169`, which names three relationships.

No briefing index line changes: no doc's intro moves in this phase.

*(deviation: review turned up four edits no step names. `conventions/documentation.md` gained the grooming obligation exceptions were owed, the spent-and-retarget lifecycle the readers were acting on without a home, and a carve-out letting a marker example name an illustrative path — the must-exist rule would otherwise report the examples this plan writes as dead references. `docs/conventions/documentation.md`'s "Structure is earned" gate had stated the markers' bar as greppability alone, which is not the bar this marker was judged against.)*

#### Phase 2: Teach the readers

1. In `agents/adversarial-reviewer.md:31`, conventions lens: before reporting a site against a rule, read the site for an exception naming that rule. A marker carrying a reason answers the finding. A bare one does not — report it, because a marker with no reason is the convention being skipped rather than excused. Keep the sibling-grep clause, and record that a marked exception is the durable form of the evidence it hunts for. *(deviation: the marker instruction went into the shared Work review preamble instead, so both lenses read it. The correctness lens hunts missing test coverage on its own, and would have reported Phase 4's two marked sites with nothing answering it. The preamble also rules that a marker the diff introduces is judged rather than honoured, closing the hole where a change excuses itself by adding one.)*
2. In `skills/groom-docs/SKILL.md:11`, rubric item 2: add exception markers to the project's recorded rulings, and state that their grep covers the repo rather than `docs/conventions/`. *(deviation: the item names exceptions as recorded rulings and gives them no grep. Every fan-out subagent reads the rubric, so a repo-wide grep there would run once per check, duplicating the accumulation check that owns it. The item also keeps exceptions clear of "These win over both", which would have read an exception as precedence when it is the opposite of an override.)*
3. In `skills/groom-docs/SKILL.md:33`, the cross-tier duplication sweep: a site carrying an exception naming the rule is not drift.
4. In `skills/groom-docs/SKILL.md` Step 2, add a check for exception accumulation. It greps the repo for `(exception:`, groups the hits by the rule each names, and reports every rule carrying more than one for the user's ruling. It also reports any marker carrying no reason, and any whose reason no longer holds. State that this grep is not a grooming pass over code. *(deviation: the pattern matches the verb, a colon, and a doc path instead. Requiring the parentheses would miss every marker in a code comment, where they are dropped, and both of Phase 4's markers sit in one. Matching the bare word instead reported ordinary English as a malformed marker — `docs/conventions/skills.md:45` was a live false hit. The check also reports a marker whose named doc or section does not exist, which nothing else catches.)*
5. In `skills/update-docs/SKILL.md:30`, gate 2: when the lesson is that one site sits outside a rule, the comment it becomes carries an exception marker. *(deviation: gate 2 also gained the extension-authoring caveat. Gate 2 routes a one-site lesson to a comment and can exit before gate 4 is consulted, so a session authoring an extension would have stamped an exception against a rule that extension ships — which Phase 1 step 6's change to `conventions/extensions.md` bans.)*
6. In `skills/review/SKILL.md:37`, the sweep for lessons: a rejected finding whose reason is that this one site is legitimately outside a rule is recorded as an exception at the site. *(deviation: the step names the case as a lesson and leaves the marker to `/q:update-docs`. Writing the marker here would pre-classify the lesson, which the run contract gives to that skill, and would route a marker in a code file around the gate this plan just taught it.)*
7. In `skills/update/SKILL.md:50-53`, the changed-`conventions/` bullets: re-check exception markers whose target rule changed, and remove one whose target moved or disappeared. *(deviation: a marker whose rule merely moved is retargeted, not removed. Removing it would strip a still-valid excuse on an upstream section rename and leave the site as an unmarked deviation. Removal is kept for an exception that is spent — its rule gone, or changed to admit the site. The step's lead-in was rewritten to reach the exception markers the project's code carries, since it otherwise scoped the whole list to docs. The spent-and-retarget lifecycle went into `conventions/documentation.md` first, because these bullets restate law and it had no home there.)*
8. In `skills/uninstall-extension/SKILL.md:37`, Step 4: add exception markers to the kinds of hit the grep is looking for, and widen that grep past the policy-owned docs, since an exception can sit in a code file.
9. In `skills/install/SKILL.md:149`, the extension run's closing report: report the exception markers a newly installed extension carries alongside its overrides markers. An extension's sites can sit outside a q rule it consumes, and the project takes those on with it.

### Pull request 2 — the absorbed tests

#### Phase 3: Test the version scripts

Closes issue #94.

1. Add a staging helper to `test/helpers.mjs` on the model of `stageFrontmatter` (`:122-138`): copy the real script and `scripts/manifests.mjs` into a temporary tree, and write the manifests the case needs. Keep the real-directory `node_modules` treatment and the comment explaining it.
2. Write `test/check-versions.test.mjs`. Cover every version-carrying file agreeing, each one disagreeing in turn, one missing, one holding invalid JSON, one naming no version, and the lockfile disagreeing at either of its two version fields. The missing and unparseable cases are also what pin `helpers(script)`'s failure output, since the script names itself in every message it prints.
3. Write `test/set-version.test.mjs`. Cover each of major, minor and patch, a target that is missing, a target that is unparseable, a version that is not `major.minor.patch`, and the all-or-nothing property — every version-carrying file moves, or none does.
4. Write `test/manifests.test.mjs`, importing the module. Cover `lockVersions` against a lockfile carrying both fields and against one missing `packages[""]`. Leave `helpers(script)`'s failure output to steps 2 and 3, which observe it across a process boundary, per Decision 8.
5. Write each suite against however many files carry the version, never against a count.
6. Break each script deliberately and confirm the suite goes red, once per branch the suite claims to cover (source: docs/conventions/testing.md, Show the suite failing). Mutate the staging helper too.

### Pull request 3 — the check

#### Phase 4: Enforce that executables carry tests

Closes issue #91, whose second half is this check.

Re-derive the executable inventory before writing anything. Context's list was true at `cb4fb7e`, and work adding executables was in flight while this plan was written. Every executable the check discovers needs a test or an exception inside this phase, or the phase does not end green.

1. Write `scripts/check-tests.mjs`, modelled on `scripts/check-frontmatter.mjs`. Walk the tree per Decision 6's discovery and skip sets. Report each failure as `file:line`, exit 1 on any failure, and print a summary line on success. Fail a marker that names no section. Carry the rule's rationale in the script's header comment, where the reader who would weaken it stands (source: @lab43/q conventions/documentation.md, Documentation is the last rung).
2. Add `check-tests` to `package.json`'s scripts and into the `check` chain.
3. Add a staging helper for it to `test/helpers.mjs`, and write `test/check-tests.test.mjs`. Cover an executable with its test, one without, one carrying a valid exception, one carrying a marker with no section, each skipped directory, and a `.husky/` file against `.husky/_/`.
4. Mark `docs/workflow-chart/screenshot.py` and `.husky/pre-commit` with exception markers and their reasons, per Decision 7.
5. Rewrite `docs/conventions/testing.md`, "What carries tests", rather than cutting a line out of it (source: @lab43/q conventions/writing.md, Refine rather than append). The existence obligation goes, because the check holds it now. What stays is the judgement the check cannot make: what a test has to exercise, and why verification that does not survive the session counts for nothing. Keep the heading — it is what the two exception markers target.
6. Break the check deliberately and confirm its suite goes red, once per branch.

## Verification

- `npm run check` passes, with `check-tests` reporting two marked exceptions.
- Delete `test/check-versions.test.mjs` and confirm `check-tests` names it and fails. Restore it.
- Strip the section from one of the two exception markers and confirm `check-tests` fails. Restore it.
- Run `/q:groom-docs` and confirm its accumulation check reports `docs/conventions/testing.md`, What carries tests, as carrying two exceptions. *(deviation: the run's clarification settled this as the grep Step 2 of the skill specifies, rather than a full grooming run. The skill audits the whole documentation surface and ships a pull request of its own, which is past what this plan delivers.)*
- Run `/q:review` over `docs/workflow-chart/screenshot.py` and confirm the conventions lens answers with the marker instead of reporting a missing suite. *(deviation: the run's clarification settled this as a `q:adversarial-reviewer` conventions-lens review of the file, which is the machinery the skill delegates to. The skill itself is conversational and ships a pull request of its own.)*
- Strip the reason from that same marker, leaving the marker itself intact, and run `/q:review` again. The conventions lens must report the site rather than accept the marker. Restore the reason. *(deviation: settled the same way as the bullet above.)*
