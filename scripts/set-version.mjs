// Move q's version. Both manifests move together here, before
// `check-versions` holds them equal.
//
// Don't reach for `npm version` to do the arithmetic. It rewrites
// package.json in npm's own formatting, expanding every compact value in the
// file, and that reformat would bury the one changed line in every release
// commit. `--dry-run` rewrites the file too, so it cannot supply the number
// on its own.
//
// The levels are the ones docs/guides/releasing.md defines, over the plain
// major.minor.patch versions q uses.

import fs from "node:fs";
import path from "node:path";

import { root, manifests, helpers } from "./manifests.mjs";

const { fail, read, parse } = helpers("set-version");

const levels = ["major", "minor", "patch"];
const level = process.argv[2];
if (!levels.includes(level)) {
  fail(`usage: set-version.mjs <${levels.join("|")}>`);
}

const [source] = manifests;
const current = parse(source, read(source)).version;
if (typeof current !== "string") fail(`${source} names no version`);

const parts = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
if (!parts) fail(`${source} names ${current}, which is not major.minor.patch`);

const [major, minor, patch] = parts.slice(1).map(Number);
const next = {
  major: `${major + 1}.0.0`,
  minor: `${major}.${minor + 1}.0`,
  patch: `${major}.${minor}.${patch + 1}`,
}[level];

// Every manifest is rewritten and checked before any is written, so one that
// cannot take the version leaves the release with none of them moved.
const rewritten = manifests.map((file) => {
  const after = read(file).replace(
    /("version"\s*:\s*)"[^"]*"/,
    `$1${JSON.stringify(next)}`,
  );
  // A regex that matched nothing leaves the old version parsed out of the
  // result, which is also what a rewrite of the wrong field would look like.
  if (parse(file, after).version !== next) {
    fail(`${file} has no version field to rewrite`);
  }
  return { file, after };
});

for (const { file, after } of rewritten) {
  fs.writeFileSync(path.join(root, file), after);
}

console.log(`set-version: ${current} → ${next} (${level})`);
