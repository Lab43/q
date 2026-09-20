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
import {
  FIXTURE_VERSION,
  cleanup,
  esc,
  jsonFile,
  runScript,
  stageVersions,
  versionLock,
  versionManifest,
  versionTree,
} from "./helpers.mjs";

after(cleanup);

const SCRIPT = "check-versions.mjs";
const OTHER = "9.9.9";

const check = (overrides) =>
  runScript(stageVersions(SCRIPT, versionTree(overrides)), SCRIPT);

const assertRejected = (overrides, expected) => {
  const { status, stderr } = check(overrides);
  assert.equal(status, 1, "expected rejection, got exit 0");
  assert.match(stderr, /^check-versions: /m, "a failure must name the script");
  if (expected) assert.match(stderr, expected);
};

describe("agreement", () => {
  it("accepts every version-carrying file at the same version", () => {
    const { status, stdout, stderr } = check();
    assert.equal(status, 0, `expected acceptance, got:\n${stderr}`);
    assert.match(stdout, new RegExp(`check-versions: ${esc(FIXTURE_VERSION)}`));
  });

  it("reports the version it agreed on, not a fixed string", () => {
    const base = stageVersions(SCRIPT, versionTree({}, OTHER));
    assert.match(runScript(base, SCRIPT).stdout, new RegExp(`check-versions: ${esc(OTHER)}`));
  });
});

describe("a version that disagrees", () => {
  // Every manifest after the source, so the set can grow without this suite
  // going quiet on the file that was added. Each names the
  // manifest-versus-manifest message, which nothing else reaches.
  for (const file of manifests.slice(1)) {
    it(`rejects ${file} carrying a different version`, () => {
      // The whole message, not just its tail: it is the only thing telling a
      // releaser which manifest to fix and what each one currently says.
      assertRejected(
        { [file]: versionManifest(OTHER) },
        new RegExp(
          `${esc(manifests[0])} is ${esc(FIXTURE_VERSION)}, ` +
            `${esc(manifests[1])} is ${esc(OTHER)} — release moves both together`,
        ),
      );
    });
  }

  it(`rejects ${manifests[0]}, the source, carrying a different version`, () => {
    // Everything is compared against this one, so it disagrees with all of them.
    assertRejected(
      { [manifests[0]]: versionManifest(OTHER) },
      new RegExp(
        `${esc(manifests[0])} is ${esc(OTHER)}, ` +
          `${esc(manifests[1])} is ${esc(FIXTURE_VERSION)} — release moves both together`,
      ),
    );
  });

  it("rejects the lockfile's root version disagreeing", () => {
    assertRejected(
      { [lockfile]: versionLock(OTHER, FIXTURE_VERSION) },
      new RegExp(`${esc(lockfile)} is ${esc(OTHER)} — run npm install`),
    );
  });

  it('rejects the lockfile\'s packages[""] version disagreeing', () => {
    // The second field is the one a hand-edit misses, and npm ci ignores
    // both. Naming the value pins that the message reports this field rather
    // than the root one, which still agrees.
    assertRejected(
      { [lockfile]: versionLock(FIXTURE_VERSION, OTHER) },
      new RegExp(`${esc(lockfile)} is ${esc(OTHER)} — run npm install`),
    );
  });
});

describe("a file it cannot read a version out of", () => {
  for (const file of [...manifests, lockfile]) {
    // Each names the file, so one it() per file genuinely distinguishes the
    // file it covers. These are also what pin helpers(script)'s output.
    it(`rejects ${file} missing entirely`, () => {
      assertRejected({ [file]: null }, new RegExp(`cannot read ${esc(file)}`));
    });

    it(`rejects ${file} holding invalid JSON`, () => {
      assertRejected({ [file]: "{ not json" }, new RegExp(`cannot parse ${esc(file)}`));
    });
  }

  for (const file of manifests) {
    it(`rejects ${file} naming no version`, () => {
      assertRejected({ [file]: jsonFile({ name: "q" }) }, new RegExp(`${esc(file)} names no version`));
    });
  }

  it("rejects a lockfile naming no version at either field", () => {
    assertRejected({ [lockfile]: jsonFile({ name: "q", packages: { "": {} } }) }, /run npm install/);
  });

  it('rejects a lockfile with no packages[""] entry', () => {
    assertRejected(
      { [lockfile]: jsonFile({ name: "q", version: FIXTURE_VERSION }) },
      /run npm install/,
    );
  });
});
