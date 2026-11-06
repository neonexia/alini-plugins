# Collaboration scenarios

These are illustrative workflows, not mandatory steps, platform-enforced states,
or authority to operate business systems. Use the organization's actual process,
permissions and completion criteria. Event names below are custom examples; use
normal event envelopes with descriptions, registered agent IDs and evidence links.
Read only the scenario relevant to the task.

## Order fulfillment across departments

**Outcome:** Fulfill an accepted customer order under its agreed terms, or record
an explicit exception requiring a decision.

**Participants:** Sales/customer service, finance, inventory, warehouse and logistics
agents. The coordinating agent tracks dependencies and the customer commitment.

**Possible channel:** `order-482-fulfillment`, with a description identifying the
order and intended outcome. Keep sensitive customer or payment details in their
approved systems; share only appropriate references and necessary context.

1. Sales records the accepted order version, quantities and delivery commitment.
2. Finance reports payment or credit readiness under the applicable business rules.
   Inventory reports actual reservations, distinguishing them from availability estimates.
3. Warehouse prepares the order when the required prerequisites are satisfied.
   Logistics can investigate delivery options in parallel; an option is not a booking.
4. Inventory discovers a shortage. The coordinator asks the responsible departments
   for alternatives. A proposed substitution or split shipment remains a proposal
   until the required decision is observed. Changes to the order reopen affected
   checks, such as price, credit, reservation or delivery feasibility.
5. Logistics records shipment evidence. If the agreed outcome includes delivery,
   dispatch alone does not complete the work; delivery evidence is still required.

**Example events:** `order.confirmed`, `inventory.reserved`, `finance.ready`,
`fulfillment.blocked`, `shipment.dispatched`, `delivery.confirmed`. A status event
includes what was checked, the order version, evidence and outstanding conditions.

**Unavailable participant:** If finance readiness is required and the finance agent
has not responded, seek an authorized alternative or leave that dependency pending.
Continue independent planning; silence does not authorize release of the order.

**Completion evidence:** The agreed quantities and destination reconcile with the
required fulfillment evidence, financial conditions are satisfied, and exceptions
have explicit dispositions. Use the actual task scope: shipment and delivery are
separate outcomes, not interchangeable labels.

## Return and refund across departments

**Outcome:** Resolve a customer's return with the correct refund or replacement,
and reconcile the physical item, financial outcome and customer notification.

**Participants:** Customer support, returns/warehouse, product quality, finance and,
when needed, logistics or replacement-inventory agents.

**Possible channel:** `return-219-resolution`. A coordinator's journal can separately
record the current decision, owners, dependencies and remaining evidence.

1. Support records the requested remedy and applicable return terms, referencing
   the original order. A request is not yet authorization or a completed refund.
2. Logistics arranges the authorized return. Warehouse confirms receipt, item identity
   and quantities; product quality records inspection findings where required.
3. Finance determines or executes the authorized refund using the actual terms and
   findings. Some policies permit refunds before receipt; others require inspection.
   Do not impose a universal sequence or invent an inspection requirement.
4. Suppose the inspected serial number differs from the expected item. Record the
   discrepancy and obtain the required disposition. Other agents can gather records
   without treating the disputed item as reconciled.
5. Finance reports the actual transaction state. A submitted request is not a settled
   refund. Support communicates the confirmed outcome and any remaining conditions.

**Example events:** `return.requested`, `return.received`, `inspection.recorded`,
`return.exception`, `refund.submitted`, `refund.confirmed`, `customer.notified`.
Link each to the same case and the relevant evidence; avoid duplicating financial
side effects when replaying events. If execution is uncertain, reconcile with the
business system before retrying a payment or replacement order.

**Unavailable participant:** If inspection is required but the quality agent is
unavailable, record the dependency and seek an authorized replacement. Do not turn
an optional consultation into a blocker or waive a required check to finish early.

**Completion evidence:** The authorized remedy has reached its required final state,
item disposition is recorded where applicable, and required notification is evidenced.
For a replacement, use replacement fulfillment criteria rather than refund criteria.

## Applying the same principles elsewhere

- **Software change:** A produced artifact and a required independent check are
  separate facts. Record which revision was examined and reconsider affected checks
  after a material change.
- **Insurance claim:** Received documents, a coverage decision and a completed payment
  are distinct outcomes. Use the actual policy and authorized decision maker.
- **Relief coordination:** Reported supplies, confirmed access and an authorized
  dispatch are distinct facts. Use responsible responders' procedures and current
  observations; a capability profile alone is not operational authority.

Across scenarios, invitations establish neither responsibility nor approval. Keep
required dependencies distinct from optional contributions, preserve uncertainties,
and evaluate completion against the stated outcome rather than the number of messages.
