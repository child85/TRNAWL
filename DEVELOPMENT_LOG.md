# Development Log

## 2026-05-22

### First Deployable MVP

Built and deployed the first static Azure MVP backed by Supabase.

Changed:

- Added Supabase email/password authentication.
- Added dashboard, tickets, workflows, customer actions, calendar, reports, and admin views.
- Added drag-and-drop ticket board.
- Added ticket creation with owner, customer, due date, priority, blocked reason, and readiness checks.
- Added New SOW Workflow starter.
- Added customer action register.
- Added Supabase migrations for operational workflow/accountability tables and ticket owner labels.
- Updated Azure Static Web Apps workflow to deploy static files without a build step.

Notes:

- AI is intentionally excluded from this MVP.
- Supabase email confirmation is currently enabled, so users must confirm email before sign-in unless that setting is changed.

### Ticket Form Responsibility Cleanup

Changed the first ticket flow to use selectable demo objects instead of free text.

Changed:

- Added Thomas as the default Delivery Lead.
- Added five demo people: Bugs Bunny, Daffy Duck, Lola Bunny, Porky Pig, and Wile E. Coyote.
- Added three demo customers: Acme Anvils Ltd., ToonTown Telecom, and Roadrunner Logistics.
- Replaced free-text owner/customer fields with selects.
- Renamed responsibility fields to Delivery Lead and Opportunity Lead.
- Removed pricing and delivery-reviewed readiness checks.
- Removed owner-assigned readiness check because assignment happens when the ticket is created.
