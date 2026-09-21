# The q State File

Format and writer rules for `.claude/q-state.json`, the consumer-side record of the versions a project was last reconciled against. The skills that read or write the file follow this doc; nothing else edits it.

## What the file is

The file holds machine-written version watermarks — never rules, never doc enumerations. Reconciliation is the work of folding a version change into the project — holding its docs against an extension release's changed rules, or its scaffolded surfaces against a new q version; `/q:reconcile` performs it. A watermark records the version the project was last reconciled against. Drift is the lockfile or the installed version disagreeing with it, however the move arrived — a hand-run npm install, a teammate's merge, a Dependabot bump. The skills and the session-start hook compare its versions against the lockfile and `node_modules`; nothing consults it for how to behave.

## Format

The file lives at `.claude/q-state.json`, committed. JSON, one key per line, so a watermark move reads as a one-line diff:

```json
{
  "note": "Machine state written by q's skills. Never edit by hand; /q:reconcile repairs drift.",
  "reconciledAgainst": {
    "@lab43/q": "0.3.0"
  }
}
```

`reconciledAgainst` holds one entry for `@lab43/q` and one per installed extension: the version the project was last reconciled against. q's entry has the same shape as the rest, carrying no privilege and no separate field.

## Writer rules

- `/q:install` fills in missing watermarks and never touches present ones — a stale entry is reconciliation's to move. Bootstrapping q, it writes the `@lab43/q` entry; installing an extension, it writes that extension's. Each value is the version just installed, which has no reconciliation debt.
- `/q:reconcile` writes the affected watermark after each reconciliation, and writes nothing before one — watermarks certify reconciliation.
- `/q:uninstall-extension` drops the extension's entry as part of reconciling its removal.

An absent file means no record — create it on the first watermark write.

What divides this file from `package.json` is who writes it. The manifest is hand-authored and npm's to rewrite, so it carries what a person sets and a consumer reads — the q pin, `q.description`. Watermarks are machine-written, so they live here, where the format stays q's to guarantee and nothing edits them by hand.
