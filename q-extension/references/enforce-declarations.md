# Enforce Declarations

The machine-local enforcement procedure: make this machine match what the project declares. Enforce without asking — the declarations are the project's recorded decisions, and this merely applies them.

1. Check that `node` and `npm` resolve. When either is missing, Node.js is not installed — report that fix. Nothing below runs without it.
2. When `node_modules/` is missing a declared dependency, or holds a version other than the lockfile's, run the project's package-manager install — `npm install`, or the pnpm or yarn equivalent its lockfile indicates. That install is the whole update mechanism: a session reads q from `node_modules/@lab43/q` as it stands, so nothing else has to reach it.
3. Register the project's marketplace: `claude plugin marketplace add --scope local ./`. The tracked settings only declare the marketplace — sessions resolve it against a machine-global registry the declaration does not update: an interactive session offers the registration behind a trust prompt, and a headless one never registers it at all. The manifest at the project root supplies the name, so nothing has to read or pass one. Skip this step when the project has no `.claude-plugin/marketplace.json`. The add fails outright against a directory holding no manifest. A project without one has not been scaffolded yet. Otherwise run it unconditionally, since the add changes nothing when the registry already points here. Local scope records the registration in the project's own `.claude/settings.local.json`, which does not keep it private.

   Three situations need it:

   - A fresh clone has never registered the marketplace.
   - A declined trust prompt left it unregistered.
   - Another checkout of this repo has repointed the project's name at itself. The machine-global registry holds one entry per marketplace name. The add repoints it back, because an entry whose name matches but whose path differs is updated to the new path.
4. After any change above, the plugin loads only once the user runs `/reload-plugins`, a terminal command no session can invoke. Name it in the closing report.

Name any tracked file the enforcement rewrote (a lockfile). That change stays in the tree as the user's.
