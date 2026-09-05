---
name: evaluate
description: Evaluate code — a file, directory, or the session's change — against the project's conventions; recommends fixing the code or amending the convention, and the user rules on each. Use when checking conformance, before imitating existing code, or when a rule seems stale or missing; not for bugs or general quality.
---

# Evaluate

Judges the fit between a code artifact and the conventions that govern it — in both directions, so the code and the conventions are each candidates for change. Not a general code review: the rubric is the project's recorded conventions and the framework principles, nothing else.

If the project has no `docs/conventions/`, propose `/q:setup` first — there is nothing to evaluate against.

## Step 1: Scope the target and assemble the rubric

The target comes from the prompt: a file, component, directory, or the session's recent change. The rubric, in descending precedence:

1. The project's `docs/conventions/` docs whose topics govern the target — the stack-specific doc plus any broader ones that apply — found from the agent briefing's index. Recorded deviations ("(overrides:" markers) arrive with these docs and win over whichever rule they override.
2. `${CLAUDE_PLUGIN_ROOT}/conventions/principles.md`.

Check whether the target is a living exemplar — grep `docs/conventions/` for its path. Drift in an exemplar outranks every other finding: the docs actively send imitators to it.

## Step 2: Evaluate (read-only)

Hold the target against each governing rule; for large targets, fan out read-only subagents by doc cluster. Every finding cites both sides — code (`file:line`) and rule (doc, section) — and classifies as one of:

- **Code deviates** from a sound convention → code-fix candidate.
- **Convention rot** — the rule's stated rationale no longer holds, or the codebase has coherently moved past it → convention-change candidate. Grep sibling sites to tell these apart: many sites deviating the same way is evidence against the rule; one site deviating is evidence against the code.
- **Unowned pattern** — a decision-shaped pattern in the target that no convention owns and the next writer would need → new-convention candidate. Most patterns don't qualify: code that merely works the way it works is not a convention, and `/q:update-docs` will hold candidates to its gates.

On disagreement, the convention is presumed right — it is the recorded decision binding future code; the burden of evidence is on the code.

## Step 3: Rule with the user

Present the findings, each with a recommendation: fix the code, amend the convention, record a new one, or drop. Discuss; make small calls autonomously and state them; the user rules on every finding that changes something. Nothing is edited before this step.

## Step 4: Execute the rulings

- Apply the approved code fixes; run the project's own checks (lint, tests) over the result and report failures rather than papering over them.
- Approved convention changes — amendments and new rules — go through `/q:update-docs`, the documentation surface's single write path.

## Step 5: Report

Findings and rulings, including what was dropped and why; fixes applied and the check results; convention changes recorded; anything that couldn't be verified, named explicitly. Committing is the user's call.
