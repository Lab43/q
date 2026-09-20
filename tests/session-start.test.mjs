// The session-start hook decides between two outcomes: silence, or one uniform
// message routing the session to /q:sync. Silence is also the healthy signal,
// so an input the hook cannot read must still be loud — accidental silence is
// the failure this suite exists to prevent.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cleanup, pathWith, repoRoot, runHook, stageHook } from "./helpers.mjs";

after(cleanup);

// Committed as a literal, not read from the source. Reading it would make the
// assertion circular: the message is a contract with the session that reads it,
// so changing it should fail here and be updated deliberately.
const MESSAGE =
  "The q plugin could not validate this project's q setup, so its conventions and tooling may be stale or broken. Run /q:sync to repair it.";

const PIN = "1.0.0";

/** A project where pinned, loaded and watermarked all agree. */
const agreeing = (overrides = {}) => ({
  "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN } }),
  ".claude/q-state.json": JSON.stringify({ reconciledAgainst: { "@lab43/q": PIN } }),
  [`node_modules/@lab43/q/package.json`]: JSON.stringify({ version: PIN }),
  ...overrides,
});

const assertSilent = (result) => {
  assert.equal(result.stdout, "", "expected no output");
  assert.equal(result.status, 0);
};

const assertLoud = (result) => {
  assert.notEqual(result.stdout.trim(), "", "expected the hook to emit its message");
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "SessionStart");
  assert.equal(parsed.hookSpecificOutput.additionalContext, MESSAGE);
  assert.equal(result.status, 0, "the hook always exits 0 — it reports, never blocks");
};

describe("designed silences", () => {
  it("is silent with no package.json at all", () => {
    assertSilent(runHook(stageHook()));
  });

  it("is silent when package.json declares no @lab43/q devDependency", () => {
    const staged = stageHook({ project: { "package.json": '{"devDependencies":{"other":"1.0.0"}}' } });
    assertSilent(runHook(staged));
  });

  it("is silent when pinned, loaded and watermarked agree", () => {
    assertSilent(runHook(stageHook({ project: agreeing() })));
  });

  it("is silent when q appears only as a value, as in q's own manifest", () => {
    const staged = stageHook({ project: { "package.json": '{"name":"@lab43/q","version":"1.0.0"}' } });
    assertSilent(runHook(staged));
  });

  it("is silent for an unwatermarked devDependency whose manifest is absent", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, mystery: "2.0.0" } }),
      }),
    });
    assertSilent(runHook(staged));
  });

  it("is silent for an unwatermarked devDependency lacking the q-extension keyword", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, plain: "2.0.0" } }),
        "node_modules/plain/package.json": JSON.stringify({ version: "2.0.0", keywords: ["other"] }),
      }),
    });
    assertSilent(runHook(staged));
  });

  it("is silent for an unwatermarked devDependency whose manifest is unparseable", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, broken: "2.0.0" } }),
        "node_modules/broken/package.json": "{ not json",
      }),
    });
    assertSilent(runHook(staged));
  });
});

describe("the project manifest", () => {
  it("is loud when package.json is invalid JSON", () => {
    // The wrapper's grep still matches the pin's text, so it falls through.
    const staged = stageHook({ project: { "package.json": '{"devDependencies":{"@lab43/q":"1.0.0"' } });
    assertLoud(runHook(staged));
  });

  it("is loud when the pin is not a version string", () => {
    const staged = stageHook({ project: { "package.json": '{"devDependencies":{"@lab43/q":true}}' } });
    assertLoud(runHook(staged));
  });

  it("is silent when q is a plain dependency rather than a devDependency", () => {
    // The wrapper's grep matches @lab43/q in key position wherever it sits, so
    // this reaches the node script, which drops it for not being a
    // devDependency. Nothing else stages that pass-through.
    const staged = stageHook({ project: { "package.json": '{"dependencies":{"@lab43/q":"1.0.0"}}' } });
    assertSilent(runHook(staged));
  });

  it("is silent when the project directory is a file, not a directory", () => {
    // ENOTDIR is a designed silence. The wrapper's -f test shortcuts this, so
    // the node script is exercised directly.
    const staged = stageHook({ project: agreeing() });
    const asFile = path.join(staged.base, "not-a-dir");
    fs.writeFileSync(asFile, "");
    assertSilent(runHook({ proj: asFile, root: staged.root }, { entry: "node" }));
  });
});

describe("the loaded plugin", () => {
  it("is loud when the plugin manifest is missing", () => {
    const staged = stageHook({ project: agreeing(), pluginManifest: null });
    assertLoud(runHook(staged));
  });

  it("is loud when the plugin manifest is unparseable", () => {
    const staged = stageHook({ project: agreeing(), pluginManifest: "{ not json" });
    assertLoud(runHook(staged));
  });

  it("is loud when the plugin manifest names no version", () => {
    const staged = stageHook({ project: agreeing(), pluginManifest: '{"name":"@lab43/q"}' });
    assertLoud(runHook(staged));
  });

  it("is loud when the loaded version differs from the pin", () => {
    const staged = stageHook({ project: agreeing(), pluginManifest: '{"version":"0.9.0"}' });
    assertLoud(runHook(staged));
  });

  // q carries a watermark entry, so the extension loop checks the copy under the
  // project's own node_modules as well. That is a different install from the one
  // CLAUDE_PLUGIN_ROOT names, and the cases above leave it agreeing.
  it("is loud when the project's installed q differs from the pin", () => {
    const staged = stageHook({
      project: agreeing({ "node_modules/@lab43/q/package.json": JSON.stringify({ version: "0.9.0" }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when q is pinned and watermarked but not installed in the project", () => {
    const staged = stageHook({ project: agreeing({ "node_modules/@lab43/q/package.json": null }) });
    assertLoud(runHook(staged));
  });
});

describe("the state file", () => {
  it("is loud when a pinned project has no state file", () => {
    const staged = stageHook({ project: agreeing({ ".claude/q-state.json": null }) });
    assertLoud(runHook(staged));
  });

  it("is loud when the state file is invalid JSON", () => {
    const staged = stageHook({ project: agreeing({ ".claude/q-state.json": "{ not json" }) });
    assertLoud(runHook(staged));
  });

  it("is loud when the state file is not an object", () => {
    const staged = stageHook({ project: agreeing({ ".claude/q-state.json": '"a string"' }) });
    assertLoud(runHook(staged));
  });

  it("is loud when reconciledAgainst is an array", () => {
    const staged = stageHook({
      project: agreeing({ ".claude/q-state.json": '{"reconciledAgainst":[]}' }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when reconciledAgainst has no entry for q", () => {
    const staged = stageHook({
      project: agreeing({ ".claude/q-state.json": '{"reconciledAgainst":{"other":"1.0.0"}}' }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when a watermark is not a version string", () => {
    const staged = stageHook({
      project: agreeing({ ".claude/q-state.json": '{"reconciledAgainst":{"@lab43/q":42}}' }),
    });
    assertLoud(runHook(staged));
  });
});

describe("watermarked extensions", () => {
  const withExt = (overrides) =>
    agreeing({
      "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
      ".claude/q-state.json": JSON.stringify({
        reconciledAgainst: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
      }),
      "node_modules/@acme/ext/package.json": JSON.stringify({ version: "2.0.0" }),
      ...overrides,
    });

  it("is silent when an extension's three versions agree", () => {
    assertSilent(runHook(stageHook({ project: withExt({}) })));
  });

  it("is loud when a watermarked extension is no longer pinned", () => {
    const staged = stageHook({
      project: withExt({ "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN } }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when an extension's pin is not a version string", () => {
    const staged = stageHook({
      project: withExt({
        "package.json": JSON.stringify({
          devDependencies: { "@lab43/q": PIN, "@acme/ext": { bad: true } },
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when an extension's pin and watermark disagree", () => {
    const staged = stageHook({
      project: withExt({
        "package.json": JSON.stringify({
          devDependencies: { "@lab43/q": PIN, "@acme/ext": "3.0.0" },
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when a watermarked extension is not installed", () => {
    const staged = stageHook({
      project: withExt({ "node_modules/@acme/ext/package.json": null }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when an extension is installed at a version other than its pin", () => {
    const staged = stageHook({
      project: withExt({ "node_modules/@acme/ext/package.json": JSON.stringify({ version: "9.9.9" }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when a q-extension devDependency carries no watermark", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        "node_modules/@acme/ext/package.json": JSON.stringify({
          version: "2.0.0",
          keywords: ["q-extension"],
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("emits one message when two things are wrong at once", () => {
    const staged = stageHook({
      project: withExt({
        "node_modules/@acme/ext/package.json": null,
        ".claude/q-state.json": JSON.stringify({
          reconciledAgainst: { "@lab43/q": "0.1.0", "@acme/ext": "2.0.0" },
        }),
      }),
    });
    const result = runHook(staged);
    assertLoud(result);
    assert.equal(result.stdout.trimEnd().split("\n").length, 1);
  });
});

describe("a pin located outside the root manifest", () => {
  const WORKSPACE = "packages/acme-conventions";
  const MANIFEST = `${WORKSPACE}/package.json`;

  /** A repo authoring an extension: the q pin is the workspace's, not the root's. */
  const located = (overrides = {}) => ({
    "package.json": JSON.stringify({ private: true, workspaces: ["packages/*"] }),
    ".claude/q-state.json": JSON.stringify({
      manifest: MANIFEST,
      reconciledAgainst: { "@lab43/q": PIN },
    }),
    [MANIFEST]: JSON.stringify({
      name: "@acme/conventions",
      keywords: ["q-extension"],
      devDependencies: { "@lab43/q": PIN },
    }),
    "node_modules/@lab43/q/package.json": JSON.stringify({ version: PIN }),
    ...overrides,
  });

  // Every loud case here also proves the wrapper fell through: its grep gate
  // finds no q in the root manifest, so a message means the state file let it past.
  it("is silent when the located pin, its watermark and the install agree", () => {
    assertSilent(runHook(stageHook({ project: located() })));
  });

  it("is silent when q is installed under the workspace rather than hoisted", () => {
    const staged = stageHook({
      project: located({
        "node_modules/@lab43/q/package.json": null,
        [`${WORKSPACE}/node_modules/@lab43/q/package.json`]: JSON.stringify({ version: PIN }),
      }),
    });
    assertSilent(runHook(staged));
  });

  it("is loud when the locator names a manifest that is not there", () => {
    assertLoud(runHook(stageHook({ project: located({ [MANIFEST]: null }) })));
  });

  it("is loud when the locator names an unparseable manifest", () => {
    assertLoud(runHook(stageHook({ project: located({ [MANIFEST]: "{ not json" }) })));
  });

  it("is loud when the located manifest declares no @lab43/q devDependency", () => {
    const staged = stageHook({
      project: located({ [MANIFEST]: JSON.stringify({ name: "@acme/conventions" }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when the locator is not a string", () => {
    const staged = stageHook({
      project: located({
        ".claude/q-state.json": JSON.stringify({
          manifest: 42,
          reconciledAgainst: { "@lab43/q": PIN },
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when a root pin sits beside the located one", () => {
    const staged = stageHook({
      project: located({
        "package.json": JSON.stringify({
          private: true,
          workspaces: ["packages/*"],
          devDependencies: { "@lab43/q": PIN },
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when the located pin and its watermark disagree", () => {
    const staged = stageHook({
      project: located({
        ".claude/q-state.json": JSON.stringify({
          manifest: MANIFEST,
          reconciledAgainst: { "@lab43/q": "0.9.0" },
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when the installed q differs from the located pin", () => {
    const staged = stageHook({
      project: located({ "node_modules/@lab43/q/package.json": JSON.stringify({ version: "0.9.0" }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is silent when an extension is pinned in the root manifest beside it", () => {
    const staged = stageHook({
      project: located({
        "package.json": JSON.stringify({
          private: true,
          workspaces: ["packages/*"],
          devDependencies: { "@acme/ext": "2.0.0" },
        }),
        ".claude/q-state.json": JSON.stringify({
          manifest: MANIFEST,
          reconciledAgainst: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
        }),
        "node_modules/@acme/ext/package.json": JSON.stringify({ version: "2.0.0" }),
      }),
    });
    assertSilent(runHook(staged));
  });

  // The authored extension's own dependencies are not the project's installed
  // extensions, so the reverse-direction check must not reach them.
  it("is silent when the located manifest depends on an unwatermarked q-extension", () => {
    const staged = stageHook({
      project: located({
        [MANIFEST]: JSON.stringify({
          name: "@acme/conventions",
          devDependencies: { "@lab43/q": PIN, "@acme/other": "2.0.0" },
        }),
        "node_modules/@acme/other/package.json": JSON.stringify({
          version: "2.0.0",
          keywords: ["q-extension"],
        }),
      }),
    });
    assertSilent(runHook(staged));
  });

  it("is loud when a watermarked extension is pinned in the located manifest instead", () => {
    const staged = stageHook({
      project: located({
        [MANIFEST]: JSON.stringify({
          name: "@acme/conventions",
          devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
        }),
        ".claude/q-state.json": JSON.stringify({
          manifest: MANIFEST,
          reconciledAgainst: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
        }),
        "node_modules/@acme/ext/package.json": JSON.stringify({ version: "2.0.0" }),
      }),
    });
    assertLoud(runHook(staged));
  });
});

describe("a state file with no pin to find", () => {
  it("is loud when the root manifest names no q and no locator points elsewhere", () => {
    const staged = stageHook({
      project: {
        "package.json": JSON.stringify({ private: true }),
        ".claude/q-state.json": JSON.stringify({ reconciledAgainst: { "@lab43/q": PIN } }),
      },
    });
    assertLoud(runHook(staged));
  });

  it("is loud when there is no root manifest at all", () => {
    const staged = stageHook({
      project: { ".claude/q-state.json": JSON.stringify({ reconciledAgainst: { "@lab43/q": PIN } }) },
    });
    assertLoud(runHook(staged));
  });

  it("is loud when the state file is unparseable and the root manifest names no q", () => {
    const staged = stageHook({
      project: { "package.json": JSON.stringify({ private: true }), ".claude/q-state.json": "{ not json" },
    });
    assertLoud(runHook(staged));
  });
});

describe("the wrapper", () => {
  it("emits the message when node is unavailable", () => {
    const staged = stageHook({ project: agreeing() });
    // grep stays available so the wrapper's pin gate runs for real and the only
    // thing missing is node.
    assertLoud(runHook(staged, { env: { PATH: pathWith(["grep"]) } }));
  });

  it("keeps its message identical to the node script's", () => {
    const sh = fs.readFileSync(path.join(repoRoot, "hooks", "session-start.sh"), "utf8");
    const mjs = fs.readFileSync(path.join(repoRoot, "hooks", "session-start.mjs"), "utf8");

    assert.ok(mjs.includes(MESSAGE), "session-start.mjs no longer carries the expected message");
    // The wrapper embeds the message in a single-quoted bash string, so each
    // apostrophe becomes '"'" — a byte comparison against the source is
    // impossible, and un-escaping is what makes the two comparable.
    assert.ok(
      sh.replaceAll(`'"'"'`, "'").includes(MESSAGE),
      "session-start.sh no longer carries the expected message",
    );
  });
});

describe("q's own checkout", () => {
  it("is silent, because q pins no q", () => {
    assertSilent(
      runHook({ proj: repoRoot, root: repoRoot }),
    );
  });
});
