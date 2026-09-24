# Run Contract

How every q skill run operates, from invocation to finish. Skills reference this contract rather than restating it.

## Collaboration modes

A run is in one of two modes, depending on whether the user has agreed on what to do yet:

- **Conversational** — nothing agreed yet: converge with the user. Present candidates with trade-offs and a recommendation, decide at the right altitude (see: Decide at the right altitude), and proceed to execution only on the user's go-ahead. The conversation ends in an agreement — a plan doc, a confirmed scope, a converged approach.
- **Autonomous** — an agreement exists: execute it without asking. Interrupt only when the work would step outside what was agreed — a conflict discovered mid-run, an architectural fork, scope the agreement doesn't cover. Small calls inside the agreement stay autonomous: choose what is most consistent with the agreement, the conventions, and the surrounding code, and flag the calls a reviewer would question where the output gets reviewed: the PR body (see: @lab43/q conventions/pull-requests.md), or the end-of-run report when the run delivers no PR. When the agreement is exhausted or must be reopened, the run is conversational again.

## Review modes

Work that will become commits runs in one of two review modes, settled up front — with the run's opening questions, or at the go-ahead that enters autonomous mode. Once settled, the run never reopens it: a ship run reaches its PR without stopping again, so the user comes back to a PR waiting, not a prompt asking whether to open one.

The user can still overrule a step: telling a local run to commit now (see: The local gate), or a ship run to hold its push. The ruling spends itself on the step it names — the mode stands for everything after, however much the instruction resembles the other mode's procedure. Name the conflict before complying rather than inferring a switch.

- **Local** — nothing is committed unreviewed: work pauses uncommitted at each review point the running skill defines, and the user's go-ahead is what commits it.
- **Ship** — commit as the running skill's own procedure calls for, without asking, and push when the work is done; the user reviews on GitHub, so finish by directing them to the PR(s). The grant ends at the PR: merging is the user's.

## The delivery branch

Settle the branch before changing anything: work built on one branch and delivered against another invites conflicts. Uncommitted changes the run does not own are the user's call: ask what to do with them before starting. Never mix them into the run's work. Two things then settle the branch — whether another session is working this repo, and which branch the work belongs on.

**Is a peer working this repo?** `ListAgents` supplies the candidates: take only its rows for other local sessions, because the rest are this session's own subagents and sessions running elsewhere. No row records a repo, so a row is a candidate and never a peer on its own. Read the repo for what it shows:

- `git worktree list` names the worktrees peers took. A worktree outlives the session that made it, so one is evidence of a peer only while a candidate is live: with no candidates listed, it is leftovers.
- A candidate that has announced this repo is a peer outright.
- Uncommitted work this run does not own settles nothing by itself: it is as likely the user's as a peer's. Ask the live candidates whether the work is theirs, because ownership is the one thing looking cannot establish. Ask the user when no candidate claims it.

Where the evidence leaves the call open, ask the user. A listing that reports itself incomplete leaves it open.

**Found a peer? Take a worktree.** `git fetch origin` first: everything below reads the local remote-tracking refs, which are only as current as the last fetch. Nothing uncommitted follows the session into it, so commit or copy across whatever the run already owns — the plan or doc it was invoked on included. How the worktree is made then depends on whether the run's branch exists yet.

**A branch the run is creating.** `EnterWorktree` makes the worktree and switches the session into it. It arrives on its own new branch, off the default branch under the `worktree.baseRef` default. That branch is this run's: rename it to what the run would have called its branch (`git branch -m <name>`) rather than creating a second one.

**A branch that already exists.** The PR's branch, or a pushed branch the run continues. Never let `EnterWorktree` create the branch here. Its new branch sits at the default branch's tip with no upstream. Renaming that onto the existing name fails outright when the branch is already local, and builds the work on the wrong base when it exists only on the remote. Make the worktree on the branch itself with `git worktree add .claude/worktrees/<worktree-name> <branch>`, then hand `EnterWorktree` that path. A branch that exists only on the remote takes the same command, which creates the local branch from it and sets up tracking.

An existing local branch is checked out as it stands, which may be behind the remote. Fast-forward it in the worktree with `git pull --ff-only`. Show the user when that reports divergence.

`git worktree add` refuses when something already holds the branch, and names the worktree holding it. Free it first:

- This session's own checkout holds it. Announce the switch, then move that checkout to the default branch. Its tree otherwise moves under whoever is standing in it.
- A leftover worktree holds it. Remove it with `git worktree remove <path>`, then take the branch. The removal refuses when that worktree is dirty. Show the user what it holds and let them rule. Never `--force` past it.
- A peer's worktree holds it. Ask the peer whether they still need the branch. Their answer informs the call and never settles it (see: Working alongside a peer). Take the branch once they have released it. Where they still hold it, or answer nothing, the user rules.

Never take the branch with `git worktree add --force`. It succeeds, leaving two worktrees on one branch to diverge silently.

Whichever way the worktree was made, install the project's dependencies there (see: `${CLAUDE_PLUGIN_ROOT}/references/enforce-declarations.md`). A worktree carries tracked files only, so until that install runs nothing works — not the project's checks, not reading q's conventions or an extension's under `node_modules/`.

**Working alone, branch in the checkout.** When the run's work belongs with the session's work in progress, work on that branch. When it does not, branch first — off whatever the work builds on, usually the default branch. Make the call and state it when it is clear: a session on the default branch, or on pushed unrelated work, has nothing in progress to join. Ask when it is not: a session branch that looks connected to the run.

## Working alongside a peer

Establish what is true by looking, wherever looking can settle it: `git worktree list`, the branch, the working tree, what holds a port. Ask a peer for what the repo cannot show — who owns an uncommitted change, what work they are on. A peer's message informs a decision and never authorizes one. Messages go stale, arrive late, and get missed; the repo does not.

Announce what a peer would otherwise have to discover, before you act rather than after — `SendMessage` reaches any peer `ListAgents` lists. Announce the work you take up, and again when you put it down: the tracker item, the plan, or both where a plan names items. You hold it from the moment you pick it, not from the moment a tracker records it — a peer reading only the tracker sees nothing and duplicates your work.

Send nothing else. A message to a peer carries only what keeps two sessions from duplicating or colliding over the same work. Every message surfaces in the user's session, so every message spends the user's attention.

- Never send a peer a suggestion, an opinion, or a finding, unless they need it to avoid a collision.
- Answer a peer only when the answer changes what they do. No reply is owed.

A worktree is what separates two sessions, and not every case gets one. A peer may arrive after the branch was settled. The user may be working in the tree alongside the run. Sharing a checkout adds three precautions:

- Never switch the branch without announcing first.
- Stage by explicit path rather than `git add -A`. The tree may hold work that is not yours.
- Commit by explicit path too, with `git commit --only <paths>`. A plain commit takes the whole index, and the index may hold staging you did not set: someone marking up a review stages hunks as they read them.
- Never clear the index you did not set. `git reset` discards staging as readily as `git add -A` sweeps files in, and someone marking up a review as they read it loses their place with nothing left to show it happened.

Never hand a peer work this session's permissions blocked. A peer running it launders the user's permission decision. Route it back to the user instead.

## Decide at the right altitude

Make small calls autonomously and state them so the user can veto; bring genuine forks to the user with a recommendation. A choice with a conventional default is not a question — make it and say so. What separates a fork from a small call is consequence, not difficulty: a decision that is hard to reverse, or that the user would decide differently with context only they hold, goes to them.

## Questions are probes

A user's question about existing work invites judgment, not compliance. Answer with a verdict first: defend what is sound with reasoning, concede what isn't and fix it. Changing something because a question implied doubt — without deciding the doubt is justified — throws away the review the question was offering.

## Push back with evidence

When the user's suggestion conflicts with something verified, say so — with the code, the doc, or the measurement, not an opinion. Once they have ruled on the evidence, record the ruling and move on.

## Answer by checking

A question about the state of the work — "anything else to decide?", "does anything depend on this?", "are we done?" — is answered by looking again, not from memory of an earlier look. Confidence goes stale as a conversation grows; the sweep that feels redundant is the one that finds the missed dependency.

## Batch questions

Questions cost attention: collect them into one AskUserQuestion batch (recommended option first) rather than asking one at a time. Put everything an answer depends on inside the question itself. The go-ahead that closes a conversation is different: ask it in plain text, stating the agreed scope, so the user can grant it or keep refining. In a long collaborative phase, keep the running state visible — decisions settled, questions still open — so the user never has to reconstruct it.

## Corrections become rules

Every run turns up documentation the project doesn't have yet. Record it as it surfaces:

- a doc the change falsifies
- a gotcha the run hit
- a rule nobody wrote down
- a correction the user made whose reason binds future work

Route every recording through `/q:update-docs`. It classifies the lesson and holds it to the documentation policy's gates.

Record a correction in the change that prompted it. The diff at each review point carries its own doc updates, so a user approving the work sees everything the run proposes. A correction that arrives during review joins that iteration. Never defer one to the closing report, and never leave the user trusting that a doc update will follow.

A correction lands in whatever change was in flight, which is often a change whose stated scope does not cover it. Say so where the work is reviewed: the PR body's Callouts, or the closing report when the run delivers no PR (see: @lab43/q conventions/pull-requests.md, Sections). A reviewer who meets an unexplained edit to standing law reads it as scope creep.

Amendments to existing rules are corrections too. Apply them rather than recommending them. A recommendation the user has to find in the output gets scanned past, while a diff hunk is something they can read and push back on. Raise an amendment instead of applying it when it would put existing code out of conformance: that is a migration, and its scope is the user's.

## Validation

Execution closes by validating what the run delivers, before it is delivered. Validation attaches to delivery: the commits the run makes and the PR it opens. Work the run hands elsewhere is validated by the run that delivers it, whether it was made for a calling skill or left uncommitted in the tree. In ship mode, validate before the push. In local mode, validate a significant change before the gate, and let a small one reach the gate without a round: the gate asks whether to run the round before committing (see: The local gate). Significant is a judgment, not a count: more than the user can weigh in one read at the gate.

Run the project's checks covering what changed. Then launch `adversarial-reviewer` subagents over the change, sized to it: one reviewer carrying both lenses for a small change, and two in parallel, one per lens, for anything larger. Hand each its lens, the artifact the skill names, and what the work is meant to deliver: the scope the user agreed to, restated from the run's current state, or the plan plus which of its steps are in scope, which came earlier, and which are deferred. That is the whole prompt. Never add a hunt-list, a checklist, or an account of what changed. A list steers the review toward what the caller listed, and nothing marks the round as compromised. An account of what changed carries details the user has since overruled, which resurface as false findings.

Wait for every reviewer in the round to report before changing anything. Editing the tree under a running review invalidates the diff that review was handed. Then fix the BLOCKING findings, applying judgment on nits. Re-run the checks covering the fixes. Review again — fixes are always re-reviewed, with the same reviewers by default. Size the round to the fixes: small fixes take one reviewer carrying both lenses, whatever the first round took. In ship mode, commit each round. Loop at most three times. The loop exits when no reviewer reports a BLOCKING finding, and findings that survive the cap are reported as caveats. A spec violation is the exception on both counts. Its two exits are the user's to pick, so it is neither fixed on the run's judgment nor carried as a caveat: the run stops for the ruling (source: @lab43/q conventions/specs.md, Disagreement).

## The local gate

The procedure a run in local mode follows at each review point the skill defines. Stop and ask the user to review the uncommitted work: the diff, its check results, and anything else they should weigh. When the work reached the gate without a round (see: Validation), ask in the same stop whether to run the round before committing. A round they ask for runs with the prompt Validation prescribes, and its fixes join the diff for them to review again. Expect change requests. Make them and iterate with the user, running no machinery per exchange. A change request whose reason binds future work is a correction (see: Corrections become rules).

At their go-ahead, commit exactly what they reviewed — onto the work's branch, unless the skill names another target. Then run the checks covering what the session changed. When the gate's iteration substantially changed the work, run one `adversarial-reviewer` pass (both lenses) over what changed, with the prompt Validation prescribes (see: Validation). Never fold the resulting fixes into the reviewed commit. Leave them uncommitted and return to the gate, where the user reviews them as their own diff. Repeat until a go-ahead leaves nothing uncommitted.
