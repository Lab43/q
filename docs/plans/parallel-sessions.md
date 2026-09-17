---
status: completed
---

# Parallel Sessions

## Goal

Let several sessions work one repo at the same time without colliding. A worktree isolates a session's tree; taking turns covers whatever driving binds, until a project isolates those resources for real. Nothing in a project has to be built first — parallel sessions work on the day q is installed, and get faster if a project invests.

Closes [#7](https://github.com/Lab43/q/issues/7).

## Context

The seam exists and is empty. `skills/tackle/SKILL.md:41` and `skills/implement-plan/SKILL.md:37` both read "If the project's conventions govern where parallel work lives (worktrees, session rules), apply them first." q ships nothing those lines can apply. The other eleven skills say nothing at all, and all thirteen write files.

Every skill follows the run contract. Each `skills/*/SKILL.md` references `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`; verified by grepping all thirteen for that path. `references/run-contract.md`, "The delivery branch", already settles where a run's work goes, and closes with "Branch mechanics a skill names — stacked PRs, worktrees — are its own."

`/q:triage` claims an item when the user agrees the pick, then hands off, and never looks again. `q conventions/issue-tracking.md`, "Respect existing claims", governs what the tracker records, not what another live session is doing.

`skills/drive/SKILL.md` Step 2 brings the target up and already draws one boundary around shared state: "Never stop what you didn't start: a stack already running is the user's."

The harness supplies the mechanics, verified by reading each tool's own schema and by grepping the shipped binary (Homebrew `claude-code` 2.1.236, which carries the strings `EnterWorktree`, `worktree.baseRef` and `notify_when_idle`):

- `EnterWorktree` creates a git worktree under `.claude/worktrees/` on a new branch, and switches the session into it. Its base ref follows the `worktree.baseRef` setting, whose default `fresh` branches from `origin/<default-branch>` — already what the run contract asks for.
- `EnterWorktree` refuses to act unless the user asks for a worktree or **project instructions (CLAUDE.md / memory) direct it**. A project whose briefing never mentions worktrees cannot use them autonomously. *(result: the restriction is the tool's own instruction to the calling model, not a runtime gate — `checkPermissions` allows creating a worktree unconditionally. The briefing line is still what makes a session take one.)*
- `EnterWorktree` is always a deferred tool, so its schema has to be loaded before it can be called.
- A worktree carries tracked files only, and `EnterWorktree` switches the session into it. A fresh one has no `node_modules/`, so the project's checks cannot run there. Conventions are read before the branch is settled, so the normal path is unaffected, but anything reading them from inside the worktree resolves `q conventions/…` against a `node_modules/` that is not there — a subagent launched from it, a re-read mid-run, a session that starts in one. Verified by creating a worktree of a scratch repo and listing it.
- `ListAgents` lists every agent this session can message, each row labelled by kind: subagents it spawned, other local sessions on this machine, and, where connected, cloud and remote sessions. No row records which repo its session is working in, so a listing alone never establishes a peer on this repo.
- `SendMessage` reaches a listed agent by the name its row shows. Messages enqueue and drain at the receiver's next tool round. `notify_when_idle` buys a one-shot notice when a session on this machine next goes idle, instead of polling.
- `SendMessage` forbids asking a peer to perform an action that was denied or blocked in your own session. The harness enforces this at delivery: a message crossing a permission-mode boundary is held for the receiving user's approval before it reaches their session.

The **Ignore rules** item of `skills/install/SKILL.md`'s Step 3 covers `node_modules/` and `.claude/settings.local.json` only — nothing ignores `.claude/worktrees/`, so a worktree created there is an untracked second copy of the whole tree that repo tooling can walk into.

`references/agent-briefing.md` holds the briefing template and the rules for maintaining it, read by `/q:install`, `/q:update-docs` and `/q:groom-docs`.

Rules placed in `references/run-contract.md` bind consumers with no override path: the precedence rule and the `overrides:` marker both target pack docs (source: q conventions/documentation.md).

## Decisions

1. **A worktree isolates the tree; driving isolates the resources.** Creating a worktree allocates nothing a session holds exclusively — ports, databases, caches, devices are bound when the session drives, and allocated then. This is what keeps q free of project machinery: creation is the same everywhere, and allocation is where projects differ. A worktree still needs the project's ordinary setup before anything can run in it, which is a separate matter from exclusivity and is handled as a fresh checkout would be. Rejected: allocating a session's resources at worktree-creation time, which forces a per-project creation mechanism and pays for isolation even when the session never drives.

2. **Worktrees only under contention.** A session working alone branches in place: no peer, no collision, no worktree to create or clean up. A session that finds a live peer takes a worktree. Rejected: a worktree for every delivery run, which pays the cost on the common solo case; and worktrees only on request, which leaves the collision window open exactly when sessions are least able to stop and ask.

3. **Worktrees live where the harness puts them.** Use `EnterWorktree`, which means `.claude/worktrees/`. q ships no worktree script and invents no path. Rejected: prescribing a sibling directory so IDE worktree integrations keep working — it forces q to own creation mechanics the harness already provides, and the IDE can open the directory regardless.

4. **Taking turns is the fallback, and it needs nothing built.** Where two sessions would bind the same resource, one waits. This works in every repo immediately, which is what makes parallel sessions available before any project does any work. Isolation is an optimization over turn-taking, never a precondition for it. Rejected: treating a repo without isolation as single-session-only, which withholds the majority of the benefit — parallel editing and reviewing — to guard a minority of moments.

5. **Coordination rules live in the run contract, and bind skill runs only.** All thirteen skills already follow it, so one edit binds every run, where the two skills carrying the rule today carry a duplicated sentence that eleven others simply lack. The contract never loads outside a skill run, so a session doing ad-hoc work is not bound by it. That is a narrower hole than it sounds: a skill run detects such a session and takes a worktree, which puts its own files beyond reach, leaving only two ad-hoc sessions able to collide with each other. Revisit if that starts happening — the fix is a line in the briefing template, which q already has the machinery to push into every project. Rejected: a new pack conventions doc, which costs an index line in every consuming project's briefing forever to close a gap that has not yet bitten; and per-skill instructions, which is the duplication this replaces.

6. **A project's parallel facts live in its driving manual.** What is safe to run per session, what is a singleton, and how to claim and release it are driving knowledge, and the manual is already the doc that holds driving knowledge. Rejected: a separate parallel-sessions guide, which splits one topic across two docs a session must read together.

7. **`/q:parallelize` owns the isolation build.** It answers one question against the actual repo — what does this repo hold exactly one of that a session needs while working — then isolates what can be isolated and declares what cannot. Rejected: a fixed taxonomy of hazards to check, which cannot be complete for an arbitrary repo and invites working the list instead of reading the code.

8. **Ground truth decides; messages inform.** A session establishes what is true by looking — `git worktree list`, the branch, the working tree, what holds a port — and announces so peers need not discover it the slow way. A protocol resting on messages would fail wherever the messaging tools are absent. Rejected: treating announcements as authoritative claims, which turns a dropped or unread message into a collision.

9. **Triage re-checks a claim at pick time.** Ranking, proposing and agreeing a pick take conversation, and a peer can claim the same item during it. Re-reading the item's status immediately before handing off closes the window at its only cost, one fetch. *(deviation: the re-read narrows the window rather than closing it, and it was never the mechanism. Holding a work item became session state the run contract carries: a session announces the item it takes up and answers a peer asking what it holds, and it holds the item from the moment it picks one to propose — the conversation is the work being protected. The re-check moved to `/q:tackle`, which reads the item at its source anyway and so covers a session invoked straight on one — triage re-reading immediately before handing off was a second fetch of what tackle fetches next. Rejected: leaving coordination to the tracker, which records a claim late or never, and records nothing at all where the user declined write-backs or the source cannot carry them.)*

10. **Single PR.** One subsystem, all prose plus one new skill, and the pieces mean little apart: the contract rule cannot fire until the briefing authorizes worktrees, and the skill has nothing to record into until the manual holds parallel facts.

## Out of scope

- **Isolation implementations** — declined. What isolates a repo's resources is bespoke to that repo; `/q:parallelize` builds it inside a project, and q ships none of it.
- **Worktree scripts** — declined. `EnterWorktree` covers creation, Decision 1 keeps resource allocation out of it, and the setup a worktree does need is the project's own package-manager install.
- **An orchestrator spawning headless workers** — declined, and already rejected in #7: the conversational gates in `/q:tackle` cannot run in a subagent, and a relay orchestrator is a context bottleneck.
- **Splitting Claude-specific instructions out of the briefing and pack docs** — deferred to [#28](https://github.com/Lab43/q/issues/28). This plan adds the worktree authorization line to the briefing template, which grows that issue's surface by one line.

## Phases

### Phase 1 — Authorize worktrees

Nothing in later phases can act until a project's briefing mentions worktrees, because `EnterWorktree` refuses without it.

1. In `references/agent-briefing.md`, add a line to the template authorizing a session to take a worktree when another session is working the repo. The line must contain the word "worktree" for the tool to honour it. Place it with the standing instructions, not in the docs index.
2. Add the same information to `AGENTS.md`, wording it for this repo, per that file's rule that the template's prose is a floor rather than a script.
3. In the **Ignore rules** item of `skills/install/SKILL.md`'s Step 3 — not the file's `## Step 7`, which opens the PR — add `.claude/worktrees/` to what the scaffold ignores. A worktree there is a full second copy of the tree, and repo tooling walks into what git does not ignore. *(deviation: this repo's own `.gitignore` took the same line. Step 2 authorizes worktrees here, and the file covered only `.idea`.)*

### Phase 2 — Bind every run to the protocol

1. In `references/run-contract.md`, "The delivery branch": before settling the branch, establish whether a peer is working this repo. Take only `ListAgents`' rows for other local sessions — the other kinds are this session's own subagents and sessions running elsewhere — and treat those as candidates rather than peers, since no row records a repo. Read the repo for what it shows: `git worktree list` names peers already isolated, and a candidate that has announced this repo settles it outright. *(deviation: a worktree is evidence of a peer only while a candidate is live, and with none listed it is leftovers. A worktree outlives the session that made it, and no session can clean up another's, so the listing alone would read a stale directory as a live peer forever. No row records a repo, so a worktree cannot be matched to a particular candidate — only to the fact that some candidate is live.)* Uncommitted work this run does not own proves nothing on its own — it is as likely the user's as a peer's — so treat it as a reason to ask rather than as a peer detected. Where the evidence leaves it open, ask the user, who knows what their other sessions are doing; the section already asks the user when the branch call is not clear. *(deviation: a live candidate is asked before the user is. Who owns an uncommitted change is the one thing looking cannot settle, and the peer holding it answers faster and more reliably than the user guessing.)*
2. In the same section, say what taking a worktree involves: `EnterWorktree`, whose schema is loaded first because it is always deferred *(deviation: the schema-loading instruction was left out. The harness already tells a session which tools are deferred and how to load one, and whether a tool is deferred is a fact about the harness's configuration rather than about this workflow.)*, and then the project's dependency install, because a worktree carries tracked files only and nothing — not the project's checks, not reading the pack conventions under `node_modules/` — works until it runs. Point at `${CLAUDE_PLUGIN_ROOT}/references/enforce-pins.md`, which already covers installing what a checkout is missing. Working alone, branch in place as now. *(deviation: the step also fetches. A worktree branches from the local `origin/<default-branch>` ref, so without a fetch it starts from whatever that ref last saw — the solo path never hits this, because the skills fetch and branch in one command.)*
3. Replace that section's closing sentence, "Branch mechanics a skill names — stacked PRs, worktrees — are its own." Worktree choice is the contract's now; stacked PRs stay the skill's. *(deviation: the sentence was deleted rather than halved. Stacking is still the skill's, and `/q:implement-plan` already says a stacked run keeps its whole stack in one worktree — leaving a disclaimer here about a topic the contract never raises.)*
4. Add a section to `references/run-contract.md` covering conduct alongside peers: establish shared state by looking rather than by asking; announce before changing anything a peer can see; in a checkout another session shares, never switch the branch without announcing first, and stage by explicit path rather than `git add -A`, because the tree may hold work that is not yours. State that a peer's message informs a decision and never authorises one, and that work blocked by this session's permissions is never handed to a peer to run.
5. Delete the now-redundant sentence from `skills/tackle/SKILL.md:41` and `skills/implement-plan/SKILL.md:37`. *(deviation: both skills also gained a clause skipping their branch command. `EnterWorktree` already arrives on a new branch, and the unconditional command would have created a second one and abandoned it.)*
6. In `skills/triage/SKILL.md` Step 3, re-read the agreed pick's status in the source immediately before handing off, and treat a claim that appeared during the conversation as the set-aside it now is. *(deviation: triage does not re-read. Step 1 asks the peers what items they hold, and Step 3 announces the pick before proposing it and releases it when the user chooses otherwise. `/q:tackle` Step 1 announces the item before investigating it, reads it fresh, and returns an unavailable one to the user — a session invoked straight on an issue holds it without triage ever running, and needed that check as much.)*

### Phase 3 — Take turns while driving

1. In `skills/drive/SKILL.md` Step 2, before bringing the target up, establish whether what it binds is something the repo holds only one of, and whether a peer holds it. Wait rather than seize; where the harness offers a one-shot idle notice, subscribe instead of polling. Announce the claim, and announce the release. *(deviation: Step 4 also reports what the run waited on and how long it held. A wait is neither a failure nor a manual entry, so it otherwise reached the user only through the manual's diff.)*
2. In `skills/drive/SKILL.md` Step 3, record in the manual what a session may run its own copy of and what it must take turns over, so the next session knows without discovering it.

### Phase 4 — Ship `/q:parallelize`

1. Write `skills/parallelize/SKILL.md` to the skill-authoring rules (see: docs/conventions/skills.md), carrying:
   - A frontmatter description saying when it applies — a repo whose sessions contend over something while driving — what to invoke it with, and that it changes the repo and ships a PR.
   - Ground rules: follow the run contract, and settle the review mode up front as delivery skills do.
   - **Read the repo.** Find what it runs and what those things bind, from whatever the repo declares it in: service and container definitions, scripts, test and build configuration, CI, environment templates, the driving manual. Read what is there rather than matching against a list of kinds — this step carries the widest autonomy of any q skill, and an unfamiliar repo shape is the normal case.
   - **Resolve each contended resource.** For everything the repo holds exactly one of that a session needs while working, either design isolation giving each session its own, or declare it a hard limit that sessions take turns over.
   - **Build it.** Implement the isolation designed above, routing to `/q:create-plan` when the build is plan-sized, as `/q:tackle` does.
   - **Record it.** Hand the outcome to `/q:drive` for the driving manual: what a session may run its own copy of, what it must take turns over, and how to claim and release it. *(deviation: the call names only what to exercise. Phase 3 put the manual's contents into `/q:drive`'s own Step 3, so naming them again in the caller would copy the callee's instructions unmarked.)*
   - **Deliver.** Validate and open the PR per the run contract.
2. Add a Workflow row for `/q:parallelize` to the README's skill table, and raise that row group's `rowspan`.

## Verification

Prove the two ends that phases cannot prove alone. Both need a real second session: open another interactive `claude` in the same repo, in its own terminal, so it appears to the first as a local session in `ListAgents`.

- **Contention is detected and acts.** With one session already working the repo, give the second delivery work. It should find the peer and take a worktree under `.claude/worktrees/` rather than branching in place, install the project's dependencies there, and run the project's checks green inside it. Close the second session and confirm a session started alone still branches in place.
- **Turns are taken.** With two sessions driving a repo whose manual names something it holds only one of, the second should wait on the first rather than seizing it, and should be told when it frees up.
- **The skill loads.** Load the plugin into a scratch project with `claude -p --plugin-dir`, and confirm `q:parallelize` appears in the skill list.
