---
name: triage
description: Choose what to work on next from a set of items — a Jira board, GitHub issues, a Notion doc, a file or pasted list — and work through it one pick at a time. Priority guidelines steer the ranking when given ("newest first"). Each agreed pick runs as a /q:tackle cycle in this session, claimed in the source (assignee, status) only with the user's agreement. For a single known item, invoke /q:tackle directly.
---

# Triage

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **Triage ranks, tackle grounds**: judge items on what the source says — titles, descriptions, labels, dates — never by exploring the code. Grounding an item against the codebase is the first step of its tackle cycle, not a triage cost paid across the whole set.
- **Conventions govern the tracker**: read and follow the issue-tracking conventions (see: @lab43/q conventions/issue-tracking.md), plus any project rulings, which win. Never re-ask what they settle.
- **Track the session**: keep a scratchpad note of the session's agreements (review mode, write-backs, priority guidelines) and each item's outcome. An outcome is the PR, plan, or nothing-to-do verdict the tackle cycle produced, or that the user skipped the item. Ranking and the closing recap read from this note, and it keeps the loop intact when earlier cycles are compacted away.

## Step 1: Read the set

The set comes from the invocation — a Jira board or filter, a GitHub repo's issues, a Notion doc, a file, a pasted list; given nothing, ask what to triage. Read it with whatever tool serves the source, fetching summaries rather than full item histories. Note any priority guidelines the invocation carries.

Read the priority the user set, when the source records one — a hand-ordered position, a priority field, a label. A default listing order is not one: creation date and ID say nothing about priority. A fetch can drop fields silently. Confirm the call you use preserves the priority and carries descriptions, labels, dates, assignees. A GitHub milestone records its priority as a hand-ordered position. That order comes back only through GraphQL:

```bash
gh api graphql -f query='{repository(owner:"<owner>",name:"<repo>"){milestones(query:"<milestone-title>",first:10){nodes{title issues(first:100,states:OPEN){nodes{number title body labels(first:20){nodes{name}} assignees(first:10){nodes{login}} createdAt updatedAt}}}}}}'
```

`milestones(query:)` matches titles by substring, so take the node whose title is the one you were given. `gh issue list --milestone` returns creation order instead. Omitting `states: OPEN` pulls in the milestone's closed issues.

Set aside items not available to pick up rather than proposing them (source: @lab43/q conventions/issue-tracking.md, Respect existing claims). Check the project's open PRs (`gh pr list`) against the set — the source may not show a fix in review. Ask the peers what work items they hold, and set those aside too (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Working alongside a peer). Any session holds an item, not just another triage run — a `/q:tackle` invoked straight on an issue holds it too. A peer triaging the same set holds no item until it picks. Never divide the set between sessions. Never ask the user to resolve the overlap. Name the set-asides once; the user can pull any back in.

## Step 2: Settle the session

In conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Collaboration modes), settle the session in one batch of questions:

- The review mode every tackle cycle will run under (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Review modes).
- The write-backs the issue-tracking conventions gate on a session-wide agreement: claiming each agreed pick, commenting PR links (see: @lab43/q conventions/issue-tracking.md). Skip what the source can't support and what conventions already settle.
- Anything about the set itself that ranking genuinely turns on.

Settle each answer once and don't re-ask it per item, though the user may change any answer between items. Don't ask for priority guidelines when none were given. Rank on the first of these the set gives you:

- the priority guidelines the invocation carries
- the priority the user set in the source
- your own judgment

State the basis with each proposal so the user can redirect it.

## Step 3: Propose and hand off

Rank what remains — items neither picked nor skipped this session — and take the top one. Announce it to the peers before proposing it: you hold an item from the moment you pick it, so no two sessions spend a conversation scoping the same one. Then propose it: the recommended item, why it's next under the guidelines (or the stated basis), and the runners-up. When a set-aside would outrank the pick, or an item's claim looks stale, flag it alongside the proposal: the status may be wrong, and the user rules (source: @lab43/q conventions/issue-tracking.md, Respect existing claims). The user may agree, pick a different item, adjust the guidelines — reranking takes effect immediately — or stop. Release the item you announced as soon as you are no longer holding it, and announce the next one you take up.

The agreed pick authorizes its handoff, nothing more. Claim the item in the source when claiming was agreed. Then continue into `/q:tackle` in this session, passing only what triage settled: the item's reference in its source (its text, when the set was pasted inline), the review mode, and any constraints from the conversation. Tackle reads the source itself and settles the verdict, route, and approach with the user — the pick decides only what's next.

## Step 4: Loop

When the cycle ends, re-read the source and the open PRs and screen the set again as in Step 1 — statuses change and items arrive mid-session. Then return to Step 3. When the set runs dry or the user stops, close with a recap of each item's outcome.
