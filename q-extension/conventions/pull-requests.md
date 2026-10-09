# Pull Requests

Rules for authoring a pull request. Hold its prose to the writing rules (see: @lab43/q conventions/writing.md). Sign the body and every comment or reply on it: "— Claude 🤖", except a body Claude Code has already ended with its own attribution line (source: @lab43/q conventions/writing.md, Sign what you post). A project's own PR conventions win over this doc (source: @lab43/q conventions/conventions.md, Three tiers of conventions), and so does a PR template in the repo.

## Draft

Open the PR as a draft when the project's root `package.json` declares it:

```json
"q": { "draftPullRequests": true }
```

A team sets it so the author reviews the PR before anyone else does. Marking it ready is the author's signal that the team's review can start, so leave the PR a draft.

## Title

The title names the work the PR delivers.

## Body

A PR has two goals, in order: make the change easy for a human to review, and prove it does what it says. Every sentence in the body:

- Serves one of the two goals.
- Assumes no session context — the future reader arriving through git history has none, however much today's reviewer knows.

Describe the change, never the run that produced it. The run's story is not the change's:

- review rounds
- rulings
- session events
- the plan the run followed

The body stands without the plan: a reviewer who never opens it still learns what the PR delivers and why.

## Sections

Compose the body from these sections, in order. Most PRs need only Summary and Testing. Add another section only when it has something the reviewer needs.

- **Summary** — the rubric the reviewer checks the diff against. Open with what the change is and why the project wants it, then what is true after merge that wasn't before. State outcomes, not edits: one claim per deliverable, each something the reader can now rely on. The diff is the catalog of changes. When the diff is large, say where the substance lives and which files are mechanical fallout. The work's source comes after the outcomes, for the reader who wants the history behind them: the tracker item when one exists (source: @lab43/q conventions/issue-tracking.md, Work links back), and the plan doc when the PR implements a plan. Where the tracker closes an item from the link's wording, word it to close only in the PR whose merge finishes the item — the last layer of a stack, the only PR otherwise. Every other layer links the item without closing it, or the first merge closes work the rest of the stack hasn't delivered.
- **Callouts** — answers to the questions the diff will raise:
  - Choices that look wrong but are deliberate.
  - Expected changes deliberately not made.
  - Close calls the author wants checked.
  - Rules added to or changed in standing law that the PR's purpose doesn't explain — the diff shows the rule, not the problem that prompted it.

  Each entry states the question's answer and its reason. A call no reviewer would question is noise here. Callouts also reach the reviewer on the diff itself (see: Diff comments).
- **Caveats** — the known problems shipping with the change. The reviewer shouldn't spend effort discovering what the author already knows.
- **Follow-ups** — the work this change obligates: what a reviewer would otherwise ask "doesn't this mean X needs doing?". Link each to its tracker item when one exists — the body informs the reviewer, but nobody returns to a merged body to collect work, so the tracker carries it. Work the session surfaced that this change doesn't obligate goes to the tracker alone.
- **Testing** — the evidence the diff doesn't carry: what was exercised and what it demonstrated, claim by claim, shown as well as told when the change can be seen (see: Screenshots and recordings). The project's standing checks prove nothing about this change and go unlisted. When the diff's own tests are the whole proof, say so.

## Screenshots and recordings

Show a change a person sees on screen in the Testing section:

- a screenshot for a state
- a recording for a flow, an animation, or an interaction
- for a bug fix, the same steps before and after: first showing the bug, then not

Show only what the change touched. A change with nothing on screen to see carries none.

Attach each file with `--attach` on `gh pr create` or `gh pr edit`. Reference the file's local path where it belongs in the body, and `gh` replaces the path with the uploaded file's URL. The flag needs `gh` 2.99 or later. On an older `gh`, stop and ask the user to upgrade.

## Diff comments

Post a callout about a specific change also as a comment on its line of the diff, so the reviewer meets it in place. A callout not tied to a specific change needs no comment. Give the comment only what a reader needs to understand why that change was made — the anchor already says where and what, so no labels and no framing. The signature still closes it, being neither label nor framing (source: @lab43/q conventions/writing.md, Sign what you post).
