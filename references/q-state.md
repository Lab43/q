# The q State File

Format and writer rules for `.claude/q-state.json`, the consumer-side record of the versions a project was last reconciled against. The skills that read or write the file follow this doc; nothing else edits it.

## What the file is

The file holds machine-written version watermarks — never rules, never doc enumerations. Pins stay authoritative where they are: the project's `package.json`, one exact devDependency per installed extension. Reconciliation is the work of folding a version change into the project — holding its docs against an extension release's changed rules, or its scaffolded surfaces against a new q version; `/q:update` performs it. A watermark records the version its pin was last reconciled against, so an out-of-band pin move — a hand-run npm install, a teammate's merge, a Dependabot bump — is detectable as pin ≠ watermark. The skills and the session-start hook compare its versions against the pins; nothing consults it for how to behave.

## Format

The file lives at `.claude/q-state.json`, committed. JSON, one key per line, so a watermark move reads as a one-line diff:

```json
{
  "note": "Machine state written by q's skills. Never edit by hand; /q:sync reports drift.",
  "reconciledAgainst": {
    "@lab43/q": "0.3.0"
  }
}
```

`reconciledAgainst` holds one entry per installed extension: the version the project was last reconciled against. `@lab43/q` is an ordinary entry among them, carrying no privilege and no separate field.

## Writer rules

- `/q:install` fills in missing watermarks and never touches present ones — a stale entry is reconciliation's to move. Bootstrapping q, it writes the `@lab43/q` entry; installing another extension, it writes that extension's. Each value is the version just installed, which has no reconciliation debt.
- `/q:update` writes the affected watermark after each reconciliation, whether the run moved a pin or caught up an out-of-band move.
- `/q:uninstall-pack` drops the extension's entry as part of reconciling its removal.
- `/q:sync` reads and compares; it never writes. Watermarks certify reconciliation, and sync never reconciles.

An absent file means no record — create it on the first watermark write. The file never ships in an extension: it lives in `.claude/`, outside the `files` whitelist a tarball is built from (source: q conventions/extensions.md).
