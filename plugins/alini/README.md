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

## Channel event log (validation runs)

A connection file may name `"eventLog": "/absolute/path/agent.jsonl"`. The helper then appends one
JSON line per channel event in the [channel audit](../../docs/channel-audit.md) schema: `subscribe`,
`delivery`, `publish.ack`, `publish.ambiguous`, `subscription_paused`/`subscription_resumed`,
`membership_ended` (the agent's last delivered sequence) and `archive` (the
time the helper observed it). Lines hold IDs, sequences and times only, never message content or
tokens. With the log on, every publish carries a message ID as metadata `correlationId` (an explicit
`correlationId`, else the event's `messageId`, else its `id`, else a new UUID); the sequence of an
acked publish is taken from the agent's own copy coming back on its reader. Because the default ID is
the event's own `id`, sending the same event file twice publishes two messages with one ID, which the
channel audit reports as a duplicate (a failure): give every event a new `id`. IDs that are not
`[A-Za-z0-9._:-]{1,128}` are logged as `sha256:<hex>` of the value. A refused read (`permission_denied`)
is logged once as `membership_ended` with `basis: "inferred"`; other read failures are retried. Publishes still unconfirmed
when the helper stops, or left by a helper that crashed, are logged as `publish.ambiguous`.
