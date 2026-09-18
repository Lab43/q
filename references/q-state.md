# The q State File

Format and writer rules for `.claude/q-state.json`, the consumer-side record of the versions a project was last reconciled against. The skills that read or write the file follow this doc; nothing else edits it.

## What the file is

The file holds machine-written version watermarks — never rules, never doc enumerations. Pins stay authoritative where they are: `package.json` for doc packs, the marketplace ref for the plugin. Reconciliation is the work of folding a version change into the project — holding its docs against a pack release's changed rules, or its scaffolded surfaces against a new plugin version; `/q:update` performs it. A watermark records the version its pin was last reconciled against, so an out-of-band pin move — a hand-run npm install, a teammate's merge, a Dependabot bump — is detectable as pin ≠ watermark. The skills and the session-start hook compare its versions against the pins; nothing consults it for how to behave.

## Format

The file lives at `.claude/q-state.json`, committed. JSON, one key per line, so a watermark move reads as a one-line diff:

```json
{
  "note": "Machine state written by q's skills. Never edit by hand; /q:sync reports drift.",
  "qReconciledAgainst": "0.3.0",
  "docsReconciledAgainst": {
    "@lab43/q": "0.3.0"
  }
}
```

- `qReconciledAgainst` — the q plugin version the project was last reconciled against.
- `docsReconciledAgainst` — one entry per installed doc pack: the pack version the project's docs were last reconciled against.

## Writer rules

- `/q:install` fills in missing watermarks and never touches present ones — a stale entry is reconciliation's to move. Bootstrapping q, it writes `qReconciledAgainst` and the framework pack's `docsReconciledAgainst` entry; installing a doc pack, it writes that pack's entry. Each value is the version just installed, which has no reconciliation debt.
- `/q:update` writes the affected watermark after each reconciliation, whether the run moved a pin or caught up an out-of-band move.
- `/q:uninstall-pack` drops the pack's `docsReconciledAgainst` entry as part of reconciling its removal.
- `/q:sync` reads and compares; it never writes. Watermarks certify reconciliation, and sync never reconciles.

An absent file means no record — create it on the first watermark write. The file never ships in a pack: it lives in `.claude/`, outside the `files` whitelist a pack's tarball is built from (source: q conventions/extensions.md).
