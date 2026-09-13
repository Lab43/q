# The q State File

Format and writer rules for `.claude/q-state.json`, the consumer-side record of the versions a project's docs were last reconciled against. The skills that read or write the file follow this doc; nothing else edits it.

## What the file is

The file holds machine-written version watermarks — never rules, never doc enumerations. Pins stay authoritative where they are: `package.json` for doc packs, the marketplace ref for the plugin. A watermark records the version its pin was last reconciled against, so an out-of-band pin move — a hand-run npm install, a teammate's merge, a Dependabot bump — is detectable as pin ≠ watermark. The skills and the session-start hook compare its versions against the pins; nothing consults it for how to behave.

## Format

The file lives at `.claude/q-state.json`, committed. JSON, one key per line, so the hook can parse it with grep and sed:

```json
{
  "note": "Machine state written by q's skills. Never edit by hand; /q:sync reports drift.",
  "scaffoldedAgainst": "0.3.0",
  "reconciledAgainst": {
    "@lab43/q-conventions": "0.1.0"
  }
}
```

- `scaffoldedAgainst` — the plugin version the install scaffold last matched.
- `reconciledAgainst` — one entry per installed doc pack: the pack version the project's docs were last reconciled against.

## Writer rules

- `/q:install` writes `scaffoldedAgainst` and the framework pack's entry at bootstrap, and a pack's entry on its pack path — each set to the version installed at that point. A fresh install has no reconciliation debt. It writes only absent watermarks — never over a present entry, stale or not: moving a watermark is reconciliation's act, and only reconciliation moves it.
- `/q:update` writes the affected watermark after each reconciliation, whether the run moved a pin or caught up an out-of-band move. Its bare sweep drops entries for packs no longer in `package.json`.
- `/q:sync` reads and compares; it never writes. Watermarks certify reconciliation, and sync never reconciles.

An absent file means no record — create it on the first watermark write. The file never ships in a pack: it lives in `.claude/`, outside the `files` whitelist a pack's tarball is built from (source: q conventions/doc-packs.md).
