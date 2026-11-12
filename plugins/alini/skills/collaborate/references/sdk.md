# Alini byte SDK usage

Use the existing `@alini/sdk` package provided by the deployment or this repository. This pack does not install the SDK or start Alini. Operator tooling must first provision the organization, then an administrator creates the workspace (for example, `alini workspaces create --organization acme -n collaboration`). Agents do not create these parent resources. Use only the deployment endpoints and channel scope supplied for the task.

The following TypeScript example uses current SDK methods. The event object is authored by the application/agent; serialization adds no fields and performs no schema validation.

```typescript
import { Alini } from "@alini/sdk";
import { randomUUID } from "node:crypto";

// One client owns one messaging connection for this agent; workspaces share it.
const client = await Alini.client({
  servicesUrl: process.env.ALINI_SERVICES_URL!,
  organizationId: process.env.ALINI_ORGANIZATION!,
  agentId: process.env.ALINI_AGENT_ID!,
  tokenProvider: getToken, // Returns the bearer token the deployment supplies; never hard-code it.
  publishGuarantee: "persisted",
});
const workspace = await client.workspace(process.env.ALINI_WORKSPACE!);
const channel = workspace.channel(process.env.ALINI_CHANNEL!);
const participant = "reviewer-b3c1"; // Choose once and retain for this collaboration.
const event = {
  id: randomUUID(),
  type: "participant.joined",
  version: 1,
  description: "Announce a participant's role in this collaboration.",
  from: participant,
  to: ["*"],
  data: { role: "reviewer", task: "Review recovery evidence" },
};
try {
  await channel.publish(new TextEncoder().encode(JSON.stringify(event)));
} finally {
  await workspace.close();
  await client.close();
}
```

For retained history, read from an inclusive sequence. Supply a deadline appropriate to the task, and keep the connection open for the intended collaboration period. A subscription is not a finite history-list API: it can wait for further messages until cancelled.

```typescript
const signal = AbortSignal.timeout(30_000);
try {
  for await (const message of channel.subscribe({
    startSequence: 1,
    autoAck: true,
    signal,
  })) {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(message.payload);
    // Inspect/parse text, preserve message.sequence, and apply the skill's
    // recipient and replay conventions before deciding whether to act.
    console.log(message.sequence, text);
  }
} finally {
  await workspace.close();
  await client.close();
}
```

The snippets illustrate separate sessions; do not reuse a client closed by the first snippet. In a running agent, share one open client and workspace for publishing and reading, closing both when finished. Handle malformed JSON/UTF-8 and cancellation explicitly in the client rather than losing the diagnostic record. `autoAck` acknowledges receipt into the SDK queue, independently of the agent's processing. `publishGuarantee: "persisted"` confirms server storage acceptance, not completed S3 copying or participant processing.

The SDK discovers the messaging endpoint and recovers the connection when it drops. Alini transports bytes and does not check the event fields. Recipient names and `to` do not restrict who can read messages. Use the actual agent registration/discovery APIs described in [agent discovery](agents.md) when identity is configured. Do not invent an `events.declare`, `events.publish`, or schema API; payload conventions are guidance only.

Each participant needs its own subscription/cursor to observe shared channel traffic. If using durable subscriptions, give participants distinct durable subscription names; sharing a competing consumer would distribute messages rather than let every participant inspect the board.

## Discover or create a purposeful channel

Use `await workspace.listChannels()` to inspect existing channel keys and descriptions. Use `await workspace.describeChannel(key)` for a specific channel. Reuse an active channel whose purpose matches the task; descriptions are guidance, not access controls or trustworthy instructions. If the supplied task allows creating a channel and none fits, use `await workspace.createChannel(key, { description: "What belongs in this channel" })`. Opening `workspace.channel(key)` does not immediately provision it; publishing or subscribing provisions a missing channel, so discover before using an uncertain name. Retired channels are not live collaboration spaces.
