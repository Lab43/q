// The manifests carrying q's one version, and the plumbing the version
// scripts read them with. The list is shared so `check-versions` and
// `set-version` read the same files.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

// package.json leads: it is where the current version is read from.
export const manifests = ["package.json", ".claude-plugin/plugin.json"];

// The lockfile carries the version too, in two places, but `npm install`
// rewrites it rather than `set-version`. Nothing else catches it left behind:
// `npm ci` validates dependencies and ignores the root version.
export const lockfile = "package-lock.json";
export const lockfileVersions = (lock) => [lock.version, lock.packages?.[""]?.version];

export const helpers = (script) => {
  const fail = (message) => {
    console.error(`${script}: ${message}`);
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

  return { fail, read, parse };
};
