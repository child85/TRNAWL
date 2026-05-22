# TRNAWL

TRNAWL is a lightweight operational workflow and accountability platform for project, SOW, delivery, and customer-action coordination.

It helps teams manage SOWs, delivery reviews, internal tasks, and customer actions without relying on scattered Excel files, Teams threads, email chains, and tribal knowledge. Users can create tickets, assign owners, set due dates, drag work through workflow stages, and receive reminders before work becomes overdue.

TRNAWL is not trying to replace Jira, ServiceNow, Planner, Teams, SharePoint, or email. It sits between delivery, sales, architecture, governance, and customer coordination to make execution visible.

## Problem Statement

Most companies already have plenty of tools: Jira, ServiceNow, Planner, Excel, Teams, email, and SharePoint. Projects still fail operationally because coordination lives across spreadsheets, chats, emails, status calls, and memory.

The core issue is not tooling. The core issue is execution visibility:

- Who owns this?
- Is delivery involved?
- Are commercial inputs ready?
- Did legal review it?
- What is blocked?
- Why is this delayed?
- Which customer actions are still unresolved?

TRNAWL provides a Jira-like board where useful, but avoids Jira-like complexity. The first version should stay simple, clean, and focused on adoption.

## Core Features

- Fast ticket creation for SOWs, delivery reviews, internal tasks, and customer actions
- Clear ownership with Owner, Delivery Lead, Sales Lead, due dates, status, and priority
- Drag-and-drop ticket board with simple workflow stages
- Reminder support before tickets become overdue
- Customer overview with tiles, basic customer records, related tickets, and customer actions
- Delivery review tracking for handoffs, assumptions, risks, and follow-up actions
- Operational visibility through dashboards, reports, and calendar views
- Templates and configurable workflows for repeatable delivery processes
- Lightweight governance checks for SOWs, delivery reviews, and customer-facing actions
- Team capacity visibility for simple operational planning
- Operational readiness scores for SOWs and delivery work
- Blocked reason tracking with useful reporting categories
- Customer action register with internal accountability
- Weekly operational briefs for stale work, delayed reviews, and overloaded owners

## AI-Assisted Ticket Enrichment

TRNAWL should include an **Improve with AI** feature during ticket creation. AI is not a chatbot gimmick here; it is a governance layer that improves clarity, accountability, and operational quality.

Before submitting a ticket, users can ask AI to improve the draft. The AI should:

- Rephrase unclear input
- Fix grammar and formatting
- Structure the request into clearer ticket text
- Suggest missing fields such as owner, due date, priority, workflow stage, or acceptance criteria
- Flag missing operational context such as scope assumptions, commercial inputs, delivery feasibility, customer dependencies, or SLA risks
- Preserve the user's intent
- Show all proposed changes for review before the user accepts them

The user stays in control. AI should enrich the ticket, not submit or change work without approval.

Later AI capabilities should review active work for unrealistic assumptions, hidden scope gaps, staffing risks, SLA conflicts, stale tickets, and delayed reviews.

## Workflow Philosophy

The most valuable part of TRNAWL is not the ticket itself. It is the workflow.

Workflows capture organizational experience:

- How a new SOW should move from intake to delivery review
- Which checks must happen before customer presentation
- When sales input, legal input, delivery feasibility, and scope boundary checks are needed
- Which customer actions should be created automatically
- What operational risks should be visible early

Example: a **New SOW Workflow** can automatically create delivery review, commercial input check, legal input check, scope boundary review, and customer deck review tasks. This turns repeated tribal knowledge into a repeatable operating model.

## Operational Readiness

TRNAWL should make readiness visible without becoming a checklist monster.

Each SOW or delivery workflow should be able to show whether the basics are covered:

- Scope boundaries clear
- Customer dependencies listed
- Due dates realistic
- Success criteria clear
- Delivery capacity realistic
- Handoff plan clear

Generic tasks and internal actions should not force this checklist. They should stay quick: owner, due date, context, and status.

## Delivery Review Workflow

The delivery review workflow should make handoffs and approvals easy to track.

Example stages:

1. Draft
2. Ready for Review
3. In Review
4. Changes Requested
5. Approved
6. Delivered

Each review ticket should support:

- Reviewer assignment
- Due dates and reminders
- Linked customer or internal actions
- Review notes
- Approval status
- Follow-up tasks

## Navigation Concept

Initial navigation should include:

- Dashboard
- Tickets
- Customers
- Calendar
- Reports
- Admin
- Templates / Workflows

The navigation should stay practical and familiar. Users should be able to move quickly between daily work, upcoming deadlines, reporting, and admin configuration.

## MVP Scope

The MVP should focus on a narrow, useful workflow:

- Email/password sign-in through Supabase Auth
- Create, edit, and delete tickets
- Assign owners
- Set due dates and priorities
- Move tickets across workflow stages
- Filter by owner, status, due date, and priority
- Track blocked reasons such as delivery input, commercial input, legal input, customer dependency, unclear scope, missing owner, unresolved dependency, or pending approval
- Show overdue and upcoming work
- Support basic delivery review stages
- Provide an **Improve with AI** review step before ticket submission
- Offer a simple dashboard for operational visibility
- Provide a New SOW workflow template that creates the minimum operational review tasks
- Include a simple team capacity calendar focused on who is blocked, reserved, or overloaded
- Include a customer action register
- Generate a weekly operational brief from overdue work, stale actions, delayed reviews, and capacity pressure

## Current MVP

The first deployable MVP is a static Azure Static Web Apps frontend backed by Supabase.

Included now:

- Supabase email/password authentication
- Dashboard with open, overdue, blocked, and customer-action counts
- Drag-and-drop ticket board
- Ticket creation with Owner, type-specific leads, optional customer, default due date, priority, blocked reason, initial status, and type-specific readiness checks
- Ticket details with editable fields, readiness checks, blocked reason, status update, and working notes
- Customer records with default Sales Lead
- Admin user overview with manager and calendar color
- Calendar planning by user, due date, and colored ticket assignment
- Selectable demo people and customers for ticket creation
- Customers view with customer tiles, customer creation, and detail pages
- Workflow template view
- New SOW Workflow starter that creates review tickets
- Customer action register
- Calendar view for upcoming ticket and customer-action due dates
- Basic reports for weekly operational visibility
- Development log view with short change summaries
- Admin/status page

AI features are intentionally excluded from this first MVP.

## Future Roadmap

- Custom workflow builder
- Ticket templates by process or customer
- Calendar integrations
- Email and chat reminders
- SLA and due-date reporting
- Bulk ticket import from spreadsheets
- Saved views and team dashboards
- Customer-facing action views
- Role-based permissions
- Audit trail for delivery reviews
- AI governance checks for scope gaps, delivery assumptions, staffing risks, stale work, and SLA conflicts
- AI-generated summaries, risks, and next steps
- Teams and Outlook ticket capture
- Customer health dashboard
- Operational readiness score trends
- Blocked reason aging analytics
- AI weekly operational brief generation
- API and webhook support

## Project Structure

```text
TRNAWL/
├── DEVELOPMENT_LOG.md
├── app.js
├── docs/
│   ├── product-overview.md
│   ├── product-strategy.md
│   └── workflow.md
├── index.html
├── styles.css
├── staticwebapp.config.json
├── supabase/
│   ├── README.md
│   └── migrations/
├── .gitignore
├── LICENSE
└── README.md
```

## Setup

This repository is intentionally lightweight. The current MVP is a static frontend and does not require a build step.

To get started locally:

```bash
git clone https://github.com/child85/TRNAWL.git
cd TRNAWL
```

Run a local static server:

```bash
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

The deployed app expects Supabase to have the included migrations applied.

## Guiding Principles

- Keep the first version simple
- Prioritize adoption over configuration depth
- Make ticket creation fast
- Make ownership and deadlines obvious
- Let AI assist, but keep users in control
- Avoid Jira-level complexity unless users clearly need it
- Do not become a Jira, ServiceNow, Monday.com, or full PM-suite clone
- Focus on operational governance, execution visibility, and presales/delivery coordination
