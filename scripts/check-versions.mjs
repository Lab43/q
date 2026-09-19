// Hold every file carrying q's version at the same value. Two manifests carry
// it because `claude plugin validate --strict` warns when plugin.json names no
// version, and that command gates structural changes here. Nothing
// load-bearing reads plugin.json's copy — sessions load the plugin live and
// the session-start hook reads npm's record — so drift misleads whoever is
// diagnosing an install rather than breaking one.
//
// The lockfile is checked because a release bumps the manifests and refreshes
// the lockfile with a separate `npm install`. A skipped install reaches npm
// otherwise: `npm ci` validates dependencies and ignores the root version, so
// nothing else objects.

import {
  manifests,
  lockfile,
  lockfileVersions,
  helpers,
} from "./manifests.mjs";

const { fail, read, parse } = helpers("check-versions");

const [pkg, plugin] = manifests.map((file) => {
  const value = parse(file, read(file)).version;
  if (typeof value !== "string") fail(`${file} names no version`);
  return value;
});

if (pkg !== plugin) {
  fail(
    `${manifests[0]} is ${pkg}, ${manifests[1]} is ${plugin} — release moves both together`,
  );
}

for (const value of lockfileVersions(parse(lockfile, read(lockfile)))) {
  if (value !== pkg) {
    fail(`${manifests[0]} is ${pkg}, ${lockfile} is ${value} — run npm install`);
  }
}

console.log(`check-versions: ${pkg}`);
