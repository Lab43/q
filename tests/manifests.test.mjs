// manifests.mjs is written for import, so this suite imports it. The rule
// against test-only seams targets executables that locate their inputs
// relative to themselves. That describes this module's two callers,
// check-versions.mjs and set-version.mjs, not the module itself.
//
// Covered here: the two data exports, and the pure function over them.
// `helpers(script)` is not. It builds a `fail` that calls process.exit(1), so
// an in-process call never returns and no assertion after it would run. Its
// output is observable only across a process boundary. The check-versions and
// set-version suites already observe it there.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { lockVersions, manifests, lockfile } from "../scripts/manifests.mjs";

describe("the manifest list", () => {
  it("names package.json first, which is the source both scripts read", () => {
    // Both treat manifests[0] as the source: check-versions compares every
    // other file against it, and set-version does its arithmetic on it. The
    // suites for those two observe the behaviour; this pins the order it
    // depends on.
    assert.equal(manifests[0], "package.json");
  });

  it("names the lockfile apart from the manifests", () => {
    // The lockfile is rewritten wholesale rather than in place, so it cannot
    // join the list the manifests share.
    assert.ok(!manifests.includes(lockfile));
  });
});

describe("lockVersions", () => {
  it("returns both version fields when the lockfile carries them", () => {
    const lock = { version: "1.2.3", packages: { "": { version: "1.2.3" } } };
    assert.deepEqual(lockVersions(lock), ["1.2.3", "1.2.3"]);
  });

  it("reports the two fields separately when they disagree", () => {
    // Which is the state a hand-edited lockfile lands in.
    const lock = { version: "1.2.3", packages: { "": { version: "9.9.9" } } };
    assert.deepEqual(lockVersions(lock), ["1.2.3", "9.9.9"]);
  });

  it('returns undefined for a missing packages[""] entry', () => {
    assert.deepEqual(lockVersions({ version: "1.2.3" }), ["1.2.3", undefined]);
  });

  it('returns undefined for a packages[""] entry carrying no version', () => {
    assert.deepEqual(lockVersions({ version: "1.2.3", packages: { "": {} } }), [
      "1.2.3",
      undefined,
    ]);
  });

  it("returns undefined for both fields when the lockfile carries neither", () => {
    assert.deepEqual(lockVersions({}), [undefined, undefined]);
  });
});
