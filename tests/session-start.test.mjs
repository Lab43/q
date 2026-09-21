// The session-start hook decides between two outcomes: silence, or one uniform
// message routing the session to /q:reconcile. Silence is also the healthy
// signal,
// so an input the hook cannot read must still be loud — accidental silence is
// the failure this suite exists to prevent.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cleanup, pathWith, repoRoot, runHook, stageDecoy, stageDir, stageHook } from "./helpers.mjs";
import { lockedVersion } from "../q-extension/hooks/locked-version.mjs";

after(cleanup);

// Committed as a literal, not read from the source. Reading it would make the
// assertion circular: the message is a contract with the session that reads it,
// so changing it should fail here and be updated deliberately.
const MESSAGE =
  "The q plugin could not validate this project's q setup, so its conventions and tooling may be stale or broken. Run /q:reconcile to repair it.";

const PIN = "1.0.0";

/** A package-lock.json (v3) resolving each named direct dependency. */
const lockOf = (versions) =>
  JSON.stringify({
    name: "fixture",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: Object.fromEntries(
      Object.entries(versions).map(([name, version]) => [`node_modules/${name}`, { version }]),
    ),
  });

/** A project where locked, loaded, installed and watermarked all agree. */
const agreeing = (overrides = {}) => ({
  "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN } }),
  "package-lock.json": lockOf({ "@lab43/q": PIN }),
  ".claude/q-state.json": JSON.stringify({ reconciledAgainst: { "@lab43/q": PIN } }),
  [`node_modules/@lab43/q/package.json`]: JSON.stringify({ version: PIN }),
  ...overrides,
});

/**
 * An installed extension under the project's node_modules: the keyword in its
 * manifest plus a payload file, which together are what identifies one.
 */
const installedExt = (payload = "q-extension/conventions/rules.md", contents = "# Rules\n") => ({
  "node_modules/@acme/ext/package.json": JSON.stringify({
    version: "2.0.0",
    keywords: ["q-extension"],
  }),
  [`node_modules/@acme/ext/${payload}`]: contents,
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

  it("is silent when locked, loaded, installed and watermarked agree", () => {
    assertSilent(runHook(stageHook({ project: agreeing() })));
  });

  // package.json's value is a specifier, never a version the hook enforces:
  // a ranged pin with an agreeing lockfile and watermark is healthy.
  it("is silent with a ranged pin when the lockfile and watermark agree", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": "^1.0.0" } }),
      }),
    });
    assertSilent(runHook(staged));
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

  // The lockfile agrees throughout, so only the shape guard can catch this:
  // an entry that is not a string is not a specifier, however healthy the
  // versions around it look.
  it("is loud when q's manifest entry is not a string", () => {
    const staged = stageHook({
      project: agreeing({ "package.json": '{"devDependencies":{"@lab43/q":true}}' }),
    });
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

describe("the lockfile", () => {
  it("is loud when a q project has no lockfile", () => {
    const staged = stageHook({ project: agreeing({ "package-lock.json": null }) });
    assertLoud(runHook(staged));
  });

  it("is loud when the lockfile cannot resolve q", () => {
    const staged = stageHook({ project: agreeing({ "package-lock.json": lockOf({}) }) });
    assertLoud(runHook(staged));
  });
});

describe("the loaded plugin", () => {
  it("is loud when the package manifest is missing", () => {
    const staged = stageHook({ project: agreeing(), packageManifest: null });
    assertLoud(runHook(staged));
  });

  it("is loud when the package manifest is unparseable", () => {
    const staged = stageHook({ project: agreeing(), packageManifest: "{ not json" });
    assertLoud(runHook(staged));
  });

  it("is loud when the package manifest names no version", () => {
    const staged = stageHook({ project: agreeing(), packageManifest: '{"name":"@lab43/q"}' });
    assertLoud(runHook(staged));
  });

  it("is loud when the loaded version differs from the lockfile's", () => {
    const staged = stageHook({ project: agreeing(), packageManifest: '{"version":"0.9.0"}' });
    assertLoud(runHook(staged));
  });

  // q carries a watermark entry, so the extension loop checks the copy under the
  // project's own node_modules as well. That is a different install from the one
  // CLAUDE_PLUGIN_ROOT names, and the cases above leave it agreeing.
  it("is loud when the project's installed q differs from the lockfile's", () => {
    const staged = stageHook({
      project: agreeing({ "node_modules/@lab43/q/package.json": JSON.stringify({ version: "0.9.0" }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when q is declared and watermarked but not installed in the project", () => {
    const staged = stageHook({ project: agreeing({ "node_modules/@lab43/q/package.json": null }) });
    assertLoud(runHook(staged));
  });

  // CLAUDE_PLUGIN_ROOT names the payload directory, and npm requires the
  // manifest at the package root above it. A manifest planted inside the
  // plugin root at a disagreeing version makes the hook loud the moment it
  // reads the wrong one.
  it("reads the version from the package root, not the plugin root", () => {
    const staged = stageHook({ project: agreeing() });
    fs.writeFileSync(path.join(staged.root, "package.json"), '{"version":"0.9.0"}');
    assertSilent(runHook(staged));
  });

  // The plugin root the variable names and the one the running file sits in
  // are the same directory in production, so each pair of cases below splits
  // them: a decoy copy of the pair under a package at a disagreeing version.
  // Without the split, deleting either read leaves every case green.
  it("reads the plugin root from CLAUDE_PLUGIN_ROOT, not the running file", () => {
    const staged = stageHook({ project: agreeing() });
    assertSilent(runHook(staged, { from: stageDecoy(staged) }));
  });

  it("reads it from the variable through the node script too", () => {
    const staged = stageHook({ project: agreeing() });
    assertSilent(runHook(staged, { from: stageDecoy(staged), entry: "node" }));
  });

  // With the variable unset, each half derives the root from its own location.
  // The move put the manifest a further level up, so a fallback left pointing
  // at the old place reads no version.
  it("falls back to the running file's own package root", () => {
    const staged = stageHook({ project: agreeing() });
    const decoy = stageDecoy(staged, JSON.stringify({ version: PIN }));
    assertSilent(runHook(staged, { from: decoy, pluginRoot: false }));
  });

  it("falls back through the node script too", () => {
    const staged = stageHook({ project: agreeing() });
    const decoy = stageDecoy(staged, JSON.stringify({ version: PIN }));
    assertSilent(runHook(staged, { from: decoy, pluginRoot: false, entry: "node" }));
  });

  it("is loud when the fallback root's package disagrees with the lockfile", () => {
    const staged = stageHook({ project: agreeing() });
    assertLoud(runHook(staged, { from: stageDecoy(staged), pluginRoot: false }));
  });
});

describe("the state file", () => {
  it("is loud when a q project has no state file", () => {
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
      "package-lock.json": lockOf({ "@lab43/q": PIN, "@acme/ext": "2.0.0" }),
      ".claude/q-state.json": JSON.stringify({
        reconciledAgainst: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
      }),
      ...installedExt(),
      ...overrides,
    });

  it("is silent when an extension's three versions agree", () => {
    assertSilent(runHook(stageHook({ project: withExt({}) })));
  });

  it("is loud when a watermarked extension is in neither dependency map", () => {
    const staged = stageHook({
      project: withExt({ "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN } }) }),
    });
    assertLoud(runHook(staged));
  });

  // Lockfile and versions agree; only the shape guard can catch the entry.
  it("is loud when an extension's manifest entry is not a string", () => {
    const staged = stageHook({
      project: withExt({
        "package.json": JSON.stringify({
          devDependencies: { "@lab43/q": PIN, "@acme/ext": { bad: true } },
        }),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when the lockfile cannot resolve a watermarked extension", () => {
    const staged = stageHook({
      project: withExt({ "package-lock.json": lockOf({ "@lab43/q": PIN }) }),
    });
    assertLoud(runHook(staged));
  });

  // npm update moves the lockfile and leaves package.json alone, so this is
  // the shape an unreconciled move arrives in — node_modules not yet caught up.
  it("is loud when the lockfile moved off the watermark and node_modules is untouched", () => {
    const staged = stageHook({
      project: withExt({ "package-lock.json": lockOf({ "@lab43/q": PIN, "@acme/ext": "3.0.0" }) }),
    });
    assertLoud(runHook(staged));
  });

  // Same move, node_modules already caught up: only the watermark comparison
  // can catch it, so this is the case that pins that branch alone.
  it("is loud when the lockfile and node_modules moved but the watermark did not", () => {
    const staged = stageHook({
      project: withExt({
        "package-lock.json": lockOf({ "@lab43/q": PIN, "@acme/ext": "3.0.0" }),
        "node_modules/@acme/ext/package.json": JSON.stringify({
          version: "3.0.0",
          keywords: ["q-extension"],
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

  it("is loud when node_modules is stale against an agreeing lockfile and watermark", () => {
    const staged = stageHook({
      project: withExt({ "node_modules/@acme/ext/package.json": JSON.stringify({ version: "9.9.9" }) }),
    });
    assertLoud(runHook(staged));
  });

  it("is loud when a q-extension devDependency carries no watermark", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        ...installedExt(),
      }),
    });
    assertLoud(runHook(staged));
  });

  // An extension may be a regular dependency, because a package shipping rules
  // can also be one the project builds on.
  it("is loud when a q-extension dependency carries no watermark", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({
          devDependencies: { "@lab43/q": PIN },
          dependencies: { "@acme/ext": "2.0.0" },
        }),
        ...installedExt(),
      }),
    });
    assertLoud(runHook(staged));
  });

  it("is silent when an extension held as a regular dependency agrees", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({
          devDependencies: { "@lab43/q": PIN },
          dependencies: { "@acme/ext": "2.0.0" },
        }),
        "package-lock.json": lockOf({ "@lab43/q": PIN, "@acme/ext": "2.0.0" }),
        ".claude/q-state.json": JSON.stringify({
          reconciledAgainst: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
        }),
        ...installedExt(),
      }),
    });
    assertSilent(runHook(staged));
  });

  it("is loud when an extension held as a regular dependency drifts from its watermark", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({
          devDependencies: { "@lab43/q": PIN },
          dependencies: { "@acme/ext": "3.0.0" },
        }),
        "package-lock.json": lockOf({ "@lab43/q": PIN, "@acme/ext": "3.0.0" }),
        ".claude/q-state.json": JSON.stringify({
          reconciledAgainst: { "@lab43/q": PIN, "@acme/ext": "2.0.0" },
        }),
        ...installedExt(),
      }),
    });
    assertLoud(runHook(staged));
  });

  // The keyword alone is not identity. A package carrying it but shipping no
  // payload is not an extension, so it has no watermark to be missing and
  // there is no finding any skill could resolve.
  it("is silent for a keyword-carrying dependency that ships no payload", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        "node_modules/@acme/ext/package.json": JSON.stringify({
          version: "2.0.0",
          keywords: ["q-extension"],
        }),
      }),
    });
    assertSilent(runHook(staged));
  });

  it("is loud for an unwatermarked extension whose payload is a plugin alone", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        ...installedExt("q-extension/.claude-plugin/plugin.json", '{"name":"ext"}'),
      }),
    });
    assertLoud(runHook(staged));
  });

  // The other half of the conjunction. A payload directory laid down before
  // the keyword is the natural authoring order, and nothing without the
  // keyword is an extension.
  it("is silent for a dependency shipping a payload but no keyword", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        "node_modules/@acme/ext/package.json": JSON.stringify({ version: "2.0.0" }),
        "node_modules/@acme/ext/q-extension/conventions/rules.md": "# Rules\n",
      }),
    });
    assertSilent(runHook(staged));
  });

  // The payload check stats a path inside node_modules, and stat throws on an
  // unreadable directory however it is called. The hook reports; it never exits
  // on a stack trace.
  it("survives a payload directory it cannot read", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        ...installedExt(),
      }),
    });
    const payload = path.join(staged.proj, "node_modules/@acme/ext/q-extension");
    fs.chmodSync(payload, 0o000);
    try {
      // Unreadable reads as no payload, so this is the keyword-only silence.
      assertSilent(runHook(staged));
    } finally {
      fs.chmodSync(payload, 0o755);
    }
  });

  // A payload directory holding neither conventions/ nor .claude-plugin/ is
  // not one of the two shapes an extension ships.
  it("is silent for a keyword-carrying dependency whose payload holds neither shape", () => {
    const staged = stageHook({
      project: agreeing({
        "package.json": JSON.stringify({ devDependencies: { "@lab43/q": PIN, "@acme/ext": "2.0.0" } }),
        ...installedExt("q-extension/skills/thing/SKILL.md", "# Thing\n"),
      }),
    });
    assertSilent(runHook(staged));
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

describe("the wrapper", () => {
  it("emits the message when node is unavailable", () => {
    const staged = stageHook({ project: agreeing() });
    // grep stays available so the wrapper's pin gate runs for real and the only
    // thing missing is node.
    assertLoud(runHook(staged, { env: { PATH: pathWith(["grep"]) } }));
  });

  it("keeps its message identical to the node script's", () => {
    const sh = fs.readFileSync(path.join(repoRoot, "q-extension", "hooks", "session-start.sh"), "utf8");
    const mjs = fs.readFileSync(path.join(repoRoot, "q-extension", "hooks", "session-start.mjs"), "utf8");

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
      runHook({ proj: repoRoot, root: path.join(repoRoot, "q-extension") }),
    );
  });
});

// The module is written for import, so its suite imports the shipped file
// directly (see: tests/helpers.mjs). Fixtures mirror the files the four
// managers write — npm 10, pnpm 10, yarn berry 4, yarn classic 1 — pared to
// the structure the readers walk.
describe("lockedVersion", () => {
  const npmLock = (packages) =>
    JSON.stringify({ name: "fixture", version: "1.0.0", lockfileVersion: 3, packages });

  const NPM_LOCK = npmLock({
    "": { name: "fixture", version: "1.0.0", devDependencies: { semver: "^7.5.0" } },
    "node_modules/semver": { version: "7.5.0", resolved: "https://registry.npmjs.org/x" },
  });

  const PNPM_LOCK = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      '@acme/ext':
        specifier: ^1.0.0
        version: 1.0.0(peer@2.0.0)
    devDependencies:
      semver:
        specifier: ^7.5.0
        version: 7.5.0

packages:

  peer@2.0.0:
    resolution: {integrity: sha512-x}
`;

  const BERRY_LOCK = `# This file is generated by running "yarn install" inside your project.
# Manual changes might be lost - proceed with caution!

__metadata:
  version: 8
  cacheKey: 10c0

"fixture@workspace:.":
  version: 0.0.0-use.local
  resolution: "fixture@workspace:."
  dependencies:
    semver: "npm:^7.5.0"
  languageName: unknown
  linkType: soft

"semver@npm:^7.5.0":
  version: 7.5.0
  resolution: "semver@npm:7.5.0"
  languageName: node
  linkType: hard
`;

  const CLASSIC_LOCK = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


semver@^7.3.0, semver@^7.5.0:
  version "7.5.0"
  resolved "https://registry.yarnpkg.com/semver/-/semver-7.5.0.tgz"

"@acme/ext@^1.0.0":
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/@acme/ext/-/ext-1.0.0.tgz"
`;

  describe("npm", () => {
    it("finds a direct dependency's version", () => {
      const dir = stageDir({ "package-lock.json": NPM_LOCK });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), "7.5.0");
    });

    it("returns undefined for a package the lockfile lacks", () => {
      const dir = stageDir({ "package-lock.json": NPM_LOCK });
      assert.equal(lockedVersion(dir, "left-pad", "^1.0.0"), undefined);
    });

    it("returns undefined for unparseable JSON", () => {
      const dir = stageDir({ "package-lock.json": "{ not json" });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), undefined);
    });

    it("returns undefined for an entry whose version is not a string", () => {
      const dir = stageDir({
        "package-lock.json": npmLock({ "node_modules/semver": { version: 42 } }),
      });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), undefined);
    });
  });

  describe("pnpm", () => {
    it("finds a devDependency's version", () => {
      const dir = stageDir({ "pnpm-lock.yaml": PNPM_LOCK });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), "7.5.0");
    });

    it("strips the peer suffix from a quoted, scoped dependency", () => {
      const dir = stageDir({ "pnpm-lock.yaml": PNPM_LOCK });
      assert.equal(lockedVersion(dir, "@acme/ext", "^1.0.0"), "1.0.0");
    });

    it("returns undefined for a package only the packages section names", () => {
      // peer@2.0.0 sits under packages: but is nobody's direct dependency.
      const dir = stageDir({ "pnpm-lock.yaml": PNPM_LOCK });
      assert.equal(lockedVersion(dir, "peer", "^2.0.0"), undefined);
    });

    it("returns undefined when the file has no importers section", () => {
      const dir = stageDir({ "pnpm-lock.yaml": "lockfileVersion: '9.0'\n" });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), undefined);
    });
  });

  describe("yarn berry", () => {
    // The passed specifier is deliberately wrong: berry resolves through the
    // workspace block's own specifier. This also pins the __metadata check —
    // read as classic, the wrong specifier matches nothing.
    it("resolves the npm: specifier from the workspace block", () => {
      const dir = stageDir({ "yarn.lock": BERRY_LOCK });
      assert.equal(lockedVersion(dir, "semver", "irrelevant"), "7.5.0");
    });

    it("returns undefined when no workspace block exists", () => {
      const dir = stageDir({
        "yarn.lock": BERRY_LOCK.replace('"fixture@workspace:."', '"fixture@link:."'),
      });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), undefined);
    });

    it("returns undefined when the specifier's block is missing", () => {
      const dir = stageDir({
        "yarn.lock": BERRY_LOCK.replace('"semver@npm:^7.5.0":', '"semver@npm:^9.9.9":'),
      });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), undefined);
    });
  });

  describe("yarn classic", () => {
    it("matches the specifier among a multi-specifier key", () => {
      const dir = stageDir({ "yarn.lock": CLASSIC_LOCK });
      assert.equal(lockedVersion(dir, "semver", "^7.3.0"), "7.5.0");
    });

    it("matches a quoted, scoped key", () => {
      const dir = stageDir({ "yarn.lock": CLASSIC_LOCK });
      assert.equal(lockedVersion(dir, "@acme/ext", "^1.0.0"), "1.0.0");
    });

    it("returns undefined when the specifier matches no key", () => {
      const dir = stageDir({ "yarn.lock": CLASSIC_LOCK });
      assert.equal(lockedVersion(dir, "semver", "~7.0.0"), undefined);
    });

    it("returns undefined for a non-string specifier", () => {
      const dir = stageDir({ "yarn.lock": CLASSIC_LOCK });
      assert.equal(lockedVersion(dir, "semver", undefined), undefined);
    });
  });

  describe("dispatch", () => {
    it("returns undefined when no lockfile exists", () => {
      assert.equal(lockedVersion(stageDir({}), "semver", "^7.5.0"), undefined);
    });

    it("reads package-lock.json ahead of pnpm-lock.yaml", () => {
      const dir = stageDir({
        "package-lock.json": NPM_LOCK,
        "pnpm-lock.yaml": PNPM_LOCK.replace("version: 7.5.0", "version: 9.9.9"),
      });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), "7.5.0");
    });

    it("does not fall through past a lockfile that exists but misleads", () => {
      const dir = stageDir({
        "package-lock.json": "{ not json",
        "pnpm-lock.yaml": PNPM_LOCK,
      });
      assert.equal(lockedVersion(dir, "semver", "^7.5.0"), undefined);
    });
  });
});
