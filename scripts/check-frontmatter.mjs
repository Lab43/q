// Parse every markdown frontmatter block as strict YAML. Nothing else does.
// markdownlint ignores frontmatter content. `claude plugin validate` skips
// docs/plans/ entirely, and tolerates invalid YAML where it does look. A value
// carrying a bare ": " is the case that matters: it loads fine in a session,
// while editors and every YAML parser reject it. The defect never surfaces
// where the work happens, so only a check like this one catches it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Keep in sync with `ignores` in .markdownlint-cli2.jsonc, so the two checks
// cover the same files.
const skipNames = new Set(["node_modules", ".git"]);
const skipPaths = new Set([path.join(".claude", "worktrees")]);

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipNames.has(entry.name)) continue;
      if (skipPaths.has(path.relative(root, full))) continue;
      walk(full);
    } else if (entry.name.endsWith(".md")) files.push(full);
  }
};
walk(root);

// A frontmatter delimiter is a line of exactly `---`, with trailing spaces or
// tabs permitted — markdownlint accepts those, so rejecting them here would
// fail valid files.
const DELIMITER = /^---[ \t]*$/;

const failures = [];
let checked = 0;

for (const file of files.sort()) {
  const where = path.relative(root, file);
  let text = fs.readFileSync(file, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  // Splitting on /\r?\n/ makes the rest of this CRLF-safe, and lets a closing
  // delimiter at end-of-file count even with no trailing newline.
  const lines = text.split(/\r?\n/);
  if (!DELIMITER.test(lines[0])) continue;

  const end = lines.findIndex((line, i) => i > 0 && DELIMITER.test(line));
  if (end === -1) {
    failures.push(`${where}:1 — frontmatter opens but never closes`);
    continue;
  }

  checked++;
  let parsed;
  try {
    parsed = load(lines.slice(1, end).join("\n"));
  } catch (e) {
    // js-yaml counts lines from the start of the block; the block starts at
    // file line 2.
    failures.push(
      `${where}:${(e.mark?.line ?? 0) + 2} — ${e.reason ?? e.message.split("\n")[0]}`,
    );
    continue;
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    failures.push(`${where}:2 — frontmatter is not a mapping`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`check-frontmatter: ${failure}`);
  console.error(`check-frontmatter: ${failures.length} of ${files.length} files failed`);
  process.exit(1);
}

console.log(`check-frontmatter: ${checked} frontmatter blocks, ${files.length} markdown files`);
