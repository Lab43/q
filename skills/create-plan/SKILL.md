---
name: create-plan
description: Collaboratively create a plan in docs/plans, grounded in the codebase, hardened by adversarial review, and iterated with the user until it's ready for /q:implement-plan. The argument can be anything from a rough phrase to a detailed writeup. Produces only the plan doc — never implements, never commits.
---

# Create Plan

The idea to plan comes from the invocation, at any fidelity — a phrase ("email templates", "rate limiting") or a worked-out writeup; given nothing, ask what they want to plan. Whatever arrives is a starting point, not a transcript: a vague idea gets its details teased out, and a detailed one still gets grounded, verified, and challenged.

If the project has no `docs/conventions/`, or `node_modules/@lab43/q-conventions/` is absent, propose `/q:install-q` first — on a fresh clone, `npm install` alone may fill the latter.

## Ground rules

- **Follow the collaboration contract** — `${CLAUDE_PLUGIN_ROOT}/references/collaboration.md`.
- **Plan, don't implement**: the only project file this skill writes is `docs/plans/<plan-name>.md` (create the directory on the first plan). No implementation, no commits unless the user asks.
- **Ground everything**: every claim about current behavior comes from reading the code (cite `file:line`); every external fact (package versions, library APIs, option names, client support) is verified during planning, never stated from memory — online where reading settles it, by exercising the toolchain in scratch space where only running something can. A plan resting on an unverified assumption is a planning failure, not a note for the implementer.
- **Evidence can flip decisions**: when exploration contradicts a tentative decision (a planned feature depends on data that turns out not to exist), surface the finding prominently and re-decide before it gets written into the plan.
- **Tooling limitations never dictate content** (see: q conventions/principles.md): if a design choice would break a test helper, CI step, or script, the plan schedules the tooling fix — it does not bend the design around it.

## Step 1: Explore

Before proposing anything, establish current state:

1. The relevant code — use an Explore subagent for breadth; read the load-bearing files yourself.
2. The conventions governing the affected territory, found from the agent briefing's docs index — plus this workflow's own rubric, the plan format: `node_modules/@lab43/q-conventions/conventions/plans.md`.
3. Prior plans in the same territory (`docs/plans/`, if it exists). Read their decisions and rejected alternatives for the rationale, not the ruling: a rejection whose grounds still hold isn't re-proposed; one whose grounds have shifted is back on the table, with its history. Deferrals are candidates to raise with the user, not inheritances. Status matters: a `pending` plan in the same territory is a possible collision to surface, and an `abandoned` one's decisions never bound anything. Trust newer plans and the code over older ones, and take no format cues — the plan format doc is the only format authority.

## Step 2: Discuss

Tease out the goals and key aspects with the user, in conversational mode (see: ${CLAUDE_PLUGIN_ROOT}/references/collaboration.md, Collaboration modes). Beyond the design decisions themselves, two calls are settled here:

- Scope boundaries are decisions too: record what's explicitly out of scope or deferred, and why.
- The delivery shape — single PR or stacked, per the format's defaults (see: q conventions/plans.md, Delivery shape) and any PR rules the project's conventions record. The defaults usually decide it: state the call for veto rather than asking, unless the estimate is genuinely borderline.

Once the scope, delivery shape, and key design decisions feel settled, ask for the go-ahead to write. That settled shape is the agreement: Steps 3 and 4 run autonomously inside it, and Step 5 is conversational again.

## Step 3: Write the plan

Write `docs/plans/<plan-name>.md` according to the plan format (see: q conventions/plans.md).

## Step 4: Adversarial review

Review, then fix, up to three times. Each round launches two `adversarial-reviewer` subagents in parallel over the plan doc — one with the **feasibility** lens, one with the **rigor** lens; both run every round, because a fix made for one lens can introduce a problem only the other would catch. Each gets the plan path and nothing more: the plan must stand alone, exactly as it will for `/q:implement-plan`. The loop ends when neither reviewer reports a BLOCKING finding; anything still open after the third round goes to the user as an open risk.

One policy for BLOCKING and NITS alike: make the straightforward fix; take a finding to the user, with the reviewer's evidence, when its fix would reopen a settled decision or significantly change the plan. FOLLOW-UPS are never folded into the plan — report them to the user in Step 5.

## Step 5: User review

Present the plan: a summary of the settled decisions, what adversarial review changed, any surviving findings, and the reviewers' follow-ups. Then iterate:

- The user reads the plan and asks questions. Treat each as potentially reopening design — answer with evidence, fold every outcome into the doc immediately, and summarize what changed.
- If a round of user feedback materially changes decisions or phases, propose another adversarial round (Step 4) — ask rather than launch, since the user may not be done making changes.
- Repeat until the user says the plan is ready.

## Step 6: Handoff

Close by reminding the user: `/q:implement-plan <plan-name>` executes it, and that it's best run after `/clear` — the plan doc is the complete handoff, so carrying the planning conversation along inflates every request's context and lets discussion that never made it into the plan steer the implementation.
