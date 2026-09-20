---
name: address-feedback
description: Work feedback on an open pull request — the reviewer's comments, questions, and requested changes. Invoke it with a PR number or URL. Given nothing, it resolves the PR for the current branch. Invoke it on a PR carrying no comments too, when the user has revisions of their own. The user rules on every item before anything changes. Agreed fixes are implemented, adversarially reviewed, and delivered to the PR under the review mode the user picks. Replies are posted back on the PR only when the user wants them.
---

# Address Feedback

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`.
- **Feedback is not a work order**: every item opens a discussion, the ones phrased as directives included. Never implement feedback you believe is wrong. Answer every question the feedback asks. A code change never stands in place of that answer (source: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Questions are probes).
- **The round is the unit**: feedback arrives as a batch, or item by item from the user as they read. The agenda stays open while the user is still adding to it. Take a position on each item and settle it as it arrives, then implement it. Validation and delivery run once, over the closed agenda.
- **The PR under review is the boundary**: the round's fixes land on its branch as new commits. Never rebase that branch and never force-push over it — the reviewer's inline comments anchor to the commits they read, and rewriting the history strands them. Never open a second PR. Work the feedback opens that this PR can't hold goes to a plan or the tracker instead.
- **Track resolutions**: keep a scratchpad note of each item — where it came from, its agreed disposition, and how it resolved. It feeds the replies and the closing report.
- **Context hygiene**: use subagents (Explore for recon, background Bash for checks, `adversarial-reviewer` for review) to keep large output out of the main context.

## Step 1: Gather the feedback

1. Resolve the PR from the invocation — a number or a URL. Given nothing, run `gh pr view` for the current branch. Ask which PR to work when that branch has none. Stop and tell the user when the PR is already closed or merged.
2. Require a clean working tree first — if anything is uncommitted, stop and show the user. Uncommitted work carried onto the PR's branch by a checkout lands in someone else's review.
3. Work on the PR's own branch, never a new one (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The delivery branch). Check it out and fast-forward it:

   ```bash
   git fetch origin && git checkout <head-branch> && git pull --ff-only
   ```

   Stop and show the user when the local branch has diverged from the PR's. Record the head SHA once the branch is current: `git rev-parse HEAD`. It is the branch as this round found it, and Step 5 reviews the round against it.
4. Fetch everything the reviewer wrote:
   - `gh pr view <n> --comments` — the top-level comments, plus each review's summary and verdict.
   - the inline threads, which GitHub groups and tracks resolution for:

     ```bash
     gh api graphql -f query='{repository(owner:"<owner>",name:"<repo>"){pullRequest(number:<n>){reviewThreads(first:100){nodes{isResolved isOutdated path line comments(first:50){nodes{databaseId author{login} body}}}}}}}'
     ```

     Skip every thread `isResolved` reports closed — the reviewer ended those. An `isOutdated` thread is still live: it anchors to a line that later commits moved. Skip a thread whose last comment already answers the one before it. An earlier round settled that item, and the reviewer has not written back.
5. Ignore every comment that raises nothing to settle. A callout explaining the change under review is the common case (see: @lab43/q conventions/pull-requests.md, Diff comments).
6. Gather the user's own feedback. The invocation may carry it. Ask the user what they want changed whenever the PR carries no feedback of its own. Always ask whether more is coming, because the user may still be reading the PR and add items as they go.
7. Build the agenda from everything gathered — one item per inline thread, top-level comment, or review summary that carries feedback, plus one per point the user raised. Merge items that share a root cause or answer each other. Record where each item came from, because that decides how it gets answered. Post the agenda — each item's gist in one line, in the order you propose to take them. No positions yet, and no edits. Leave the agenda open when the user has more coming, and add each new item to it as it arrives. The agenda closes when the user says nothing more is coming. Ask them rather than reading a pause as the end.

## Step 2: Take a position on each item

Establish ground truth before forming a position:

- the code the item points at, and its history
- the conventions governing that territory, found from the agent briefing's docs index
- the primary source, wherever the item turns on how a dependency or tool behaves — the library's own code, its documentation, its upstream issues

Never agree or push back from memory of an external fact (package versions, library APIs, option names, tool behavior). Run the check whenever running one can settle the question.

Feedback invites judgment, not compliance (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Questions are probes). Where the evidence contradicts it, say so with the evidence (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Push back with evidence). Where investigating exposes the questioned code as genuinely weak, say that rather than defending it.

Give each item one disposition:

- **Answer** — the item asks a question that evidence answers. Nothing changes.
- **Push back** — the item is wrong, or the change it asks for is worse than what stands. Name what you would do instead, including nothing.
- **Fix** — the item is right. Name the change.
- **Beyond this PR** — the item calls for a redesign, or for more change than this PR can hold.

## Step 3: Agree

Settle the round with the user, in conversational mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Collaboration modes).

Post every item's disposition with its evidence. Most carry no question:

- an obvious fix
- an answer the evidence settles
- a push-back the code proves

State those for the user to veto rather than asking them (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Decide at the right altitude).

Ask one batch, carrying only what the user has to rule on:

- the fork a disposition turns on, wherever an item has materially different resolutions, each with a recommendation
- whether each resolution is posted back where the feedback was written, asked once for the round. Skip it when nothing was written on the PR.
- the review mode (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Review modes). In this run, ship covers commit and push to the PR. Local commits nothing until the user has reviewed the diff.

Ask the batch's round-wide questions at the first item and carry the answers forward. A later item reopens the batch only for the fork it turns on.

Answers settle decisions. They are not the agreement. While the agenda is open, a go-ahead authorizes the item it names and nothing beyond it. Implement that item, then return to Step 2 with the next one. Ask for the round's go-ahead once the agenda is closed, summarizing the agreed scope. That go-ahead is what makes the rest of the run autonomous.

An item beyond this PR is not resolved here. Settle the rest of the round, and take it to `/q:create-plan` or to the tracker on the user's call.

## Step 4: Implement

1. Implement each agreed fix, following the governing conventions and matching surrounding code.
2. Verify: run the project's checks — lint, typecheck, and the tests covering what changed, as the project's briefing, conventions, or scripts name them (parallel background subagents are fine). When a fix changed a drivable surface — an endpoint, a screen — drive it through `/q:drive`, naming that surface as what to exercise.
3. In ship mode, commit — before review, so the review history is inspectable in git.

When the agreed fixes turn out to need a redesign, or more change than this PR can hold, interrupt. Present the discovery and recommend `/q:create-plan` or a tracker item. Neither starts without the user's go-ahead.

## Step 5: Adversarial review

Validate the round (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, Validation) with the **correctness** and **conventions** lenses. Enter this step once, over a closed agenda. Settling one item while the agenda is still open is iteration, so never launch reviewers over it.

The round is the product, so its diff runs from Step 1's recorded SHA: `git diff <recorded-sha>`, which holds the round's work whether or not it is committed. Name any file the round added and left untracked, which no diff shows. Hand the reviewers the agreed dispositions as the scope. In each pass of the validation loop, re-drive a surface only when a fix could change what driving showed.

## Step 6: Deliver to the PR

1. **The local gate**: run it over the session's uncommitted work (see: `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`, The local gate).
2. **Push**: `git push origin HEAD`.
3. **Bring the PR body up to date** wherever the round changed what it claims, the findings that survived Step 5 included (see: @lab43/q conventions/pull-requests.md).
4. **Reply**, when replying was agreed: post each item's resolution where the feedback was written. Skip an item the user raised in session. It has no thread to answer. Give the reviewer what they need to understand it — the answer, the evidence behind a push-back, or the reason a fix took the shape it did. Sign each reply (source: @lab43/q conventions/writing.md, Sign what you post). Write each reply to a file and pass it by path, so apostrophes in the prose can't break the command. Reply to an inline thread at its first comment's `databaseId`:

   ```bash
   gh api --method POST repos/<owner>/<repo>/pulls/<n>/comments/<comment-id>/replies -F body=@<reply-file>
   ```

   Answer a top-level comment or a review summary with `gh pr comment <n> --body-file <reply-file>`. Never mark a thread resolved — that is the reviewer's call.
5. Close the session by reporting each item's resolution, any caveats, any amendment raised instead of applied, and any follow-up work — filed in the tracker on the user's agreement (source: @lab43/q conventions/issue-tracking.md, Ask before filing).
