# Issue Tracking

Rules for working a project's issue tracker — the shared source of work items — from any session. Sign every item you file and every comment you post: "— Claude 🤖" (source: @lab43/q conventions/writing.md, Sign what you post). A project's own tracker conventions win over this doc (source: @lab43/q conventions/documentation.md, Three tiers of conventions), and so does an issue template the tracker carries.

## Respect existing claims

An item assigned to someone else, marked in progress or blocked, or with a fix already in review is not available to pick up. A claim that looks stale — long untouched, its PR closed unmerged — may be wrong: surface it to the user rather than working the item or silently passing it by.

## Claim what you work

Picking up a tracker item means assigning it to the user and moving it to the tracker's working status — on the user's agreement, asked once per session and carried forward.

## Ask before filing

Filing a new tracker item — the follow-up work a session surfaces — happens on the user's agreement, given per item rather than once per session. Ask the session's candidates together, in one batch. Each candidate is one piece of work. A bundled item gets half fixed and stays open. Write each agreed item to the authoring rules (see: Write for whoever picks it up).

## Write for whoever picks it up

Whoever reads an item holds none of the context that produced it. Hold its prose to the writing rules (see: @lab43/q conventions/writing.md).

Four readers act on an item, each deciding something different:

- Whoever ranks the tracker decides whether the work is worth doing, and when.
- Whoever picks it up decides what to build.
- Whoever reviews the result decides whether the item is done.
- Whoever hits the same symptom later decides whether this item is their problem.

Name the work the item asks for in the title. The first reader and the last meet the title alone, and decide from it whether to open the item at all.

### Sections

Compose the body from these sections, in order. Most items need only Goal. Add another only when it has something a reader needs. A body carrying only a Goal needs no headings. Head each section once it carries more.

- **Goal** — what the problem is and why it needs solving. For a bug, the behavior that should hold instead.
- **Evidence** — what a reader can check: the reproduction, the `file:line`, the rule the behavior contradicts, a link to the error log or dashboard showing it. Paste an error message verbatim as well as linking to it. Whoever hits the same symptom searches for that string, and a log link ages out while the item stays open.
- **Constraints** — what the work must respect and what is already ruled out: the limits found, the dead ends walked, anything deliberately excluded.
- **Callouts** — answers to the questions whoever picks it up will ask: an approach noticed but not settled, a question the run will have to answer, a suspected duplicate. Nothing here binds. The run that takes the item rules on all of it. Something nobody would ask about is noise here.
- **Closed when** — what is true once the item is closed. A closing condition left to guess gets the item closed wrong, or not at all.

Cut the story of the session that surfaced the item. It belongs to none of these sections.

### State the goal, not the solution

Leave the fix to the run that takes the item. A spelled-out fix is the most perishable thing an item can carry. It was written without the current code in front of the author. The run that picks the item up then reads it as a premise instead of deriving its own, and the work starts from an assumption nobody checked.

What was found while writing the item still belongs, stated as a finding rather than a direction (see: Sections). Where the approach was already decided, state it and say what decided it.

### The body is the work as intended

While an item sits unclaimed, keep the body currently true. Fold in whatever changes what the item asks for, so nobody reconstructs the ask by reading the thread in order. What someone reported seeing stays as they wrote it. Folding in changes the ask, never the account. Edit the body on the user's agreement, as with claiming and commenting.

Once the item is claimed (see: Claim what you work), the body freezes. Everything a run learns from then on goes in a comment. Planning is work like any other, so a `/q:create-plan` run is under the freeze too. The body is the rubric the work is checked against, and a run that edits it moves its own goalposts.

## Work links back

The PR addressing an item links to it from the PR body; when the tracker doesn't pick that link up automatically, comment the PR's link on the item — on the user's agreement, asked once per session and carried forward.
