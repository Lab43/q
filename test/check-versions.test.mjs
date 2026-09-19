// check-versions holds every file carrying q's version at one value. The
// cases below are split by how a tree can disagree: a version that differs,
// and a file the script cannot get a version out of at all.
//
// Every case is built from the real `manifests` and `lockfile` exports rather
// than a hardcoded list, so a file added to or dropped from that set changes
// what these tests cover without anyone editing them.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { manifests, lockfile } from "../scripts/manifests.mjs";
import { cleanup, runVersions, stageVersions } from "./helpers.mjs";

after(cleanup);

const SCRIPT = "check-versions.mjs";
const VERSION = "1.2.3";
const OTHER = "9.9.9";

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const manifest = (version) => json({ name: "q", version });
const lock = (version, packageVersion = version) =>
  json({ name: "q", version, packages: { "": { name: "q", version: packageVersion } } });

/** A tree where every version-carrying file agrees, before overrides. */
const tree = (overrides = {}) => ({
  ...Object.fromEntries(manifests.map((file) => [file, manifest(VERSION)])),
  [lockfile]: lock(VERSION),
  ...overrides,
});

const check = (overrides) =>
  runVersions(stageVersions(SCRIPT, tree(overrides)), SCRIPT);

const assertRejected = (overrides, expected) => {
  const { status, stderr } = check(overrides);
  assert.equal(status, 1, `expected rejection, got exit 0`);
  assert.match(stderr, /^check-versions: /m, "a failure must name the script");
  if (expected) assert.match(stderr, expected);
};

describe("agreement", () => {
  it("accepts every version-carrying file at the same version", () => {
    const { status, stdout, stderr } = check();
    assert.equal(status, 0, `expected acceptance, got:\n${stderr}`);
    assert.match(stdout, new RegExp(`check-versions: ${VERSION}`));
  });

  it("reports the version it agreed on, not a fixed string", () => {
    const base = stageVersions(SCRIPT, {
      ...Object.fromEntries(manifests.map((file) => [file, manifest(OTHER)])),
      [lockfile]: lock(OTHER),
    });
    assert.match(runVersions(base, SCRIPT).stdout, new RegExp(`check-versions: ${OTHER}`));
  });
});

describe("a version that disagrees", () => {
  // Every manifest in turn, so the set can grow without this suite going
  // quiet on the file that was added.
  for (const file of manifests) {
    it(`rejects ${file} carrying a different version`, () => {
      assertRejected({ [file]: manifest(OTHER) }, new RegExp(OTHER));
    });
  }

  it("rejects the lockfile's root version disagreeing", () => {
    assertRejected({ [lockfile]: lock(OTHER, VERSION) }, /run npm install/);
  });

  it('rejects the lockfile\'s packages[""] version disagreeing', () => {
    // The second field is the one a hand-edit misses, and npm ci ignores both.
    assertRejected({ [lockfile]: lock(VERSION, OTHER) }, /run npm install/);
  });
});

describe("a file it cannot read a version out of", () => {
  for (const file of [...manifests, lockfile]) {
    it(`rejects ${file} missing entirely`, () => {
      assertRejected({ [file]: null }, /cannot read/);
    });

    it(`rejects ${file} holding invalid JSON`, () => {
      assertRejected({ [file]: "{ not json" }, /cannot parse/);
    });
  }

  for (const file of manifests) {
    it(`rejects ${file} naming no version`, () => {
      assertRejected({ [file]: json({ name: "q" }) }, /names no version/);
    });
  }

  it("rejects a lockfile naming no version at either field", () => {
    assertRejected({ [lockfile]: json({ name: "q", packages: { "": {} } }) }, /run npm install/);
  });

  it('rejects a lockfile with no packages[""] entry', () => {
    assertRejected({ [lockfile]: json({ name: "q", version: VERSION }) }, /run npm install/);
  });
});
