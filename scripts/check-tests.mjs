// Hold every executable this repo carries to having committed tests. The rule
// is docs/conventions/testing.md, "What carries tests"; this script is the rung
// that enforces it, so weakening the script weakens the rule.
//
// A file legitimately outside the rule says so where it stands, with an
// exception marker naming that section. That is the only way past this check:
// deleting a file's discovery here, or widening a skip set to cover it, hides
// the gap instead of recording it. Several exceptions against the rule are the
// signal to revisit the rule itself, and `/q:groom-docs` counts them.
//
// Discovery is the filesystem, not `git ls-files`, so a scratch script in the
// tree is caught like any other. Tests would otherwise each need a git repo
// staged around them.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const RULE = "docs/conventions/testing.md";

// test/ holds the suites themselves. .github/ holds workflows GitHub runs, not
// this repo, and no local harness runs one. The rest are not this repo's code.
const skipNames = new Set(["node_modules", ".git", "test", ".github"]);
// husky's own directory, which it regenerates.
const skipPaths = new Set([path.join(".claude", "worktrees"), path.join(".husky", "_")]);

const EXTENSIONS = [".mjs", ".sh", ".py"];
const HUSKY = `.husky${path.sep}`;

// Everything under .husky/ runs as a git hook whatever it is named, and none of
// them carry an extension.
const isExecutable = (where, name) =>
  where.startsWith(HUSKY) || EXTENSIONS.some((ext) => name.endsWith(ext));

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const where = path.relative(root, full);
    if (entry.isDirectory()) {
      if (skipNames.has(entry.name)) continue;
      if (skipPaths.has(where)) continue;
      walk(full);
    } else if (isExecutable(where, entry.name)) {
      files.push(full);
    }
  }
};
walk(root);

// The marker's parentheses are dropped inside a comment, where the comment's
// own delimiters stand in for them, so it is matched on its own line.
const MARKER = /^\s*(?:#|\/\/|<!--)\s*exception:\s*([^,]+?)\s*(?:,\s*(.*?))?\s*(?:-->)?\s*$/;

/**
 * What the file says about being outside the rule: an excuse naming a section,
 * a marker too incomplete to excuse anything, or nothing at all.
 */
const exceptionIn = (text) => {
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const match = MARKER.exec(line);
    if (!match || match[1] !== RULE) continue;
    if (!match[2]) return { line: index + 1, section: null };
    return { line: index + 1, section: match[2] };
  }
  return null;
};

const failures = [];
let tested = 0;
let excused = 0;

for (const file of files.sort()) {
  const where = path.relative(root, file);

  // session-start.sh and session-start.mjs share one suite, which is how the
  // pair is actually tested.
  const suite = `${path.basename(file, path.extname(file))}.test.mjs`;
  if (fs.existsSync(path.join(root, "test", suite))) {
    tested++;
    continue;
  }

  const exception = exceptionIn(fs.readFileSync(file, "utf8"));
  if (exception?.section) {
    excused++;
    continue;
  }

  if (exception) {
    failures.push(`${where}:${exception.line} — exception names no section of ${RULE}`);
    continue;
  }

  failures.push(`${where}:1 — no test/${suite}, and no exception naming ${RULE}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`check-tests: ${failure}`);
  console.error(`check-tests: ${failures.length} of ${files.length} executables failed`);
  process.exit(1);
}

console.log(`check-tests: ${tested} executables tested, ${excused} excused`);
