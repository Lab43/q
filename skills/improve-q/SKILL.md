---
name: improve-q
description: Propose improvements to the q framework itself and, on approval, PR them. Use when friction with a q skill or policy surfaces, when upstream candidates were flagged this session or have accumulated in the project's rulings, or to change how the workflow works.
---

# Improve q

Runs in a consuming project; changes q itself. Never edits the installed plugin in place — changes go through a PR to `https://github.com/Lab43/q`.

## Step 1: Gather candidates

1. The prompt — the user may name the improvement outright.
2. This session's history — friction with a q skill or policy (an instruction that misfired, a gap, a wrong assumption), and any upstream-to-q candidates flagged earlier in the session.
3. The project's marked overrides — grep `docs/conventions/` for "(overrides: q" (the `q` prefix selects framework overrides).
4. The project's unmarked extensions — read the project docs whose filenames match `${CLAUDE_PLUGIN_ROOT}/conventions/` for rulings that extend a framework rule rather than contradict it.

## Step 2: Converge with the user

Qualify the candidates against the framework's documentation policy (`${CLAUDE_PLUGIN_ROOT}/conventions/documentation.md`). An override or extension made for project-specific reasons doesn't qualify. Don't disqualify one for adopting an alternative a framework doc records as rejected — that is evidence against the rejection, and the candidate becomes revisiting it. Check the q repo's PR history too — search open and closed PRs per candidate (`gh pr list --repo Lab43/q --state all --search "<topic>"`), reading a hit's diff when its description doesn't settle the overlap: a candidate an open PR already covers is recommended defer, and one already proposed and closed without merging qualifies only with evidence the earlier PR lacked. Non-qualifiers are dropped without discussion and surface only in the report.

Present the qualifiers in one message — for each, the proposed change, the evidence behind it, and a recommendation — and collect a ruling on each (AskUserQuestion). Discuss a candidate only where its ruling calls for it: the user pushes back, asks, or raises an alternative. The rulings:

- **Ship** — joins the change set the remaining steps carry to the PR.
- **Defer** — stays recorded in the project, a candidate for a later run.
- **Remove** — for an override the review turns against: the framework rule holds up and the deviation was the mistake. Delete it from the project's docs via `/q:update-docs`, outside the PR.

## Step 3: Make the change

1. Clone fresh into a temporary directory outside the project (`gh repo clone Lab43/q`) and branch.
2. Read the checkout's `AGENTS.md` first and follow it — it governs how the change is made.
3. Apply the change set; run `claude plugin validate --strict .`.
4. Propose the commit — committing is the user's call.

## Step 4: Open the PR

Confirm with the user before pushing — the PR is outward-facing. Then `gh pr create` against the default branch. The PR body carries what changed, why, and the provoking context from this session — the PR is the paper trail, so provenance belongs here, never in the conventions prose (source: q documentation.md, Conventions docs). If pushing to the repo is denied, fall back to a fork and say so.

## Step 5: Report

The PR link; what shipped, what was deferred or dropped and why; and any project deviation the PR would resolve — leave it recorded, untouched: it comes out only after the change ships in a plugin update, and the PR may be rejected.
