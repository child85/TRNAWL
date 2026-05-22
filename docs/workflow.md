# Workflow Notes

TRNAWL starts with simple, understandable workflow stages. The goal is operational governance without bureaucracy.

## Default Ticket Workflow

1. New
2. In Progress
3. Waiting
4. Review
5. Done

## Delivery Review Workflow

1. Draft
2. Ready for Review
3. In Review
4. Changes Requested
5. Approved
6. Delivered

## New SOW Workflow

The New SOW Workflow should capture the minimum operational review path for a new statement of work.

Suggested generated tasks:

1. Create SOW Intake Ticket
2. Delivery Review
3. Pricing Review
4. Scope Boundary Review
5. Legal Review
6. Customer Deck / Final Review

Each task should have an owner, due date, status, and blocker field. The workflow should make missing handoffs visible without forcing a heavy project plan.

## Blocked Reasons

Blocked tickets should use a controlled reason so the dashboard and reports can show where work is stuck.

Suggested reasons:

- Waiting for delivery
- Waiting for pricing
- Waiting for legal
- Waiting for customer
- Scope unclear
- Owner missing
- Dependency unresolved
- Approval pending
- Other

## Operational Readiness Checks

SOW and delivery work should expose a simple readiness view:

- Delivery reviewed
- Pricing reviewed
- Scope boundaries clear
- Owner assigned
- Customer dependencies listed
- Due dates realistic

The first version can store these as checklist fields and calculate a simple readiness score.

## Customer Action Register

Customer actions should be tracked separately from internal tasks when the customer owns the next move.

Each customer action should capture:

- Customer
- Action
- Customer owner
- Internal accountable owner
- Due date
- Status
- Last follow-up date

This keeps external dependencies visible without pretending they are internally owned tickets.

## Weekly Operational Brief

The weekly brief should summarize execution visibility:

- overdue tickets
- delayed delivery reviews
- stale customer actions
- blocked reason trends
- overloaded owners
- unclear scope or missing approvals

## Reminder Rules

Initial reminder behavior should be simple:

- Show tickets due in the next 7 days
- Highlight tickets due today
- Mark overdue tickets clearly
- Notify owners before work becomes overdue

## AI Review Step

The **Improve with AI** action should happen before ticket submission. Users should see proposed changes and decide whether to accept, edit, or discard them.

AI should look for missing operational context:

- unclear owner
- missing due date
- vague request
- hidden scope assumption
- pricing dependency
- delivery feasibility concern
- customer dependency
- SLA or staffing risk
