// Resolve the version a project's lockfile records for a direct dependency.
// The session-start hook anchors its version checks here rather than on
// package.json's pin: the lockfile is exact whatever the pin looks like, and
// npm update moves it even when it leaves the pin untouched.
//
// Dependency-free scanning, no YAML library: each reader knows just enough of
// its format to find a direct dependency's version. Malformed input of any
// kind — a missing file, unparseable text, an absent package, an unexpected
// shape — returns undefined rather than throwing; the caller decides what
// silence means, and the hook importing this must never exit on a stack trace.

import fs from "node:fs";
import path from "node:path";

const read = (file) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
};

const unquote = (text) => text.replace(/^["']|["']$/g, "");

// npm: package-lock.json (lockfileVersion 3) names a direct dependency's
// version at packages["node_modules/<name>"].version.
const npmVersion = (text, name) => {
  let lock;
  try {
    lock = JSON.parse(text);
  } catch {
    return undefined;
  }
  const version = lock?.packages?.[`node_modules/${name}`]?.version;
  return typeof version === "string" ? version : undefined;
};

// pnpm: pnpm-lock.yaml (lockfileVersion '9.0') records the root importer's
// direct dependencies as
//   importers: → .: → dependencies:/devDependencies: → <name>: → version:
// at two spaces per level. A peer-dependency suffix rides the version, as
// 7.5.0(peer@1.0.0), and is not part of it.
const pnpmVersion = (text, name) => {
  let inImporters = false;
  let inRoot = false;
  let inDeps = false;
  let inName = false;
  for (const raw of text.split(/\r?\n/)) {
    const entry = raw.trim();
    if (!entry) continue;
    const indent = raw.length - raw.trimStart().length;
    if (indent === 0) {
      inImporters = entry === "importers:";
      inRoot = inDeps = inName = false;
    } else if (!inImporters) {
      continue;
    } else if (indent === 2) {
      inRoot = entry === ".:";
      inDeps = inName = false;
    } else if (!inRoot) {
      continue;
    } else if (indent === 4) {
      inDeps = entry === "dependencies:" || entry === "devDependencies:";
      inName = false;
    } else if (!inDeps) {
      continue;
    } else if (indent === 6) {
      inName = unquote(entry.replace(/:$/, "")) === name;
    } else if (inName && indent === 8) {
      const match = entry.match(/^version:\s*(.+)$/);
      if (match) return unquote(match[1]).replace(/\(.*/, "");
    }
  }
  return undefined;
};

// yarn, both formats: blocks keyed by comma-separated dependency descriptors.
// A key quoted whole (berry) and keys quoted per descriptor (classic) both
// come apart the same way: split on the commas, strip the quote characters
// each piece kept.
const yarnBlocks = (text) => {
  const blocks = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^[^\s#]/.test(line)) {
      current = {
        descriptors: line
          .replace(/:\s*$/, "")
          .split(",")
          .map((descriptor) => unquote(descriptor.trim())),
        lines: [],
      };
      blocks.push(current);
    } else if (line.trim() && current) {
      current.lines.push(line);
    }
  }
  return blocks;
};

const blockVersion = (block, form) => {
  for (const line of block.lines) {
    if (line.length - line.trimStart().length !== 2) continue;
    const match = line.trim().match(form);
    if (match) return unquote(match[1]);
  }
  return undefined;
};

// berry: the block keyed "<root>@workspace:." maps each direct dependency to
// its specifier, npm:-prefixed; the block keyed "<name>@npm:<specifier>"
// carries the resolved version.
const berryVersion = (blocks, name) => {
  const workspace = blocks.find((block) =>
    block.descriptors.some((descriptor) => descriptor.endsWith("@workspace:.")),
  );
  if (!workspace) return undefined;
  let specifier;
  let inDeps = false;
  for (const line of workspace.lines) {
    const entry = line.trim();
    const indent = line.length - line.trimStart().length;
    if (indent === 2) {
      inDeps = entry === "dependencies:" || entry === "devDependencies:";
    } else if (inDeps && indent === 4) {
      const match = entry.match(/^(.+?):\s+(.+)$/);
      if (match && unquote(match[1]) === name) specifier = unquote(match[2]);
    }
  }
  if (typeof specifier !== "string") return undefined;
  const block = blocks.find((b) => b.descriptors.includes(`${name}@${specifier}`));
  return block && blockVersion(block, /^version:\s*(.+)$/);
};

// classic: nothing marks a direct dependency, so the block is found by the
// specifier the project's package.json records — one descriptor among the
// comma-separated key.
const classicVersion = (blocks, name, specifier) => {
  if (typeof specifier !== "string") return undefined;
  const block = blocks.find((b) => b.descriptors.includes(`${name}@${specifier}`));
  return block && blockVersion(block, /^version\s+"([^"]*)"$/);
};

/**
 * The version the lockfile in `projDir` resolves for the direct dependency
 * `name`, or undefined when no lockfile is readable or the package can't be
 * found in it. `specifier` is the dependency's own entry in the project's
 * package.json — only yarn classic needs it (see above). Dispatches on which
 * lockfile exists; a file that exists but misleads settles the answer as
 * undefined rather than falling through to the next format.
 */
export const lockedVersion = (projDir, name, specifier) => {
  try {
    if (typeof name !== "string") return undefined;
    const npmText = read(path.join(projDir, "package-lock.json"));
    if (npmText !== null) return npmVersion(npmText, name);
    const pnpmText = read(path.join(projDir, "pnpm-lock.yaml"));
    if (pnpmText !== null) return pnpmVersion(pnpmText, name);
    const yarnText = read(path.join(projDir, "yarn.lock"));
    if (yarnText !== null) {
      const blocks = yarnBlocks(yarnText);
      // __metadata's presence is what tells berry from classic — its value
      // moves between yarn releases.
      return blocks.some((block) => block.descriptors.includes("__metadata"))
        ? berryVersion(blocks, name)
        : classicVersion(blocks, name, specifier);
    }
    return undefined;
  } catch {
    return undefined;
  }
};
