// check-tests owns three judgements: whether an executable has a suite, which
// files are executables at all, and whether a marker excuses the ones without
// a suite. The cases below are split that way, in that order.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanup, runScript, stageTests } from "./helpers.mjs";

after(cleanup);

const SCRIPT = "check-tests.mjs";
const RULE = "docs/conventions/testing.md";
const MARKER = `# exception: ${RULE}, What carries tests`;
const REASON = "# Cannot be tested here, for a reason the next editor needs.";

const check = (files) => runScript(stageTests(files), SCRIPT);

const assertAccepted = (files) => {
  const { status, stdout, stderr } = check(files);
  assert.equal(status, 0, `expected acceptance, got:\n${stderr}`);
  return stdout;
};

const assertRejected = (files, expected) => {
  const { status, stderr } = check(files);
  assert.equal(status, 1, "expected rejection, got exit 0");
  assert.match(stderr, /^check-tests: /m, "a failure must name the script");
  if (expected) assert.match(stderr, expected);
  return stderr;
};

describe("pairing an executable with its suite", () => {
  it("accepts an executable whose suite exists", () => {
    assertAccepted({ "hooks/thing.mjs": "", "tests/thing.test.mjs": "" });
  });

  it("rejects an executable with no suite and no marker", () => {
    assertRejected({ "hooks/thing.mjs": "" }, /hooks\/thing\.mjs:1 — no tests\/thing\.test\.mjs/);
  });

  it("pairs on the basename, so a pair can share one suite", () => {
    // session-start.sh and session-start.mjs are tested together, which is
    // how the repo actually covers them.
    assertAccepted({
      "hooks/thing.mjs": "",
      "hooks/thing.sh": "",
      "tests/thing.test.mjs": "",
    });
  });

  it("reports failures sorted, not in the order the walk found them", () => {
    // "-" sorts before "/", so a-b.mjs precedes a/z.mjs — but the walk
    // descends into a/ first, because readdir hands back "a" before "a-b.mjs".
    // Only these two shapes tell a sorted report from an unsorted one.
    const { stderr } = check({ "a/z.mjs": "", "a-b.mjs": "" });
    assert.ok(
      stderr.indexOf("a-b.mjs") < stderr.indexOf("a/z.mjs"),
      `expected a-b.mjs before a/z.mjs, got:\n${stderr}`,
    );
  });

  it("does not accept a suite that only looks like the right one", () => {
    assertRejected({ "hooks/thing.mjs": "", "tests/thing.test.js": "" }, /no tests\/thing\.test\.mjs/);
  });

  it("names every failing executable, not just the first", () => {
    const stderr = assertRejected({ "hooks/one.mjs": "", "scripts/two.sh": "" });
    assert.match(stderr, /hooks\/one\.mjs:1/);
    assert.match(stderr, /scripts\/two\.sh:1/);
    // Three discovered: these two, and the script itself, which passes.
    assert.match(stderr, /2 of 3 executables failed/);

  });
});

describe("what counts as an executable", () => {
  for (const ext of ["mjs", "sh", "py"]) {
    it(`discovers a .${ext} file`, () => {
      assertRejected({ [`src/thing.${ext}`]: "" }, new RegExp(`src/thing\\.${ext}:1`));
    });
  }

  it("matches the extension at the end, not anywhere in the name", () => {
    assertAccepted({ "docs/notes.py.bak": "", "docs/thing.mjs.txt": "" });
  });

  it("ignores a dotfile under .husky, which is never a hook", () => {
    // Finder drops .DS_Store there. Failing on it would block every commit.
    assertAccepted({ ".husky/.DS_Store": "" });
  });

  it("ignores a file with no extension outside .husky", () => {
    assertAccepted({ "docs/LICENSE": "", "src/notes.txt": "" });
  });

  it("discovers an extensionless file under .husky", () => {
    // A git hook runs whatever it is named, and none of them carry one.
    assertRejected({ ".husky/pre-commit": "" }, /\.husky\/pre-commit:1/);
  });

  it("ignores husky's own directory, which husky regenerates", () => {
    assertAccepted({ ".husky/_/husky.sh": "", ".husky/_/h": "" });
  });

  it("still discovers .husky files beside the skipped directory", () => {
    assertRejected({ ".husky/_/husky.sh": "", ".husky/pre-push": "" }, /\.husky\/pre-push:1/);
  });
});

describe("directories it must not walk", () => {
  // Each stages an untested executable somewhere the script skips. Without
  // the skip these become failures on files this repo does not own.
  for (const where of [
    "node_modules/some-dep/index.mjs",
    ".git/hooks/thing.sh",
    ".claude/worktrees/other/scripts/thing.mjs",
    ".github/workflows/thing.sh",
    "tests/fixture.mjs",
  ]) {
    it(`ignores ${where}`, () => {
      assertAccepted({ [where]: "" });
    });
  }

  it("still walks .claude outside worktrees", () => {
    assertRejected({ ".claude/thing.mjs": "" }, /\.claude\/thing\.mjs:1/);
  });

  it("still walks a directory whose name merely contains a skipped one", () => {
    assertRejected({ "my_node_modules/thing.mjs": "" }, /my_node_modules\/thing\.mjs:1/);
  });

  it("skips tests/ and .github/ by path, so a nested one is still walked", () => {
    assertRejected({ "docs/tools/tests/thing.mjs": "" }, /docs\/tools\/tests\/thing\.mjs:1/);
  });

  it("skips worktrees by its path, so one elsewhere is still walked", () => {
    assertRejected({ "docs/worktrees/thing.mjs": "" }, /docs\/worktrees\/thing\.mjs:1/);
  });
});

describe("the exception marker", () => {
  it("accepts an executable carrying a marker naming a section", () => {
    assertAccepted({ "src/thing.py": `${REASON}\n${MARKER}\n` });
  });

  it("rejects a marker naming the rule but no section", () => {
    assertRejected(
      { "src/thing.py": `${REASON}\n# exception: ${RULE}\n` },
      /src\/thing\.py:2 — exception names no section/,
    );
  });

  it("reports the line the marker sits on", () => {
    assertRejected(
      { "src/thing.py": `#!/usr/bin/env python3\n${REASON}\n\n# exception: ${RULE}\n` },
      /src\/thing\.py:4 — exception names no section/,
    );
  });

  it("does not let a marker naming another rule excuse a missing suite", () => {
    assertRejected(
      { "src/thing.py": "# exception: docs/conventions/style.md, Magic numbers\n" },
      /no tests\/thing\.test\.mjs/,
    );
  });

  it("reads a marker in a // comment as well as a #", () => {
    assertAccepted({ "src/thing.mjs": `// ${MARKER.slice(2)}\n` });
  });

  it("does not read the marker out of a string literal", () => {
    // A pattern matching the bare word would excuse any script that merely
    // talks about markers — check-tests itself names the rule in a constant.
    assertRejected(
      { "src/thing.mjs": `const rule = "exception: ${RULE}, What carries tests";\n` },
      /no tests\/thing\.test\.mjs/,
    );
  });

  it("does not read a marker sharing a line with code", () => {
    // The marker gets its own line. Trailing it after a statement would let
    // any line that happens to end with the text excuse the file.
    assertRejected(
      { "src/thing.mjs": `const x = 1; // exception: ${RULE}, What carries tests\n` },
      /no tests\/thing\.test\.mjs/,
    );
  });

  it("ignores the marker's own name in ordinary prose", () => {
    // The word is not the marker. Only a comment line carrying the shape is.
    assertRejected(
      { "src/thing.py": "# The exception: this file is special.\n" },
      /no tests\/thing\.test\.mjs/,
    );
  });
});

describe("reporting", () => {
  it("counts the tested and the excused separately", () => {
    // Three tested: these two plus the script itself, which the harness
    // stages a suite for.
    const stdout = assertAccepted({
      "hooks/one.mjs": "",
      "tests/one.test.mjs": "",
      "scripts/two.sh": "",
      "tests/two.test.mjs": "",
      "src/three.py": `${REASON}\n${MARKER}\n`,
    });
    assert.match(stdout, /check-tests: 3 executables tested, 1 excused/);
  });

  it("discovers itself, so the harness is not hiding the script from its own walk", () => {
    // Without its staged suite the script fails on itself. That is what makes
    // every other case's pass meaningful.
    const { status, stderr } = runScript(
      stageTests({ "tests/check-tests.test.mjs": null }),
      SCRIPT,
    );
    assert.equal(status, 1);
    assert.match(stderr, /scripts\/check-tests\.mjs:1/);
  });
});
