// The run-note hook decides between silence and handing a note back. Silence
// is the healthy outcome for every session with no run in flight, so what
// exists but cannot be read — the hook input, the note — must speak: silence
// there would hide a run that lost its place.

import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cleanup, repoRoot, runHook, stageDir, stageHook } from "./helpers.mjs";

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

  it("is silent when the scratchpad directory is a file", () => {
    assertSilent(run({ source: "compact", scratchpad_dir: path.join(stageDir({ pad: "x\n" }), "pad") }));
  });

  it("is silent when the scratchpad holds no note", () => {
    assertSilent(run({ source: "compact", scratchpad_dir: stageDir({ "other.md": "x\n" }) }));
  });

  it("is silent inside a subagent, whose compaction is not the run's", () => {
    assertSilent(
      run({ source: "compact", agent_id: "a1", scratchpad_dir: stageDir({ "q-run.md": NOTE }) }),
    );
  });
});

// The start reason is gated in hooks.json, not in the script, so the wiring
// is what holds the "only after compaction" guarantee.
describe("the wiring", () => {
  it("runs the hook under the compact matcher, and only there", () => {
    const hooks = JSON.parse(fs.readFileSync(path.join(repoRoot, "q-extension", "hooks", "hooks.json"), "utf8"));
    const groups = hooks.hooks.SessionStart.filter((g) => g.hooks.some((h) => h.command.includes("run-note.mjs")));
    assert.equal(groups.length, 1, "expected exactly one SessionStart group to run the hook");
    assert.equal(groups[0].matcher, "compact");
    assert.equal(groups[0].hooks.length, 1, "the compact group runs nothing else");
  });
});

describe("the note", () => {
  it("points at the note and keeps its text out of context", () => {
    const pad = stageDir({ "q-run.md": NOTE });
    const context = spoken(run({ source: "compact", scratchpad_dir: pad }));
    assert.ok(context.includes(path.join(pad, "q-run.md")), "the context does not name the note's path");
    assert.ok(!context.includes(NOTE.trim()), "the note's text was injected");
    assert.match(context, /re-read the skill the note names from the step it names/);
    assert.match(context, /When the summary shows the run ended or was set aside, remove the note/);
  });

  it("leaves the start reason to the matcher in hooks.json", () => {
    const pad = stageDir({ "q-run.md": NOTE });
    const context = spoken(run({ source: "startup", scratchpad_dir: pad }));
    assert.ok(context.includes(path.join(pad, "q-run.md")));
  });

  it("speaks when the note exists but cannot be read", () => {
    // A directory in the note's place: it exists, and reading it fails.
    const context = spoken(run({ source: "compact", scratchpad_dir: stageDir({ "q-run.md/inner": "x\n" }) }));
    assert.match(context, /could not read it \(EISDIR\)/);
    assert.doesNotMatch(context, /re-read the skill/, "an unreadable note must not be replayed as a note");
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
