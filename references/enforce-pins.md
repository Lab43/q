# Enforce Pins

The machine-local enforcement procedure: make this machine match the project's declared pins. Enforce without asking — pins are the project's recorded decisions, and this merely applies them.

1. When `node_modules/` is missing a pinned package, or holds a version other than its pin, run `npm install`.
2. Before any plugin operation, run `claude plugin marketplace update q-pin` — the plugin cache is otherwise stale against a moved marketplace ref. When the CLI does not know the `q-pin` marketplace — its scaffold landed in this same session — first run `claude plugin marketplace add ./.claude/q-marketplace`.
3. When the plugin is absent, run `claude plugin install q@q-pin --scope project`.
4. When the installed plugin version differs from the pin, run `claude plugin update q@q-pin --scope project`. When the ref moved without a version change, the version-keyed cache hides the move — uninstall and reinstall instead.
5. After any plugin change, run `/reload-plugins`.

Name any tracked file the enforcement rewrote (a lockfile). That change stays in the tree as the user's.
