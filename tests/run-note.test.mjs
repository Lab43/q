// The run-note hook decides between silence and handing a note back. Silence
// is the healthy outcome for every session with no run in flight, so what
// exists but cannot be read — the hook input, the note — must speak: silence
// there would hide a run that lost its place.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { cleanup, runHook, stageDir, stageHook } from "./helpers.mjs";

after(cleanup);

const NOTE = "Skill: /q:implement, Step 4 (Build). Ship mode. Branch `fix-export`.\n";

/** Run the hook with `fields` as its stdin JSON, or a raw string as sent. */
const run = (fields) =>
  runHook(stageHook(), {
    entry: "run-note",
    input: typeof fields === "string" ? fields : JSON.stringify(fields),
  });

const assertSilent = (result) => {
  assert.equal(result.stdout, "", "expected no output");
  assert.equal(result.status, 0);
};

/** The hook spoke: return what it added to the session's context. */
const spoken = (result) => {
  assert.notEqual(result.stdout.trim(), "", "expected the hook to speak");
  assert.equal(result.status, 0, "the hook always exits 0 — it reports, never blocks");
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "SessionStart");
  return parsed.hookSpecificOutput.additionalContext;
};

describe("designed silences", () => {
  it("is silent when the input names no scratchpad directory", () => {
    assertSilent(run({ session_id: "abc", source: "compact" }));
  });

  it("is silent when the scratchpad directory is not a path", () => {
    assertSilent(run({ session_id: "abc", source: "compact", scratchpad_dir: 42 }));
  });

  it("is silent when the scratchpad directory does not exist", () => {
    assertSilent(run({ source: "compact", scratchpad_dir: path.join(stageDir({}), "gone") }));
  });

  it("is silent when the scratchpad holds no note", () => {
    assertSilent(run({ source: "compact", scratchpad_dir: stageDir({ "other.md": "x\n" }) }));
  });
});

describe("the note", () => {
  it("hands the note back verbatim, told to re-read the skill", () => {
    const context = spoken(run({ source: "compact", scratchpad_dir: stageDir({ "q-run.md": NOTE }) }));
    assert.ok(context.endsWith(`\n\n${NOTE}`), "the note is not the context's body");
    assert.match(context, /Re-read the skill it names from the step it names/);
  });

  it("hands it back whatever restarted the context, a resume included", () => {
    const context = spoken(run({ source: "resume", scratchpad_dir: stageDir({ "q-run.md": NOTE }) }));
    assert.ok(context.endsWith(`\n\n${NOTE}`));
  });

  it("speaks when the note exists but cannot be read", () => {
    // A directory in the note's place: it exists, and reading it fails.
    const context = spoken(run({ source: "compact", scratchpad_dir: stageDir({ "q-run.md/inner": "x\n" }) }));
    assert.match(context, /could not read it \(EISDIR\)/);
    assert.doesNotMatch(context, /Re-read the skill/, "an unreadable note must not be replayed as a note");
  });
});

describe("the hook input", () => {
  for (const [label, input] of [
    ["empty", ""],
    ["not JSON", "not json"],
    ["JSON but not an object", "[]"],
    ["JSON null", "null"],
  ]) {
    it(`speaks when the input is ${label}`, () => {
      assert.match(spoken(run(input)), /could not read the hook input/);
    });
  }
});
