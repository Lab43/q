// Validate the project's q setup and, when it doesn't validate, tell the
// session to run /q:sync. Claude Code loads whatever plugin version is on
// disk, so drift surfaces only if something checks at session start — no
// other channel runs every session. The checks: the q copy this session
// loaded vs the project's pin, each watermarked package's pin vs its
// watermark vs its installed version, and the reverse direction — a
// q-extension devDependency with no watermark entry (installed by hand,
// never indexed).
//
// The remedy is uniform — /q:sync re-derives the specifics and routes each
// finding to its remedy — so every failure emits the same message and
// the script stops at the first one. Two silences are designed. A project
// that declares no @lab43/q devDependency is not a q project. A devDependency
// with no watermark entry and no readable manifest cannot be identified as an
// extension. Fail every other missing or unreadable input like any other
// invalid state.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const proj = process.env.CLAUDE_PROJECT_DIR || ".";
const root =
  process.env.CLAUDE_PLUGIN_ROOT ||
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Keep in sync with the message in session-start.sh (bash can't import it).
const MESSAGE =
  "The q plugin could not validate this project's q setup, so its conventions and tooling may be stale or broken. Run /q:sync to repair it.";

const fail = () => {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: MESSAGE,
      },
    }),
  );
  process.exit(0);
};
const read = (file) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
};
const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};
const installedVersion = (dir) => parse(read(path.join(dir, "package.json")) ?? "")?.version;

// Pins: one exact devDependency for q and one per extension, in the project's
// package.json. A missing manifest means not a q project. One that exists but
// can't be read or parsed fails like any other invalid state.
let pkgText;
try {
  pkgText = fs.readFileSync(path.join(proj, "package.json"), "utf8");
} catch (e) {
  if (e.code === "ENOENT" || e.code === "ENOTDIR") process.exit(0);
  fail();
}
const pkg = parse(pkgText);
if (pkg === undefined) fail();

const devDeps =
  pkg && typeof pkg.devDependencies === "object" && pkg.devDependencies !== null
    ? pkg.devDependencies
    : {};

// Declaring no @lab43/q devDependency is a designed silence. A pin that
// is declared but is not a version string is an invalid state like any other,
// and fails the way a malformed pin fails for every extension below.
if (!Object.hasOwn(devDeps, "@lab43/q")) process.exit(0);
const pinned = devDeps["@lab43/q"];
if (typeof pinned !== "string") fail();

// The q this session actually loaded. CLAUDE_PLUGIN_ROOT is the directory it
// was resolved from, and npm wrote that copy's version, so comparing it
// against the pin also catches a session running some other checkout's q.
const loaded = installedVersion(root);
if (typeof loaded !== "string") fail();
if (loaded !== pinned) fail();

// Watermarks. A pinned project with no state file is unrecorded drift.
const stateText = read(path.join(proj, ".claude/q-state.json"));
if (stateText === null) fail();

const state = parse(stateText);
if (state === undefined || typeof state !== "object" || state === null) fail();

const recon = state.reconciledAgainst ?? {};
if (typeof recon !== "object" || recon === null || Array.isArray(recon)) fail();
// q is the framework rather than an extension, so it is checked by name: a
// pinned project with no entry for it is caught here. The reverse-direction
// loop below cannot stand in. It identifies extensions by a keyword read from
// node_modules, which q does not carry and which an uninstalled or stale copy
// doesn't supply either.
if (!Object.hasOwn(recon, "@lab43/q")) fail();

for (const [ext, mark] of Object.entries(recon)) {
  if (typeof mark !== "string") fail();
  const pin = Object.hasOwn(devDeps, ext) ? devDeps[ext] : undefined;
  if (typeof pin !== "string") fail(); // removed out of band, never reconciled
  if (pin !== mark) fail();

  const inst = installedVersion(path.join(proj, "node_modules", ext));
  if (typeof inst !== "string") fail();
  if (inst !== pin) fail();
}

// Reverse direction: a devDependency whose installed manifest carries the
// q-extension keyword but that has no watermark entry was installed by hand
// and never indexed. The keyword is readable only from the package's own
// manifest under node_modules. A devDependency whose manifest is absent or
// unparseable is therefore skipped here rather than reported.
for (const dep of Object.keys(devDeps)) {
  if (Object.hasOwn(recon, dep)) continue;
  const keywords = parse(
    read(path.join(proj, "node_modules", dep, "package.json")) ?? "",
  )?.keywords;
  if (Array.isArray(keywords) && keywords.includes("q-extension")) fail();
}
