// Staging helpers for the suites. Every executable these stage runs as the
// real shipped file, copied into a staged tree and spawned rather than
// imported: the check scripts resolve their inputs relative to themselves,
// and the hook pair is a bash wrapper around a node script, so neither is
// reachable in-process. Importing one would test a reimplementation of the
// thing that actually runs. A module written for import is the exception,
// and its suite imports it directly.

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

/** Stage a bare directory of files, for suites that call a module directly. */
export const stageDir = (files) => {
  const base = mkTmp("q-dir-");
  writeFiles(base, files);
  return base;
};

/** Copy every shipped hook file under a staged plugin root. */
const copyHooks = (root) => {
  const src = path.join(repoRoot, "q-extension", "hooks");
  fs.mkdirSync(path.join(root, "hooks"), { recursive: true });
  for (const file of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, file), path.join(root, "hooks", file));
  }
};

/**
 * Stage a project directory and a plugin root holding the real hook files.
 *
 * The plugin root is the package's `q-extension/` payload directory, and the
 * manifest carrying the version sits at the package root above it. Staging
 * them as one directory would leave the hook's version read untested against
 * the only layout a consuming project ever has.
 *
 * `project` maps relative paths to contents. `packageManifest` is the package
 * root's package.json contents; null omits it, which is how an unreadable
 * manifest is staged.
 */
export const stageHook = ({ project = {}, packageManifest = '{"version":"1.0.0"}' } = {}) => {
  const base = mkTmp("q-hook-");
  const proj = path.join(base, "project");
  const pkg = path.join(base, "package");
  const root = path.join(pkg, "q-extension");
  fs.mkdirSync(proj, { recursive: true });
  copyHooks(root);
  if (packageManifest !== null) fs.writeFileSync(path.join(pkg, "package.json"), packageManifest);
  writeFiles(proj, project);

  return { base, proj, root };
};

/**
 * Stage a second copy of the hook pair under its own package root, carrying a
 * different version. Launching from here with `CLAUDE_PLUGIN_ROOT` still set to
 * the first root is what separates the variable from the derived path: silence
 * means the variable won, the message means the file's own location did.
 */
export const stageDecoy = ({ base }, packageManifest = '{"version":"0.9.0"}') => {
  const pkg = path.join(base, "decoy");
  const root = path.join(pkg, "q-extension");
  copyHooks(root);
  fs.writeFileSync(path.join(pkg, "package.json"), packageManifest);

  return root;
};

const entries = {
  wrapper: (from) => [BASH, [path.join(from, "hooks", "session-start.sh")]],
  node: (from) => [process.execPath, [path.join(from, "hooks", "session-start.mjs")]],
  "run-note": (from) => [process.execPath, [path.join(from, "hooks", "run-note.mjs")]],
};

/**
 * Run a hook. `entry` picks the session-start wrapper (the real session-start
 * path), its node script directly, for the few states the wrapper
 * deliberately shortcuts, or the run-note hook.
 *
 * `input` is the hook's stdin, the JSON Claude Code sends; omitted, stdin is
 * closed, which the session-start pair never reads.
 *
 * `from` launches the staged copy at another plugin root while
 * `CLAUDE_PLUGIN_ROOT` still names `root`. The two are the same directory in
 * production, so only splitting them can show which one the pair reads.
 * `pluginRoot: false` unsets the variable, leaving each half to derive the
 * root from its own location.
 */
export const runHook = (
  { proj, root },
  { entry = "wrapper", env = {}, pluginRoot = true, from = root, input } = {},
) => {
  const base = {
    CLAUDE_PROJECT_DIR: proj,
    PATH: process.env.PATH,
  };
  if (pluginRoot) base.CLAUDE_PLUGIN_ROOT = root;
  const [cmd, args] = entries[entry](from);

  try {
    const stdout = execFileSync(cmd, args, {
      env: { ...base, ...env },
      encoding: "utf8",
      input,
      stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
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
