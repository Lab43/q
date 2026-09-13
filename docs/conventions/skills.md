# Skills

Rules for writing q's skills.

## Naming

Names are `verb(-noun)`: a verb, plus a noun whenever it clarifies the object — and the noun must be accurate about that object (`update-docs` writes to the whole doc surface; `groom-docs` grooms all of it, not just conventions). Autocomplete makes length free, and explicit names tell users what a skill does at the point of choice. Avoid names that collide with built-in commands or well-known skills (`init`, `help`) even when namespacing would disambiguate — a near-synonym sitting in the same skill list misroutes both humans and models, and distinctiveness beats conformance when a collision looms.

## Modes

The run contract defines the modes a run moves through and the conduct that binds each (see: references/run-contract.md). Every skill references it once, before its first step, and declares each mode inline at the step where its stretch begins, the question that settles the review mode included.

The common shape of a run is four stretches: gather, converse, execute, validate. Gathering takes no mode; it neither seeks an agreement nor executes one. Conversation belongs where the shape is still ambiguous, and ends in the agreement. Execution runs autonomously under that agreement, with a go-ahead gate just before any step that is expensive or hard to reverse. Validation closes execution: the run's product passes the project's checks and an adversarial review before anything is delivered — the contract carries the shared procedure, and a skill's own text adds only its bindings (lenses, scope, diff). Where an autonomous step looks destructive — a deletion, an overwrite — write the approval into it as a direct imperative ("sync without asking"): a missing one reads as "maybe ask", and one stall breaks the mode's no-interruption promise.

An invocation that fully specifies its work is itself the agreement, and leaves nothing to converse about. A skill whose every run is like this declares the mode where it references the contract ("proceed autonomously throughout"). The same rule governs one skill invoking another: the caller spells out the scope, review mode included when the callee needs one. A call that would leave the callee asking is underspecified; fix the call rather than suppressing the callee's questions.

## Description

The frontmatter description is the only part of a skill in context until it is invoked — everything the model and the human know at the point of choice. It says what the skill does, plus whatever must be known *before* deciding to use it. Anything safely learnable *after* invoking is the body's job. Before the decision means:

- **When it applies** — the situations to fire in, including the non-obvious moments where the session's attention is elsewhere ("including mid-investigation or mid-debugging") and the boundary against a neighboring skill where misrouting is live ("not for bugs or general quality"). The model matches descriptions against the current situation; an unnamed situation never fires.
- **What to invoke it with** — argument expectations, chosen before the body loads.
- **What it will do** — any irreversible or outward-facing effect not gated behind the user, and any unusual cost. A gated effect gets the shape of its outcome, not a procedure: say what the skill produces and who rules ("recommends fixing the code or amending the convention, and the user rules on each"), so a what-it-does clause never reads as the skill changing things on its own.

Procedure and preconditions the skill checks itself are learnable after — in the body. Avoid bloat. Every word should earn its keep.

## Body

The description loads with the body at invocation, so an intro never restates it. An intro line survives only by adding what the description can't carry — an execution-binding constraint or design intent; with nothing to add, the body opens at its first step.

A body instructs the agent executing it: write imperatives ("commit the fixes"), never narration about what "the run" or "the skill" does ("the run commits the fixes") and never passives that hide the actor ("the fixes are committed"). Declarative sentences are reserved for facts a step relies on ("plans can predate refactors"); every action gets a command.

Reference a policy doc whole — never with a parenthetical list of its sections. The list is an enumeration that rots on every reorganization of the target, and the skill reads the doc at run time anyway.

Framework docs are read from the consuming project's `node_modules/@lab43/q-conventions/conventions/` — a stable project-relative path. Plugin-internal files (the manifest, hooks) are referenced via `${CLAUDE_PLUGIN_ROOT}` — the plugin installs at a different path on every machine, so a literal path breaks everywhere but this checkout.

Instructions shared across skills may be duplicated in each body or extracted into `references/` at the plugin root, referenced via `${CLAUDE_PLUGIN_ROOT}/references/`. Duplication is the default — inline text reads in flow, while a reference turns a step into a lookup; extraction earns that lookup when the copies are long, keep drifting apart, or the sharers multiply. Reference files are on-demand context for skill runs — never conventions law, never indexed in any briefing; a rule that should bind consumer sessions outside a skill belongs in the pack instead.

An instruction another doc already owns — a pack doc's, a reference doc's — enters a skill body or a reference doc as a reference, or as a restatement carrying its source marker, never an unmarked copy (see: q conventions/documentation.md, Restatements).

A step that launches a subagent passes what the agent's description names as its inputs — the description is the caller's side of the contract, and a launch that omits a named input is a defect.
