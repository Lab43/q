# Skills

Rules for writing q's skills.

## Naming

Names are `verb(-noun)`: a verb, plus a noun whenever it clarifies the object — and the noun must be accurate about that object (`update-docs` writes to the whole doc surface; `groom-docs` grooms all of it, not just conventions). Autocomplete makes length free, and explicit names tell users what a skill does at the point of choice. Avoid names that collide with built-in commands or well-known skills (`init`, `help`) even when namespacing would disambiguate — a near-synonym sitting in the same skill list misroutes both humans and models, and distinctiveness beats conformance when a collision looms.

## Interaction modes

How much a skill converses before acting — chosen per phase, not per skill: conversation goes where ambiguity is, gates go where cost is, autonomy covers the rest. A phase takes only the mode its work earns — many skills live in a single mode throughout, and the full arc (converse, then propose, then execute) appears only in a skill that carries a change from open requirements to shipped result.

- **Conversational** — converge with the user: present candidates, discuss, make small calls autonomously and state them, bring genuine forks with a recommendation; proceed on go-ahead. For phases where the change set is still being decided.
- **Propose-then-apply** — the draft is the proposal: show the change and its target, apply on approval. For phases where a concrete draft opens the conversation better than abstract discussion.
- **Autonomous** — execute, batching judgment calls to the user (AskUserQuestion) and reporting the rest. For phases with nothing to discuss until findings exist, and for mechanical execution of an agreed change.

Modes are authoring vocabulary, not machinery — no frontmatter field, no mode registry, no mandated phase structure. A skill never declares its modes; it shows them: the body's decision gates are the record of intent — and where an agent would predictably stall to ask (deletions, doc edits under a prior go-ahead), the absence of a gate is stated as a direct imperative ("sync without asking"), never left to inference. Review checks one agreement — each phase's interaction level fits its ambiguity and its actions' cost. Under-conversing where the call is still open, or an ungated irreversible step, is a finding.

In every mode, some calls are the user's alone: committing, pushing, deleting or reorganizing docs, and reversing a recorded decision. Each such invariant is stated in the body step that executes it.

## Description

The frontmatter description is the only part of a skill in context until it is invoked — everything the model and the human know at the point of choice. It says what the skill does, plus whatever must be known *before* deciding to use it. Anything safely learnable *after* invoking is the body's job. Before the decision means:

- **When it applies** — the situations to fire in, including the non-obvious moments where the session's attention is elsewhere ("including mid-investigation or mid-debugging") and the boundary against a neighboring skill where misrouting is live ("not for bugs or general quality"). The model matches descriptions against the current situation; an unnamed situation never fires.
- **What to invoke it with** — argument expectations, chosen before the body loads.
- **What it will do** — any irreversible or outward-facing effect not gated behind the user, and any unusual cost. A gated effect gets the shape of its outcome, not a procedure: say what the skill produces and who rules ("recommends fixing the code or amending the convention, and the user rules on each"), so a what-it-does clause never reads as the skill changing things on its own.

Procedure and preconditions the skill checks itself are learnable after — in the body. Avoid bloat. Every word should earn its keep.

## Body

The description loads with the body at invocation, so an intro never restates it. An intro line survives only by adding what the description can't carry — an execution-binding constraint or design intent; with nothing to add, the body opens at its first step.

Reference a policy doc whole — never with a parenthetical list of its sections. The list is an enumeration that rots on every reorganization of the target, and the skill reads the doc at run time anyway.

Framework files are referenced via `${CLAUDE_PLUGIN_ROOT}` — the plugin installs at a different path on every consumer's machine, so a literal or relative path breaks everywhere but this checkout.
