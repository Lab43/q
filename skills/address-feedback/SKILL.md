---
name: address-feedback
description: Work a human reviewer's feedback on a pull request — their comments, questions, and requested changes. Invoke it with a PR number or URL; given nothing, it resolves the PR for the current branch. Every unresolved thread gets a recommended disposition — answered, pushed back on with evidence, or fixed — and the user rules on each before anything changes. Agreed fixes are then implemented, adversarially reviewed, and delivered to the PR under the review mode the user picks, each thread's resolution posted as a reply. Fires when review feedback arrives on a PR; for a fresh bug or task, invoke /q:tackle.
---

# Address Feedback

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **Feedback is not a work order**: the reviewer's comments open a discussion, the ones phrased as directives included. Never implement a comment you believe is wrong. Never answer a question with a code change.
- **The PR under review is the boundary**: the round's fixes land on its branch as new commits. Never rebase that branch and never force-push over it — the reviewer's inline comments anchor to the commits they read, and rewriting the history strands them. Never open a second PR. Work the feedback opens that this PR can't hold is plan-worthy.
- **Track resolutions**: keep a scratchpad note of each thread, its agreed disposition, and how it resolved — it feeds the replies and the closing report.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.

## Step 1: Gather the feedback

1. Resolve the PR from the invocation — a number or a URL. Given nothing, run `gh pr view` for the current branch. Stop and tell the user when the PR is already closed or merged.
2. Work on the PR's own branch, never a new one (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The delivery branch). Check it out and fast-forward it:

   ```bash
   git fetch origin && git checkout <head-branch> && git pull --ff-only
   ```

   Stop and show the user when the local branch has diverged or the tree is dirty.
3. Fetch everything the reviewer wrote:
   - `gh pr view <n> --comments` — the top-level comments, plus each review's summary and verdict.
   - the inline threads, which GitHub groups and tracks resolution for:

     ```bash
     gh api graphql -f query='{repository(owner:"<owner>",name:"<repo>"){pullRequest(number:<n>){reviewThreads(first:100){nodes{isResolved isOutdated path line comments(first:50){nodes{databaseId author{login} body}}}}}}}'
     ```

     Skip every thread `isResolved` reports closed — the reviewer ended those. An `isOutdated` thread is still live: it anchors to a line that later commits moved.
4. Set aside the PR author's own callout comments. A PR opened under these conventions carries them on the diff, posted from the same account the reviewer comments from and signed (source: q conventions/pull-requests.md, Diff comments). They are the author's prompts to the reviewer, not feedback to work.
5. Build the agenda: one item per thread, merging threads that share a root cause or answer each other. Post it — each item's gist in one line, in the order you propose to take them. No positions yet, and no edits.

## Step 2: Take a position on each item

Establish ground truth before forming a position:

- the code the comment points at, and its history
- the conventions governing that territory, found from the agent briefing's docs index
- the primary source, wherever the item turns on how a dependency or tool behaves — the library's own code, its documentation, its upstream issues

Never agree or push back from memory of an API. Run the check whenever running one can settle the question.

The reviewer's comment invites judgment, not compliance (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Questions are probes). Where the evidence contradicts it, say so with the evidence (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Push back with evidence). Where investigating exposes the questioned code as genuinely weak, say that rather than defending it.

Give each item one disposition:

- **Answer** — the item asks a question that evidence answers. Nothing changes.
- **Push back** — the comment is wrong, or the change it asks for is worse than what stands. Name what you would do instead, including nothing.
- **Fix** — the comment is right. Name the change.
- **Plan-worthy** — the item calls for a redesign, or for more change than this PR can hold.

## Step 3: Agree

Settle the round with the user, in conversational mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Collaboration modes). One batch:

- each item's disposition, with its evidence
- the fork a disposition turns on, wherever an item has materially different resolutions, each with a recommendation
- whether each item's resolution is posted as a reply on its thread, asked once for the round
- the review mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Review modes). In this run, ship covers commit and push to the PR; local pushes nothing until the user has reviewed the diff.

Answers settle decisions; they are not the agreement. Close the conversation by summarizing the agreed dispositions and asking for the go-ahead — that green light, not the last answer, is what makes the rest of the run autonomous.

A plan-worthy item is not resolved here. Settle the rest of the round, and take that item to `/q:create-plan` or to the tracker on the user's call.

## Step 4: Implement

1. Record the branch's head SHA before changing anything: `git rev-parse HEAD`. It is the revision the reviewer read, and Step 5 reviews the round against it.
2. Implement each agreed fix, following the governing conventions and matching surrounding code.
3. Verify: run the project's checks — lint, typecheck, and the tests covering what changed, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine). When a fix changed a drivable surface — an endpoint, a screen — drive it through `/q:drive`, naming that surface as what to exercise.
4. In ship mode, commit — before review, so the review history is inspectable in git.

When the agreed fixes turn out to need a redesign, or more change than this PR can hold, interrupt: present the discovery and recommend `/q:create-plan`. Planning starts only on the user's go-ahead.

## Step 5: Adversarial review

Validate the round (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Validation) with the **correctness** and **conventions** lenses. The round is the product, so its diff runs from Step 4's recorded SHA: `git diff <recorded-sha>...HEAD` in ship mode, or the uncommitted diff plus the changed-file list in local review. Hand the reviewers the agreed dispositions as the scope. Per loop round, re-drive a surface only when a fix could change what driving showed.

## Step 6: Deliver to the PR

1. **Local review's gate**: run the gate over the session's uncommitted work (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The local gate).
2. **Push**: `git push origin HEAD`.
3. **Bring the PR body up to date** wherever the round changed what it claims, the findings that survived Step 5 included (see: q conventions/pull-requests.md).
4. **Reply**, when replying was agreed: post each item's resolution on its thread. Give the reviewer what they need to understand it — the answer, the evidence behind a push-back, or the reason a fix took the shape it did. Sign each reply (source: q conventions/pull-requests.md, Diff comments). Reply to an inline thread at its first comment's `databaseId`:

   ```bash
   gh api --method POST repos/<owner>/<repo>/pulls/<n>/comments/<comment-id>/replies -f body='<reply>'
   ```

   Answer a top-level comment with `gh pr comment <n>`. Never mark a thread resolved — that is the reviewer's call.
5. Close the session by reporting each item's resolution, any caveats, any amendment raised instead of applied, and any follow-up work — filed in the tracker on the user's agreement (source: q conventions/issue-tracking.md, Ask before filing).
