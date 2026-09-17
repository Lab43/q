# Enforce Pins

The machine-local enforcement procedure: make this machine match the project's declared pins. Enforce without asking — pins are the project's recorded decisions, and this merely applies them.

1. Check that `node` and `npm` resolve. When either is missing, Node.js is not installed — report that fix; the npm sync below waits on it, though the plugin steps still run.
2. When `node_modules/` is missing a pinned package, or holds a version other than its pin, run the project's package-manager install — `npm install`, or the pnpm or yarn equivalent its lockfile indicates.
3. Before any plugin operation, run `claude plugin marketplace update q-pin` — the plugin cache is otherwise stale against a moved marketplace ref. When the CLI does not know the `q-pin` marketplace, first run `claude plugin marketplace add --scope local ./.claude/q-marketplace`. Local scope records the registration in the project's own `.claude/settings.local.json`. It does not keep the registration private. The add also writes the machine-global marketplace registry, which holds one entry per marketplace name, and resolution follows that entry. Every q project names its marketplace `q-pin`, so on a machine with two of them the last add wins and a project can install the other's pinned version. Issue #48 tracks the fix.
4. When the plugin is absent, run `claude plugin install q@q-pin --scope project`.
5. When the installed plugin version differs from the pin, or the pinned ref is known to have moved, run `claude plugin update q@q-pin --scope project`. If the content doesn't move, uninstall and reinstall `q@q-pin` — the plugin cache is keyed by version, so a ref move without a version change is otherwise invisible.
6. After any plugin change, run `/reload-plugins`.

Name any tracked file the enforcement rewrote (a lockfile). That change stays in the tree as the user's.
