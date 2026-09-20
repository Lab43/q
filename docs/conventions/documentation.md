# Documentation

Rules for writing q's docs — the framework payload and this repo's own.

## The tier test

Every rule written in this repo goes to one of two homes:

- **Framework payload** — the law and workflow the `@lab43/q` package ships: `conventions/`, the skills, the hooks, the agents, and the references they read. A rule lands here when it would bind a consuming project: how their docs work, principles their sessions follow. The test: would this change what a session in *someone else's* repo writes or flags?
- **`docs/conventions/` (this project's tier)** — a rule about developing q itself: its skills, its README, its repo mechanics. Consumers are never bound by these and never routed to them.

**Payload is addressed solely to consumers.** Payload docs never mention q's own repo, development practices, or internal layout; even acknowledging that they might be read from within q muddies them for the audience they speak to. (A skill whose *subject* is the q repo — `/q:upstream` PRs against it — names the repo as its target; that is not mentioning it as "here".) q still follows the payload (it is a consuming project of its own workflow).

Rejected: shipping the framework conventions at the contract path (`docs/conventions/`) for the symmetry of "q uses q" — it conflates payload with q's own project docs, so q's plans and repo rules would read as framework law to consumers.

## Working on the payload

q is the framework, so the extension format does not reach it. The authoring rules an extension follows still govern this repo's payload, by this ruling (see: @lab43/q conventions/extensions.md, Authoring).

In this repo, `@lab43/q` in a path reference resolves to the repo root, q's own working tree (source: @lab43/q conventions/documentation.md, Package doc paths).

Rejected: seeding the framework tier into consuming projects as editable copies (seed-and-fork) — that loses the update channel and makes framework law indistinguishable from project choice during grooming.

## Structure is earned

Mandated structure — a required field, a fixed format, a grammar, a registry, a status taxonomy, a new marker — is added to q only for a demonstrated need, never because thoroughness seems to call for it. Agents bias toward inventing process; the burden is on the structure to do work plain prose cannot (the markers earn their keep by making deviations, sanctioned copies, and excused sites greppable and countable — that is the bar). Until a plain-prose version demonstrably fails, ship the plain-prose version.
