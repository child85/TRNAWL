# TRNAWL

TRNAWL is a lightweight operational workflow and accountability platform for SOW, delivery review, internal task, and customer action coordination.

It replaces scattered Excel trackers with a simple ticket board, customer context, workflow templates, reminders, blocker visibility, and AI-assisted text improvement. The goal is a Jira-like operational experience without Jira-level complexity.

TRNAWL is not trying to replace Jira, ServiceNow, Planner, Teams, SharePoint, or email. It sits between delivery, sales, architecture, governance, and customer coordination to make execution visible.

## The Problem

Most companies already have many tools and still lose operational control because coordination lives across:

- Excel trackers
- Teams chats
- Emails
- Status calls
- Tribal knowledge
- Hidden customer dependencies

The core issue is not tooling. The core issue is execution visibility:

- Who owns this?
- What is blocked?
- Which customer action is still open?
- Is the SOW ready for delivery review?
- Did legal, commercial, or scope review happen?
- Which work is about to become overdue?
- Who needs to act next?

## What TRNAWL Does

TRNAWL gives teams a fast operational control board for delivery work:

- Create tickets quickly
- Assign a real owner
- Set due dates and priority
- Track customer context
- Move work through status stages
- Highlight blockers
- Capture updates and history
- Generate repeatable workflows
- Send email notifications
- Improve unclear notes with AI before they become bad tickets

The product is designed for adoption. If updating a ticket feels slower than sending a Teams message, the tool loses.

## Current MVP

The current MVP is a static Azure Static Web Apps frontend backed by Supabase, with an Azure Function for AI text improvement and a Cloudflare Worker for email delivery.

Included now:

- Supabase email/password authentication
- Dashboard with open, overdue, blocked, and customer-action counts
- Compact Priority Work tiles sorted by due date
- Active Blockers tiles that open the relevant ticket
- Drag-and-drop ticket board
- Ticket creation with owner, type, customer, due date, priority, blocked reason, and status
- Ticket detail view with editable fields, readiness checks, updates, history, and delete
- Customer records with tiles, detail pages, default Sales Lead, and related work
- Admin user management with email, manager, role, and color
- Mail notification settings and editable mail body previews
- AI Settings for the Improve with AI instruction
- Improve with AI for note and description fields, including title context and review-before-accept
- Workflow templates, dependency settings, and workflow generation
- New SOW workflow starter
- Customer action register
- Calendar capacity planning with draggable people, role/name filters, bookings, and due work
- Reports for operational briefs and selected data points
- Project Plan roadmap with editable, deletable, completable, draggable roadmap items
- Development log view with short change summaries

## Core Features

### Tickets

Tickets are intentionally simple. The primary fields are:

- Title
- Description
- Type
- Owner
- Customer when relevant
- Due date
- Status
- Priority
- Blocked reason
- Updates and history

Generic internal tasks stay lightweight. SOW and customer-facing work can use readiness checks and workflow structure.

### Customers

Customers are first-class objects, not free text. Each customer can hold:

- Segment
- Status
- Primary contact
- Contact email
- Sales Lead
- Notes
- Related tickets
- Open customer actions

### Workflows

Workflows are the strongest long-term differentiator. They capture repeatable operational knowledge such as:

- SOW intake
- Delivery review
- Commercial input check
- Scope boundary review
- Legal review
- Customer deck or final review

Workflow steps can have dependencies, so later work can be blocked until required previous steps are finished.

### Blockers

Blocked work is treated as escalation work, not passive reporting. Blocker tiles show:

- Blocked reason
- Ticket title
- Owner
- Due date
- Customer context
- Blocked age

### Calendar

The calendar is a lightweight capacity board, not a full MS Project replacement. It answers:

- Who is booked?
- For what work?
- For which customer or task?
- What is due soon?
- Which team members are visible by role or search?

### Email Notifications

TRNAWL can send email through a backend endpoint, not directly from the browser.

Current notification rules:

- Task assigned
- Due date approaching
- Due date past
- Task completed

Recipients with blank email addresses are skipped automatically.

### AI-Assisted Ticket Enrichment

Improve with AI is a governance layer, not a chatbot gimmick.

When a user writes unclear or messy input, TRNAWL can:

- Translate to English if needed
- Fix typos and grammar
- Rephrase into clear operational language
- Preserve intent
- Use the ticket or form title as context
- Suggest missing information
- Let the user review the result before accepting it

Example:

```text
scope is nicht ganz klar, delivery soll mal schauen ob wir das so machen koennen
```

Can become:

```text
Scope requires clarification. Delivery team to assess feasibility of proposed approach.
```

The user stays in control. AI does not submit or change work without approval.

## Navigation

Current navigation:

- Dashboard
- Tickets
- Workflows
- Customers
- Customer Actions
- Calendar
- Reports
- Project Plan
- Dev Log
- Admin

## MVP Scope

The MVP focuses on one useful promise:

Give delivery and operations teams a fast way to see ownership, deadlines, blockers, customer actions, and repeatable review workflows.

The MVP deliberately avoids:

- Sprint planning complexity
- Enterprise BPM complexity
- ITSM replacement scope
- Heavy field configuration
- Overbuilt reporting

## Future Roadmap

- Stronger workflow builder
- Template management
- SOW and at-a-glance templates
- Template variables for customer, owner, due date, deal size, and review type
- Approval paths by deal size, such as below 50k, above 50k, and above 100k
- Customer-facing action views
- Role-based permissions
- Audit trail for review decisions
- Saved views and team dashboards
- Calendar integrations
- Teams and Outlook capture
- Bulk import from spreadsheets
- AI review for scope gaps, delivery assumptions, staffing risks, stale work, and SLA conflicts
- AI-generated weekly operational briefs
- Blocker aging analytics
- Customer health dashboard
- API and webhook support

## Project Structure

```text
TRNAWL/
├── api/
│   └── improve-note/
├── docs/
│   ├── pitch-assets/
│   ├── product-overview.md
│   ├── product-strategy.md
│   └── workflow.md
├── supabase/
│   └── migrations/
├── DEVELOPMENT_LOG.md
├── index.html
├── app.js
├── styles.css
├── staticwebapp.config.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Setup

This repository is intentionally lightweight. The static frontend does not require a build step.

Clone the repository:

```bash
git clone https://github.com/child85/TRNAWL.git
cd TRNAWL
```

Run a local static server:

```bash
python -m http.server 4173
```

Open:

```text
http://localhost:4173
```

The deployed app expects the Supabase migrations to be applied and the Azure Static Web Apps environment variables to be configured.

## Environment Variables

Frontend:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Azure Function:

```text
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=haiku
```

Email is sent through the configured Cloudflare Worker endpoint in `app.js`.

## Guiding Principles

- Keep the first version simple
- Prioritize adoption over configuration depth
- Make ticket creation fast
- Make ownership and deadlines obvious
- Make blockers impossible to miss
- Let AI improve clarity, but keep users in control
- Avoid Jira-level complexity unless users clearly need it
- Focus on operational governance, execution visibility, and presales/delivery coordination
