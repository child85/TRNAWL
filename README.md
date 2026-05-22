# TRNAWL

TRNAWL is a lightweight project, SOW, and delivery tracking tool that replaces Excel-based project tracking with a simple, user-friendly ticket board.

It helps teams manage SOWs, delivery reviews, internal tasks, and customer actions without relying on scattered Excel files. Users can create tickets, assign owners, set due dates, drag tickets through workflow stages, and receive reminders before work becomes overdue.

## Problem Statement

Many teams still manage delivery work in spreadsheets, email threads, chat messages, and ad hoc status meetings. That makes it hard to see who owns what, what is due soon, what is blocked, and what needs customer or delivery review.

TRNAWL aims to provide a Jira-like experience without Jira complexity. The first version should stay simple, clean, and focused on adoption.

## Core Features

- Fast ticket creation for SOWs, delivery reviews, internal tasks, and customer actions
- Clear ownership with assignees, due dates, status, and priority
- Drag-and-drop ticket board with simple workflow stages
- Reminder support before tickets become overdue
- Delivery review tracking for handoffs, approvals, and follow-up actions
- Operational visibility through dashboards, reports, and calendar views
- Templates and configurable workflows for repeatable delivery processes

## AI-Assisted Ticket Enrichment

TRNAWL should include an **Improve with AI** feature during ticket creation.

Before submitting a ticket, users can ask AI to improve the draft. The AI should:

- Rephrase unclear input
- Fix grammar and formatting
- Structure the request into clearer ticket text
- Suggest missing fields such as owner, due date, priority, workflow stage, or acceptance criteria
- Preserve the user's intent
- Show all proposed changes for review before the user accepts them

The user stays in control. AI should enrich the ticket, not submit or change work without approval.

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
- Calendar
- Reports
- Admin
- Templates / Workflows

The navigation should stay practical and familiar. Users should be able to move quickly between daily work, upcoming deadlines, reporting, and admin configuration.

## MVP Scope

The MVP should focus on a narrow, useful workflow:

- Create, edit, and delete tickets
- Assign owners
- Set due dates and priorities
- Move tickets across workflow stages
- Filter by owner, status, due date, and priority
- Show overdue and upcoming work
- Support basic delivery review stages
- Provide an **Improve with AI** review step before ticket submission
- Offer a simple dashboard for operational visibility

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
- AI-generated summaries, risks, and next steps
- API and webhook support

## Project Structure

```text
TRNAWL/
├── docs/
│   ├── product-overview.md
│   └── workflow.md
├── src/
│   └── README.md
├── .gitignore
├── LICENSE
└── README.md
```

## Setup

This repository is intentionally lightweight. There is no application runtime yet.

To get started locally:

```bash
git clone https://github.com/child85/TRNAWL.git
cd TRNAWL
```

As implementation begins, add the app stack, package manager, environment variables, and run commands here.

## Guiding Principles

- Keep the first version simple
- Prioritize adoption over configuration depth
- Make ticket creation fast
- Make ownership and deadlines obvious
- Let AI assist, but keep users in control
- Avoid Jira-level complexity unless users clearly need it
