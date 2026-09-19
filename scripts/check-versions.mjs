// Hold the plugin manifest's version equal to the package's. Two manifests
// carry it because `claude plugin validate --strict` warns when plugin.json
// names no version, and that command gates structural changes here. Nothing
// load-bearing reads plugin.json's copy — sessions load the plugin live and
// the session-start hook reads npm's record — so drift misleads whoever is
// diagnosing an install rather than breaking one.

import { manifests, helpers } from "./manifests.mjs";

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

console.log(`check-versions: ${pkg}`);
