// Staging helpers for the suites. Every executable these stage runs as the
// real shipped file, copied into a staged tree and spawned rather than
// imported: the check scripts resolve their inputs relative to themselves,
// and the hook pair is a bash wrapper around a node script, so neither is
// reachable in-process. Importing one would test a reimplementation of the
// thing that actually runs. A module written for import is the exception,
// and its suite imports it directly.
//
// `npm test` names `test/*.test.mjs` explicitly. Node treats every file under a
// directory called test/ as a suite, so bare discovery reports this file as a
// trivially passing one — and a later top-level throw here would surface as a
// failing "test/helpers.mjs" instead of pointing at the real suite.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Imported to derive fixtures from, never as logic under test: a case built
// from this list covers whatever files carry the version today.
import { manifests, lockfile } from "../scripts/manifests.mjs";

export const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Resolved from this process's PATH, because a case that empties the child's
// PATH to hide node would otherwise leave bash unresolvable too, and the spawn
// would fail before the hook ever ran.
const BASH = execFileSync("sh", ["-c", "command -v bash"], { encoding: "utf8" }).trim();

const tmpDirs = [];

const mkTmp = (prefix) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
};

/**
 * A PATH directory holding only the named commands, so every other binary goes
 * missing. An empty PATH would hide the wrapper's `grep` too, and the wrapper
 * treats any non-1 grep exit as "fall through" — so the case meant to isolate a
 * missing node would pass even with the grep gate broken.
 */
export const pathWith = (commands) => {
  const dir = mkTmp("q-path-");
  for (const cmd of commands) {
    const real = execFileSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" }).trim();
    fs.symlinkSync(real, path.join(dir, cmd));
  }
  return dir;
};

/** Remove every directory staged so far. Call from an `after` hook. */
export const cleanup = () => {
  while (tmpDirs.length) fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
};

/** Write `{ "relative/path": "contents" }` under `dir`, creating parents. */
const writeFiles = (dir, files) => {
  for (const [rel, contents] of Object.entries(files)) {
    if (contents === null) continue;
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents);
  }
};

/**
 * Stage a project directory and a plugin root holding the real hook pair.
 *
 * `project` maps relative paths to contents. `pluginManifest` is the plugin
 * root's package.json contents; null omits it, which is how an unreadable
 * plugin manifest is staged.
 */
export const stageHook = ({ project = {}, pluginManifest = '{"version":"1.0.0"}' } = {}) => {
  const base = mkTmp("q-hook-");
  const proj = path.join(base, "project");
  const root = path.join(base, "plugin");
  fs.mkdirSync(proj, { recursive: true });
  fs.mkdirSync(path.join(root, "hooks"), { recursive: true });

  for (const file of ["session-start.sh", "session-start.mjs"]) {
    fs.copyFileSync(path.join(repoRoot, "hooks", file), path.join(root, "hooks", file));
  }
  if (pluginManifest !== null) fs.writeFileSync(path.join(root, "package.json"), pluginManifest);
  writeFiles(proj, project);

  return { base, proj, root };
};

/**
 * Run the hook. `entry` picks the wrapper (the real session-start path) or the
 * node script directly, for the few states the wrapper deliberately shortcuts.
 */
export const runHook = ({ proj, root }, { entry = "wrapper", env = {} } = {}) => {
  const base = {
    CLAUDE_PROJECT_DIR: proj,
    CLAUDE_PLUGIN_ROOT: root,
    PATH: process.env.PATH,
  };
  const [cmd, args] =
    entry === "wrapper"
      ? [BASH, [path.join(root, "hooks", "session-start.sh")]]
      : [process.execPath, [path.join(root, "hooks", "session-start.mjs")]];

  try {
    const stdout = execFileSync(cmd, args, {
      env: { ...base, ...env },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { stdout, status: 0 };
  } catch (e) {
    return { stdout: e.stdout ?? "", status: e.status ?? 1 };
  }
};

/**
 * Stage a tree holding real scripts from `scripts/` and the given files. Each
 * script is copied rather than imported, because they resolve their inputs
 * relative to themselves.
 */
const stageScripts = (prefix, scripts, files) => {
  const base = mkTmp(prefix);
  fs.mkdirSync(path.join(base, "scripts"), { recursive: true });
  for (const script of scripts) {
    fs.copyFileSync(path.join(repoRoot, "scripts", script), path.join(base, "scripts", script));
  }
  writeFiles(base, files);
  return base;
};

/**
 * Stage a tree holding the real check-frontmatter script and the given
 * markdown files.
 *
 * node_modules is a real directory whose entries are symlinked into it, rather
 * than a symlink to the repo's. readdirSync reports a symlinked directory's
 * isDirectory() as false, so symlinking node_modules itself would stop the
 * script's walk from ever descending into it — and the skip that keeps it out
 * would go untested while appearing to work.
 */
export const stageFrontmatter = (files) => {
  const base = stageScripts("q-fm-", ["check-frontmatter.mjs"], files);

  const deps = path.join(base, "node_modules");
  fs.mkdirSync(deps, { recursive: true });
  for (const entry of fs.readdirSync(path.join(repoRoot, "node_modules"))) {
    fs.symlinkSync(path.join(repoRoot, "node_modules", entry), path.join(deps, entry));
  }

  return base;
};

/**
 * Stage a tree holding the real check-tests script, the executables to
 * discover, and whatever suites stand beside them under test/.
 *
 * The script lands in `scripts/` like any other, so it discovers itself. Its
 * own suite is staged alongside so it passes, which means every staged tree
 * holds one tested executable before the case adds any — the counts a case
 * asserts include it. Staging the script somewhere the walk skips would hide
 * whether it discovers itself at all; passing null for that suite drops it,
 * which is how a case checks that it does.
 *
 * No node_modules: the script imports only node builtins.
 */
export const stageTests = (files) =>
  stageScripts("q-chk-", ["check-tests.mjs"], { "test/check-tests.test.mjs": "", ...files });


/**
 * Run a staged script from `scripts/`, with whatever arguments it takes.
 *
 * Spawned from an empty directory, never the runner's cwd. A script broken to
 * resolve its root from cwd — which is exactly the deliberate break the
 * testing rules call for — would otherwise rewrite this checkout's own
 * manifests instead of the staged copies.
 */
export const runScript = (base, script, args = []) => {
  try {
    const stdout = execFileSync(
      process.execPath,
      [path.join(base, "scripts", script), ...args],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], cwd: mkTmp("q-cwd-") },
    );
    return { stdout, stderr: "", status: 0 };
  } catch (e) {
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", status: e.status ?? 1 };
  }
};

/**
 * Stage a tree holding a real version script and the shared module it reads
 * its manifests through. Both scripts resolve their files from the module's
 * own location, so the pair has to travel together.
 *
 * `files` maps relative paths to contents; a null omits that file, which is
 * how a missing manifest is staged.
 *
 * No node_modules here, unlike stageFrontmatter: these scripts import nothing
 * but node builtins and their sibling module, so there is nothing to resolve.
 */
export const stageVersions = (script, files) =>
  stageScripts("q-ver-", [script, "manifests.mjs"], files);

/** Read a staged file back, to check what a script wrote or left alone. */
export const stagedFile = (base, file) => fs.readFileSync(path.join(base, file), "utf8");

/** The version every version-script fixture starts at. */
export const FIXTURE_VERSION = "1.2.3";

/** A JSON file, formatted as the manifests in this repo are. */
export const jsonFile = (value) => `${JSON.stringify(value, null, 2)}\n`;

/** A manifest carrying a name and a version, and nothing the scripts read. */
export const versionManifest = (version) => jsonFile({ name: "q", version });

/** A lockfile carrying the version at both fields npm writes it to. */
export const versionLock = (version, packageVersion = version) =>
  jsonFile({ name: "q", version, packages: { "": { name: "q", version: packageVersion } } });

/**
 * A tree where every version-carrying file agrees, before overrides. Built
 * from the real exports, so a file joining that set joins every case.
 */
export const versionTree = (overrides = {}, version = FIXTURE_VERSION) => ({
  ...Object.fromEntries(manifests.map((file) => [file, versionManifest(version)])),
  [lockfile]: versionLock(version),
  ...overrides,
});

/** Escape a version or filename for use inside a built RegExp. */
export const esc = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
