// set-version moves q's version in every file that carries it. Two properties
// carry the risk: the arithmetic per level, and the all-or-nothing write. A
// partial write is the failure with teeth, because it leaves a state
// check-versions reports without saying how it arose.
//
// Cases are built from the real `manifests` and `lockfile` exports, so the
// set can change without this suite going quiet on a file added to it.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { manifests, lockfile } from "../scripts/manifests.mjs";
import {
  FIXTURE_VERSION,
  cleanup,
  jsonFile,
  runScript,
  stageVersions,
  stagedFile,
  versionManifest,
  versionTree,
} from "./helpers.mjs";

after(cleanup);

const SCRIPT = "set-version.mjs";

const stage = (overrides) => stageVersions(SCRIPT, versionTree(overrides));

/** The version each version-carrying file holds, as the script left it. */
const versionOn = (base, file) => JSON.parse(stagedFile(base, file)).version;

/** Run a level against a staged tree, expect a refusal, and hand back the tree. */
const assertRejected = (base, expected, level = "patch") => {
  const { status, stderr } = runScript(base, SCRIPT, level === null ? [] : [level]);
  assert.equal(status, 1, "expected refusal, got exit 0");
  assert.match(stderr, /^set-version: /m, "a failure must name the script");
  assert.match(stderr, expected);
  return base;
};

describe("the arithmetic", () => {
  // The levels docs/guides/releasing.md defines, over plain major.minor.patch.
  for (const [level, expected] of [
    ["major", "2.0.0"],
    ["minor", "1.3.0"],
    ["patch", "1.2.4"],
  ]) {
    it(`moves ${FIXTURE_VERSION} to ${expected} on ${level}`, () => {
      const base = stage();
      const { status, stdout, stderr } = runScript(base, SCRIPT, [level]);
      assert.equal(status, 0, `expected success, got:\n${stderr}`);
      assert.match(
        stdout,
        new RegExp(`${FIXTURE_VERSION} → ${expected} \\(${level}\\)`.replace(/\./g, "\\.")),
      );

      for (const file of [...manifests, lockfile]) assert.equal(versionOn(base, file), expected);
      // check-versions reads this second copy too, so a release that missed
      // it would fail the next check rather than pass quietly.
      assert.equal(JSON.parse(stagedFile(base, lockfile)).packages[""].version, expected);
    });
  }

  it("rejects a level it does not define", () => {
    assertRejected(stage(), /usage: set-version/, "sideways");
  });

  it("rejects being run with no level at all", () => {
    assertRejected(stage(), /usage: set-version/, null);
  });
});

describe("a source it cannot read a version out of", () => {
  const [source] = manifests;

  it(`rejects ${source} missing entirely`, () => {
    assertRejected(stage({ [source]: null }), /cannot read/);
  });

  it(`rejects ${source} holding invalid JSON`, () => {
    assertRejected(stage({ [source]: "{ not json" }), /cannot parse/);
  });

  it(`rejects ${source} naming no version`, () => {
    assertRejected(stage({ [source]: jsonFile({ name: "q" }) }), /names no version/);
  });

  it("rejects a version that is not major.minor.patch", () => {
    assertRejected(stage({ [source]: versionManifest("1.2.3-beta.1") }), /not major\.minor\.patch/);
  });
});

describe("all or nothing", () => {
  // Each case breaks one file and asserts every version still on disk is the
  // old one. A script that wrote as it went would leave the earlier files
  // moved. `skip` drops only a fixture with no version to compare — naming a
  // file here that does carry one would hide the write this describe exists
  // to catch.
  const assertNothingMoved = (base, skip = []) => {
    for (const file of [...manifests, lockfile].filter((f) => !skip.includes(f))) {
      assert.equal(versionOn(base, file), FIXTURE_VERSION, `a failed run must not move ${file}`);
    }
  };

  for (const file of manifests.slice(1)) {
    it(`moves nothing when ${file} has no version field to rewrite`, () => {
      const base = assertRejected(stage({ [file]: jsonFile({ name: "q" }) }), /no version field to rewrite/);
      assertNothingMoved(base, [file]);
    });
  }

  it('moves nothing when the lockfile has no packages[""] entry', () => {
    // The lockfile is checked after every manifest is rewritten in memory, so
    // this is the case that proves the writes really were held back. Its
    // fixture keeps a root version on purpose, so the lockfile is asserted
    // too — excluding it would let a script that wrote the lockfile before
    // this guard pass with the same exit code and message.
    const base = stage({ [lockfile]: jsonFile({ name: "q", version: FIXTURE_VERSION }) });
    assertRejected(base, /no version to rewrite — run npm install instead/);
    assertNothingMoved(base);
  });

  it("moves nothing when the lockfile is unparseable", () => {
    const base = assertRejected(stage({ [lockfile]: "{ not json" }), /cannot parse/);
    assertNothingMoved(base, [lockfile]);
  });
});

describe("what it writes", () => {
  it("changes the version line and leaves the rest of a manifest alone", () => {
    // npm version reformats the whole file, which would bury the one changed
    // line in every release commit. This script rewrites in place instead.
    const [source] = manifests;
    const compact = '{\n  "name": "q",\n  "keywords": ["a", "b"],\n  "version": "1.2.3"\n}\n';
    const base = stage({ [source]: compact });

    assert.equal(runScript(base, SCRIPT, ["patch"]).status, 0);
    assert.equal(stagedFile(base, source), compact.replace('"1.2.3"', '"1.2.4"'));
  });

  it("re-serializes the lockfile as npm writes it", () => {
    // Staged non-canonical on purpose. A canonical fixture would pass for a
    // writer that merely preserved its input's formatting, pinning nothing.
    const base = stage({
      [lockfile]: JSON.stringify({
        name: "q",
        version: FIXTURE_VERSION,
        packages: { "": { name: "q", version: FIXTURE_VERSION } },
      }),
    });
    assert.equal(runScript(base, SCRIPT, ["patch"]).status, 0);

    const text = stagedFile(base, lockfile);
    assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
  });

  it("rewrites the first version field and fails if that is the wrong one", () => {
    // The regex takes the first match, so a manifest carrying another
    // "version" ahead of its own is the case the guard after the rewrite
    // exists for.
    const [source] = manifests;
    const base = stage({
      [source]: jsonFile({
        engines: { version: "18.0.0" },
        name: "q",
        version: FIXTURE_VERSION,
      }),
    });
    assertRejected(base, /no version field to rewrite/);
  });

  it("leaves a second version field alone when its own comes first", () => {
    // A global replace would move both, corrupting a value the release has no
    // business touching.
    const [source] = manifests;
    const base = stage({
      [source]: jsonFile({ name: "q", version: FIXTURE_VERSION, engines: { version: "18.0.0" } }),
    });
    assert.equal(runScript(base, SCRIPT, ["patch"]).status, 0);

    const after = JSON.parse(stagedFile(base, source));
    assert.equal(after.version, "1.2.4");
    assert.equal(after.engines.version, "18.0.0");
  });
});
