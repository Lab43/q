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
    const { status, stderr } = runScript(stage(), SCRIPT, ["sideways"]);
    assert.equal(status, 1);
    assert.match(stderr, /usage: set-version/);
  });

  it("rejects being run with no level at all", () => {
    const { status, stderr } = runScript(stage(), SCRIPT);
    assert.equal(status, 1);
    assert.match(stderr, /usage: set-version/);
  });
});

describe("a source it cannot read a version out of", () => {
  const [source] = manifests;

  it(`rejects ${source} missing entirely`, () => {
    const { status, stderr } = runScript(stage({ [source]: null }), SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /set-version: cannot read/);
  });

  it(`rejects ${source} holding invalid JSON`, () => {
    const { status, stderr } = runScript(stage({ [source]: "{ not json" }), SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /set-version: cannot parse/);
  });

  it(`rejects ${source} naming no version`, () => {
    const base = stage({ [source]: jsonFile({ name: "q" }) });
    const { status, stderr } = runScript(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /names no version/);
  });

  it("rejects a version that is not major.minor.patch", () => {
    const base = stage({ [source]: versionManifest("1.2.3-beta.1") });
    const { status, stderr } = runScript(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /not major\.minor\.patch/);
  });
});

describe("all or nothing", () => {
  // Each case breaks one file and asserts every other still holds the old
  // version. A script that wrote as it went would leave the earlier ones
  // moved. The broken file carries no version to compare, so it is excluded.
  const assertNothingMoved = (base, broken) => {
    for (const file of [...manifests, lockfile].filter((f) => f !== broken)) {
      assert.equal(versionOn(base, file), FIXTURE_VERSION, `a failed run must not move ${file}`);
    }
  };

  for (const file of manifests.slice(1)) {
    it(`moves nothing when ${file} has no version field to rewrite`, () => {
      const base = stage({ [file]: jsonFile({ name: "q" }) });
      const { status, stderr } = runScript(base, SCRIPT, ["patch"]);
      assert.equal(status, 1);
      assert.match(stderr, /no version field to rewrite/);
      assertNothingMoved(base, file);
    });
  }

  it('moves nothing when the lockfile has no packages[""] entry', () => {
    // The lockfile is checked after every manifest is rewritten in memory, so
    // this is the case that proves the writes really were held back.
    const base = stage({ [lockfile]: jsonFile({ name: "q", version: FIXTURE_VERSION }) });
    const { status, stderr } = runScript(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /no version to rewrite — run npm install instead/);
    assertNothingMoved(base, lockfile);
  });

  it("moves nothing when the lockfile is unparseable", () => {
    const base = stage({ [lockfile]: "{ not json" });
    const { status, stderr } = runScript(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /cannot parse/);
    assertNothingMoved(base, lockfile);
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
    const base = stage();
    assert.equal(runScript(base, SCRIPT, ["patch"]).status, 0);

    const text = stagedFile(base, lockfile);
    assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
  });
});
