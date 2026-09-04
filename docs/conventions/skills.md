# Skills

Rules for writing q's skills.

## Naming

Names are `verb(-noun)`: a verb, plus a noun whenever it clarifies the object — and the noun must be accurate about that object (`update-docs` writes to the whole doc surface; `groom-docs` grooms all of it, not just conventions). Autocomplete makes length free, and explicit names tell users what a skill does at the point of choice. Avoid names that collide with built-in commands or well-known skills (`init`, `help`) even when namespacing would disambiguate — a near-synonym sitting in the same skill list misroutes both humans and models, and distinctiveness beats conformance when a collision looms.

## Description

The frontmatter description is the only part of a skill that is always in context — it is the trigger surface for model-invocation and the human's basis for choosing. It must carry everything needed at the point of choice; everything else belongs in the body, which lazy-loads on invocation.

A description contains, in roughly this order:

- **What it does** — action, object, output; the name expanded one level, first clause, no throat-clearing.
- **When to fire** — the situations it should trigger in, *including the non-obvious moments* where the session's attention is elsewhere ("including mid-investigation or mid-debugging"). Trigger clauses earn their words more than any other content: the model matches descriptions against the current situation, and an unnamed situation never fires.
- **Scope limits and guarantees** — but only those that gate the risk of *this skill's* primary action ("deletions are proposed, never applied unilaterally"; "opens the PR only on the user's go-ahead"). These are safety information for the human and the disambiguation boundary between sibling skills. Family-wide norms every skill follows (committing is always the user's call) are stated once in the body step that executes them, never repeated in descriptions.
- **Behavioral properties that affect the decision to invoke** — idempotent, model-invocable, argument expectations — and only those.

A description never contains procedure (the body's job; steps in a description are context tax) or facts that rot.

One to three sentences, every clause either triggering or gating.

## Body

Reference a policy doc whole — never with a parenthetical list of its sections. The list is an enumeration that rots on every reorganization of the target, and the skill reads the doc at run time anyway.
