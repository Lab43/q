---
name: drive
description: Bring the product or toolchain up and exercise it — to see a change working, or to settle a question only running something can. Name what to exercise. Records what it learned in the project's driving manual. Never fixes what it finds.
---

# Drive

What to exercise comes from the invocation — a flow, an endpoint, a command, a question only running something can settle. Given nothing, ask.

## Ground rules

- **Follow the run contract** — `${CLAUDE_PLUGIN_ROOT}/references/run-contract.md`. Once you know what to exercise, proceed autonomously throughout: there is no agreement to converge on and nothing to deliver.
- **Report, never fix**: report a failing launch, a broken flow, a wrong result. The fix belongs to the calling run, or to the user.
- **Never skip silently**: stop and ask when the environment won't come up, when a dependency is missing, or when a feature can't be exercised. Name what's missing. Offer to install it when you know how, and do it only on the user's go-ahead. Never report a surface as exercised unless you exercised it.

## Step 1: Read the driving manual

Find the project's driving manual from the agent briefing's docs index, or from `docs/guides/` when the index doesn't name it. Read it. Follow what it cites.

Derive how to drive when the project has no manual. Read its scripts, its config, and its README.

## Step 2: Drive it

Bring the target up. Never stop what you didn't start: a stack already running is the user's.

Exercise it the way it will really be used: load the page, call the endpoint, run the command, walk the flow.

Write whatever harness the driving needs in scratch space — a script, a fixture, a seeded request. Leave it there. Report a harness worth keeping rather than planting it in the project.

Keep a record as you go: the commands you ran, what you saw, and every step the manual didn't tell you.

## Step 3: Update the manual

Record what cost you time, and what would cost the next session time:

- what has to be installed or running first — a database, a container stack, local certificates, an MCP server
- the commands that bring it up, plus the ports, URLs, and credentials they need
- the path to what you exercised — the route, the seed data, the login
- the failure that looks like a bug in the code and isn't

Write a failure as its symptom, its cause, and what to do about it. A symptom the next session can't match against what they're seeing teaches nothing.

Leave out what the scripts and the config already answer. A manual of obvious facts is surface that rots.

The manual is a set of directions, not a log. Where its instructions failed you, rewrite them. Never leave a wrong instruction standing next to its correction.

Create the manual when the project has none. Name it `docs/guides/driving-manual.md`, unless the project's own docs layout points somewhere else.

Make the change through `/q:update-docs`. Deliver nothing here. The change joins the calling run's change, or waits uncommitted.

## Step 4: Report

Report what you exercised and what it demonstrated, claim by claim — the evidence a PR's Testing section carries (source: q conventions/pull-requests.md, Sections). Name what changed in the manual, and say whether that change is still uncommitted. Report what failed and stop there.
