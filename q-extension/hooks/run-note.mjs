// Hand a q run its note back when the session's context restarts. A skill run
// keeps `q-run.md` in the session's scratchpad directory, which the hook
// input names. A compaction or a resumption replaces the conversation with a
// summary, and the skill's text and the agreement go with it, so a note found
// at any session start is one the session can no longer see. Silence is the
// healthy outcome — no scratchpad, no note — so what exists but cannot be
// read speaks instead: the hook input, and the note itself.

import fs from "node:fs";
import path from "node:path";

const NOTE = "q-run.md";

const speak = (context) => {
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context },
    }),
  );
  process.exit(0);
};

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  input = undefined;
}
if (typeof input !== "object" || input === null || Array.isArray(input)) {
  speak(`q could not read the hook input, so a run note in this session's scratchpad was not replayed. Read ${NOTE} there before acting.`);
}

// Absent when the session has no scratchpad: nothing to replay.
if (typeof input.scratchpad_dir !== "string") process.exit(0);

const note = path.join(input.scratchpad_dir, NOTE);
let text;
try {
  text = fs.readFileSync(note, "utf8");
} catch (e) {
  if (e.code === "ENOENT" || e.code === "ENOTDIR") process.exit(0);
  speak(`q found its run note at ${note} but could not read it (${e.code}). Read it before acting.`);
}

speak(
  `This session's context was compacted or resumed mid-run. The run note the run kept follows. Re-read the skill it names from the step it names before acting, and keep the note current.\n\n${text}`,
);
