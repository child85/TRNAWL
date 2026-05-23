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
- Kept Owner visible as a direct assignment select.
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

### Calendar Booking Task Creation

Made calendar bookings removable and able to create a task directly from the drop dialog.

Changed:

- Added delete controls to calendar booking chips.
- Changed the task search field to also work as a new task title.
- Added a note field to the calendar booking dialog.
- Saving a booking now creates a task when no existing task is selected.
- Booking notes are saved to the linked or newly created ticket.

### Blocked Ticket Tiles

Changed blocked reason summaries into highlighted clickable blocked-ticket tiles.

Changed:

- Replaced blocked reason count rows with ticket-specific blocker tiles.
- Each blocker tile opens the ticket detail view.
- Tiles show blocked reason, ticket title, owner, due date, and customer context.
- Added stronger blocker highlighting on dashboard and reports.

### Quality Review Pass

Tightened operational logic where the MVP worked but the workflow could mislead users.

Changed:

- Dashboard counts now use active tickets instead of every historical ticket.
- Priority work no longer shows the same ticket multiple times.
- Blocked sections are now named Active Blockers and show blocked age.
- Calendar-created customer work now becomes a customer action instead of a hidden-customer generic task.
- Calendar bookings now use the last booked business day as the due date.
- Exact task or customer search matches are resolved before creating new records.

### Assignment Control Cleanup

Removed the extra Take ownership button from ticket details to reduce visual weight.

Changed:

- Removed the Take ownership button from the Assignment section.
- Kept the Owner select as the single place to change assignment.
- Reduced horizontal crowding in the ticket detail view.

### Ticket Detail Field Cleanup

Moved Owner and Blocked reason back into the normal ticket detail field grid.

Changed:

- Moved Owner into the compact ticket fields.
- Moved Blocked reason into the compact ticket fields.
- Removed the separate Assignment panel from ticket details.
- Kept stable context settings focused on customer and lead fields only.

### Calendar Search Dropdowns

Changed calendar booking task and customer results into click-to-open dropdown lists.

Changed:

- Search results are hidden until the task or customer field is focused.
- Task and customer results now open as dropdowns under their search fields.
- Selecting a result closes the dropdown.
- Clicking outside the booking search closes open dropdowns.

### Workflow Dependency Generation

Added dependency settings to the New SOW workflow generator.

Changed:

- Renamed the SOW starter to Generate Workflow.
- Added editable dependency settings in the workflow dialog.
- Defaulted review tasks to depend on the intake task.
- Defaulted final review to depend on all review tasks.
- Generated tickets now include dependency notes and dependency blockers.

### Ticket Deletion Controls

Added ticket deletion from details and an admin cleanup tool for all tickets.

Changed:

- Added Delete Ticket to the ticket detail view.
- Added an Admin danger zone to delete all tickets.
- Cleared local calendar reservations when affected tickets are deleted.
- Added Supabase delete policy migration for authenticated users.

### Admin User Creation

Removed the noisy Ready status and added a real Admin flow for creating selectable users.

Changed:

- Removed the visible top-bar sync status pill.
- Added a Create User button to Admin.
- Added a user creation dialog with name, role, manager, and color.
- New users are saved to the people table and immediately appear in owner, lead, and calendar selections.

### Ticket Filter Alignment

Kept the ticket search, type filter, and owner filter on one clean row.

Changed:

- Added a dedicated ticket toolbar layout.
- Kept filters aligned in one row on desktop.
- Preserved mobile wrapping for narrow screens.

### Task Card Responsibility Cleanup

Stopped task cards from showing Delivery Lead when the ticket type does not use a lead.

Changed:

- Task cards now show Owner only.
- Delivery Lead remains visible only for ticket types that actually use delivery governance.
- Kept ticket detail responsibility aligned with the type rules.

### Workflow Generation Expansion

Made every workflow card executable and added custom workflow creation from scratch.

Changed:

- Added a Workflow from Scratch button.
- Added custom workflow name and task entry in the generator.
- Changed Customer Action Follow-Up and Delivery Review Workflow from Ready labels to Generate Workflow buttons.
- Added real template tasks for the two previously placeholder workflows.

### Report Builder

Turned Reports from a fixed brief into a selectable operational report builder.

Changed:

- Added report focus selection.
- Added owner scope so users can report only their own work.
- Added selectable report data points.
- Added a generated brief preview with live ticket and customer-action data.

### Customer Action Defaults

Made customer action creation prefill obvious ownership and due date defaults.

Changed:

- Preselected the customer owner from the selected customer's Sales Lead.
- Updated the customer owner when the selected customer changes.
- Defaulted new customer actions to three days from today.

### User Email Readiness

Added email addresses to TRNAWL users for the upcoming email notification flow.

Changed:

- Added optional email to user creation.
- Seeded Thomas with thomasfecke263@gmail.com.
- Show email status in Admin users.
- Added helper logic so blank user emails are treated as not sendable.

### Mail Notification Rules

Added configurable email notification rules for assignment, due dates, overdue escalation, and completion.

Changed:

- Added Admin mail settings with rule toggles.
- Added Cloudflare Worker email sending through the TRNAWL email API.
- Added assignment and completion email triggers on ticket changes.
- Added deduped due-date and overdue email checks when the app syncs.

### Project Plan Roadmap

Added a Project Plan navigation area for managing roadmap items.

Changed:

- Added Project Plan to navigation.
- Seeded roadmap items for template management, SOW templates, At-a-glance templates, phrasing variables, and approval paths.
- Added create, edit, delete, and complete actions for roadmap items.
- Stored roadmap items in Supabase.

### Mail Body Previews

Added Admin previews for every configured mail notification body.

Changed:

- Added preview cards under Mail Settings.
- Show subject and body for assignment, due-soon, overdue, and completion emails.
- Use the same email template helper as live notifications.

### User Editing

Added Admin editing for existing users.

Changed:

- Added Edit actions to the Admin user table.
- Reused the user dialog for create and edit.
- Allow editing name, role, email, manager, and color.
- Added Supabase update policy for app people.

### Priority Work Sorting

Changed dashboard Priority Work into a due-date driven view.

Changed:

- Sorted Priority Work by due date instead of mixing status-based urgency.
- Excluded done tickets from the list.
- Kept blocker status focused in Active Blockers.

### Calendar Horizon And Colors

Expanded calendar planning to four weeks and improved user color contrast.

Changed:

- Changed Calendar from 2 weeks to 4 weeks.
- Updated demo user colors to a broader readable palette.
- Kept the overall UI restrained while making calendar ownership easier to scan.

### Editable Mail Templates

Added edit controls for mail preview templates in Admin.

Changed:

- Added Edit buttons to each mail preview.
- Added inline subject and body intro editing.
- Added supported variables for ticket title, owner, customer, due date, blocker, and status.
- Persisted mail template wording in browser storage for the MVP.
