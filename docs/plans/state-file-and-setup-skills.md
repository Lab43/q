---
status: pending
---

# State File and Setup Skills

## Goal

Make out-of-band pin moves detectable. A new consumer-side state file records the versions the project's docs were last reconciled against, and the session-start hook flags any pin that has moved past that record. Alongside it, consolidate the four setup skills (install-q, update-q, install-pack, update-pack) into three: install, update, and sync. GitHub issues #18 and #17 track the gaps; the PR closes both.

## Context

- Reconciliation runs only inside a pin move the update skill itself performs. When pinned == installed == latest, `skills/update-q/SKILL.md:21` and `skills/update-pack/SKILL.md:18` report and stop.
- A pin moved out of band — a hand-run npm install, a teammate's merge, a Dependabot bump — leaves pinned == installed == latest with the briefing index, overrides, and restatements unreconciled. Nothing records what version the docs were last reconciled against, so the catch-up diff cannot be computed.
- The install-q scaffold catch-up runs only inside update-q's pin move (`skills/update-q/SKILL.md:47`). A hand-bumped marketplace ref never triggers it.
- `hooks/session-start.sh` compares the plugin's pinned ref against the installed version and nothing else. It exits silently when the pin file is missing (line 7).
- The plugin cache is keyed by version, and a moved marketplace ref is invisible to `claude plugin update` until `claude plugin marketplace update q-pin` refreshes the marketplace; a ref move without a version change needs uninstall and reinstall (`skills/update-q/SKILL.md:29`).
- Fresh-machine setup has no owner. The plugin install command appears only in install-q's one-time closing report, and `gh` is checked once, on the installing machine (`skills/install-q/SKILL.md:21`).
- A pack's written-against declaration is its shipped `@lab43/q-conventions` devDependency (source: q conventions/doc-packs.md). Consumer skills read it from the installed tarball (`skills/update-pack/SKILL.md:12`).
- q's own checkout is a consumer with no pins: no root `package.json`, and `.claude/settings.json` loads the working tree through the `q-dev` marketplace. Every mechanism here must stay silent in that state.
- q has no external installs yet (the user's ruling, 2026-09-13), so the skill renames need no migration or deprecation story.
- Referrers of the four old skill names outside their own directories: `README.md` (lines 13, 27–41, 90), `docs/guides/releasing.md` (lines 5, 10, 21), `hooks/session-start.sh:14`, `packages/q-conventions/README.md:3`.

## Decisions

1. **The file holds watermarks, not authority.** Pins stay authoritative where they are: `package.json` for packs, the marketplace ref for the plugin. The state file records what those pins were last reconciled against. Staleness is pin ≠ watermark. npm-native tooling keeps working against `package.json`, and a hand-edit to the file can only suppress a staleness flag, never corrupt an authority. Rejected: the file as single source of truth with `package.json` and the marketplace ref derived from it — it fights npm tooling (a Dependabot bump would contradict the authority instead of moving a pin), and hand-edits would corrupt rather than merely mask.
2. **Location and format.** `.claude/q-state.json`, committed, beside the q-pin marketplace. That path sits outside the documentation taxonomy, so grooming ignores it. JSON, one key per line so the hook can parse it with grep and sed (no jq dependency):

   ```json
   {
     "note": "Machine state written by q's skills. Never edit by hand; /q:sync reports drift.",
     "scaffoldedAgainst": "0.3.0",
     "reconciledAgainst": {
       "@lab43/q-conventions": "0.1.0"
     }
   }
   ```

   `scaffoldedAgainst` is the plugin version the install scaffold last matched. `reconciledAgainst` holds one entry per installed doc pack: the pack version the project's docs were last reconciled against. The file holds machine-written version watermarks only — never rules, never doc enumerations. The skills and the hook compare its versions against the pins; nothing consults it for how to behave. This keeps faith with the rejected pack-side `q` metadata key (source: q conventions/doc-packs.md): a consumer-side watermark enumerates nothing and no doc surface carries it.
3. **Pack declarations are unchanged.** A pack's written-against declaration remains its shipped devDependency. The state file never ships: it lives in `.claude/`, outside any pack's `files` whitelist. A pack-authoring repo carries a state file only in its role as a consumer, recording its own reconciled-against watermark. Rejected: shipping the state file or a slice of it in the tarball as the declaration — that contradicts the consumer-side boundary and re-approaches the rejected metadata key.
4. **Skill surface: install, update, sync.** install-q and install-pack merge into `install` (bare invocation bootstraps q; a pack-name argument installs that pack). update-q and update-pack merge into `update` (bare checks the plugin, the framework pack, and every installed pack; a named target scopes the run). `sync` is new. The update pair were near-duplicates — identical delivery steps, parallel take-stock, move, and reconcile procedures — and a single update skill matches how the hook routes. The install fork is argument-shaped and decided at entry, and merging removes the two-run dance for installing a pack into a q-less project. Rejected: keeping the four skills and only adding sync (leaves the duplication and the which-skill-owns-which-pin question); merging everything into one skill (install's conversational migration stretch and update's reconcile procedure share nothing).
5. **sync owns machine-local enforcement.** sync makes the current machine match the declared state: the npm install, the plugin install, the `gh` check. It reports pin-vs-watermark staleness and routes to `/q:update`. It never reconciles docs and never writes watermarks: watermarks certify reconciliation, and a skill that never reconciles must never move them. Its only tracked-file side effect is a lockfile an npm sync may rewrite, reported and left in the tree as the user's. The enforcement procedure itself lives in `references/enforce-pins.md`, referenced by all three skills — shared instructions extract to `references/` when the sharers multiply (source: docs/conventions/skills.md, Body). Rejected: install and update delegating by reading sync's SKILL.md — one skill's body serving as another's reference is a shape the skills conventions don't sanction.
6. **Watermark writes.** install writes `scaffoldedAgainst` and the framework pack's entry at bootstrap, and a pack's entry at pack install, each set to the version just installed — a fresh install has no reconciliation debt. update writes the affected watermark after each reconciliation, whether the run moved a pin or caught up an out-of-band move. update's bare sweep drops entries for packs no longer in `package.json`.
7. **The out-of-band catch-up lives in update.** update's take-stock grows a fourth version per artifact: reconciled-against for packs, scaffolded-against for the plugin. When a pin disagrees with its watermark, diff watermark against pinned and run the same reconciliation a pin move gets, without moving any pin. For the plugin, that reconciliation includes the install scaffold catch-up. A pinned doc pack with no watermark entry — installed by hand, never through install — has no diff base: run install's pack path instead, scoped to join the run, which indexes the pack as a fresh install and writes its watermark.
8. **The format spec lives in the plugin.** `references/q-state.md` at the plugin root carries the file's format and writer rules, read by the three skills at run time. The consumer-facing guard is the in-file `note` plus one line in the briefing section install scaffolds. Rejected: a new pack conventions doc — a single rule does not pay for a doc plus its index line in every consumer briefing.
9. **install scaffolds the onboarding surfaces.** Two lines that travel with the repo, because sync ships inside the plugin and a fresh machine cannot self-bootstrap. For humans, a setup line in the consumer's README: the plugin install command, `npm install`, and `/q:sync` on each new machine. For agents, a briefing line: a session with no `/q:` skills in its skill list is on a machine missing the q plugin — hand the user the install command, then `/q:sync`. The briefing is the one agent-facing q surface that loads without the plugin, so prose is the strongest enforcement rung available there. *(deviation: the plan left the no-README case unspecified; the user's clarification at run start — install creates a minimal README carrying just the setup line when the project has none.)*
10. **Hook checks.** Four comparisons, each silent when its inputs are missing:
    - plugin pinned ≠ installed → run `/q:sync`
    - plugin pinned ≠ `scaffoldedAgainst` → run `/q:update`
    - for each pack in `reconciledAgainst`: `package.json` pin ≠ watermark → run `/q:update`
    - for each pack in `reconciledAgainst`: pinned but missing or stale in `node_modules/` → run `/q:sync`

    The last check is what tells a collaborator's fresh clone (plugin installed, `npm install` not yet run) that its conventions are unreadable.
11. **Single PR.** The user's call. The change is one coherent redesign of a single subsystem, and the phases keep review navigable; stacking would split rewritten skill bodies from the machinery they read.

## Out of scope

- **A last-groomed watermark for groom-docs** — declined. It adds a writer and a field for a trigger that stays human judgment either way.
- **A home for parallel-session state** — declined. No design exists to reserve for; the JSON object extends when one does.
- **Detecting a missing plugin from the hook** — declined as impossible: the hook ships inside the plugin. The scaffolded README and briefing lines (see: Decisions) are the coverage.

## Phases

### Phase 1: State file reference

Write `references/q-state.md`: the file's path, the format from Decision 2, watermark semantics, writer rules (install and update write, sync reads), and the missing-file rule (an absent file means no record; skills create it on their first write).

### Phase 2: Enforcement reference and sync skill

Write `references/enforce-pins.md`, the machine-local enforcement procedure from Decision 5:

- `npm install` when `node_modules/` is missing or stale against `package.json`.
- `claude plugin marketplace update q-pin` before any plugin operation — the cache is otherwise stale against a moved ref (see: Context).
- When the CLI does not know the `q-pin` marketplace — a scaffold from this same session: `claude plugin marketplace add ./.claude/q-marketplace`.
- When the plugin is absent: `claude plugin install q@q-pin --scope project`.
- When installed ≠ pinned: `claude plugin update q@q-pin --scope project`. When the ref moved without a version change, uninstall and reinstall instead (see: Context).
- Run `/reload-plugins` after any plugin change.
- Enforce without asking — pins are the project's recorded decisions.
- Name any tracked file the enforcement rewrote (a lockfile); that change stays in the tree as the user's.

Create `skills/sync/SKILL.md`:

- Description: set up or repair this machine for a q-using project; the boundary against update (sync never moves pins, never reconciles docs).
- Procedure:
  - Run `references/enforce-pins.md`.
  - Check `gh auth status` and `gh repo view`, and report the fix when either fails.
  - Compare each pin against its watermark and route any mismatch to an update run. Write the routing against the update skills that exist at this boundary (`/q:update-q`, `/q:update-pack`); Phase 4's referrer sweep renames it to `/q:update`.
- No branch, review, or PR steps: sync delivers no repo change.
- Add the README skills-table row (Setup group).

### Phase 3: install skill

Create `skills/install/SKILL.md`, merging `skills/install-q/SKILL.md` (bare path) and `skills/install-pack/SKILL.md` (pack path). Changes beyond the merge:

- The pack path on a q-less project runs the bare path first, replacing install-pack's "propose `/q:install-q` and stop" (`skills/install-pack/SKILL.md:12`).
- The pack path's nothing-to-do stop (`skills/install-pack/SKILL.md:12`) gains a fourth condition: the pack's watermark entry present. Decision 7's fallback depends on this run writing the entry for an already-installed pack.
- The closing report's framework-declaration flag (`skills/install-pack/SKILL.md:42`) keeps suggesting `/q:update-q` at this boundary; Phase 4's referrer sweep renames it.
- Bootstrap writes the state file: `scaffoldedAgainst` from the installed plugin version, the framework pack's `reconciledAgainst` entry from the installed pack version. The pack path writes the new pack's entry.
- The scaffold gains three items: the README onboarding line and the missing-plugin briefing line (Decision 9), and one briefing line naming `.claude/q-state.json` as machine-written state that only q skills edit.
- Local-enforcement steps (plugin install mechanics, `npm install`) reference `references/enforce-pins.md`.
- Delete `skills/install-q/` and `skills/install-pack/`.
- Update referrers: `README.md:13`, the two Setup table rows for install-q and install-pack collapse into one install row, `README.md:90`, the install half of `packages/q-conventions/README.md:3`, and the install-q references in `skills/update-q/SKILL.md:17` and `skills/update-q/SKILL.md:47` (kept consistent until Phase 4 replaces that file).

### Phase 4: update skill

Create `skills/update/SKILL.md`, merging `skills/update-q/SKILL.md` and `skills/update-pack/SKILL.md`. Changes beyond the merge:

- Bare invocation takes stock of the plugin, the framework pack, and every installed pack; a named target scopes the run.
- Take stock of the four versions per artifact and add the catch-up branch, per Decision 7.
- Installed ≠ pinned routes through `references/enforce-pins.md`, without asking.
- Write watermarks and prune per Decision 6.
- The framework section keeps update-q's specifics: the briefing index sync, the pack-declaration flags, the pack-authoring note.
- Delete `skills/update-q/` and `skills/update-pack/`.
- Update referrers: the two Setup table rows collapse into one update row; `docs/guides/releasing.md` lines 5, 10, 21; the update half of `packages/q-conventions/README.md:3`; the hook message at `hooks/session-start.sh:14` becomes "run /q:sync" (its pinned ≠ installed condition is sync's under Decision 10); the interim `/q:update-q` and `/q:update-pack` routing written by Phases 2 and 3 into `skills/sync/SKILL.md` and `skills/install/SKILL.md`.

### Phase 5: Hook

Extend `hooks/session-start.sh` with the three remaining Decision 10 comparisons: parse `.claude/q-state.json` with the same grep/sed technique the script already uses, and loop over the `reconciledAgainst` entries. Aggregate every finding into one message — the hook emits a single JSON document, so multiple findings share one `additionalContext`. Keep the silent exits for missing inputs and the 10-second timeout in `hooks/hooks.json`.

## Verification

- Exercise the hook against scratch fixture directories covering: no state file (silent); everything matching (silent); plugin pinned ≠ installed (sync message); plugin pin ahead of `scaffoldedAgainst` (update message); a pack pin ahead of its watermark (update message); a pinned pack missing from `node_modules/` (sync message); a pack installed at a version other than its pin (sync message); two findings at once (one aggregated message); q's own checkout shape, with no pin file (silent).
- Grep the repo for `install-q`, `update-q`, `install-pack`, and `update-pack`: no hits remain outside `docs/plans/`.
