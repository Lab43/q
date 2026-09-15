// Validate the project's q setup and, when it doesn't validate, tell the
// session to run /q:sync. Claude Code loads whatever plugin version is
// installed, so drift surfaces only if something checks at session start —
// no other channel runs every session. The checks: plugin installed vs
// pinned, plugin pin vs the q reconciliation watermark, each watermarked
// pack's pin and installed version, and the reverse direction — a doc-pack
// devDependency with no watermark entry (installed by hand, never indexed).
//
// The remedy is uniform — /q:sync re-derives the specifics and routes each
// finding to its remedy — so every failure emits the same message and
// the script stops at the first one. The only designed silence is a project
// with no pin file; anything else missing or unreadable fails like any other
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

// Plugin pin: the q--v ref in the project's marketplace file. A missing file
// means not a q-pinned project; one that exists but can't be read or parsed
// fails like any other invalid state.
let pinText = null;
try {
  pinText = fs.readFileSync(
    path.join(proj, ".claude/q-marketplace/.claude-plugin/marketplace.json"),
    "utf8",
  );
} catch (e) {
  if (e.code === "ENOENT" || e.code === "ENOTDIR") process.exit(0);
  fail();
}

const marketplace = parse(pinText);
if (marketplace === undefined) fail();
const ref = marketplace?.plugins?.find?.((p) => p?.name === "q")?.source?.ref;
const match = (typeof ref === "string" ? ref : pinText).match(
  /q--v([0-9][0-9A-Za-z.-]*)/,
);
if (!match) fail();
const pinned = match[1];

// Installed plugin version.
const manifest = parse(read(path.join(root, ".claude-plugin/plugin.json")) ?? "");
if (typeof manifest?.version !== "string") fail();
if (manifest.version !== pinned) fail();

// Watermarks. A pinned project without a state file, or whose q watermark
// doesn't match the pin, is unrecorded drift.
const stateText = read(path.join(proj, ".claude/q-state.json"));
if (stateText === null) fail();

const state = parse(stateText);
if (state === undefined || typeof state !== "object" || state === null) fail();
if (state.qReconciledAgainst !== pinned) fail();

const recon = state.docsReconciledAgainst ?? {};
if (typeof recon !== "object" || recon === null || Array.isArray(recon)) fail();

const pkgText = read(path.join(proj, "package.json"));
const pkg = pkgText === null ? null : parse(pkgText);
if (pkgText !== null && pkg === undefined) fail();
const devDeps =
  pkg &&
  typeof pkg.devDependencies === "object" &&
  pkg.devDependencies !== null
    ? pkg.devDependencies
    : {};

for (const [pack, mark] of Object.entries(recon)) {
  if (typeof mark !== "string") fail();
  const pin = Object.hasOwn(devDeps, pack) ? devDeps[pack] : undefined;
  if (typeof pin !== "string") fail(); // removed out of band, never reconciled
  if (pin !== mark) fail();

  const inst = parse(
    read(path.join(proj, "node_modules", pack, "package.json")) ?? "",
  );
  if (typeof inst?.version !== "string") fail();
  if (inst.version !== pin) fail();
}

// Reverse direction: a devDependency whose installed manifest carries the
// q-docs keyword but that has no watermark entry was installed by hand and
// never indexed. A dependency that isn't installed can't be identified as a
// doc pack — skip it.
for (const dep of Object.keys(devDeps)) {
  if (Object.hasOwn(recon, dep)) continue;
  const keywords = parse(
    read(path.join(proj, "node_modules", dep, "package.json")) ?? "",
  )?.keywords;
  if (Array.isArray(keywords) && keywords.includes("q-docs")) fail();
}
