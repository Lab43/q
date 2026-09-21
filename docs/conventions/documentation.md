# Documentation

Rules for writing q's docs — the framework payload and this repo's own.

## Working on the payload

q is the framework, so the extension format does not reach it. The authoring rules an extension follows still govern this repo's payload, by this ruling (see: @lab43/q conventions/extensions.md, Authoring). The two homes a rule written here can go to, and the test deciding between them, are that same shipped law (see: @lab43/q conventions/extensions.md, Which rules ship).

In this repo, `@lab43/q` in a path reference resolves to `q-extension/`, q's own payload working tree (source: @lab43/q conventions/documentation.md, Package doc paths). That is the directory every extension puts its payload in (source: @lab43/q conventions/extensions.md, Layout). The name is mildly wrong here, since q is not an extension. Keep it anyway: a name true of q alone would cost a permanent carve-out in every rule and check that resolves a package's payload path.

The payload joins this project's documentation surface. `q-extension/conventions/` gets the full checks, like `docs/conventions/`. `q-extension/references/` is not conventions law (source: docs/conventions/skills.md, Body), so it gets guide mode instead (see: @lab43/q conventions/documentation.md, Taxonomy).

Rejected: seeding the framework tier into consuming projects as editable copies (seed-and-fork) — that loses the update channel and makes framework law indistinguishable from project choice during grooming.

## Structure is earned

Mandated structure — a required field, a fixed format, a grammar, a registry, a status taxonomy, a new marker — is added to q only for a demonstrated need, never because thoroughness seems to call for it. Agents bias toward inventing process; the burden is on the structure to do work plain prose cannot (the markers earn their keep by making deviations, sanctioned copies, and excused sites greppable and countable — that is the bar). Until a plain-prose version demonstrably fails, ship the plain-prose version.

## Table cells that must not wrap

A markdown table gives no way to set attributes on the cells it generates. A column whose values have to stay on one line is written as a raw `<table>` instead, fenced with `<!-- markdownlint-disable MD033 -->` and re-enabled after it. `README.md`'s Skills and Markers tables are the living examples. Their load-bearing lines are the `<td nowrap><samp>…</samp></td>` cells.

- Put `nowrap` on the cell.
- Put the value in `<samp>`.
- Never write a held value as `<code>`. GitHub gives `<code>` its own `white-space: break-spaces`, and a value set on the element replaces the one inherited from the cell.
- Never swap `nowrap` for a `style` attribute. GitHub strips `style`.
- Write every other backtick in the table as `<code>` as well. Markdown is not parsed anywhere inside a raw `<table>`, so a backtick left in any column renders literally.

Hold only the column that needs it. Widening the rest to match forces a horizontal scroll on the whole table.
