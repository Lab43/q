// check-frontmatter delegates YAML judgement to js-yaml and owns two things
// itself: finding the frontmatter block, and rejecting a block that parses but
// is not a mapping. The cases below are split accordingly — the parser's
// verdicts, then the block-finding this script is responsible for.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanup, runScript, stageFrontmatter } from "./helpers.mjs";

const SCRIPT = "check-frontmatter.mjs";

after(cleanup);

/** Run the checker over a single staged markdown file. */
const check = (contents) =>
  runScript(stageFrontmatter({ "doc.md": contents }), SCRIPT);

const assertRejected = (contents, expected) => {
  const { status, stderr } = check(contents);
  assert.equal(status, 1, `expected rejection, got exit 0\n${contents}`);
  assert.match(stderr, /doc\.md:\d+/, "a failure must name the file and line");
  if (expected) assert.match(stderr, expected);
};

const assertAccepted = (contents) => {
  const { status, stderr } = check(contents);
  assert.equal(status, 0, `expected acceptance, got:\n${stderr}`);
};

describe("invalid YAML is rejected", () => {
  it("rejects a bare colon-space in a value", () => {
    // The case the check exists for: valid to Claude Code, rejected by editors
    // and by every YAML parser.
    assertRejected("---\ndescription: Bare: colon.\n---\n\n# X\n", /bad indentation/);
  });

  it("rejects a tab used for indentation", () => {
    assertRejected("---\nouter:\n\tinner: x\n---\n\n# X\n", /tab characters/);
  });

  it("rejects an unclosed quote", () => {
    assertRejected("---\nkey: 'unclosed\n---\n\n# X\n");
  });

  it("rejects an unclosed flow sequence", () => {
    assertRejected("---\nkey: [1, 2\n---\n\n# X\n");
  });

  it("rejects an unclosed flow mapping", () => {
    assertRejected("---\nkey: {a: 1\n---\n\n# X\n");
  });

  it("rejects duplicate keys", () => {
    assertRejected("---\nkey: 1\nkey: 2\n---\n\n# X\n", /duplicated mapping key/);
  });

  it("rejects inconsistent indentation", () => {
    assertRejected("---\nkey: value\n  stray: indent\n---\n\n# X\n", /bad indentation/);
  });

  it("rejects an unknown escape sequence", () => {
    assertRejected('---\nkey: "bad \\q escape"\n---\n\n# X\n', /unknown escape/);
  });

  it("rejects an undefined alias", () => {
    assertRejected("---\nkey: *nope\n---\n\n# X\n", /alias/);
  });
});

describe("valid YAML is accepted", () => {
  it("accepts a quoted colon-space, which is the fix for the rejected case", () => {
    assertAccepted('---\ndescription: "Quoted: colon."\n---\n\n# X\n');
  });

  it("accepts a nested mapping", () => {
    assertAccepted("---\nkey:\n  - a\n  - b\n---\n\n# X\n");
  });

  it("accepts a block scalar", () => {
    assertAccepted("---\nkey: |\n  line one\n  line two\n---\n\n# X\n");
  });

  it("accepts CRLF line endings", () => {
    assertAccepted("---\r\nkey: value\r\n---\r\n\r\n# X\r\n");
  });
});

describe("the frontmatter block", () => {
  it("rejects a block that never closes", () => {
    assertRejected("---\nkey: value\n\n# X\n", /never closes/);
  });

  it("rejects a YAML document-end marker used as the closing delimiter", () => {
    assertRejected("---\nkey: value\n...\n\n# X\n", /never closes/);
  });

  it("rejects a block that is empty", () => {
    assertRejected("---\n---\n\n# X\n");
  });

  it("rejects a block holding a bare scalar", () => {
    assertRejected("---\njust a scalar\n---\n\n# X\n", /not a mapping/);
  });

  it("rejects a block holding a sequence", () => {
    assertRejected("---\n- a\n- b\n---\n\n# X\n", /not a mapping/);
  });

  it("accepts trailing whitespace on the closing delimiter", () => {
    // markdownlint accepts it, so rejecting it here would fail valid files.
    assertAccepted("---\nkey: value\n---  \n\n# X\n");
  });

  it("accepts a closing delimiter at end of file with no trailing newline", () => {
    assertAccepted("---\nkey: value\n---");
  });

  it("accepts a horizontal rule in the body", () => {
    assertAccepted("---\nkey: value\n---\n\nBody.\n\n---\n\nMore body.\n");
  });

  it("sees through a byte-order mark", () => {
    // Without stripping the BOM the block is invisible, and invalid YAML inside
    // it would pass unreported.
    assertRejected("﻿---\ndescription: Bare: colon.\n---\n\n# X\n", /bad indentation/);
  });

  it("ignores a file carrying no frontmatter", () => {
    assertAccepted("# Just a heading\n\nBody text with a colon: here.\n");
  });
});

describe("directories it must not walk", () => {
  // Each stages genuinely invalid frontmatter in a directory the script skips.
  // Without the skip these become false failures on files nobody owns.
  const broken = "---\nkey: bare: colon\n---\n\n# X\n";

  it("ignores markdown inside node_modules", () => {
    const base = stageFrontmatter({ "node_modules/some-dep/README.md": broken });
    assert.equal(runScript(base, SCRIPT).status, 0);
  });

  it("ignores markdown inside .git", () => {
    const base = stageFrontmatter({ ".git/notes.md": broken });
    assert.equal(runScript(base, SCRIPT).status, 0);
  });

  it("ignores markdown inside another worktree", () => {
    const base = stageFrontmatter({ ".claude/worktrees/other/doc.md": broken });
    assert.equal(runScript(base, SCRIPT).status, 0);
  });

  it("still walks .claude outside worktrees", () => {
    const base = stageFrontmatter({ ".claude/doc.md": broken });
    assert.equal(runScript(base, SCRIPT).status, 1, "only worktrees are excluded, not all of .claude");
  });
});

describe("reporting", () => {
  it("names the line the parser objected to", () => {
    const { stderr } = check("---\nfine: value\nbroken: bare: colon\n---\n\n# X\n");
    assert.match(stderr, /doc\.md:3/, "the error line is the third line of the file");
  });

  it("counts every markdown file it walked, not only those with frontmatter", () => {
    const base = stageFrontmatter({
      "with.md": "---\nkey: value\n---\n\n# X\n",
      "without.md": "# No frontmatter\n",
      "nested/also.md": "---\nkey: value\n---\n\n# X\n",
    });
    const { stdout, status } = runScript(base, SCRIPT);
    assert.equal(status, 0);
    assert.match(stdout, /2 frontmatter blocks, 3 markdown files/);
  });

  it("reports every failing file, not just the first", () => {
    const base = stageFrontmatter({
      "one.md": "---\na: bare: colon\n---\n\n# X\n",
      "two.md": "---\nb: bare: colon\n---\n\n# X\n",
    });
    const { stderr, status } = runScript(base, SCRIPT);
    assert.equal(status, 1);
    assert.match(stderr, /one\.md:2/);
    assert.match(stderr, /two\.md:2/);
    assert.match(stderr, /2 of 2 files failed/);
  });
});
