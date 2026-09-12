# Run Contract

How every q skill run operates, from invocation to finish. Skills reference this contract rather than restating it.

## Collaboration modes

A run is in one of two modes, depending on whether the user has agreed on what to do yet:

- **Conversational** — nothing agreed yet: converge with the user. Present candidates with trade-offs and a recommendation, decide at the right altitude (see: Decide at the right altitude), and proceed to execution only on the user's go-ahead. The conversation ends in an agreement — a plan doc, a confirmed scope, a converged approach.
- **Autonomous** — an agreement exists: execute it without asking. Interrupt only when the work would step outside what was agreed — a conflict discovered mid-run, an architectural fork, scope the agreement doesn't cover. Small calls inside the agreement stay autonomous: choose what is most consistent with the agreement, the conventions, and the surrounding code, and flag each one where the output gets reviewed — a PR's decisions section, the end-of-run report — pointing the reviewer's attention at the calls nobody pre-approved. When the agreement is exhausted or must be reopened, the run is conversational again.

## Review modes

Work that will become commits runs in one of two review modes, settled up front — with the run's opening questions, or at the go-ahead that enters autonomous mode. Once settled it is never revisited mid-run: a ship run reaches its PR without stopping again, so the user comes back to a PR waiting, not a prompt asking whether to open one.

- **Local** — nothing is committed unreviewed: work pauses uncommitted at each review point the running skill defines, and the user's approval is what commits it.
- **Ship** — commit as the running skill's own procedure calls for, without asking, and push when the work is done; the user reviews on GitHub, so finish by directing them to the PR(s). The grant ends at the PR: merging is the user's.

## Decide at the right altitude

Make small calls autonomously and state them so the user can veto; bring genuine forks to the user with a recommendation. A choice with a conventional default is not a question — make it and say so. What separates a fork from a small call is consequence, not difficulty: a decision that is hard to reverse, or that the user would decide differently with context only they hold, goes to them.

## Questions are probes

A user's question about existing work invites judgment, not compliance. Answer with a verdict first: defend what is sound with reasoning, concede what isn't and fix it. Changing something because a question implied doubt — without deciding the doubt is justified — throws away the review the question was offering.

## Push back with evidence

When the user's suggestion conflicts with something verified, say so — with the code, the doc, or the measurement, not an opinion. Once they have ruled on the evidence, record the ruling and move on.

## Answer by checking

A question about the state of the work — "anything else to decide?", "does anything depend on this?", "are we done?" — is answered by looking again, not from memory of an earlier look. Confidence goes stale as a conversation grows; the sweep that feels redundant is the one that finds the missed dependency.

## Batch questions

Questions cost attention: collect them and ask together (recommended option first) rather than one at a time. In a long collaborative phase, keep the running state visible — decisions settled, questions still open — so the user never has to reconstruct it.

## Validation

Execution closes by validating the run's product before anything is delivered — never fewer than one adversarial pass. Run the project's checks covering what changed. Then launch two `adversarial-reviewer` subagents in parallel over the change, one per lens, handing each the agreed scope and the artifact the skill names. One reviewer carrying both lenses suffices for a minor change — a few files, no new surface — with the call recorded among the run's reported decisions, where the user can veto it. Fix the BLOCKING findings, applying judgment on nits. Re-run the checks covering the fixes, then review again with the same reviewers — fixes are always re-reviewed. In ship mode, commit each round. Loop at most three times; the loop exits when no reviewer reports a BLOCKING finding, and findings that survive the cap are reported as caveats.

## The local gate

The procedure local review runs at each review point the skill defines. Stop and ask the user to review the uncommitted work: the diff, its check results, and anything else they should weigh. Expect change requests — make them and iterate with the user, running no machinery per exchange. At their go-ahead, commit exactly what they reviewed — onto the work's branch, unless the skill names another target. Then run the checks covering what the session changed. When the changes were substantive, run one `adversarial-reviewer` pass (both lenses) over them. Never fold the resulting fixes into the reviewed commit — leave them uncommitted and return to the gate, where the user reviews them as their own diff. Repeat until a go-ahead leaves nothing uncommitted.
