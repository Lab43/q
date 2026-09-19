// Staging helpers for the suites. Every case runs the real shipped file —
// copied into a staged tree rather than imported — because both targets read
// their inputs from disk relative to themselves. Importing the logic would
// test a reimplementation of the thing that actually runs.
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
  const base = mkTmp("q-fm-");
  fs.mkdirSync(path.join(base, "scripts"), { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, "scripts", "check-frontmatter.mjs"),
    path.join(base, "scripts", "check-frontmatter.mjs"),
  );

  const deps = path.join(base, "node_modules");
  fs.mkdirSync(deps, { recursive: true });
  for (const entry of fs.readdirSync(path.join(repoRoot, "node_modules"))) {
    fs.symlinkSync(path.join(repoRoot, "node_modules", entry), path.join(deps, entry));
  }

  writeFiles(base, files);
  return base;
};

/** Run check-frontmatter against a staged tree. */
export const runFrontmatter = (base) => {
  try {
    const stdout = execFileSync(
      process.execPath,
      [path.join(base, "scripts", "check-frontmatter.mjs")],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return { stdout, stderr: "", status: 0 };
  } catch (e) {
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", status: e.status ?? 1 };
  }
};
