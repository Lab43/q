# Writing

Rules for writing prose — docs, plans, PR bodies, anything a human or agent will read. Agents bias toward long, chained, accreting text. These rules are the standing correction.

## One idea per sentence

Give each instruction or claim its own sentence. Don't chain ideas with semicolons, commas, or em-dash asides. Chained qualifiers make the reader guess what binds to what. A conditional sits next to the thing it modifies, or becomes its own sentence.

## Lists over paragraphs

Three or more parallel items become a list. Parallelism hides in prose: check any paragraph that names several deliverables, steps, or options. A reader scans a list but has to parse a paragraph.

Each item stands alone, with no trailing commas and no closing "and" or "or". When dropping the connective would lose meaning, the lead-in carries it: "any of the following".

## Constrain content, not length

Never regulate prose with a length target — "keep it short", "a few sentences", a line cap. Define what the piece must carry and what gets cut. A length target doesn't select for the right information, and it backfires when there is genuinely a lot to present.

## Plain words

Use the words a reader would use to describe the thing. Write "errors now show a message instead of crashing", not "error handling was hardened with graceful degradation". Jargon and category labels make the reader translate before they can follow.

## Instructions are commands

Write an instruction — to a human or an agent — as a command: "commit the fixes", never "the fixes are committed" or "the run commits the fixes". Passives and narration hide who acts. Keep declarative sentences for facts a reader relies on.

## Deletion is the default

Deletion is safe: version history keeps everything cut. When a judgment call between keeping and cutting is close, cut. When text is ambiguous or wrong, try deleting it before qualifying it.

## Refine rather than append

Integrate a change by rewriting the text it lands in until the piece reads as if written that way from the start. Appending shows at every scale:

- a qualifier bolted onto an existing sentence
- a clarification or exception that walks back a statement made earlier — evidence the statement itself needs adjusting
- a changelog at the bottom of a doc — version history is the changelog

In every case, fix the original text where it stands.

## Write for the reader, not the edit

Write each edit for the reader who arrives fresh: they see the merged text, never the text it replaced, the request, or the conversation behind the change. Cut detail that earns its place only against that history — a qualifier rebutting the old wording, a scope note answering something the conversation raised. To the fresh reader it answers a question no one asked. The test: would the sentence survive a from-scratch rewrite of the piece?
