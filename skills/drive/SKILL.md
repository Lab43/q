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

Work out first what driving will bind — ports, databases, caches, devices — and which of those the repo holds only one of. The manual names them where a previous session recorded them, and the repo's scripts and config answer it where the manual doesn't. Then find out whether a peer already holds each one, under the conduct the run contract sets out (see: ${CLAUDE_PLUGIN_ROOT}/references/run-contract.md, Working alongside a peer): probe the resource itself — what is listening on the port, what holds the lock — and use `ListAgents` to put a session behind what you find.

Wait rather than seize. Where the harness offers a one-shot idle notice — `SendMessage`'s `notify_when_idle` — subscribe rather than poll. The notice says a session went idle, never that it freed anything: a session that left a server running is idle while still holding the port. Treat it as a prompt to probe again, never as an all-clear. Tell the user when the wait turns open-ended rather than waiting silently.

Announce the claim when you take it. When you finish, announce what you actually freed and what you left running — a stack you leave up still holds its port.

Bring the target up. Never stop what you didn't start: a stack already running is the user's.

Exercise it the way it will really be used: load the page, call the endpoint, run the command, walk the flow.

Write whatever harness the driving needs in scratch space — a script, a fixture, a seeded request. Leave it there. Report a harness worth keeping rather than planting it in the project.

Keep a record as you go: the commands you ran, what you saw, and every step the manual didn't tell you.

## Step 3: Update the manual

Record what cost you time, and what would cost the next session time:

- what has to be installed or running first — a database, a container stack, local certificates, an MCP server
- the commands that bring it up, plus the ports, URLs, and credentials they need
- the path to what you exercised — the route, the seed data, the login
- what a session may run its own copy of, and what it must take turns over
- how to claim and release each thing it takes turns over
- the failure that looks like a bug in the code and isn't

Write a failure as its symptom, its cause, and what to do about it. A symptom the next session can't match against what they're seeing teaches nothing.

Leave out what the scripts and the config already answer. A manual of obvious facts is surface that rots.

The manual is a set of directions, not a log. Where its instructions failed you, rewrite them. Never leave a wrong instruction standing next to its correction.

Create the manual when the project has none. Name it `docs/guides/driving-manual.md`, unless the project's own docs layout points somewhere else.

Make the change through `/q:update-docs`. Deliver nothing here. The change joins the calling run's change, or waits uncommitted.

## Step 4: Report

Report what you exercised and what it demonstrated, claim by claim — the evidence a PR's Testing section carries (source: q conventions/pull-requests.md, Sections). Name what changed in the manual, and say whether that change is still uncommitted. Name anything you waited on, and how long it held you. Report what failed and stop there.
