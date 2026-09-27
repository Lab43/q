// Point a q run at its note after compaction. A skill run keeps `q-run.md`
// in the session's scratchpad directory, which the hook input names.
// Compaction replaces the conversation with a summary, and the skill's text
// and the agreement go with it, so a note found afterwards is one the session
// can no longer see. The note's text stays out of context: the session reads
// it. hooks.json runs this only on the compact start reason. The script reads
// no start reason itself. The note is the main thread's, so a subagent
// compacting is silent. Silence is the healthy outcome otherwise too — no
// scratchpad, no note — and what exists but cannot be read speaks instead:
// the hook input, and the note itself.

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

// Present only when the hook fires inside a subagent.
if (input.agent_id !== undefined) process.exit(0);

// Absent when the session has no scratchpad: nothing to replay.
if (typeof input.scratchpad_dir !== "string") process.exit(0);

const note = path.join(input.scratchpad_dir, NOTE);
// Read to prove the note can be read, since a pointer at one that cannot be
// would misdirect the session. The text itself is not passed on.
try {
  fs.readFileSync(note);
} catch (e) {
  if (e.code === "ENOENT" || e.code === "ENOTDIR") process.exit(0);
  speak(`q found its run note at ${note} but could not read it (${e.code}). Read it before acting.`);
}

speak(
  `This session's context was compacted. A q run kept its run note at ${note}. Read it before acting. The summary decides whether that run is still live. When it is, re-read the skill the note names from the step it names, and keep the note current. When the summary shows the run ended or was set aside, remove the note and carry on.`,
);
