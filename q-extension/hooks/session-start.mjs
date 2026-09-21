// Validate the project's q setup and, when it doesn't validate, tell the
// session to run /q:reconcile. Claude Code loads whatever plugin version is on
// disk, so drift surfaces only if something checks at session start — no
// other channel runs every session. The checks anchor on the lockfile and on
// node_modules — the lockfile is exact whatever package.json's pin looks
// like, and npm moves it even when it leaves the pin untouched: the q copy
// this session loaded vs the lockfile's @lab43/q, each watermarked package's
// lockfile version vs its watermark vs its installed version, and the
// reverse direction — an installed extension with no watermark entry
// (installed by hand, never indexed).
//
// The remedy is uniform — /q:reconcile re-derives the specifics and routes
// each finding to its remedy — so every failure emits the same message and
// the script stops at the first one. Two silences are designed. A project
// that declares no @lab43/q devDependency is not a q project. A dependency
// with no watermark entry that cannot be read as an extension is not one to
// report. Fail every other missing or unreadable input like any other
// invalid state.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lockedVersion } from "./locked-version.mjs";

const proj = process.env.CLAUDE_PROJECT_DIR || ".";
const root =
  process.env.CLAUDE_PLUGIN_ROOT ||
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Keep in sync with the message in session-start.sh (bash can't import it).
const MESSAGE =
  "The q plugin could not validate this project's q setup, so its conventions and tooling may be stale or broken. Run /q:reconcile to repair it.";

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

// The manifest is read for membership and specifiers, never for versions:
// @lab43/q in devDependencies is what makes this a q project, and a
// watermarked package missing from both dependency maps was removed out of
// band. A missing manifest means not a q project. One that exists but can't
// be read or parsed fails like any other invalid state.
let pkgText;
try {
  pkgText = fs.readFileSync(path.join(proj, "package.json"), "utf8");
} catch (e) {
  if (e.code === "ENOENT" || e.code === "ENOTDIR") process.exit(0);
  fail();
}
const pkg = parse(pkgText);
if (pkg === undefined) fail();

const depMap = (field) =>
  pkg && typeof pkg[field] === "object" && pkg[field] !== null ? pkg[field] : {};

const devDeps = depMap("devDependencies");
// An extension may be a regular dependency: a package shipping rules can also
// be one the project builds on. q never is — it is tooling, so it stays a
// devDependency check below.
const deps = { ...depMap("dependencies"), ...devDeps };

// Declaring no @lab43/q devDependency is a designed silence.
if (!Object.hasOwn(devDeps, "@lab43/q")) process.exit(0);

// The q this session actually loaded. CLAUDE_PLUGIN_ROOT is the directory it
// was resolved from, and npm wrote that copy's version, so comparing it
// against the lockfile also catches a session running some other checkout's q.
//
// The version sits one level above that directory. The plugin root is the
// payload directory, and npm requires package.json at the package root holding
// it, so the two are never the same directory.
const loaded = installedVersion(path.join(root, ".."));
if (typeof loaded !== "string") fail();
// A missing lockfile, or one that cannot resolve q, reads as undefined and
// fails this comparison like any other drift.
const lockedQ = lockedVersion(proj, "@lab43/q", devDeps["@lab43/q"]);
if (loaded !== lockedQ) fail();

// Watermarks. A project with q declared but no state file is unrecorded drift.
const stateText = read(path.join(proj, ".claude/q-state.json"));
if (stateText === null) fail();

const state = parse(stateText);
if (state === undefined || typeof state !== "object" || state === null) fail();

const recon = state.reconciledAgainst ?? {};
if (typeof recon !== "object" || recon === null || Array.isArray(recon)) fail();
// q is the framework rather than an extension, so it is checked by name: a
// declared project with no entry for it is caught here. The reverse-direction
// loop below cannot stand in. It identifies extensions by a keyword read from
// node_modules, which q does not carry and which an uninstalled or stale copy
// doesn't supply either.
if (!Object.hasOwn(recon, "@lab43/q")) fail();

for (const [ext, mark] of Object.entries(recon)) {
  if (typeof mark !== "string") fail();
  if (!Object.hasOwn(deps, ext)) fail(); // removed out of band, never reconciled
  if (typeof deps[ext] !== "string") fail(); // not a specifier — invalid state
  const locked = lockedVersion(proj, ext, deps[ext]);
  if (locked !== mark) fail(); // moved or unresolvable, never reconciled
  const inst = installedVersion(path.join(proj, "node_modules", ext));
  if (typeof inst !== "string") fail();
  if (inst !== locked) fail(); // node_modules stale against the lockfile
}

// Reverse direction: a dependency whose installed copy is an extension but
// that has no watermark entry was installed by hand and never indexed.
// Identity is both halves — the q-extension keyword, and a payload directory
// holding conventions/ or .claude-plugin/. Either alone describes a package
// that is not an extension and has no watermark to be missing.
//
// Both are readable only from the package's own copy under node_modules, so a
// dependency whose manifest is absent or unparseable is skipped rather than
// reported.
// throwIfNoEntry covers a missing path, but stat still throws on an
// unreadable one, and this hook must never exit on a stack trace.
const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};
const hasPayload = (dir) =>
  ["conventions", ".claude-plugin"].some((sub) => isDir(path.join(dir, "q-extension", sub)));

for (const dep of Object.keys(deps)) {
  if (Object.hasOwn(recon, dep)) continue;
  const installed = path.join(proj, "node_modules", dep);
  const keywords = parse(read(path.join(installed, "package.json")) ?? "")?.keywords;
  if (Array.isArray(keywords) && keywords.includes("q-extension") && hasPayload(installed)) fail();
}
