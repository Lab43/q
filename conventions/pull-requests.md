# Pull Requests

Rules for authoring a pull request. Hold its prose to the writing rules (see: q conventions/writing.md). Sign the body and every comment on it: "— Claude 🤖" (source: q conventions/writing.md, Sign what you post). A project's own PR conventions win over this doc (source: q conventions/documentation.md, Two tiers of conventions), and so does a PR template in the repo.

## Title

The title names the work the PR delivers.

## Body

A PR has two goals, in order: make the change easy for a human to review, and prove it does what it says. Every sentence in the body:

- Serves one of the two goals.
- Assumes no session context — the future reader arriving through git history has none, however much today's reviewer knows.

Describe the change, never the run that produced it. Review rounds, rulings, and session events are the run's story, not the change's.

## Sections

Compose the body from these sections, in order. Most PRs need only Summary and Testing. Add another section only when it has something the reviewer needs.

- **Summary** — the rubric the reviewer checks the diff against: what is true after merge that wasn't before, and why. State outcomes, not edits: one claim per deliverable, each something the reader can now rely on. The diff is the catalog of changes. When the diff is large, say where the substance lives and which files are mechanical fallout. The Summary links the work's source: the tracker item when one exists (source: q conventions/issue-tracking.md, Work links back), and the plan doc when the PR implements a plan. Where the tracker closes an item from the link's wording, word it to close only in the PR whose merge finishes the item — the last layer of a stack, the only PR otherwise. Every other layer links the item without closing it, or the first merge closes work the rest of the stack hasn't delivered.
- **Callouts** — answers to the questions the diff will raise:
  - Choices that look wrong but are deliberate.
  - Expected changes deliberately not made.
  - Close calls the author wants checked.
  - Rules added to or changed in standing law that the PR's purpose doesn't explain — the diff shows the rule, not the problem that prompted it.

  Each entry states the question's answer and its reason. A call no reviewer would question is noise here. Callouts also reach the reviewer on the diff itself (see: Diff comments).
- **Caveats** — the known problems shipping with the change. The reviewer shouldn't spend effort discovering what the author already knows.
- **Follow-ups** — the work this change obligates: what a reviewer would otherwise ask "doesn't this mean X needs doing?". Link each to its tracker item when one exists — the body informs the reviewer, but nobody returns to a merged body to collect work, so the tracker carries it. Work the session surfaced that this change doesn't obligate goes to the tracker alone.
- **Testing** — the evidence the diff doesn't carry: what was exercised and what it demonstrated, claim by claim. The project's standing checks prove nothing about this change and go unlisted. When the diff's own tests are the whole proof, say so.

## Diff comments

Post a callout about a specific change also as a comment on its line of the diff, so the reviewer meets it in place. A callout not tied to a specific change needs no comment. Give the comment only what a reader needs to understand why that change was made — the anchor already says where and what, so no labels and no framing.
