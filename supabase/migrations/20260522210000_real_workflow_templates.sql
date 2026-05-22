with templates as (
  select id, slug from public.workflow_templates
  where slug in ('delivery-review', 'customer-actions')
)
delete from public.workflow_template_tasks task
using templates
where task.template_id = templates.id;

with template as (
  select id from public.workflow_templates where slug = 'delivery-review'
)
insert into public.workflow_template_tasks (
  template_id,
  title,
  description,
  default_ticket_type,
  default_priority,
  default_blocked_reason,
  position,
  suggested_due_offset_days
)
select template.id, task.title, task.description, task.default_ticket_type, task.default_priority, task.default_blocked_reason, task.position, task.suggested_due_offset_days
from template
cross join (
  values
    ('Confirm review scope', 'Capture what delivery needs to review, what decision is required, and who needs the answer.', 'task', 'medium', null, 1, 0),
    ('Delivery feasibility review', 'Validate delivery approach, assumptions, staffing, handoff needs, and operational risk.', 'delivery_review', 'high', null, 2, 2),
    ('Scope boundary check', 'Confirm inclusions, exclusions, dependencies, customer responsibilities, and change-control triggers.', 'task', 'high', 'scope_unclear', 3, 2),
    ('Risk and blocker summary', 'Document open risks, blockers, and decisions required before delivery can approve the path.', 'task', 'medium', 'dependency_unresolved', 4, 4),
    ('Final delivery decision', 'Confirm whether delivery accepts, rejects, or accepts with conditions.', 'delivery_review', 'high', 'approval_pending', 5, 5)
) as task(title, description, default_ticket_type, default_priority, default_blocked_reason, position, suggested_due_offset_days);

with template as (
  select id from public.workflow_templates where slug = 'customer-actions'
)
insert into public.workflow_template_tasks (
  template_id,
  title,
  description,
  default_ticket_type,
  default_priority,
  default_blocked_reason,
  position,
  suggested_due_offset_days
)
select template.id, task.title, task.description, task.default_ticket_type, task.default_priority, task.default_blocked_reason, task.position, task.suggested_due_offset_days
from template
cross join (
  values
    ('Define customer action', 'Clarify the customer-owned action, expected output, internal owner, and due date.', 'customer_action', 'medium', 'waiting_for_customer', 1, 0),
    ('Internal follow-up owner check', 'Confirm who follows up, what message is needed, and what happens if the action is late.', 'task', 'medium', null, 2, 1),
    ('Customer reminder', 'Send or prepare the customer follow-up and record the response status.', 'customer_action', 'medium', 'waiting_for_customer', 3, 3),
    ('Impact review', 'Confirm whether the customer action blocks delivery, scope, timeline, or final review.', 'task', 'high', 'dependency_unresolved', 4, 4),
    ('Close customer action loop', 'Confirm the customer response is received, recorded, and reflected in related tickets.', 'customer_action', 'medium', 'approval_pending', 5, 5)
) as task(title, description, default_ticket_type, default_priority, default_blocked_reason, position, suggested_due_offset_days);
