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
import { cleanup, runVersions, staged, stageVersions } from "./helpers.mjs";

after(cleanup);

const SCRIPT = "set-version.mjs";
const VERSION = "1.2.3";

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const manifest = (version) => json({ name: "q", version });
const lock = (version) =>
  json({ name: "q", version, packages: { "": { name: "q", version } } });

const tree = (overrides = {}) => ({
  ...Object.fromEntries(manifests.map((file) => [file, manifest(VERSION)])),
  [lockfile]: lock(VERSION),
  ...overrides,
});

const stage = (overrides) => stageVersions(SCRIPT, tree(overrides));

/** Every version-carrying file's version, as the script left them on disk. */
const versionsOn = (base) =>
  [...manifests, lockfile].map((file) => JSON.parse(staged(base, file)).version);

describe("the arithmetic", () => {
  // The levels docs/guides/releasing.md defines, over plain major.minor.patch.
  for (const [level, expected] of [
    ["major", "2.0.0"],
    ["minor", "1.3.0"],
    ["patch", "1.2.4"],
  ]) {
    it(`moves ${VERSION} to ${expected} on ${level}`, () => {
      const base = stage();
      const { status, stdout, stderr } = runVersions(base, SCRIPT, [level]);
      assert.equal(status, 0, `expected success, got:\n${stderr}`);
      assert.match(stdout, new RegExp(`${VERSION} → ${expected} \\(${level}\\)`));

      for (const value of versionsOn(base)) assert.equal(value, expected);
      // The lockfile's second copy moves too, and nothing else reads it.
      assert.equal(JSON.parse(staged(base, lockfile)).packages[""].version, expected);
    });
  }

  it("rejects a level it does not define", () => {
    const { status, stderr } = runVersions(stage(), SCRIPT, ["sideways"]);
    assert.equal(status, 1);
    assert.match(stderr, /usage: set-version/);
  });

  it("rejects being run with no level at all", () => {
    const { status, stderr } = runVersions(stage(), SCRIPT);
    assert.equal(status, 1);
    assert.match(stderr, /usage: set-version/);
  });
});

describe("a source it cannot read a version out of", () => {
  const [source] = manifests;

  it(`rejects ${source} missing entirely`, () => {
    const { status, stderr } = runVersions(stage({ [source]: null }), SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /set-version: cannot read/);
  });

  it(`rejects ${source} holding invalid JSON`, () => {
    const { status, stderr } = runVersions(stage({ [source]: "{ not json" }), SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /set-version: cannot parse/);
  });

  it(`rejects ${source} naming no version`, () => {
    const base = stage({ [source]: json({ name: "q" }) });
    const { status, stderr } = runVersions(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /names no version/);
  });

  it("rejects a version that is not major.minor.patch", () => {
    const base = stage({ [source]: manifest("1.2.3-beta.1") });
    const { status, stderr } = runVersions(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /not major\.minor\.patch/);
  });
});

describe("all or nothing", () => {
  // Each case breaks one file and then asserts every other file still holds
  // the old version. A script that wrote as it went would leave the earlier
  // ones moved.
  // The file the case deliberately broke carries no version to compare, so
  // the assertion is about every other one.
  const assertNothingMoved = (base, broken) => {
    for (const file of [...manifests, lockfile].filter((f) => f !== broken)) {
      const value = JSON.parse(staged(base, file)).version;
      assert.equal(value, VERSION, `a failed run must leave ${file} untouched`);
    }
  };

  for (const file of manifests.slice(1)) {
    it(`moves nothing when ${file} has no version field to rewrite`, () => {
      const base = stage({ [file]: json({ name: "q" }) });
      const { status, stderr } = runVersions(base, SCRIPT, ["patch"]);
      assert.equal(status, 1);
      assert.match(stderr, /no version field to rewrite/);
      assertNothingMoved(base, file);
    });
  }

  it('moves nothing when the lockfile has no packages[""] entry', () => {
    // The lockfile is checked after every manifest is rewritten in memory, so
    // this is the case that proves the writes really were held back.
    const base = stage({ [lockfile]: json({ name: "q", version: VERSION }) });
    const { status, stderr } = runVersions(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /no version to rewrite — run npm install instead/);
    for (const file of manifests) {
      assert.equal(JSON.parse(staged(base, file)).version, VERSION);
    }
  });

  it("moves nothing when the lockfile is unparseable", () => {
    const base = stage({ [lockfile]: "{ not json" });
    const { status, stderr } = runVersions(base, SCRIPT, ["patch"]);
    assert.equal(status, 1);
    assert.match(stderr, /cannot parse/);
    for (const file of manifests) {
      assert.equal(JSON.parse(staged(base, file)).version, VERSION);
    }
  });
});

describe("what it writes", () => {
  it("changes the version line and leaves the rest of a manifest alone", () => {
    // npm version reformats the whole file, which would bury the one changed
    // line in every release commit. This script rewrites in place instead.
    const [source] = manifests;
    const compact = '{\n  "name": "q",\n  "keywords": ["a", "b"],\n  "version": "1.2.3"\n}\n';
    const base = stage({ [source]: compact });

    assert.equal(runVersions(base, SCRIPT, ["patch"]).status, 0);
    assert.equal(staged(base, source), compact.replace('"1.2.3"', '"1.2.4"'));
  });

  it("re-serializes the lockfile as npm writes it", () => {
    const base = stage();
    assert.equal(runVersions(base, SCRIPT, ["patch"]).status, 0);

    const text = staged(base, lockfile);
    assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
  });
});
