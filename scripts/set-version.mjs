// Move q's version. Two manifests carry it — package.json and
// .claude-plugin/plugin.json — and a release moves both here, before
// `check-versions` holds them equal.
//
// `npm version` is not used, though it would do the arithmetic: it rewrites
// package.json in npm's own formatting, expanding every compact object in the
// file. That reformat would land in the release commit, burying the one line
// that changed. Both manifests are rewritten in place instead, so a release
// diff is the version lines and nothing else.
//
// The levels are the ones docs/guides/releasing.md defines, over versions of
// the plain major.minor.patch form q uses. A prerelease or build suffix is
// rejected rather than guessed at.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const manifests = ["package.json", ".claude-plugin/plugin.json"];
const levels = ["major", "minor", "patch"];

const fail = (message) => {
  console.error(`set-version: ${message}`);
  process.exit(1);
};

const read = (file) => {
  try {
    return fs.readFileSync(path.join(root, file), "utf8");
  } catch (e) {
    fail(`cannot read ${file} — ${e.message}`);
  }
};

const parse = (file, text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    fail(`cannot parse ${file} — ${e.message}`);
  }
};

const level = process.argv[2];
if (!levels.includes(level)) {
  fail(`usage: set-version.mjs <${levels.join("|")}>`);
}

const current = parse(manifests[0], read(manifests[0])).version;
if (typeof current !== "string") fail(`${manifests[0]} names no version`);

const parts = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
if (!parts) fail(`${manifests[0]} names ${current}, which is not major.minor.patch`);

const [major, minor, patch] = parts.slice(1).map(Number);
const next = {
  major: `${major + 1}.0.0`,
  minor: `${major}.${minor + 1}.0`,
  patch: `${major}.${minor}.${patch + 1}`,
}[level];

// Every file is rewritten and checked before any is written, so a manifest
// that cannot take the version leaves the release with none of them moved.
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
