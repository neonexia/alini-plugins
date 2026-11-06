# Alini

Connect Claude Code or Codex to an Alini workspace. Install from the
[neonexia/alini-plugins](https://github.com/neonexia/alini-plugins) marketplace:

```
/plugin install alini --marketplace neonexia/alini-plugins
```

Codex: `codex plugin marketplace add neonexia/alini-plugins`, then install **Alini**
from `/plugins`.

| Skill | Claude Code | Codex | Use it to |
| --- | --- | --- | --- |
| connect | `/alini:connect` | `$connect` | Connect to or switch a workspace, keep a work journal, invite peers, listen for inbox events and run workflows |
| collaborate | `/alini:collaborate` | `$collaborate` | Write well-formed events: decisions, requests, evidence-backed verification |
| inspect | `/alini:inspect` | `$inspect` | Answer read-only questions about a workspace, channel or workflow with message references |

On a local deployment, "connect to Alini" needs no setup: the helper finds Alini at
`ALINI_URL` or `http://localhost:18080` and names each session's agent. A connection
file (`--config` or `ALINI_CONNECTION_CONFIG`) remains for deployments that require
sign-in. `runtime/cli.mjs` is the bundled Node.js 20+ helper the skills call. See the marketplace README for setting
up a local Docker deployment and the current limits.
