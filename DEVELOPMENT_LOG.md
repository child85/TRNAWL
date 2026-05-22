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
- Renamed responsibility fields to Delivery Lead and Sales Lead.
- Removed pricing and delivery-reviewed readiness checks.
- Removed owner-assigned readiness check because assignment happens when the ticket is created.

### Corporate Design Refresh

Restyled the MVP to feel closer to a modern corporate assurance platform.

Changed:

- Reworked the color system around a crisp business blue, white surfaces, and restrained service accents.
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
- Kept Delivery Lead and Sales Lead as separate responsibility fields.

### Customer and Ownership Cleanup

Added clearer customer and user visibility.

Changed:

- Added Customers navigation with customer tiles.
- Added customer creation with segment, status, primary contact, email, and notes.
- Added a customer detail page with related tickets and customer actions.
- Moved the user overview into Admin.
- Added Owner as the person doing the work while keeping Delivery Lead as the lead role.
- Made readiness checks conditional by ticket type so generic and internal tasks stay lightweight.

### Ticket Form Sanity Pass

Reduced ticket responsibility fields based on ticket type.

Changed:

- Removed Opportunity Lead from ticket and workflow entry.
- Kept Sales Lead only for SOW work.
- Kept Delivery Lead only for SOW and delivery review work.
- Hid customer selection for generic tasks and internal actions.
- Defaulted new ticket due dates to two days from today.
- Added ticket details from the ticket board with status update.
- Added an initial status selector when creating tickets.

### Ticket Editing and Calendar Planning

Expanded operational editing and planning behavior.

Changed:

- Added manager and color metadata to demo users.
- Added Sales Lead defaults to customer records.
- Preselected Delivery Lead from the current user's manager.
- Preselected Sales Lead from the selected customer.
- Expanded ticket details into an editable work item view.
- Added ticket updates/notes.
- Changed Calendar into user lanes with colored assignments and drag/drop planning.

### Usability Cleanup

Improved daily-use flows based on first feedback.

Changed:

- Changed customer details from list rows into modern information tiles.
- Moved ticket Owner editing into a separate assignment area at the bottom of ticket details.
- Made Save Ticket also save a typed update.
- Defaulted the Tickets view to the current user's tickets.
- Added an owner filter to the Tickets view.
- Reworked Calendar back into a capacity board with a Team list.
- Added role and name filters for the Calendar team list.
- Added drag-and-drop people reservations on Calendar days.

### TUV-Style Color Refinement

Moved the app closer to a clean blue-white corporate assurance style.

Changed:

- Removed warm yellow accenting.
- Replaced the top accent and brand rail with blue-to-cyan treatment.
- Reduced heavy shadows on panels, cards, and toolbar areas.
- Shifted warning and priority states away from yellow.
- Updated demo user colors to a cooler business palette.

### Ticket Detail Focus Cleanup

Refocused ticket details on updates and history instead of recreating the create-ticket form.

Changed:

- Moved updates and history into the primary ticket detail area.
- Made ticket facts more compact.
- Kept Owner visible with a Take ownership action.
- Locked customer, lead, and blocker settings behind a small Edit control.
- Kept rare context changes available without making them feel like daily ticket fields.

### Calendar Booking Dialog

Changed drag-and-drop calendar planning so bookings are confirmed before they are saved.

Changed:

- Dropping a person on the calendar now opens a booking dialog.
- Added days blocked with business-day scheduling.
- Added searchable task and customer selection in the booking dialog.
- Calendar reservation chips now show the linked task or customer context.
- Kept capacity bookings local to the browser for the MVP.
