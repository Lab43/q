#!/usr/bin/env node
// Hold the plugin manifest's version equal to the package's. Two manifests
// carry it because `claude plugin validate --strict` warns when plugin.json
// names no version, and that command gates structural changes here. Nothing
// load-bearing reads plugin.json's copy — sessions load the plugin live and
// the session-start hook reads npm's record — so drift misleads whoever is
// diagnosing an install rather than breaking one.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const version = (file) => {
  const full = path.join(root, file);
  let value;
  try {
    value = JSON.parse(fs.readFileSync(full, "utf8")).version;
  } catch (e) {
    console.error(`check-versions: cannot read ${file} — ${e.message}`);
    process.exit(1);
  }
  if (typeof value !== "string") {
    console.error(`check-versions: ${file} names no version`);
    process.exit(1);
  }
  return value;
};

const pkg = version("package.json");
const plugin = version(".claude-plugin/plugin.json");

if (pkg !== plugin) {
  console.error(
    `check-versions: package.json is ${pkg}, .claude-plugin/plugin.json is ${plugin} — release moves both together`,
  );
  process.exit(1);
}

console.log(`check-versions: ${pkg}`);
