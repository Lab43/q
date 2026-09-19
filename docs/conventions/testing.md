# Testing

Rules for testing q's own executables.

## What carries tests

Every executable this repo carries has committed tests.

Verification that does not survive the session does not count. A scratch script shows the code worked once and binds nothing afterwards.

## Test the shipped file, not a copy of its logic

q's executables locate their inputs relative to themselves. A test therefore stages a tree and copies the real file into it.

Rejected: giving an executable a parameter for its root so a test can import it. The seam exists only for the test, and the entry point that actually runs goes unexercised.

## Show the suite failing

A suite that passes against working code demonstrates nothing by itself. Break the code deliberately and confirm the suite goes red, once for each branch the suite claims to cover. A branch no single test pins is uncovered, however many tests surround it.

Mutate the harness too, not only the code under test. A staging shortcut can disable a whole class of coverage while every test still passes.

## Where silence is valid, test both outcomes

An executable whose healthy outcome is silence fails by staying silent when it should speak. Cover the speaking cases at least as thoroughly as the silent ones. An input that exists but cannot be read must speak.
