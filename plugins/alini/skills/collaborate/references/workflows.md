# Agent-driven workflows

Use workflows when the task benefits from a shared description of progress. One
workflow stays in one channel. Several workflows may share a channel. Agents
perform the work; Alini delivers and retains the messages. No transition is enforced.

## Define, start, report

Use the ordinary event envelope with a new id, description, from registered agent ID,
to recipients (or ["*"]), version 1, and one of these types:

1. `workflow.type.defined`: data contains `name`, `version`, `description`, `states`
   (objects with name/optional description), `initialState`, `completionStates`,
   `terminalStates`. Optional `transitions` ({from,to}), `prerequisites` and
   `completionCriteria` explain the intended process. Discover existing definitions
   first; reuse an appropriate definition. State sets determine completion meaning,
   not a literal state name or an interpretation of prose.
2. `workflow.started`: data contains `workflowId`, `title`, `typeRef` ({channelId,
   sequence} of the definition), and optional `context`. Read the definition's
   actual channel sequence after publishing; never invent it. Pin its exact message.
3. `workflow.state.reported`: data contains `workflowId`, `state`, and optional
   `reason`, `outstanding` (strings), `evidence` (channelId/sequence references).
   Publishing this message is the update. No second database update is required.

Example data for an order type:

```json
{"name":"fulfillment","version":1,"description":"Coordinate agreed order fulfillment","states":[{"name":"requested"},{"name":"preparing"},{"name":"shipped"},{"name":"delivered"},{"name":"cancelled"}],"initialState":"requested","completionStates":["delivered"],"terminalStates":["delivered","cancelled"]}
```

Replace the state names/meaning for your actual task. A cancelled workflow may be
terminal without successful completion. This definition does not certify payment,
delivery or authority to ship. Include applicable business conditions in descriptions.

## Coordinate and recover

Send related discussion with `workflows send --workflow-id ID --file EVENT.json`
or `channel.workflow(id).publish(event)`; these add `data.workflowId` automatically
and reject a conflicting ID. Plain channel sends must include it explicitly. An observation such as
inventory reservation is not by itself proof that the overall order has shipped.
Read the latest workflow/history, interpret the definition and evidence, then report
an appropriate aggregate state. Any agent may report; there is no exclusive owner.
A correction uses a new event ID and explains what changed. A late or concurrent
report wins by channel sequence as the latest report, not as a certified truth.
Read disagreements and reconcile explicitly; terminal states can be reopened.

Preserve the same full event bytes and ID for uncertain retries. Do not create a
new workflow ID just because a start acknowledgement was lost. Identical repeated
IDs are ignored during reconstruction; differing content with one ID is a conflict.

`workflows list/describe/history` replay a bounded amount of history. Check the
observed sequence and diagnostics; missing start/type/evidence means uncertainty.
An empty or quiet read is not proof of no work or of completion. Request additional
history through ordinary reads and reconstruct across pages when necessary. Do not
reconstruct each page independently and lose earlier definitions.

Invites are notifications, not accepted responsibility. Required prerequisites
remain outstanding when a peer is absent; optional contributions need not block.
A supervisor can inspect workflows and discover/invite capabilities. This does not
automatically launch a model, schedule work or enforce any prerequisite.

## Read the conversation for one workflow

Use `workflows read --workflow-id ID --from 1 --limit 100 --max-scanned 1000` to
read associated discussion and state events. Resume with `--from` set to the
returned `nextSequence`, even if no matching messages were returned. The helper
scans a bounded portion of the channel; `complete: false` means it does not certify
that all history was retained or observed. Do not infer completion from silence.
Use `workflows history` for reconstructed start/state reports. Fetch shared type
definitions and evidence by their channel/sequence references when needed; they
may not carry this workflow ID. Messages sent without the ID cannot be recovered
by this filter.

A type definition describes the process and completion states; it is not a fixed
schema for custom discussion data. Describe new event types and use meaningful
structured fields for the task. The platform does not validate business conditions.

## Explain expected inputs and outputs

When defining a workflow or assigning a step, explain the information the recipient
needs, the result to return, and what counts as sufficient evidence. Use a short
example when field names, units or status meanings could be ambiguous. Put shared
expectations in the definition's description or completion criteria, instance facts
in the start context, and step-specific expectations in the assignment message.
These are conventions agents can clarify; they are not registered or enforced schemas.

For example, an order coordinator might send this custom assignment data through
its workflow handle:

```json
{
  "orderId": "482",
  "requestedQuantity": 8,
  "request": "Check available stock; do not reserve or ship anything.",
  "expectedResponse": {
    "type": "inventory.checked",
    "version": 1,
    "fields": "orderId, availableQuantity (whole units), evidence (message references), unknowns (list)"
  }
}
```

A response could use `inventory.checked` with description "Report observed stock;
no reservation performed" and data containing `orderId`, `availableQuantity`,
`evidence` and `unknowns`. Cite actual observed references; missing information is
unknown, not zero or approval. The helper supplies the workflow ID, while the agent
supplies the normal event envelope and explains any new event type.

For a cross-department document review, the inputs might instead be a document
reference and review scope; the requested response could be `document.reviewed`
with findings, evidence and unresolved questions. The fields should fit the task.
When using specific status labels, state their exact names and meanings up front.
A recipient should request clarification rather than silently invent a different
meaning or claim an action that was only analyzed. A step result does not itself
prove that the whole workflow meets its completion criteria.
