# Issue Tracking

Rules for working a project's issue tracker — the shared source of work items — from any session. Sign every item you file and every comment you post: "— Claude 🤖" (source: q conventions/writing.md, Sign what you post).

## Respect existing claims

An item assigned to someone else, marked in progress or blocked, or with a fix already in review is not available to pick up. A claim that looks stale — long untouched, its PR closed unmerged — may be wrong: surface it to the user rather than working the item or silently passing it by.

## Claim what you work

Picking up a tracker item means assigning it to the user and moving it to the tracker's working status — on the user's agreement, asked once per session and carried forward.

## Ask before filing

Filing a new tracker item — the follow-up work a session surfaces — happens on the user's agreement, given per item rather than once per session. Ask the session's candidates together, in one batch. Each candidate is one piece of work. A bundled item gets half fixed and stays open. Write each agreed item to the authoring rules (see: Write for whoever picks it up).

## Write for whoever picks it up

An item is read by a session holding none of the context that produced it. Hold its prose to the writing rules (see: q conventions/writing.md).

- Name the work the item asks for in the title. A reader deciding what to open sees the title, not the body.
- Back the item with what can be checked: the error text, the reproduction, the `file:line`.
- Say what would be true once the item is closed. A closing condition left to guess gets the item closed wrong, or not at all.
- Leave the fix to the run that takes the item. Where the approach was already decided, state it and say what decided it.

## Work links back

The PR addressing an item links to it from the PR body; when the tracker doesn't pick that link up automatically, comment the PR's link on the item — on the user's agreement, asked once per session and carried forward.
