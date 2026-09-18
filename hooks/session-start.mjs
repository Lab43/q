// Validate the project's q setup and, when it doesn't validate, tell the
// session to run /q:sync. Claude Code loads whatever plugin version is on
// disk, so drift surfaces only if something checks at session start — no
// other channel runs every session. The checks: the q copy this session
// loaded vs the project's pin, each watermarked extension's pin vs its
// watermark vs its installed version, and the reverse direction — a
// q-extension devDependency with no watermark entry (installed by hand,
// never indexed).
//
// The remedy is uniform — /q:sync re-derives the specifics and routes each
// finding to its remedy — so every failure emits the same message and
// the script stops at the first one. The only designed silence is a project
// that declares no @lab43/q devDependency; anything else missing or
// unreadable fails like any other invalid state.

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

// Pins: one exact devDependency per extension, in the project's package.json.
// No manifest means not a q project; one that exists but can't be parsed
// fails like any other invalid state.
const pkgText = read(path.join(proj, "package.json"));
if (pkgText === null) process.exit(0);
const pkg = parse(pkgText);
if (pkg === undefined) fail();

const devDeps =
  pkg && typeof pkg.devDependencies === "object" && pkg.devDependencies !== null
    ? pkg.devDependencies
    : {};

const pinned = Object.hasOwn(devDeps, "@lab43/q")
  ? devDeps["@lab43/q"]
  : undefined;
if (typeof pinned !== "string") process.exit(0);

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
// and never indexed. A dependency that isn't installed can't be identified as
// an extension — skip it.
for (const dep of Object.keys(devDeps)) {
  if (Object.hasOwn(recon, dep)) continue;
  const keywords = parse(
    read(path.join(proj, "node_modules", dep, "package.json")) ?? "",
  )?.keywords;
  if (Array.isArray(keywords) && keywords.includes("q-extension")) fail();
}
