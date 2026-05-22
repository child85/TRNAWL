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

### Corporate Design Refresh

Restyled the MVP to feel closer to a modern corporate assurance platform.

Changed:

- Reworked the color system around a crisp business blue, white surfaces, and a restrained yellow accent.
- Replaced rounded prototype styling with sharper rectangular panels and controls.
- Added a branded top accent bar and stronger sidebar identity.
- Improved dashboard cards, ticket cards, tables, modals, and navigation styling.
- Kept the app lightweight and static while making it feel less like a basic HTML prototype.

### Sales Lead Added

Added a dedicated sales responsibility to tickets and workflows.

Changed:

- Added Sales Lead to the ticket form.
- Added Sales Lead to the New SOW workflow starter.
- Added two demo sales people: Harry Dumm and Lloyd Duemmer.
- Stored Sales Lead as a ticket reference and display name.
- Kept Delivery Lead, Sales Lead, and Opportunity Lead as separate responsibility fields.
