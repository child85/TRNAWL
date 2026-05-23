const SUPABASE_URL = "https://ofwwpmnjbbojdznnbxpl.supabase.co";
const SUPABASE_KEY = "sb_publishable_kcTEx8ODCrU3tO7LpeVxVw_ytPxlDRA";
const EMAIL_WORKER_URL = "https://trnawl-email-api.thomasfecke263.workers.dev/";
const defaultAiInstruction = "Rephrase into clear business English. Translate to English if needed. Fix typos and typing mistakes. Preserve intent. Do not invent facts. If important delivery details are missing, list them as suggestions.";

const defaultMailSettings = {
  assignedToOwner: true,
  dueApproachingOwner: true,
  overdueEscalation: true,
  completedSales: true,
};

const defaultMailTemplates = {
  assignedToOwner: {
    subject: "TRNAWL assigned: {{title}}",
    intro: "This ticket was assigned to you.",
  },
  dueApproachingOwner: {
    subject: "TRNAWL due soon: {{title}}",
    intro: "This ticket is due {{dueDate}}.",
  },
  overdueEscalation: {
    subject: "TRNAWL overdue: {{title}}",
    intro: "This ticket is overdue. Please review ownership, blocker status, and next action.",
  },
  completedSales: {
    subject: "TRNAWL completed: {{title}}",
    intro: "This ticket was marked completed.",
  },
};

const state = {
  session: JSON.parse(localStorage.getItem("trnawl.session") || "null"),
  user: null,
  activeView: "dashboard",
  tickets: [],
  stages: [],
  templates: [],
  templateTasks: [],
  customerActions: [],
  ticketComments: [],
  projectPlanItems: [],
  people: [],
  customers: [],
  selectedCustomerId: null,
  selectedTicketId: null,
  selectedPersonId: null,
  selectedProjectPlanItemId: null,
  selectedWorkflowTemplateId: null,
  scratchWorkflowMode: false,
  ticketSettingsUnlocked: false,
  activeBookingDropdown: null,
  search: "",
  typeFilter: "all",
  ownerFilter: "me",
  calendarRoleFilter: "all",
  calendarNameFilter: "",
  reportOwnerFilter: "me",
  reportFocus: "delivery",
  reportDataPoints: ["summary", "blocked", "overdue", "dueSoon", "customerActions"],
  mailSettings: JSON.parse(localStorage.getItem("trnawl.mailSettings") || JSON.stringify(defaultMailSettings)),
  mailTemplates: { ...defaultMailTemplates, ...JSON.parse(localStorage.getItem("trnawl.mailTemplates") || "{}") },
  aiInstruction: localStorage.getItem("trnawl.aiInstruction") || defaultAiInstruction,
  pendingAiTargetId: null,
  pendingAiImprovedText: "",
  sentMailKeys: JSON.parse(localStorage.getItem("trnawl.sentMailKeys") || "{}"),
  calendarReservations: JSON.parse(localStorage.getItem("trnawl.calendarReservations") || "[]"),
  pendingCalendarReservation: null,
};

const viewMeta = {
  dashboard: ["Dashboard", "Operational health, blockers, and work needing attention."],
  tickets: ["Tickets", "Move work through simple stages with ownership and due dates."],
  workflows: ["Workflows", "Start repeatable operational review paths."],
  customers: ["Customers", "Customer tiles, contacts, related tickets, and open actions."],
  actions: ["Customer Actions", "External dependencies with internal accountability."],
  calendar: ["Calendar", "Upcoming work, due dates, and customer follow-ups."],
  reports: ["Reports", "Blocked work, aging, readiness, and customer action visibility."],
  projectPlan: ["Project Plan", "Roadmap for templates, approvals, workflow logic, and adoption improvements."],
  devlog: ["Dev Log", "Short record of what changed during development."],
  admin: ["Admin", "Runtime status and project configuration."],
};

const developmentLog = [
  {
    date: "2026-05-22",
    title: "First deployable MVP",
    summary: "Built and deployed the first static Azure MVP backed by Supabase.",
    changes: [
      "Added Supabase email/password authentication.",
      "Added dashboard, tickets, workflows, customer actions, calendar, reports, and admin views.",
      "Added drag-and-drop ticket board and ticket creation.",
      "Added New SOW Workflow starter.",
      "Added customer action register.",
      "Updated Azure Static Web Apps workflow to deploy static files without a build step.",
    ],
    notes: [
      "AI is intentionally excluded from this MVP.",
      "Supabase email confirmation is currently enabled.",
    ],
  },
  {
    date: "2026-05-22",
    title: "Development log added",
    summary: "Added an in-app Dev Log navigation point and a repo-level DEVELOPMENT_LOG.md.",
    changes: [
      "Added Dev Log to the main navigation.",
      "Added short change summaries inside the app.",
      "Started DEVELOPMENT_LOG.md for ongoing development notes.",
    ],
    notes: ["Keep future entries short and outcome-focused."],
  },
  {
    date: "2026-05-22",
    title: "Ticket form responsibility cleanup",
    summary: "Changed ticket creation to use demo people and customers instead of free text.",
    changes: [
      "Preselected Thomas as Delivery Lead.",
      "Added five demo people with Looney Tunes names.",
      "Added three demo customers with playful company names.",
      "Renamed responsibility fields to Delivery Lead and Sales Lead.",
      "Removed pricing, delivery-reviewed, and owner-assigned readiness checks.",
    ],
    notes: ["Ticket responsibility is now object-based instead of free text."],
  },
  {
    date: "2026-05-22",
    title: "Corporate design refresh",
    summary: "Restyled the MVP toward a modern corporate assurance platform.",
    changes: [
      "Reworked the color system around business blue, white surfaces, and restrained service accents.",
      "Replaced rounded prototype styling with sharper rectangular panels and controls.",
      "Added a branded top accent bar and stronger sidebar identity.",
      "Improved dashboard cards, ticket cards, tables, modals, and navigation.",
    ],
    notes: ["Kept the app static and lightweight while making it feel less basic."],
  },
  {
    date: "2026-05-22",
    title: "Sales Lead added",
    summary: "Added a dedicated Sales Lead responsibility to tickets and workflows.",
    changes: [
      "Added Sales Lead select to the ticket form.",
      "Added Sales Lead select to the New SOW workflow starter.",
      "Seeded Harry Dumm and Lloyd Duemmer as demo sales people.",
      "Stored Sales Lead as a ticket reference and display name.",
    ],
    notes: ["Delivery Lead and Sales Lead are separate responsibilities."],
  },
  {
    date: "2026-05-22",
    title: "Customer and ownership cleanup",
    summary: "Added customer overview/detail pages and separated ticket Owner from Delivery Lead.",
    changes: [
      "Added Customers navigation with customer tiles and a detail page.",
      "Added customer creation with status, segment, contact, email, and notes.",
      "Moved user overview into Admin.",
      "Added Owner as the person doing the work while keeping Delivery Lead as the lead role.",
      "Made readiness checks depend on ticket type so generic/internal tasks stay lightweight.",
    ],
    notes: ["Readiness now appears for SOW, delivery review, and customer-action tickets only."],
  },
  {
    date: "2026-05-22",
    title: "Ticket form sanity pass",
    summary: "Reduced responsibility fields by ticket type and added ticket details/status updates.",
    changes: [
      "Removed Opportunity Lead from ticket and workflow entry.",
      "Show Delivery Lead only where delivery governance is useful.",
      "Show Sales Lead only for SOW work.",
      "Hide customer selection for generic tasks and internal actions.",
      "Default new ticket due dates to two days from today.",
      "Added ticket detail opening from the board with status update.",
    ],
    notes: ["Owner remains the person actually working the ticket."],
  },
  {
    date: "2026-05-22",
    title: "Ticket editing and calendar planning",
    summary: "Expanded ticket details into an editable working view and added people-based calendar planning.",
    changes: [
      "Added manager and color metadata for demo users.",
      "Added customer-level Sales Lead defaults.",
      "Preselected Delivery Lead from the current user's manager.",
      "Preselected Sales Lead from the selected customer.",
      "Added editable ticket detail fields, readiness changes, and updates.",
      "Changed Calendar into user lanes with draggable ticket assignment by person and due date.",
    ],
    notes: ["Ticket details now work more like an operational work item than a read-only preview."],
  },
  {
    date: "2026-05-22",
    title: "Usability cleanup",
    summary: "Improved customer detail tiles, ticket updates, ticket filtering, and calendar capacity planning.",
    changes: [
      "Changed customer detail information into modern tiles.",
      "Moved ticket Owner editing into a separate bottom assignment area.",
      "Save Ticket now also saves a typed update.",
      "Tickets default to the current user's work with an owner filter.",
      "Changed Calendar back to a capacity board with draggable team members.",
      "Added role and name filters for the calendar team list.",
    ],
    notes: ["Calendar reservations are saved locally in the browser for this MVP."],
  },
  {
    date: "2026-05-22",
    title: "TUV-style color refinement",
    summary: "Removed warm yellow accents and moved the UI closer to a blue-white assurance service style.",
    changes: [
      "Replaced yellow accenting with blue and cyan brand accents.",
      "Reduced heavy shadows for cleaner corporate surfaces.",
      "Updated warning and priority styling away from yellow.",
      "Updated demo user colors to stay in a cooler business palette.",
    ],
    notes: ["The design now leans more toward clean TÜV-style blue, white, and light gray."],
  },
  {
    date: "2026-05-22",
    title: "Ticket detail focus cleanup",
    summary: "Refocused ticket details on updates and history instead of recreating the create-ticket form.",
    changes: [
      "Moved updates and history into the primary detail area.",
      "Made ticket facts more compact.",
      "Kept Owner visible as a direct assignment select.",
      "Locked customer, lead, and blocker settings behind a small Edit control.",
    ],
    notes: ["Rare ticket context changes now feel deliberate without hiding them."],
  },
  {
    date: "2026-05-22",
    title: "Calendar booking dialog",
    summary: "Changed drag-and-drop people planning to ask for duration and booking context before saving.",
    changes: [
      "Dropping a person on the calendar now opens a booking dialog.",
      "Added days blocked with business-day scheduling.",
      "Added searchable task and customer selection in the booking dialog.",
      "Calendar reservation chips now show the linked task or customer context.",
    ],
    notes: ["Capacity bookings remain browser-local for the MVP."],
  },
  {
    date: "2026-05-22",
    title: "Calendar booking task creation",
    summary: "Made calendar bookings removable and able to create a task directly from the drop dialog.",
    changes: [
      "Added delete controls to calendar booking chips.",
      "Changed the task search field to also work as a new task title.",
      "Added a note field to the calendar booking dialog.",
      "Saving a booking now creates a task when no existing task is selected.",
      "Booking notes are saved to the linked or newly created ticket.",
    ],
    notes: ["Existing local bookings can now be removed from the calendar."],
  },
  {
    date: "2026-05-22",
    title: "Blocked ticket tiles",
    summary: "Changed blocked reason summaries into highlighted clickable blocked-ticket tiles.",
    changes: [
      "Replaced blocked reason count rows with ticket-specific blocker tiles.",
      "Each blocker tile now opens the ticket detail view.",
      "Tiles show blocked reason, ticket title, owner, due date, and customer context.",
      "Added stronger blocker highlighting on dashboard and reports.",
    ],
    notes: ["Blockers are now treated as escalation work, not passive report text."],
  },
  {
    date: "2026-05-22",
    title: "Quality review pass",
    summary: "Tightened operational logic where the MVP worked but the workflow could mislead users.",
    changes: [
      "Dashboard counts now use active tickets instead of every historical ticket.",
      "Priority work no longer shows the same ticket multiple times.",
      "Blocked sections are now named Active Blockers and show blocked age.",
      "Calendar-created customer work now becomes a customer action instead of a hidden-customer generic task.",
      "Calendar bookings now use the last booked business day as the due date.",
      "Exact task or customer search matches are resolved before creating new records.",
    ],
    notes: ["This pass focused on data clarity and avoiding accidental duplicate or misleading work items."],
  },
  {
    date: "2026-05-22",
    title: "Assignment control cleanup",
    summary: "Removed the extra Take ownership button from ticket details to reduce visual weight.",
    changes: [
      "Removed the Take ownership button from the Assignment section.",
      "Kept the Owner select as the single place to change assignment.",
      "Reduced horizontal crowding in the ticket detail view.",
    ],
    notes: ["Assignment remains editable without a duplicate shortcut."],
  },
  {
    date: "2026-05-22",
    title: "Ticket detail field cleanup",
    summary: "Moved Owner and Blocked reason back into the normal ticket detail field grid.",
    changes: [
      "Moved Owner into the compact ticket fields.",
      "Moved Blocked reason into the compact ticket fields.",
      "Removed the separate Assignment panel from ticket details.",
      "Kept stable context settings focused on customer and lead fields only.",
    ],
    notes: ["Owner and blocker status are regular working fields, not rare settings."],
  },
  {
    date: "2026-05-22",
    title: "Calendar search dropdowns",
    summary: "Changed calendar booking task and customer results into click-to-open dropdown lists.",
    changes: [
      "Search results are hidden until the task or customer field is focused.",
      "Task and customer results now open as dropdowns under their search fields.",
      "Selecting a result closes the dropdown.",
      "Clicking outside the booking search closes open dropdowns.",
    ],
    notes: ["The booking dialog now stays compact until the user searches."],
  },
  {
    date: "2026-05-22",
    title: "Workflow dependency generation",
    summary: "Added dependency settings to the New SOW workflow generator.",
    changes: [
      "Renamed the SOW starter to Generate Workflow.",
      "Added editable dependency settings in the workflow dialog.",
      "Defaulted review tasks to depend on the intake task.",
      "Defaulted final review to depend on all review tasks.",
      "Generated tickets now include dependency notes and dependency blockers.",
    ],
    notes: ["Workflow dependencies are visible in ticket text and blocker state for the MVP."],
  },
  {
    date: "2026-05-22",
    title: "Ticket deletion controls",
    summary: "Added ticket deletion from details and an admin cleanup tool for all tickets.",
    changes: [
      "Added Delete Ticket to the ticket detail view.",
      "Added an Admin danger zone to delete all tickets.",
      "Cleared local calendar reservations when affected tickets are deleted.",
      "Added Supabase delete policy migration for authenticated users.",
    ],
    notes: ["Bulk delete is intentionally guarded by a typed confirmation prompt."],
  },
  {
    date: "2026-05-22",
    title: "Admin user creation",
    summary: "Removed the noisy Ready status and added a real Admin flow for creating selectable users.",
    changes: [
      "Removed the visible top-bar sync status pill.",
      "Added a Create User button to Admin.",
      "Added a user creation dialog with name, role, manager, and color.",
      "New users are saved to the people table and immediately appear in owner, lead, and calendar selections.",
    ],
    notes: ["Users here are TRNAWL app people, not Supabase login accounts."],
  },
  {
    date: "2026-05-22",
    title: "Ticket filter alignment",
    summary: "Kept the ticket search, type filter, and owner filter on one clean row.",
    changes: [
      "Added a dedicated ticket toolbar layout.",
      "Kept filters aligned in one row on desktop.",
      "Preserved mobile wrapping for narrow screens.",
    ],
    notes: ["This is a visual cleanup only."],
  },
  {
    date: "2026-05-22",
    title: "Task card responsibility cleanup",
    summary: "Stopped task cards from showing Delivery Lead when the ticket type does not use a lead.",
    changes: [
      "Task cards now show Owner only.",
      "Delivery Lead remains visible only for ticket types that actually use delivery governance.",
      "Kept ticket detail responsibility aligned with the type rules.",
    ],
    notes: ["Generic tasks should stay ownership-focused."],
  },
  {
    date: "2026-05-22",
    title: "Workflow generation expansion",
    summary: "Made every workflow card executable and added custom workflow creation from scratch.",
    changes: [
      "Added a Workflow from Scratch button.",
      "Added custom workflow name and task entry in the generator.",
      "Changed Customer Action Follow-Up and Delivery Review Workflow from Ready labels to Generate Workflow buttons.",
      "Added real template tasks for the two previously placeholder workflows.",
    ],
    notes: ["Scratch workflows create tickets without saving a reusable template yet."],
  },
  {
    date: "2026-05-22",
    title: "Report builder",
    summary: "Turned Reports from a fixed brief into a selectable operational report builder.",
    changes: [
      "Added report focus selection.",
      "Added owner scope so users can report only their own work.",
      "Added selectable report data points.",
      "Added a generated brief preview with live ticket and customer-action data.",
    ],
    notes: ["Reports are generated in-browser for the MVP."],
  },
  {
    date: "2026-05-22",
    title: "Customer action defaults",
    summary: "Made customer action creation prefill obvious ownership and due date defaults.",
    changes: [
      "Preselected the customer owner from the selected customer's Sales Lead.",
      "Updated the customer owner when the selected customer changes.",
      "Defaulted new customer actions to three days from today.",
    ],
    notes: ["This keeps customer follow-up creation fast while still editable."],
  },
  {
    date: "2026-05-22",
    title: "User email readiness",
    summary: "Added email addresses to TRNAWL users for the upcoming email notification flow.",
    changes: [
      "Added optional email to user creation.",
      "Seeded Thomas with thomasfecke263@gmail.com.",
      "Show email status in Admin users.",
      "Added helper logic so blank user emails are treated as not sendable.",
    ],
    notes: ["Demo users stay blank until real addresses are added."],
  },
  {
    date: "2026-05-22",
    title: "Mail notification rules",
    summary: "Added configurable email notification rules for assignment, due dates, overdue escalation, and completion.",
    changes: [
      "Added Admin mail settings with rule toggles.",
      "Added Cloudflare Worker email sending through the TRNAWL email API.",
      "Added assignment and completion email triggers on ticket changes.",
      "Added deduped due-date and overdue email checks when the app syncs.",
    ],
    notes: ["Recipients with blank user email addresses are skipped."],
  },
  {
    date: "2026-05-22",
    title: "Project plan roadmap",
    summary: "Added a Project Plan navigation area for managing roadmap items.",
    changes: [
      "Added Project Plan to navigation.",
      "Seeded roadmap items for template management, SOW templates, At-a-glance templates, phrasing variables, and approval paths.",
      "Added create, edit, delete, and complete actions for roadmap items.",
      "Stored roadmap items in Supabase.",
    ],
    notes: ["The project plan is intended as a living roadmap, not a delivery ticket board."],
  },
  {
    date: "2026-05-22",
    title: "Mail body previews",
    summary: "Added Admin previews for every configured mail notification body.",
    changes: [
      "Added preview cards under Mail Settings.",
      "Show subject and body for assignment, due-soon, overdue, and completion emails.",
      "Use the same email template helper as live notifications.",
    ],
    notes: ["Preview values are sample ticket values; live emails use the real ticket."],
  },
  {
    date: "2026-05-22",
    title: "User editing",
    summary: "Added Admin editing for existing users.",
    changes: [
      "Added Edit actions to the Admin user table.",
      "Reused the user dialog for create and edit.",
      "Allow editing name, role, email, manager, and color.",
      "Added Supabase update policy for app people.",
    ],
    notes: ["This is needed so email recipients can be maintained after demo users are seeded."],
  },
  {
    date: "2026-05-22",
    title: "Priority work sorting",
    summary: "Changed dashboard Priority Work into a due-date driven view.",
    changes: [
      "Sorted Priority Work by due date instead of mixing status-based urgency.",
      "Excluded done tickets from the list.",
      "Kept blocker status focused in Active Blockers.",
    ],
    notes: ["Overdue work still appears first because it has the oldest due dates."],
  },
  {
    date: "2026-05-22",
    title: "Calendar horizon and colors",
    summary: "Expanded calendar planning to four weeks and improved user color contrast.",
    changes: [
      "Changed Calendar from 2 weeks to 4 weeks.",
      "Updated demo user colors to a broader readable palette.",
      "Kept the overall UI restrained while making calendar ownership easier to scan.",
    ],
    notes: ["User colors remain editable in Admin."],
  },
  {
    date: "2026-05-22",
    title: "Editable mail templates",
    summary: "Added edit controls for mail preview templates in Admin.",
    changes: [
      "Added Edit buttons to each mail preview.",
      "Added inline subject and body intro editing.",
      "Added supported variables for ticket title, owner, customer, due date, blocker, and status.",
      "Persisted mail template wording in browser storage for the MVP.",
    ],
    notes: ["Live emails now use the editable template wording."],
  },
  {
    date: "2026-05-22",
    title: "Roadmap drag and drop",
    summary: "Made Project Plan roadmap items draggable between status columns.",
    changes: [
      "Added drag handles to roadmap cards.",
      "Dropping a roadmap item on another column updates its status.",
      "Kept edit, delete, and complete actions available.",
    ],
    notes: ["Drag and drop updates the existing Supabase roadmap item."],
  },
  {
    date: "2026-05-23",
    title: "AI note improvement",
    summary: "Added Improve with AI for operational text quality.",
    changes: [
      "Added Azure Function API for Anthropic note improvement.",
      "Added Improve with AI buttons to note and description fields.",
      "Added review-before-accept dialog with suggestions.",
      "Added Admin AI instruction settings.",
    ],
    notes: ["The API key stays server-side in Azure Static Web Apps environment variables."],
  },
  {
    date: "2026-05-23",
    title: "Priority work cards",
    summary: "Changed dashboard Priority Work from a table into visual due-date cards.",
    changes: [
      "Replaced the Excel-like Priority Work table with scan-friendly cards.",
      "Added due-date urgency labels for overdue, due today, due soon, and undated work.",
      "Kept sorting by due date while making each item easier to read.",
    ],
    notes: ["Related customer tickets still use the compact table where a list is useful."],
  },
  {
    date: "2026-05-23",
    title: "AI model stabilization",
    summary: "Stabilized the Improve with AI backend model mapping.",
    changes: [
      "Mapped Haiku settings to a stable Anthropic model snapshot.",
      "Added fallback to Claude 3 Haiku if the configured key cannot access Claude 3.5 Haiku.",
      "Added Anthropic model discovery so the backend can use a model visible to the configured key.",
      "Kept friendly Admin values like haiku working for Azure environment variables.",
    ],
    notes: ["This protects the note improvement API from brittle model aliases."],
  },
  {
    date: "2026-05-23",
    title: "Compact priority work",
    summary: "Reduced dashboard Priority Work card height and added customer context.",
    changes: [
      "Changed Priority Work cards into compact rows.",
      "Added customer name directly under the ticket title.",
      "Kept due, owner, type, and blocker signals visible without wasting vertical space.",
    ],
    notes: ["Priority Work stays sorted by due date."],
  },
  {
    date: "2026-05-23",
    title: "Priority tile density",
    summary: "Matched Priority Work density to the Active Blockers tile style.",
    changes: [
      "Changed Priority Work items into compact clickable tiles.",
      "Collapsed owner, due date, and customer into short metadata lines.",
      "Removed the oversized Details button from each item.",
    ],
    notes: ["Clicking a priority tile still opens ticket details."],
  },
];

const ticketTypes = [
  ["task", "Task"],
  ["sow", "SOW"],
  ["delivery_review", "Delivery review"],
  ["customer_action", "Customer action"],
  ["internal_action", "Internal action"],
];

const priorities = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const blockedReasons = [
  ["", "Not blocked"],
  ["waiting_for_delivery", "Waiting for delivery"],
  ["waiting_for_pricing", "Waiting for commercial input"],
  ["waiting_for_legal", "Waiting for legal input"],
  ["waiting_for_customer", "Waiting for customer"],
  ["scope_unclear", "Scope unclear"],
  ["owner_missing", "Owner missing"],
  ["dependency_unresolved", "Dependency unresolved"],
  ["approval_pending", "Approval pending"],
  ["other", "Other"],
];

const actionStatuses = [
  ["open", "Open"],
  ["waiting", "Waiting"],
  ["done", "Done"],
  ["cancelled", "Cancelled"],
];

const customerStatuses = [
  ["active", "Active"],
  ["paused", "Paused"],
  ["inactive", "Inactive"],
];

const projectPlanCategories = [
  ["templates", "Template management"],
  ["content", "Content and phrasing"],
  ["approval", "Approval paths"],
  ["workflow", "Workflow logic"],
  ["adoption", "Adoption"],
];

const projectPlanStatuses = [
  ["planned", "Planned"],
  ["in_progress", "In progress"],
  ["done", "Complete"],
];

const projectPlanPriorities = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
];

const ticketTypeRules = {
  task: { deliveryLead: false, salesLead: false, customer: false },
  internal_action: { deliveryLead: false, salesLead: false, customer: false },
  delivery_review: { deliveryLead: true, salesLead: false, customer: true },
  sow: { deliveryLead: true, salesLead: true, customer: true },
  customer_action: { deliveryLead: false, salesLead: false, customer: true },
};

const readinessByType = {
  task: {
    help: "Generic tasks should stay fast. Add context in the description instead of forcing a checklist.",
    checks: [],
  },
  internal_action: {
    help: "Internal actions only need an owner and due date for now.",
    checks: [],
  },
  sow: {
    help: "Use these checks when the ticket affects a customer-facing SOW or proposal.",
    checks: [
      ["scope_clear", "Scope boundaries clear"],
      ["customer_dependencies_listed", "Customer dependencies listed"],
      ["dates_realistic", "Dates realistic"],
      ["success_criteria_clear", "Success criteria clear"],
      ["delivery_capacity_realistic", "Delivery capacity realistic"],
      ["handoff_plan_clear", "Handoff plan clear"],
    ],
  },
  delivery_review: {
    help: "Use these checks when delivery needs to review feasibility, risks, and handoff readiness.",
    checks: [
      ["scope_clear", "Scope understood"],
      ["assumptions_documented", "Assumptions documented"],
      ["risks_logged", "Delivery risks logged"],
      ["delivery_capacity_realistic", "Capacity realistic"],
      ["handoff_plan_clear", "Handoff plan clear"],
    ],
  },
  customer_action: {
    help: "Use these checks when progress depends on the customer or external stakeholder.",
    checks: [
      ["customer_owner_confirmed", "Customer owner confirmed"],
      ["customer_dependencies_listed", "Dependency clearly stated"],
      ["dates_realistic", "Date realistic"],
      ["internal_follow_up_clear", "Internal follow-up owner clear"],
      ["impact_understood", "Impact understood"],
    ],
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function init() {
  fillSelect($("#ticketType"), ticketTypes);
  fillSelect($("#ticketPriority"), priorities, "medium");
  fillSelect($("#ticketBlockedReason"), blockedReasons);
  fillSelect($("#actionStatus"), actionStatuses);
  fillSelect($("#customerStatus"), customerStatuses);
  fillSelect($("#projectPlanCategory"), projectPlanCategories);
  fillSelect($("#projectPlanStatus"), projectPlanStatuses);
  fillSelect($("#projectPlanPriority"), projectPlanPriorities, "medium");
  applyTicketTypeRules();
  bindEvents();
  renderShell();
  if (state.session?.access_token) {
    hydrateUser();
  }
}

function bindEvents() {
  $("#authForm").addEventListener("submit", (event) => {
    event.preventDefault();
    signIn();
  });
  $("#signUpButton").addEventListener("click", signUp);
  $("#signOutButton").addEventListener("click", signOut);
  $("#refreshButton").addEventListener("click", loadData);
  $("#newTicketButton").addEventListener("click", openTicketDialog);
  $("#ticketForm").addEventListener("submit", createTicket);
  $("#ticketType").addEventListener("change", applyTicketTypeRules);
  $("#ticketDetailForm").addEventListener("submit", updateTicketDetails);
  $("#ticketCustomer").addEventListener("change", applyCustomerDefaults);
  $("#ticketDetailType").addEventListener("change", applyTicketDetailRules);
  $("#ticketDetailCustomer").addEventListener("change", () => applyTicketDetailCustomerDefaults(true));
  $("#addTicketCommentButton").addEventListener("click", addTicketComment);
  $("#deleteTicketButton").addEventListener("click", deleteSelectedTicket);
  $("#toggleTicketSettingsButton").addEventListener("click", toggleTicketSettings);
  $("#calendarReservationForm").addEventListener("submit", saveCalendarReservation);
  $("#calendarBookingTaskSearch").addEventListener("input", () => showCalendarBookingDropdown("task"));
  $("#calendarBookingCustomerSearch").addEventListener("input", () => showCalendarBookingDropdown("customer"));
  $("#calendarBookingTaskSearch").addEventListener("focus", () => showCalendarBookingDropdown("task"));
  $("#calendarBookingCustomerSearch").addEventListener("focus", () => showCalendarBookingDropdown("customer"));
  $("#calendarBookingDays").addEventListener("input", updateCalendarBookingSummary);
  $("#calendarBookingTaskResults").addEventListener("click", selectCalendarBookingTask);
  $("#calendarBookingCustomerResults").addEventListener("click", selectCalendarBookingCustomer);
  $("#calendarReservationDialog").addEventListener("click", closeCalendarBookingDropdownOnOutsideClick);
  $("#workflowForm").addEventListener("submit", startWorkflow);
  $("#workflowCustomer").addEventListener("change", applyWorkflowCustomerDefaults);
  $("#workflowScratchTasks").addEventListener("input", renderScratchWorkflowPreview);
  $("#customerForm").addEventListener("submit", createCustomer);
  $("#customerEditForm").addEventListener("submit", updateCustomer);
  $("#actionForm").addEventListener("submit", createCustomerAction);
  $("#actionCustomer").addEventListener("change", applyActionCustomerDefaults);
  $("#personForm").addEventListener("submit", savePerson);
  $("#projectPlanForm").addEventListener("submit", saveProjectPlanItem);
  $("#aiImproveForm").addEventListener("submit", acceptAiImprovement);

  $$(".close-dialog").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  attachAiImproveButtons();
}

function fillSelect(select, options, selected = "") {
  if (!select) return;
  select.innerHTML = options.map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("");
}

function attachAiImproveButtons() {
  [
    "ticketDescription",
    "ticketDetailDescription",
    "ticketCommentText",
    "customerNotes",
    "customerEditNotes",
    "calendarBookingNote",
    "projectPlanDescription",
  ].forEach(addAiImproveButton);
}

function addAiImproveButton(textareaId) {
  const textarea = $(`#${textareaId}`);
  if (!textarea || textarea.dataset.aiReady) return;
  textarea.dataset.aiReady = "true";
  const button = document.createElement("button");
  button.className = "secondary-button compact-button ai-improve-button";
  button.type = "button";
  button.dataset.targetId = textareaId;
  button.innerHTML = `<i data-lucide="sparkles"></i><span>Improve with AI</span>`;
  button.addEventListener("click", () => improveTextWithAi(textareaId));
  textarea.insertAdjacentElement("afterend", button);
}

async function improveTextWithAi(targetId) {
  const textarea = $(`#${targetId}`);
  const text = textarea?.value.trim();
  if (!textarea || !text) return;
  try {
    setSync("Improving text");
    const response = await fetch("/api/improve-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, instruction: state.aiInstruction }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "AI improvement failed.");
    state.pendingAiTargetId = targetId;
    state.pendingAiImprovedText = result.improvedText || text;
    $("#aiOriginalText").textContent = text;
    $("#aiImprovedText").value = state.pendingAiImprovedText;
    $("#aiSuggestions").innerHTML = result.suggestions?.length
      ? result.suggestions.map((suggestion) => `<div>${escapeHtml(suggestion)}</div>`).join("")
      : `<div>No missing details suggested.</div>`;
    $("#aiImproveDialog").showModal();
    setSync("Ready");
  } catch (error) {
    setSync(error.message);
  }
}

function acceptAiImprovement(event) {
  event.preventDefault();
  const textarea = state.pendingAiTargetId ? $(`#${state.pendingAiTargetId}`) : null;
  if (textarea) textarea.value = $("#aiImprovedText").value;
  state.pendingAiTargetId = null;
  state.pendingAiImprovedText = "";
  $("#aiImproveDialog").close();
}

function currentReadinessConfig() {
  return readinessByType[$("#ticketType")?.value] || readinessByType.task;
}

function renderReadinessChecks() {
  const fieldset = $("#readinessFieldset");
  if (!fieldset) return;
  const config = currentReadinessConfig();
  fieldset.classList.toggle("hidden", !config.checks.length);
  $("#readinessHelp").textContent = config.help;
  $("#readinessOptions").innerHTML = config.checks.map(([value, label]) => `
    <label><input type="checkbox" name="readiness" value="${value}" /> ${escapeHtml(label)}</label>
  `).join("");
}

function readinessPayloadForType(ticketType) {
  const checks = readinessByType[ticketType]?.checks || [];
  return Object.fromEntries(checks.map(([key]) => [key, Boolean($(`input[name="readiness"][value="${key}"]`)?.checked)]));
}

function currentTicketTypeRules() {
  return ticketTypeRules[$("#ticketType")?.value] || ticketTypeRules.task;
}

function applyTicketTypeRules() {
  const rules = currentTicketTypeRules();
  toggleFormField(".ticket-delivery-field", rules.deliveryLead);
  toggleFormField(".ticket-sales-field", rules.salesLead);
  toggleFormField(".ticket-customer-field", rules.customer);
  applyCustomerDefaults();
  renderReadinessChecks();
}

function toggleFormField(selector, visible) {
  const field = $(selector);
  if (!field) return;
  field.classList.toggle("hidden", !visible);
  const control = field.querySelector("select, input, textarea");
  if (control) control.disabled = !visible;
}

function openTicketDialog() {
  setTicketDefaults();
  applyTicketTypeRules();
  $("#ticketDialog").showModal();
}

function setTicketDefaults() {
  if (!$("#ticketDueDate").value) $("#ticketDueDate").value = isoDateFromToday(2);
  if (!$("#workflowDueDate").value) $("#workflowDueDate").value = isoDateFromToday(2);
}

function applyCustomerDefaults() {
  const rules = currentTicketTypeRules();
  const currentUser = getCurrentPerson();
  if (rules.deliveryLead && currentUser?.manager_id) {
    $("#ticketDeliveryLead").value = currentUser.manager_id;
  }
  const customer = findById(state.customers, $("#ticketCustomer")?.value);
  if (rules.salesLead && customer?.sales_lead_id) {
    $("#ticketSalesLead").value = customer.sales_lead_id;
  }
}

function applyWorkflowCustomerDefaults() {
  const customer = findById(state.customers, $("#workflowCustomer")?.value);
  const currentUser = getCurrentPerson();
  if (currentUser?.manager_id) $("#workflowDeliveryLead").value = currentUser.manager_id;
  if (customer?.sales_lead_id) $("#workflowSalesLead").value = customer.sales_lead_id;
}

function applyTicketDetailRules() {
  const ticketType = $("#ticketDetailType").value;
  const rules = ticketTypeRules[ticketType] || ticketTypeRules.task;
  toggleFormField(".detail-delivery-field", rules.deliveryLead);
  toggleFormField(".detail-sales-field", rules.salesLead);
  toggleFormField(".detail-customer-field", rules.customer);
  applyTicketDetailCustomerDefaults();
  renderDetailReadinessChecks();
  applyTicketSettingsLock();
}

function toggleTicketSettings() {
  state.ticketSettingsUnlocked = !state.ticketSettingsUnlocked;
  applyTicketSettingsLock();
}

function applyTicketSettingsLock() {
  const unlocked = state.ticketSettingsUnlocked;
  const button = $("#toggleTicketSettingsButton");
  if (button) {
    button.textContent = unlocked ? "Lock" : "Edit";
    button.setAttribute("aria-pressed", String(unlocked));
  }
  $(".stable-settings")?.classList.toggle("is-locked", !unlocked);
  $$(".stable-settings select, .stable-settings input, .stable-settings textarea").forEach((control) => {
    const field = control.closest("label");
    control.disabled = !unlocked || Boolean(field?.classList.contains("hidden"));
  });
}

function applyTicketDetailCustomerDefaults(force = false) {
  const rules = ticketTypeRules[$("#ticketDetailType")?.value] || ticketTypeRules.task;
  const customer = findById(state.customers, $("#ticketDetailCustomer")?.value);
  if (rules.salesLead && customer?.sales_lead_id && (force || !$("#ticketDetailSalesLead").value)) {
    $("#ticketDetailSalesLead").value = customer.sales_lead_id;
  }
}

function renderDetailReadinessChecks() {
  const fieldset = $("#ticketDetailReadinessFieldset");
  if (!fieldset) return;
  const ticket = findById(state.tickets, state.selectedTicketId);
  const config = readinessByType[$("#ticketDetailType")?.value] || readinessByType.task;
  const saved = ticket?.readiness_checks || {};
  fieldset.classList.toggle("hidden", !config.checks.length);
  $("#ticketDetailReadinessHelp").textContent = config.help;
  $("#ticketDetailReadinessOptions").innerHTML = config.checks.map(([value, label]) => `
    <label><input type="checkbox" name="detailReadiness" value="${value}" ${saved[value] ? "checked" : ""} /> ${escapeHtml(label)}</label>
  `).join("");
}

function detailReadinessPayload(ticketType) {
  const checks = readinessByType[ticketType]?.checks || [];
  return Object.fromEntries(checks.map(([key]) => [key, Boolean($(`input[name="detailReadiness"][value="${key}"]`)?.checked)]));
}

async function signIn() {
  setAuthMessage("");
  try {
    const body = {
      email: $("#authEmail").value.trim(),
      password: $("#authPassword").value,
    };
    const session = await authRequest("/token?grant_type=password", body);
    setSession(session);
    await hydrateUser();
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function signUp() {
  setAuthMessage("");
  try {
    const body = {
      email: $("#authEmail").value.trim(),
      password: $("#authPassword").value,
    };
    const response = await authRequest("/signup", body);
    if (response.access_token) {
      setSession(response);
      await hydrateUser();
    } else {
      setAuthMessage("Account created. Check email confirmation if sign-in is not active yet.");
    }
  } catch (error) {
    setAuthMessage(error.message);
  }
}

function signOut() {
  localStorage.removeItem("trnawl.session");
  state.session = null;
  state.user = null;
  state.tickets = [];
  state.customerActions = [];
  renderShell();
}

async function hydrateUser() {
  try {
    const user = await authGet("/user");
    state.user = user;
    renderShell();
    await loadData();
  } catch {
    signOut();
  }
}

function setSession(session) {
  state.session = session;
  localStorage.setItem("trnawl.session", JSON.stringify(session));
}

function setAuthMessage(message) {
  $("#authMessage").textContent = message;
}

async function authRequest(path, body) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

async function authGet(path) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${state.session.access_token}`,
    },
  });
  return parseResponse(response);
}

async function api(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${state.session.access_token}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    signOut();
    throw new Error("Session expired.");
  }

  return parseResponse(response);
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || data?.error_description || `Request failed: ${response.status}`);
  }
  return data;
}

async function loadData() {
  if (!state.session) return;
  setSync("Syncing");
  try {
    const [stages, tickets, templates, templateTasks, customerActions, ticketComments, projectPlanItems, people, customers] = await Promise.all([
      api("/workflow_stages?select=*&order=stage_type.asc,position.asc"),
      api("/tickets?select=*&order=created_at.desc"),
      api("/workflow_templates?select=*&order=name.asc"),
      api("/workflow_template_tasks?select=*&order=position.asc"),
      api("/customer_actions?select=*&order=created_at.desc"),
      api("/ticket_comments?select=*&order=created_at.asc"),
      api("/project_plan_items?select=*&order=status.asc,priority.desc,created_at.asc"),
      api("/app_people?select=*&order=is_current_user.desc,display_name.asc"),
      api("/customers?select=*&order=name.asc"),
    ]);
    state.stages = stages;
    state.tickets = tickets;
    state.templates = templates;
    state.templateTasks = templateTasks;
    state.customerActions = customerActions;
    state.ticketComments = ticketComments;
    state.projectPlanItems = projectPlanItems;
    state.people = people;
    state.customers = customers;
    syncObjectSelects();
    renderAll();
    await runScheduledMailChecks();
    setSync("Ready");
  } catch (error) {
    setSync(error.message);
  }
}

function syncObjectSelects() {
  const personOptions = state.people.map((person) => [person.id, `${person.display_name} - ${person.role_label}`]);
  const customerOptions = state.customers.map((customer) => [customer.id, customer.name]);
  const ticketStageOptions = state.stages.filter((stage) => stage.stage_type === "ticket").map((stage) => [stage.id, stage.name]);
  const currentUser = getCurrentPerson();
  const defaultDeliveryLeadId = currentUser?.manager_id || currentUser?.id || "";
  const fallbackSalesLead = state.people.find((person) => person.display_name === "Harry Dumm") || state.people.find((person) => person.role_label.includes("Sales")) || state.people[0];
  const newStage = state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "New") || state.stages.find((stage) => stage.stage_type === "ticket");

  fillSelect($("#ticketOwner"), personOptions, currentUser?.id || "");
  fillSelect($("#ticketDeliveryLead"), personOptions, defaultDeliveryLeadId);
  fillSelect($("#ticketSalesLead"), personOptions, fallbackSalesLead?.id || "");
  fillSelect($("#workflowOwner"), personOptions, currentUser?.id || "");
  fillSelect($("#workflowDeliveryLead"), personOptions, defaultDeliveryLeadId);
  fillSelect($("#workflowSalesLead"), personOptions, fallbackSalesLead?.id || "");
  fillSelect($("#ticketCustomer"), customerOptions, state.customers[0]?.id || "");
  fillSelect($("#workflowCustomer"), customerOptions, state.customers[0]?.id || "");
  fillSelect($("#actionCustomer"), customerOptions, state.customers[0]?.id || "");
  fillSelect($("#ticketStatus"), ticketStageOptions, newStage?.id || "");
  fillSelect($("#ticketDetailStatus"), ticketStageOptions);
  fillSelect($("#ticketDetailType"), ticketTypes);
  fillSelect($("#ticketDetailPriority"), priorities);
  fillSelect($("#ticketDetailOwner"), personOptions);
  fillSelect($("#ticketDetailDeliveryLead"), personOptions);
  fillSelect($("#ticketDetailSalesLead"), personOptions);
  fillSelect($("#ticketDetailCustomer"), customerOptions);
  fillSelect($("#ticketDetailBlockedReason"), blockedReasons);
  fillSelect($("#customerSalesLead"), personOptions, fallbackSalesLead?.id || "");
  fillSelect($("#customerEditStatus"), customerStatuses);
  fillSelect($("#customerEditSalesLead"), personOptions);
  fillSelect($("#personManager"), [["", "No manager"], ...personOptions]);
  setTicketDefaults();
  applyTicketTypeRules();
  applyWorkflowCustomerDefaults();
}

function setSync(message) {
  const syncStatus = $("#syncStatus");
  if (syncStatus) syncStatus.textContent = message;
}

function renderShell() {
  $("#authView").classList.toggle("hidden", Boolean(state.session));
  $("#appView").classList.toggle("hidden", !state.session);
  if (state.session) {
    renderAll();
  }
}

function renderAll() {
  renderDashboard();
  renderTickets();
  renderWorkflows();
  renderCustomers();
  renderCustomerActions();
  renderCalendar();
  renderReports();
  renderProjectPlan();
  renderDevLog();
  renderAdmin();
  refreshIcons();
}

function switchView(view) {
  state.activeView = view;
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $$(".view").forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  $("#viewTitle").textContent = viewMeta[view][0];
  $("#viewSubtitle").textContent = viewMeta[view][1];
}

function renderDashboard() {
  const activeTickets = state.tickets.filter((ticket) => !isDoneTicket(ticket));
  const overdue = activeTickets.filter(isOverdue);
  const blocked = activeTickets.filter((ticket) => ticket.blocked_reason);
  const priorityTickets = ticketsByDueDate(activeTickets).slice(0, 8);
  const openActions = state.customerActions.filter((action) => !["done", "cancelled"].includes(action.status));

  $("#dashboardView").innerHTML = `
    <div class="metric-grid">
      ${metric("Open tickets", activeTickets.length)}
      ${metric("Overdue", overdue.length, "danger")}
      ${metric("Blocked", blocked.length, "warning")}
      ${metric("Customer actions", openActions.length)}
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>Priority Work</h2>
        ${priorityWorkCards(priorityTickets)}
      </section>
      <section class="panel">
        <h2>Active Blockers</h2>
        ${blockedReasonList()}
      </section>
    </div>
  `;
}

function metric(label, value, tone = "") {
  return `<div class="metric"><strong class="${tone}">${value}</strong><span>${label}</span></div>`;
}

function ticketTable(tickets) {
  if (!tickets.length) return `<div class="empty-state">No priority work yet.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Ticket</th><th>Owner</th><th>Due</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${tickets.map((ticket) => `
            <tr>
              <td>${escapeHtml(ticket.title)}</td>
              <td>${escapeHtml(ticket.work_owner_name || ticket.owner_name || "Unassigned")}</td>
              <td>${formatDate(ticket.due_date)}</td>
              <td>${ticketPills(ticket)}</td>
              <td><button class="secondary-button ticket-detail-button" type="button" data-ticket-id="${ticket.id}">Details</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function priorityWorkCards(tickets) {
  if (!tickets.length) return `<div class="empty-state">No priority work yet.</div>`;
  return `
    <div class="priority-work-grid">
      ${tickets.map((ticket) => `
        <button class="priority-work-card ${priorityWorkTone(ticket)} ticket-detail-button" type="button" data-ticket-id="${ticket.id}">
          <div class="priority-card-top">
            <span class="due-badge">${escapeHtml(dueLabel(ticket.due_date))}</span>
            <span class="pill">${escapeHtml(labelFor(ticketTypes, ticket.ticket_type))}</span>
          </div>
          <strong>${escapeHtml(ticket.title)}</strong>
          <div class="priority-card-meta">
            <span>${escapeHtml(ticket.customer_name || "No customer")}</span>
            <small>Owner: ${escapeHtml(ticket.work_owner_name || ticket.owner_name || "Unassigned")} · due <b>${escapeHtml(formatDate(ticket.due_date))}</b></small>
            ${ticket.blocked_reason ? `<small>${escapeHtml(labelFor(blockedReasons, ticket.blocked_reason))}</small>` : ""}
          </div>
        </button>
      `).join("")}
    </div>
  `;
}

function priorityWorkTone(ticket) {
  const days = daysUntil(ticket.due_date);
  if (!ticket.due_date) return "undated";
  if (days < 0) return "overdue";
  if (days <= 2) return "soon";
  return "";
}

function dueLabel(dateString) {
  if (!dateString) return "No due date";
  const days = daysUntil(dateString);
  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

function ticketsByDueDate(tickets) {
  return [...tickets].sort((a, b) => {
    const aTime = dueDateTime(a.due_date);
    const bTime = dueDateTime(b.due_date);
    if (aTime !== bTime) return aTime - bTime;
    return (a.title || "").localeCompare(b.title || "");
  });
}

function dueDateTime(dateString) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  const date = new Date(`${dateString}T00:00:00`);
  const time = date.getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

function blockedReasonList() {
  const blockedTickets = state.tickets
    .filter((ticket) => ticket.blocked_reason && !isDoneTicket(ticket))
    .sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date));
  if (!blockedTickets.length) return `<div class="empty-state">No blocked tickets.</div>`;
  return `<div class="blocked-tile-grid">${blockedTickets.map(blockedTicketTile).join("")}</div>`;
}

function blockedTicketTile(ticket) {
  return `
    <button class="blocked-ticket-tile ticket-detail-button" type="button" data-ticket-id="${ticket.id}">
      <span class="blocked-reason-label">${escapeHtml(labelFor(blockedReasons, ticket.blocked_reason))}</span>
      <strong>${escapeHtml(ticket.title)}</strong>
      <span>${escapeHtml(blockedAgeLabel(ticket))} · ${escapeHtml(ticket.work_owner_name || ticket.owner_name || "Unassigned")} · due ${escapeHtml(formatDate(ticket.due_date))}</span>
      ${ticket.customer_name ? `<small>${escapeHtml(ticket.customer_name)}</small>` : ""}
    </button>
  `;
}

function renderTickets() {
  const stages = state.stages.filter((stage) => stage.stage_type === "ticket");
  const currentPerson = getCurrentPerson();
  const filtered = state.tickets.filter((ticket) => {
    const search = state.search.toLowerCase();
    const matchesSearch = !search || [ticket.title, ticket.description, ticket.customer_name, ticket.work_owner_name, ticket.owner_name, ticket.delivery_lead_name, ticket.sales_lead_name, ticket.requester_name].filter(Boolean).join(" ").toLowerCase().includes(search);
    const matchesType = state.typeFilter === "all" || ticket.ticket_type === state.typeFilter;
    const matchesOwner =
      state.ownerFilter === "all" ||
      (state.ownerFilter === "me" && currentPerson && (ticket.work_owner_id === currentPerson.id || ticket.work_owner_name === currentPerson.display_name || ticket.owner_name === currentPerson.display_name)) ||
      ticket.work_owner_id === state.ownerFilter ||
      ticket.work_owner_name === state.ownerFilter;
    return matchesSearch && matchesType && matchesOwner;
  });
  const ownerOptions = [
    ["me", "My tickets"],
    ["all", "All owners"],
    ...state.people.map((person) => [person.id, person.display_name]),
  ];

  $("#ticketsView").innerHTML = `
    <div class="toolbar ticket-toolbar">
      <div class="ticket-filter-row">
        <input id="ticketSearch" placeholder="Search tickets, owners, customers" value="${escapeHtml(state.search)}" />
        <select id="typeFilter">
          <option value="all">All types</option>
          ${ticketTypes.map(([value, label]) => `<option value="${value}" ${state.typeFilter === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
        <select id="ownerFilter">
          ${ownerOptions.map(([value, label]) => `<option value="${value}" ${state.ownerFilter === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      <button class="primary-button" type="button" id="boardNewTicket"><i data-lucide="plus"></i><span>Ticket</span></button>
    </div>
    <div class="ticket-board">
      ${stages.map((stage) => boardColumn(stage, filtered.filter((ticket) => ticket.status_stage_id === stage.id))).join("")}
    </div>
  `;

  $("#ticketSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderTickets();
  });
  $("#typeFilter").addEventListener("change", (event) => {
    state.typeFilter = event.target.value;
    renderTickets();
  });
  $("#ownerFilter").addEventListener("change", (event) => {
    state.ownerFilter = event.target.value;
    renderTickets();
  });
  $("#boardNewTicket").addEventListener("click", openTicketDialog);
  bindDragAndDrop();
}

function boardColumn(stage, tickets) {
  return `
    <div class="board-column" data-stage-id="${stage.id}">
      <div class="column-header"><span>${escapeHtml(stage.name)}</span><span class="pill">${tickets.length}</span></div>
      ${tickets.map(ticketCard).join("") || `<div class="empty-state">No tickets.</div>`}
    </div>
  `;
}

function ticketCard(ticket) {
  return `
    <article class="ticket-card" draggable="true" data-ticket-id="${ticket.id}">
      <div class="ticket-title">${escapeHtml(ticket.title)}</div>
      <div class="ticket-desc">${escapeHtml(ticket.description || "No description")}</div>
      <div class="tag-row">
        <span class="pill primary">${labelFor(ticketTypes, ticket.ticket_type)}</span>
        ${ticketPills(ticket)}
        <span class="pill">Owner: ${escapeHtml(ticket.work_owner_name || ticket.owner_name || "Unassigned")}</span>
        ${shouldShowDeliveryPill(ticket) ? `<span class="pill">Delivery: ${escapeHtml(ticket.delivery_lead_name)}</span>` : ""}
      </div>
      <button class="secondary-button ticket-detail-button" type="button" data-ticket-id="${ticket.id}">Details</button>
    </article>
  `;
}

function shouldShowDeliveryPill(ticket) {
  const rules = ticketTypeRules[ticket.ticket_type] || ticketTypeRules.task;
  return Boolean(rules.deliveryLead && ticket.delivery_lead_name);
}

function ticketPills(ticket) {
  const pills = [];
  if (ticket.priority === "urgent" || ticket.priority === "high") pills.push(`<span class="pill warning">${labelFor(priorities, ticket.priority)}</span>`);
  if (isOverdue(ticket)) pills.push(`<span class="pill danger">Overdue</span>`);
  if (ticket.blocked_reason) pills.push(`<span class="pill danger">${labelFor(blockedReasons, ticket.blocked_reason)}</span>`);
  if (ticket.readiness_score > 0) pills.push(`<span class="pill success">${ticket.readiness_score}% ready</span>`);
  return pills.join("");
}

function bindDragAndDrop() {
  $$(".ticket-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.ticketId);
    });
  });

  bindTicketDetailButtons();

  $$(".board-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drop-target");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drop-target"));
    column.addEventListener("drop", async (event) => {
      event.preventDefault();
      column.classList.remove("drop-target");
      await updateTicketStage(event.dataTransfer.getData("text/plain"), column.dataset.stageId);
    });
  });
}

function bindTicketDetailButtons() {
  $$(".ticket-detail-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openTicketDetails(button.dataset.ticketId);
    });
  });
}

async function updateTicketStage(ticketId, stageId) {
  try {
    setSync("Saving");
    const previousTicket = findById(state.tickets, ticketId);
    await api(`/tickets?id=eq.${ticketId}`, {
      method: "PATCH",
      body: { status_stage_id: stageId },
    });
    await handleTicketChangeMail(previousTicket, { ...previousTicket, status_stage_id: stageId });
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function openTicketDetails(ticketId) {
  const ticket = findById(state.tickets, ticketId);
  if (!ticket) return;
  state.selectedTicketId = ticketId;
  state.ticketSettingsUnlocked = false;
  const stage = findById(state.stages, ticket.status_stage_id);
  const rules = ticketTypeRules[ticket.ticket_type] || ticketTypeRules.task;
  $("#ticketDetailTitle").textContent = ticket.title;
  $("#ticketDetailSubtitle").textContent = `${labelFor(ticketTypes, ticket.ticket_type)} · ${stage?.name || "No status"}`;
  const ticketStageOptions = state.stages.filter((item) => item.stage_type === "ticket").map((item) => [item.id, item.name]);
  const personOptions = state.people.map((person) => [person.id, `${person.display_name} - ${person.role_label}`]);
  const customerOptions = state.customers.map((customer) => [customer.id, customer.name]);
  fillSelect($("#ticketDetailType"), ticketTypes, ticket.ticket_type);
  fillSelect($("#ticketDetailPriority"), priorities, ticket.priority);
  fillSelect($("#ticketDetailOwner"), personOptions, ticket.work_owner_id || "");
  fillSelect($("#ticketDetailDeliveryLead"), personOptions, ticket.delivery_lead_id || "");
  fillSelect($("#ticketDetailSalesLead"), personOptions, ticket.sales_lead_id || "");
  fillSelect($("#ticketDetailCustomer"), customerOptions, ticket.customer_id || "");
  fillSelect($("#ticketDetailStatus"), ticketStageOptions, ticket.status_stage_id || "");
  fillSelect($("#ticketDetailBlockedReason"), blockedReasons, ticket.blocked_reason || "");
  $("#ticketDetailTitleInput").value = ticket.title || "";
  $("#ticketDetailDescription").value = ticket.description || "";
  $("#ticketDetailDueDate").value = ticket.due_date || "";
  if (rules.deliveryLead && !$("#ticketDetailDeliveryLead").value) {
    $("#ticketDetailDeliveryLead").value = getCurrentPerson()?.manager_id || "";
  }
  if (rules.salesLead && !$("#ticketDetailSalesLead").value) {
    const customer = findById(state.customers, $("#ticketDetailCustomer").value);
    $("#ticketDetailSalesLead").value = customer?.sales_lead_id || "";
  }
  renderTicketComments(ticket.id);
  applyTicketDetailRules();
  $("#ticketDetailDialog").showModal();
  refreshIcons();
}

async function updateTicketDetails(event) {
  event.preventDefault();
  if (!state.selectedTicketId) return;
  const previousTicket = findById(state.tickets, state.selectedTicketId);
  const ticketType = $("#ticketDetailType").value;
  const rules = ticketTypeRules[ticketType] || ticketTypeRules.task;
  const owner = findById(state.people, $("#ticketDetailOwner").value);
  const deliveryLead = rules.deliveryLead ? findById(state.people, $("#ticketDetailDeliveryLead").value) : null;
  const salesLead = rules.salesLead ? findById(state.people, $("#ticketDetailSalesLead").value) : null;
  const customer = rules.customer ? findById(state.customers, $("#ticketDetailCustomer").value) : null;
  const readiness = detailReadinessPayload(ticketType);
  const readinessKeys = Object.keys(readiness);
  const readinessScore = readinessKeys.length ? Math.round((Object.values(readiness).filter(Boolean).length / readinessKeys.length) * 100) : 0;
  try {
    setSync("Saving");
    const updateText = $("#ticketCommentText").value.trim();
    const ticketPatch = {
      title: $("#ticketDetailTitleInput").value.trim(),
      description: $("#ticketDetailDescription").value.trim() || null,
      ticket_type: ticketType,
      priority: $("#ticketDetailPriority").value,
      work_owner_id: owner?.id || null,
      work_owner_name: owner?.display_name || null,
      owner_name: owner?.display_name || null,
      delivery_lead_id: deliveryLead?.id || null,
      delivery_lead_name: deliveryLead?.display_name || null,
      sales_lead_id: salesLead?.id || null,
      sales_lead_name: salesLead?.display_name || null,
      customer_id: customer?.id || null,
      customer_name: customer?.name || null,
      due_date: $("#ticketDetailDueDate").value || null,
      status_stage_id: $("#ticketDetailStatus").value || null,
      blocked_reason: $("#ticketDetailBlockedReason").value || null,
      blocked_since: $("#ticketDetailBlockedReason").value ? new Date().toISOString() : null,
      readiness_checks: readiness,
      readiness_score: readinessScore,
    };
    const updatedTicket = { ...previousTicket, ...ticketPatch };
    await api(`/tickets?id=eq.${state.selectedTicketId}`, {
      method: "PATCH",
      body: ticketPatch,
    });
    if (updateText) {
      await saveTicketComment(updateText);
    }
    await handleTicketChangeMail(previousTicket, updatedTicket);
    $("#ticketDetailDialog").close();
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

async function deleteSelectedTicket() {
  if (!state.selectedTicketId) return;
  const ticket = findById(state.tickets, state.selectedTicketId);
  const confirmed = window.confirm(`Delete ticket "${ticket?.title || "selected ticket"}"? This also removes its updates and workflow links.`);
  if (!confirmed) return;
  try {
    setSync("Deleting ticket");
    await deleteTicketsByIds([state.selectedTicketId]);
    $("#ticketDetailDialog").close();
    state.selectedTicketId = null;
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

async function deleteTicketsByIds(ticketIds) {
  const ids = ticketIds.filter(Boolean);
  if (!ids.length) return;
  for (const ticketId of ids) {
    await api(`/tickets?id=eq.${ticketId}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });
  }
  state.calendarReservations = state.calendarReservations.filter((reservation) => !ids.includes(reservation.ticketId));
  localStorage.setItem("trnawl.calendarReservations", JSON.stringify(state.calendarReservations));
}

async function deleteAllTickets() {
  if (!state.tickets.length) {
    setSync("No tickets to delete");
    return;
  }
  const confirmation = window.prompt(`This permanently deletes ${state.tickets.length} tickets and their updates. Type DELETE ALL TICKETS to continue.`);
  if (confirmation !== "DELETE ALL TICKETS") return;
  try {
    setSync("Deleting all tickets");
    await api("/tickets?id=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });
    state.calendarReservations = [];
    localStorage.setItem("trnawl.calendarReservations", JSON.stringify(state.calendarReservations));
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function renderTicketComments(ticketId) {
  const comments = state.ticketComments.filter((comment) => comment.ticket_id === ticketId);
  $("#ticketCommentsList").innerHTML = comments.map((comment) => `
    <article class="comment-item">
      <p>${escapeHtml(comment.body)}</p>
      <span>${new Date(comment.created_at).toLocaleString()}</span>
    </article>
  `).join("") || `<div class="empty-state">No updates yet.</div>`;
  $("#ticketCommentText").value = "";
}

async function addTicketComment() {
  const body = $("#ticketCommentText").value.trim();
  if (!state.selectedTicketId || !body) return;
  try {
    setSync("Adding update");
    await saveTicketComment(body);
    state.ticketComments = await api("/ticket_comments?select=*&order=created_at.asc");
    renderTicketComments(state.selectedTicketId);
    setSync("Ready");
  } catch (error) {
    setSync(error.message);
  }
}

async function saveTicketComment(body) {
  await saveCommentForTicket(state.selectedTicketId, body);
}

async function saveCommentForTicket(ticketId, body) {
  if (!ticketId || !body) return;
  await api("/ticket_comments", {
    method: "POST",
    body: {
      ticket_id: ticketId,
      author_id: state.user.id,
      body,
    },
  });
}

async function createTicket(event) {
  event.preventDefault();
  const ticketType = $("#ticketType").value;
  const readiness = readinessPayloadForType(ticketType);
  const readinessKeys = Object.keys(readiness);
  const readinessScore = readinessKeys.length ? Math.round((Object.values(readiness).filter(Boolean).length / readinessKeys.length) * 100) : 0;
  const rules = ticketTypeRules[ticketType] || ticketTypeRules.task;
  const selectedStage = findById(state.stages, $("#ticketStatus").value) || state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "New") || state.stages.find((stage) => stage.stage_type === "ticket");
  const owner = findById(state.people, $("#ticketOwner").value);
  const deliveryLead = rules.deliveryLead ? findById(state.people, $("#ticketDeliveryLead").value) : null;
  const salesLead = rules.salesLead ? findById(state.people, $("#ticketSalesLead").value) : null;
  const customer = rules.customer ? findById(state.customers, $("#ticketCustomer").value) : null;
  const body = {
    title: $("#ticketTitle").value.trim(),
    description: $("#ticketDescription").value.trim() || null,
    ticket_type: ticketType,
    priority: $("#ticketPriority").value,
    work_owner_id: owner?.id || null,
    work_owner_name: owner?.display_name || null,
    delivery_lead_id: deliveryLead?.id || null,
    delivery_lead_name: deliveryLead?.display_name || null,
    sales_lead_id: salesLead?.id || null,
    sales_lead_name: salesLead?.display_name || null,
    opportunity_lead_id: null,
    customer_id: customer?.id || null,
    owner_name: owner?.display_name || null,
    requester_name: state.user.email,
    customer_name: customer?.name || null,
    due_date: $("#ticketDueDate").value || null,
    blocked_reason: $("#ticketBlockedReason").value || null,
    blocked_since: $("#ticketBlockedReason").value ? new Date().toISOString() : null,
    readiness_checks: readiness,
    readiness_score: readinessScore,
    status_stage_id: selectedStage?.id || null,
    requester_id: state.user.id,
  };

  try {
    setSync("Creating");
    const [createdTicket] = await api("/tickets", { method: "POST", body });
    await sendAssignmentMail(createdTicket, "created");
    $("#ticketForm").reset();
    $("#ticketPriority").value = "medium";
    syncObjectSelects();
    setTicketDefaults();
    applyTicketTypeRules();
    $("#ticketDialog").close();
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function renderWorkflows() {
  $("#workflowsView").innerHTML = `
    <div class="toolbar">
      <div></div>
      <button class="primary-button" type="button" id="startScratchWorkflowButton"><i data-lucide="plus"></i><span>Workflow from Scratch</span></button>
    </div>
    <div class="template-grid">
      ${state.templates.map((template) => `
        <article class="template-item">
          <h3>${escapeHtml(template.name)}</h3>
          <p>${escapeHtml(template.description || "")}</p>
          <button class="primary-button workflow-template-button" type="button" data-template-id="${template.id}"><i data-lucide="play"></i><span>Generate Workflow</span></button>
        </article>
      `).join("")}
    </div>
    ${state.templates.map((template) => workflowTemplateTaskPanel(template)).join("")}
  `;
  $("#startScratchWorkflowButton")?.addEventListener("click", openScratchWorkflowDialog);
  $$(".workflow-template-button").forEach((button) => {
    button.addEventListener("click", () => openWorkflowDialog(button.dataset.templateId));
  });
}

function workflowTemplateTaskPanel(template) {
  const tasks = workflowTasksForTemplate(template.id);
  const dependencies = defaultWorkflowDependencies(tasks);
  return `
    <section class="panel workflow-task-panel">
      <h2>${escapeHtml(template.name)} Tasks</h2>
      <div class="preview-list">
        ${tasks.map((task) => workflowTaskPreview(task, tasks, dependencies)).join("") || `<div class="empty-state">No tasks configured yet.</div>`}
      </div>
    </section>
  `;
}

function openWorkflowDialog(templateId) {
  const template = findById(state.templates, templateId);
  if (!template) return;
  state.selectedWorkflowTemplateId = template.id;
  state.scratchWorkflowMode = false;
  const tasks = workflowTasksForTemplate(template.id);
  const dependencies = defaultWorkflowDependencies(tasks);
  $("#workflowDialogTitle").textContent = `Generate ${template.name}`;
  $("#workflowDialogSubtitle").textContent = "Create operational tasks and adjust dependency logic before tickets are generated.";
  $("#workflowNameField").classList.add("hidden");
  $("#workflowScratchTasksField").classList.add("hidden");
  $("#workflowPreview").innerHTML = tasks.map((task) => workflowTaskPreview(task, tasks, dependencies)).join("");
  $("#workflowDependencies").innerHTML = workflowDependencyEditor(tasks, dependencies);
  setTicketDefaults();
  $("#workflowDialog").showModal();
}

function openScratchWorkflowDialog() {
  state.selectedWorkflowTemplateId = null;
  state.scratchWorkflowMode = true;
  $("#workflowDialogTitle").textContent = "Create Workflow from Scratch";
  $("#workflowDialogSubtitle").textContent = "Type the tasks, then choose which steps depend on earlier steps.";
  $("#workflowNameField").classList.remove("hidden");
  $("#workflowScratchTasksField").classList.remove("hidden");
  $("#workflowName").value = "";
  $("#workflowScratchTasks").value = "Intake and confirm scope\nDelivery review - Check feasibility, risks, and handoff readiness\nCustomer follow-up - Confirm customer-owned dependencies\nFinal review - Confirm everything is complete";
  renderScratchWorkflowPreview();
  setTicketDefaults();
  $("#workflowDialog").showModal();
}

function renderScratchWorkflowPreview() {
  if (!state.scratchWorkflowMode) return;
  const tasks = scratchWorkflowTasks();
  const dependencies = defaultWorkflowDependencies(tasks);
  $("#workflowPreview").innerHTML = tasks.map((task) => workflowTaskPreview(task, tasks, dependencies)).join("");
  $("#workflowDependencies").innerHTML = workflowDependencyEditor(tasks, dependencies);
}

function workflowTasksForTemplate(templateId) {
  return state.templateTasks
    .filter((task) => task.template_id === templateId)
    .sort((a, b) => a.position - b.position);
}

function scratchWorkflowTasks() {
  return $("#workflowScratchTasks").value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, ...descriptionParts] = line.split(" - ");
      return {
        id: `scratch-${index + 1}`,
        title: title.trim(),
        description: descriptionParts.join(" - ").trim() || null,
        default_ticket_type: "task",
        default_priority: "medium",
        default_blocked_reason: null,
        position: index + 1,
        suggested_due_offset_days: index * 2,
        is_scratch: true,
      };
    });
}

function defaultWorkflowDependencies(tasks) {
  const byPosition = Object.fromEntries(tasks.map((task) => [task.position, task.id]));
  const finalPosition = Math.max(...tasks.map((task) => task.position), 0);
  return Object.fromEntries(tasks.map((task) => {
    if (task.position === 1) return [task.id, []];
    if (task.position === finalPosition && finalPosition > 2) {
      return [task.id, tasks.filter((candidate) => candidate.position > 1 && candidate.position < finalPosition).map((candidate) => candidate.id)];
    }
    return [task.id, byPosition[1] ? [byPosition[1]] : []];
  }));
}

function workflowTaskPreview(task, tasks, dependencies) {
  const dependsOn = dependencyLabels(task.id, tasks, dependencies);
  return `
    <div class="workflow-task-preview">
      <strong>${task.position}. ${escapeHtml(task.title)}</strong>
      <span class="muted">${escapeHtml(task.description || "")}</span>
      <span class="workflow-dependency-note">${escapeHtml(dependsOn.length ? `Depends on: ${dependsOn.join(", ")}` : "Starts immediately")}</span>
    </div>
  `;
}

function workflowDependencyEditor(tasks, dependencies) {
  return `
    <section class="workflow-dependency-panel">
      <div>
        <h3>Dependency settings</h3>
        <p class="muted">Default: intake first, review tasks in parallel after intake, final review after every review task is done.</p>
      </div>
      <div class="workflow-dependency-grid">
        ${tasks.map((task) => workflowDependencyRow(task, tasks, dependencies)).join("")}
      </div>
    </section>
  `;
}

function workflowDependencyRow(task, tasks, dependencies) {
  const options = tasks.filter((candidate) => candidate.position < task.position);
  return `
    <article class="workflow-dependency-row">
      <strong>${task.position}. ${escapeHtml(task.title)}</strong>
      <div class="dependency-checkboxes">
        ${options.length ? options.map((candidate) => `
          <label>
            <input type="checkbox" name="workflowDependency" data-task-id="${escapeHtml(task.id)}" value="${escapeHtml(candidate.id)}" ${dependencies[task.id]?.includes(candidate.id) ? "checked" : ""} />
            ${escapeHtml(candidate.position)}. ${escapeHtml(candidate.title)}
          </label>
        `).join("") : `<span class="muted">Starts immediately</span>`}
      </div>
    </article>
  `;
}

function workflowDependencySelection(tasks) {
  const selected = $$('input[name="workflowDependency"]:checked');
  return Object.fromEntries(tasks.map((task) => [
    task.id,
    selected.filter((input) => input.dataset.taskId === task.id).map((input) => input.value),
  ]));
}

function dependencyLabels(taskId, tasks, dependencies) {
  return (dependencies[taskId] || [])
    .map((dependencyId) => tasks.find((task) => task.id === dependencyId))
    .filter(Boolean)
    .map((task) => `${task.position}. ${task.title}`);
}

async function startWorkflow(event) {
  event.preventDefault();
  const template = state.scratchWorkflowMode ? null : findById(state.templates, state.selectedWorkflowTemplateId);
  const tasks = state.scratchWorkflowMode ? scratchWorkflowTasks() : workflowTasksForTemplate(template?.id);
  if (!tasks.length) return;
  const dependencies = workflowDependencySelection(tasks);
  const newStage = state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "New") || state.stages.find((stage) => stage.stage_type === "ticket");
  const waitingStage = state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "Waiting") || newStage;
  const customer = findById(state.customers, $("#workflowCustomer").value);
  const owner = findById(state.people, $("#workflowOwner").value);
  const deliveryLead = findById(state.people, $("#workflowDeliveryLead").value);
  const salesLead = findById(state.people, $("#workflowSalesLead").value);
  const baseDate = $("#workflowDueDate").value ? new Date(`${$("#workflowDueDate").value}T00:00:00`) : new Date();

  try {
    setSync("Creating workflow");
    const dependencySummary = workflowDependencySummary(tasks, dependencies);
    const [run] = await api("/workflow_runs", {
      method: "POST",
      body: {
        template_id: template?.id || null,
        name: workflowRunName(template, customer),
        customer_name: customer?.name || null,
        opportunity_reference: workflowOpportunityWithDependencies($("#workflowOpportunity").value.trim(), dependencySummary),
        started_by: state.user.id,
      },
    });

    for (const task of tasks) {
      const taskRules = ticketTypeRules[task.default_ticket_type] || ticketTypeRules.task;
      const taskDependencies = dependencyLabels(task.id, tasks, dependencies);
      const hasDependencies = taskDependencies.length > 0;
      const dueDate = new Date(baseDate);
      dueDate.setDate(baseDate.getDate() + (task.suggested_due_offset_days || 0));
      const [ticket] = await api("/tickets", {
        method: "POST",
        body: {
          title: `${customer?.name || "Customer"}: ${task.title}`,
          description: workflowTaskDescription(task, taskDependencies),
          ticket_type: task.default_ticket_type,
          priority: task.default_priority,
          blocked_reason: hasDependencies ? "dependency_unresolved" : task.default_blocked_reason,
          blocked_since: hasDependencies || task.default_blocked_reason ? new Date().toISOString() : null,
          customer_id: taskRules.customer ? customer?.id || null : null,
          customer_name: taskRules.customer ? customer?.name || null : null,
          work_owner_id: owner?.id || null,
          work_owner_name: owner?.display_name || null,
          delivery_lead_id: taskRules.deliveryLead ? deliveryLead?.id || null : null,
          delivery_lead_name: taskRules.deliveryLead ? deliveryLead?.display_name || null : null,
          sales_lead_id: taskRules.salesLead ? salesLead?.id || null : null,
          sales_lead_name: taskRules.salesLead ? salesLead?.display_name || null : null,
          opportunity_lead_id: null,
          owner_name: owner?.display_name || null,
          requester_name: state.user.email,
          due_date: dueDate.toISOString().slice(0, 10),
          status_stage_id: hasDependencies ? waitingStage?.id || null : newStage?.id || null,
          requester_id: state.user.id,
        },
      });
      await api("/workflow_run_tickets", {
        method: "POST",
        body: {
          workflow_run_id: run.id,
          ticket_id: ticket.id,
          template_task_id: task.is_scratch ? null : task.id,
        },
      });
    }

    $("#workflowForm").reset();
    syncObjectSelects();
    $("#workflowDialog").close();
    state.selectedWorkflowTemplateId = null;
    state.scratchWorkflowMode = false;
    await loadData();
    switchView("tickets");
  } catch (error) {
    setSync(error.message);
  }
}

function workflowRunName(template, customer) {
  if (state.scratchWorkflowMode) {
    return $("#workflowName").value.trim() || `${customer?.name || "Customer"} Custom Workflow`;
  }
  return `${customer?.name || "Customer"} ${template?.name || "Workflow"}`;
}

function workflowTaskDescription(task, dependencyLabelsForTask) {
  const dependencyText = dependencyLabelsForTask.length
    ? `\n\nDependencies:\n${dependencyLabelsForTask.map((label) => `- ${label}`).join("\n")}\n\nDo not complete this task until the dependencies are done.`
    : "\n\nDependencies: none. This task can start immediately.";
  return `${task.description || ""}${dependencyText}`;
}

function workflowDependencySummary(tasks, dependencies) {
  return tasks
    .map((task) => {
      const labels = dependencyLabels(task.id, tasks, dependencies);
      return `${task.position}. ${task.title}: ${labels.length ? labels.join(", ") : "starts immediately"}`;
    })
    .join(" | ");
}

function workflowOpportunityWithDependencies(opportunity, dependencySummary) {
  const dependencyNote = `Dependencies: ${dependencySummary}`;
  return opportunity ? `${opportunity} | ${dependencyNote}` : dependencyNote;
}

function renderCustomers() {
  const selected = state.selectedCustomerId ? findById(state.customers, state.selectedCustomerId) : null;
  if (selected) {
    renderCustomerDetail(selected);
    return;
  }

  $("#customersView").innerHTML = `
    <div class="toolbar">
      <div></div>
      <button class="primary-button" type="button" id="addCustomerButton"><i data-lucide="plus"></i><span>Customer</span></button>
    </div>
    <div class="customer-tile-grid">
      ${state.customers.map(customerTile).join("") || `<div class="empty-state">No customers yet.</div>`}
    </div>
  `;

  $("#addCustomerButton").addEventListener("click", () => $("#customerDialog").showModal());
  $$(".customer-detail-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCustomerId = button.dataset.customerId;
      renderCustomers();
      refreshIcons();
    });
  });
  $$(".customer-edit-button").forEach((button) => {
    button.addEventListener("click", () => openCustomerEdit(button.dataset.customerId));
  });
}

function customerTile(customer) {
  const tickets = state.tickets.filter((ticket) => ticket.customer_id === customer.id || ticket.customer_name === customer.name);
  const actions = state.customerActions.filter((action) => action.customer_id === customer.id || action.customer_name === customer.name);
  const openActions = actions.filter((action) => !["done", "cancelled"].includes(action.status));
  return `
    <article class="customer-tile">
      <div>
        <h3>${escapeHtml(customer.name)}</h3>
        <p>${escapeHtml(customer.primary_contact || customer.segment || "No primary contact yet")}</p>
        <span class="muted">Sales: ${escapeHtml(customer.sales_lead_name || "Not set")}</span>
      </div>
      <div class="tag-row">
        <span class="pill primary">${escapeHtml(customer.segment || "No segment")}</span>
        <span class="pill ${customer.status === "active" ? "success" : ""}">${labelFor(customerStatuses, customer.status || "active")}</span>
      </div>
      <div class="customer-stats">
        <span><strong>${tickets.length}</strong> tickets</span>
        <span><strong>${openActions.length}</strong> open actions</span>
      </div>
      <div class="tile-actions">
        <button class="secondary-button customer-detail-button" type="button" data-customer-id="${customer.id}">Details</button>
        <button class="secondary-button customer-edit-button" type="button" data-customer-id="${customer.id}">Edit</button>
      </div>
    </article>
  `;
}

function renderCustomerDetail(customer) {
  const tickets = state.tickets.filter((ticket) => ticket.customer_id === customer.id || ticket.customer_name === customer.name);
  const actions = state.customerActions.filter((action) => action.customer_id === customer.id || action.customer_name === customer.name);
  $("#customersView").innerHTML = `
    <div class="detail-header">
      <button class="secondary-button" type="button" id="backToCustomers"><i data-lucide="arrow-left"></i><span>Customers</span></button>
      <div class="auth-actions">
        <button class="secondary-button" type="button" id="editCustomerButton"><i data-lucide="settings"></i><span>Edit</span></button>
        <button class="primary-button" type="button" id="addCustomerButton"><i data-lucide="plus"></i><span>Customer</span></button>
      </div>
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>${escapeHtml(customer.name)}</h2>
        <div class="customer-info-grid">
          ${infoTile("Segment", customer.segment || "Not set", "building-2")}
          ${infoTile("Status", labelFor(customerStatuses, customer.status || "active"), "activity")}
          ${infoTile("Primary Contact", customer.primary_contact || "Not set", "user")}
          ${infoTile("Email", customer.contact_email || "Not set", "mail")}
          ${infoTile("Sales Lead", customer.sales_lead_name || "Not set", "briefcase-business")}
          ${infoTile("Notes", customer.notes || "No notes yet", "notebook-text", true)}
        </div>
      </section>
      <section class="panel">
        <h2>Operational Snapshot</h2>
        <div class="metric-grid compact">
          ${metric("Tickets", tickets.length)}
          ${metric("Actions", actions.length)}
          ${metric("Overdue", tickets.filter(isOverdue).length + actions.filter(isOverdue).length, "danger")}
          ${metric("Blocked", tickets.filter((ticket) => ticket.blocked_reason).length, "warning")}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top: 16px;">
      <h2>Related Tickets</h2>
      ${ticketTable(tickets.slice(0, 10))}
    </section>
    <section class="panel" style="margin-top: 16px;">
      <h2>Customer Actions</h2>
      <div class="actions-list">
        ${actions.map(actionItem).join("") || `<div class="empty-state">No actions for this customer.</div>`}
      </div>
    </section>
  `;

  $("#backToCustomers").addEventListener("click", () => {
    state.selectedCustomerId = null;
    renderCustomers();
    refreshIcons();
  });
  $("#addCustomerButton").addEventListener("click", () => $("#customerDialog").showModal());
  $("#editCustomerButton").addEventListener("click", () => openCustomerEdit(customer.id));
  bindTicketDetailButtons();
}

function infoTile(label, value, icon, wide = false) {
  return `
    <article class="info-tile ${wide ? "wide" : ""}">
      <span class="info-icon"><i data-lucide="${icon}"></i></span>
      <div>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    </article>
  `;
}

async function createCustomer(event) {
  event.preventDefault();
  const salesLead = findById(state.people, $("#customerSalesLead").value);
  try {
    setSync("Creating customer");
    const [customer] = await api("/customers", {
      method: "POST",
      body: {
        name: $("#customerName").value.trim(),
        segment: $("#customerSegment").value.trim() || null,
        primary_contact: $("#customerPrimaryContact").value.trim() || null,
        contact_email: $("#customerContactEmail").value.trim() || null,
        status: $("#customerStatus").value,
        sales_lead_id: salesLead?.id || null,
        sales_lead_name: salesLead?.display_name || null,
        notes: $("#customerNotes").value.trim() || null,
      },
    });
    state.selectedCustomerId = customer?.id || null;
    $("#customerForm").reset();
    $("#customerStatus").value = "active";
    $("#customerDialog").close();
    await loadData();
    switchView("customers");
  } catch (error) {
    setSync(error.message);
  }
}

function openCustomerEdit(customerId) {
  const customer = findById(state.customers, customerId);
  if (!customer) return;
  state.selectedCustomerId = customerId;
  $("#customerEditName").value = customer.name || "";
  $("#customerEditSegment").value = customer.segment || "";
  $("#customerEditPrimaryContact").value = customer.primary_contact || "";
  $("#customerEditContactEmail").value = customer.contact_email || "";
  $("#customerEditStatus").value = customer.status || "active";
  $("#customerEditSalesLead").value = customer.sales_lead_id || "";
  $("#customerEditNotes").value = customer.notes || "";
  $("#customerEditDialog").showModal();
}

async function updateCustomer(event) {
  event.preventDefault();
  const customerId = state.selectedCustomerId;
  const salesLead = findById(state.people, $("#customerEditSalesLead").value);
  if (!customerId) return;
  try {
    setSync("Saving customer");
    await api(`/customers?id=eq.${customerId}`, {
      method: "PATCH",
      body: {
        name: $("#customerEditName").value.trim(),
        segment: $("#customerEditSegment").value.trim() || null,
        primary_contact: $("#customerEditPrimaryContact").value.trim() || null,
        contact_email: $("#customerEditContactEmail").value.trim() || null,
        status: $("#customerEditStatus").value,
        sales_lead_id: salesLead?.id || null,
        sales_lead_name: salesLead?.display_name || null,
        notes: $("#customerEditNotes").value.trim() || null,
      },
    });
    $("#customerEditDialog").close();
    await loadData();
    switchView("customers");
  } catch (error) {
    setSync(error.message);
  }
}

async function savePerson(event) {
  event.preventDefault();
  const manager = findById(state.people, $("#personManager").value);
  const name = $("#personName").value.trim();
  const role = $("#personRole").value.trim();
  const email = $("#personEmail").value.trim();
  if (!name || !role) return;

  try {
    const body = {
      display_name: name,
      role_label: role,
      manager_id: manager?.id || null,
      manager_name: manager?.display_name || null,
      email: email || null,
      color: $("#personColor").value || "#0067b1",
    };
    setSync(state.selectedPersonId ? "Saving user" : "Creating user");
    if (state.selectedPersonId) {
      await api(`/app_people?id=eq.${state.selectedPersonId}`, { method: "PATCH", body });
    } else {
      await api("/app_people", { method: "POST", body: { ...body, is_current_user: false } });
    }
    $("#personForm").reset();
    $("#personColor").value = "#0067b1";
    $("#personDialog").close();
    state.selectedPersonId = null;
    await loadData();
    switchView("admin");
  } catch (error) {
    setSync(error.message);
  }
}

function renderCustomerActions() {
  $("#actionsView").innerHTML = `
    <div class="toolbar">
      <div></div>
      <button class="primary-button" type="button" id="addActionButton"><i data-lucide="plus"></i><span>Action</span></button>
    </div>
    <div class="actions-list">
      ${state.customerActions.map(actionItem).join("") || `<div class="empty-state">No customer actions yet.</div>`}
    </div>
  `;
  $("#addActionButton").addEventListener("click", openActionDialog);
}

function openActionDialog() {
  $("#actionForm").reset();
  $("#actionStatus").value = "open";
  $("#actionDueDate").value = isoDateFromToday(3);
  applyActionCustomerDefaults();
  $("#actionDialog").showModal();
}

function applyActionCustomerDefaults() {
  const customer = findById(state.customers, $("#actionCustomer").value);
  $("#actionCustomerOwner").value = customer?.sales_lead_name || "";
}

function actionItem(action) {
  return `
    <article class="action-item">
      <h3>${escapeHtml(action.action)}</h3>
      <p>${escapeHtml(action.customer_name)}${action.customer_owner ? ` · ${escapeHtml(action.customer_owner)}` : ""}</p>
      <div class="tag-row">
        <span class="pill primary">${labelFor(actionStatuses, action.status)}</span>
        <span class="pill ${isOverdue(action) ? "danger" : ""}">${formatDate(action.due_date)}</span>
      </div>
    </article>
  `;
}

async function createCustomerAction(event) {
  event.preventDefault();
  const customer = findById(state.customers, $("#actionCustomer").value);
  try {
    setSync("Creating action");
    await api("/customer_actions", {
      method: "POST",
      body: {
        customer_id: customer?.id || null,
        customer_name: customer?.name || null,
        customer_owner: $("#actionCustomerOwner").value.trim() || null,
        action: $("#actionText").value.trim(),
        due_date: $("#actionDueDate").value || null,
        status: $("#actionStatus").value,
      },
    });
    $("#actionForm").reset();
    $("#actionStatus").value = "open";
    $("#actionDueDate").value = isoDateFromToday(3);
    applyActionCustomerDefaults();
    $("#actionDialog").close();
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function renderCalendar() {
  const days = [...Array(28)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
  const roles = [...new Set(state.people.map((person) => person.role_label))].sort();
  const filteredPeople = state.people.filter((person) => {
    const roleMatch = state.calendarRoleFilter === "all" || person.role_label === state.calendarRoleFilter;
    const nameMatch = !state.calendarNameFilter || person.display_name.toLowerCase().includes(state.calendarNameFilter.toLowerCase());
    return roleMatch && nameMatch;
  });
  $("#calendarView").innerHTML = `
    <div class="capacity-layout">
      <section class="panel">
        <h2>Team Capacity Calendar</h2>
        <div class="capacity-calendar">
          ${days.map((date) => calendarCapacityDay(date)).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>Team</h2>
        <div class="calendar-filters">
          <select id="calendarRoleFilter">
            <option value="all">All roles</option>
            ${roles.map((role) => `<option value="${escapeHtml(role)}" ${state.calendarRoleFilter === role ? "selected" : ""}>${escapeHtml(role)}</option>`).join("")}
          </select>
          <input id="calendarNameFilter" placeholder="Search people" value="${escapeHtml(state.calendarNameFilter)}" />
        </div>
        <div class="team-list">
          ${filteredPeople.map(teamPersonCard).join("") || `<div class="empty-state">No people match this filter.</div>`}
        </div>
      </section>
    </div>
  `;
  $("#calendarRoleFilter").addEventListener("change", (event) => {
    state.calendarRoleFilter = event.target.value;
    renderCalendar();
  });
  $("#calendarNameFilter").addEventListener("input", (event) => {
    state.calendarNameFilter = event.target.value;
    renderCalendar();
  });
  bindCapacityCalendar();
}

function calendarCapacityDay(date) {
  const iso = date.toISOString().slice(0, 10);
  const isWeekend = [0, 6].includes(date.getDay());
  const tickets = state.tickets.filter((ticket) => ticket.due_date === iso);
  const reservations = state.calendarReservations.filter((item) => item.date === iso);
  return `
    <div class="capacity-day ${isWeekend ? "weekend" : ""}" data-date="${iso}">
      <strong>${date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</strong>
      ${isWeekend ? `<span class="muted">Weekend</span>` : ""}
      <div class="capacity-items">
        ${tickets.map(calendarTicketChip).join("")}
        ${reservations.map(calendarReservationChip).join("")}
      </div>
    </div>
  `;
}

function teamPersonCard(person) {
  return `
    <article class="team-person-card" draggable="true" data-person-id="${person.id}" style="--person-color: ${escapeHtml(person.color || "#0067b1")}">
      <span class="avatar-dot">${escapeHtml(initials(person.display_name))}</span>
      <div>
        <strong>${escapeHtml(person.display_name)}</strong>
        <span>${escapeHtml(person.role_label)} · Available</span>
      </div>
    </article>
  `;
}

function calendarTicketChip(ticket) {
  const ownerName = ticket.work_owner_name || ticket.owner_name || "Unassigned";
  return `
    <button class="capacity-chip ticket-detail-button" type="button" data-ticket-id="${ticket.id}" style="--person-color: ${escapeHtml(colorForPersonName(ownerName))}">
      ${escapeHtml(ticket.title)}
    </button>
  `;
}

function calendarReservationChip(reservation) {
  const context = reservation.ticketTitle || reservation.customerName || reservation.targetName || "Reserved";
  const duration = reservation.days > 1 ? `${reservation.dayNumber || 1}/${reservation.days}` : `${reservation.days || 1}d`;
  const bookingKey = reservation.bookingId || reservation.id;
  return `
    <span class="capacity-chip reservation-chip" style="--person-color: ${escapeHtml(reservation.color || "#0067b1")}">
      <strong>${escapeHtml(reservation.personName)}</strong>
      <small>${escapeHtml(duration)} · ${escapeHtml(context)}</small>
      <button class="reservation-delete-button" type="button" data-booking-id="${escapeHtml(bookingKey)}" title="Delete booking" aria-label="Delete booking">x</button>
    </span>
  `;
}

function bindCapacityCalendar() {
  $$(".team-person-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", `person:${card.dataset.personId}`);
    });
  });

  $$(".capacity-day").forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("drop-target");
    });
    cell.addEventListener("dragleave", () => cell.classList.remove("drop-target"));
    cell.addEventListener("drop", async (event) => {
      event.preventDefault();
      cell.classList.remove("drop-target");
      const payload = event.dataTransfer.getData("text/plain");
      if (!payload.startsWith("person:")) return;
      openCalendarReservationDialog(payload.replace("person:", ""), cell.dataset.date);
    });
  });

  bindTicketDetailButtons();
  bindCalendarReservationDeletes();
}

function bindCalendarReservationDeletes() {
  $$(".reservation-delete-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteCalendarReservation(button.dataset.bookingId);
    });
  });
}

function deleteCalendarReservation(bookingId) {
  if (!bookingId) return;
  state.calendarReservations = state.calendarReservations.filter((reservation) => {
    const reservationKey = reservation.bookingId || reservation.id;
    return reservationKey !== bookingId && reservation.id !== bookingId;
  });
  localStorage.setItem("trnawl.calendarReservations", JSON.stringify(state.calendarReservations));
  renderCalendar();
}

function openCalendarReservationDialog(personId, date) {
  const person = findById(state.people, personId);
  if (!person) return;
  const startDate = nextBusinessDate(date);
  state.pendingCalendarReservation = {
    personId,
    date: startDate,
    ticketId: "",
    customerId: "",
  };
  $("#calendarBookingPersonName").textContent = person.display_name;
  $("#calendarBookingPersonMeta").textContent = `${person.role_label} · starts ${formatDate(startDate)}`;
  $("#calendarBookingAvatar").textContent = initials(person.display_name);
  $(".booking-person").style.setProperty("--person-color", person.color || "#0067b1");
  $("#calendarBookingAvatar").style.setProperty("--person-color", person.color || "#0067b1");
  $("#calendarBookingStart").value = startDate;
  $("#calendarBookingDays").value = "1";
  $("#calendarBookingTaskSearch").value = "";
  $("#calendarBookingCustomerSearch").value = "";
  $("#calendarBookingNote").value = "";
  state.activeBookingDropdown = null;
  renderCalendarBookingOptions();
  $("#calendarReservationDialog").showModal();
}

function showCalendarBookingDropdown(type) {
  state.activeBookingDropdown = type;
  renderCalendarBookingOptions();
}

function hideCalendarBookingDropdown() {
  state.activeBookingDropdown = null;
  renderCalendarBookingOptions();
}

function closeCalendarBookingDropdownOnOutsideClick(event) {
  if (!event.target.closest(".booking-search-section")) {
    hideCalendarBookingDropdown();
  }
}

function renderCalendarBookingOptions() {
  if (!state.pendingCalendarReservation) return;
  const taskQuery = $("#calendarBookingTaskSearch").value.trim().toLowerCase();
  const customerQuery = $("#calendarBookingCustomerSearch").value.trim().toLowerCase();
  const selectedTicket = findById(state.tickets, state.pendingCalendarReservation.ticketId);
  const selectedCustomer = findById(state.customers, state.pendingCalendarReservation.customerId);
  if (selectedTicket && taskQuery !== selectedTicket.title.toLowerCase()) {
    state.pendingCalendarReservation.ticketId = "";
  }
  if (selectedCustomer && customerQuery !== selectedCustomer.name.toLowerCase()) {
    state.pendingCalendarReservation.customerId = "";
  }
  const taskMatches = state.tickets
    .filter((ticket) => matchesBookingSearch(ticket, taskQuery, ["title", "customer_name", "work_owner_name", "owner_name"]))
    .sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date))
    .slice(0, 6);
  const customerMatches = state.customers
    .filter((customer) => matchesBookingSearch(customer, customerQuery, ["name", "segment", "primary_contact", "sales_lead_name"]))
    .slice(0, 6);
  $("#calendarBookingTaskResults").innerHTML = taskMatches.map(calendarBookingTaskOption).join("") || `<div class="empty-state compact-empty">No tasks found.</div>`;
  $("#calendarBookingCustomerResults").innerHTML = customerMatches.map(calendarBookingCustomerOption).join("") || `<div class="empty-state compact-empty">No customers found.</div>`;
  $("#calendarBookingTaskResults").classList.toggle("open", state.activeBookingDropdown === "task");
  $("#calendarBookingCustomerResults").classList.toggle("open", state.activeBookingDropdown === "customer");
  updateCalendarBookingSummary();
}

function matchesBookingSearch(item, query, fields) {
  if (!query) return true;
  return fields.some((field) => String(item[field] || "").toLowerCase().includes(query));
}

function calendarBookingTaskOption(ticket) {
  const pending = state.pendingCalendarReservation || {};
  const selected = pending.ticketId === ticket.id;
  return `
    <button class="booking-result ${selected ? "selected" : ""}" type="button" data-ticket-id="${escapeHtml(ticket.id)}">
      <strong>${escapeHtml(ticket.title)}</strong>
      <span>${escapeHtml(ticket.customer_name || "No customer")} · due ${escapeHtml(formatDate(ticket.due_date))}</span>
    </button>
  `;
}

function calendarBookingCustomerOption(customer) {
  const pending = state.pendingCalendarReservation || {};
  const selected = pending.customerId === customer.id;
  return `
    <button class="booking-result ${selected ? "selected" : ""}" type="button" data-customer-id="${escapeHtml(customer.id)}">
      <strong>${escapeHtml(customer.name)}</strong>
      <span>${escapeHtml(customer.segment || "No segment")} · Sales: ${escapeHtml(customer.sales_lead_name || "Not set")}</span>
    </button>
  `;
}

function selectCalendarBookingTask(event) {
  const button = event.target.closest("[data-ticket-id]");
  if (!button || !state.pendingCalendarReservation) return;
  const ticket = findById(state.tickets, button.dataset.ticketId);
  if (!ticket) return;
  state.pendingCalendarReservation.ticketId = ticket.id;
  $("#calendarBookingTaskSearch").value = ticket.title;
  const customer = ticket.customer_id
    ? findById(state.customers, ticket.customer_id)
    : state.customers.find((item) => item.name === ticket.customer_name);
  if (customer) {
    state.pendingCalendarReservation.customerId = customer.id;
    $("#calendarBookingCustomerSearch").value = customer.name;
  }
  hideCalendarBookingDropdown();
}

function selectCalendarBookingCustomer(event) {
  const button = event.target.closest("[data-customer-id]");
  if (!button || !state.pendingCalendarReservation) return;
  const customer = findById(state.customers, button.dataset.customerId);
  if (!customer) return;
  state.pendingCalendarReservation.customerId = customer.id;
  $("#calendarBookingCustomerSearch").value = customer.name;
  hideCalendarBookingDropdown();
}

function updateCalendarBookingSummary() {
  const pending = state.pendingCalendarReservation;
  if (!pending) return;
  const person = findById(state.people, pending.personId);
  const ticket = findById(state.tickets, pending.ticketId);
  const customer = findById(state.customers, pending.customerId);
  const days = normalizedBookingDays();
  const dates = businessDatesFrom(pending.date, days);
  const typedTask = $("#calendarBookingTaskSearch").value.trim();
  const context = ticket?.title || (typedTask ? `New task: ${typedTask}` : customer?.name || "Type a task title or pick a task/customer");
  $("#calendarBookingSummary").innerHTML = `
    <strong>${escapeHtml(person?.display_name || "Team member")}</strong>
    <span>${escapeHtml(days)} business day${days === 1 ? "" : "s"} · ${escapeHtml(formatDate(dates[0]))}${dates.length > 1 ? ` to ${escapeHtml(formatDate(dates[dates.length - 1]))}` : ""}</span>
    <span>${escapeHtml(context)}</span>
  `;
}

async function saveCalendarReservation(event) {
  event.preventDefault();
  const pending = state.pendingCalendarReservation;
  if (!pending) return;
  const taskTitle = $("#calendarBookingTaskSearch").value.trim();
  const note = $("#calendarBookingNote").value.trim();
  resolveCalendarBookingSelection(taskTitle, $("#calendarBookingCustomerSearch").value.trim());
  if (!pending.ticketId && !taskTitle && !pending.customerId) {
    $("#calendarBookingSummary").innerHTML = `<strong>Type a task title or pick a task/customer before booking time.</strong>`;
    return;
  }
  try {
    setSync("Booking time");
    let ticketId = pending.ticketId;
    if (!ticketId) {
      const ticket = await createCalendarBookingTask(pending, taskTitle, note);
      ticketId = ticket.id;
      state.tickets = [ticket, ...state.tickets];
    } else if (note) {
      await saveCommentForTicket(ticketId, note);
    }
    addCalendarReservation(pending.personId, pending.date, {
      days: normalizedBookingDays(),
      ticketId,
      customerId: pending.customerId,
    });
    state.pendingCalendarReservation = null;
    $("#calendarReservationDialog").close();
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function resolveCalendarBookingSelection(taskTitle, customerName) {
  const pending = state.pendingCalendarReservation;
  if (!pending) return;
  if (!pending.ticketId && taskTitle) {
    const exactTicket = state.tickets.find((ticket) => ticket.title?.toLowerCase() === taskTitle.toLowerCase());
    if (exactTicket) {
      pending.ticketId = exactTicket.id;
    }
  }
  if (!pending.customerId && customerName) {
    const exactCustomer = state.customers.find((customer) => customer.name?.toLowerCase() === customerName.toLowerCase());
    if (exactCustomer) {
      pending.customerId = exactCustomer.id;
    }
  }
  const ticket = findById(state.tickets, pending.ticketId);
  if (ticket && !pending.customerId) {
    const customer = ticket.customer_id
      ? findById(state.customers, ticket.customer_id)
      : state.customers.find((item) => item.name === ticket.customer_name);
    if (customer) {
      pending.customerId = customer.id;
    }
  }
}

async function createCalendarBookingTask(pending, taskTitle, note) {
  const person = findById(state.people, pending.personId);
  const customer = findById(state.customers, pending.customerId);
  const newStage = state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "New") || state.stages.find((stage) => stage.stage_type === "ticket");
  const bookedDates = businessDatesFrom(pending.date, normalizedBookingDays());
  const dueDate = bookedDates[bookedDates.length - 1] || pending.date;
  const title = taskTitle || `${customer?.name || "Calendar"} work`;
  const [ticket] = await api("/tickets", {
    method: "POST",
    body: {
      title,
      description: note || `Calendar booking for ${person?.display_name || "team member"}.`,
      ticket_type: customer ? "customer_action" : "task",
      priority: "medium",
      work_owner_id: person?.id || null,
      work_owner_name: person?.display_name || null,
      owner_name: person?.display_name || null,
      customer_id: customer?.id || null,
      customer_name: customer?.name || null,
      due_date: dueDate,
      status_stage_id: newStage?.id || null,
      requester_id: state.user.id,
      requester_name: state.user.email,
      blocked_reason: null,
      readiness_checks: {},
      readiness_score: 0,
    },
  });
  if (note) {
    await saveCommentForTicket(ticket.id, note);
  }
  return ticket;
}

function normalizedBookingDays() {
  return Math.max(1, Math.min(30, Number($("#calendarBookingDays").value) || 1));
}

function addCalendarReservation(personId, date, details = {}) {
  const person = findById(state.people, personId);
  if (!person) return;
  const ticket = findById(state.tickets, details.ticketId);
  const customer = findById(state.customers, details.customerId) || (ticket?.customer_id ? findById(state.customers, ticket.customer_id) : null);
  const dates = businessDatesFrom(date, details.days || 1);
  const bookingId = `${personId}-${date}-${Date.now()}`;
  const reservations = dates.map((iso, index) => ({
    id: `${bookingId}-${index}`,
    bookingId,
    personId,
    personName: person.display_name,
    role: person.role_label,
    color: person.color,
    date: iso,
    startDate: date,
    days: dates.length,
    dayNumber: index + 1,
    ticketId: ticket?.id || null,
    ticketTitle: ticket?.title || null,
    customerId: customer?.id || null,
    customerName: customer?.name || ticket?.customer_name || null,
  }));
  state.calendarReservations = [...state.calendarReservations, ...reservations];
  localStorage.setItem("trnawl.calendarReservations", JSON.stringify(state.calendarReservations));
  renderCalendar();
}

function nextBusinessDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  while ([0, 6].includes(date.getDay())) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

function businessDatesFrom(dateString, days) {
  const dates = [];
  const date = new Date(`${dateString}T00:00:00`);
  while (dates.length < days) {
    if (![0, 6].includes(date.getDay())) {
      dates.push(date.toISOString().slice(0, 10));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function renderReports() {
  const ownerOptions = [
    ["me", "My work"],
    ["all", "All owners"],
    ...state.people.map((person) => [person.id, person.display_name]),
  ];
  const dataPoints = reportDataPointOptions();

  $("#reportsView").innerHTML = `
    <div class="report-builder-grid">
      <section class="panel report-controls">
        <div class="panel-heading">
          <div>
            <h2>Build Report</h2>
            <p class="muted">Choose the message and the data points to include.</p>
          </div>
        </div>
        <div class="form-grid compact-form-grid">
          <label>Report focus
            <select id="reportFocus">
              <option value="delivery" ${state.reportFocus === "delivery" ? "selected" : ""}>Delivery status</option>
              <option value="blockers" ${state.reportFocus === "blockers" ? "selected" : ""}>Blocker escalation</option>
              <option value="customer" ${state.reportFocus === "customer" ? "selected" : ""}>Customer follow-up</option>
              <option value="owner" ${state.reportFocus === "owner" ? "selected" : ""}>My work summary</option>
              <option value="readiness" ${state.reportFocus === "readiness" ? "selected" : ""}>Readiness review</option>
            </select>
          </label>
          <label>Scope
            <select id="reportOwnerFilter">
              ${ownerOptions.map(([value, label]) => `<option value="${value}" ${state.reportOwnerFilter === value ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
        </div>
        <fieldset class="readiness-fieldset report-data-fieldset">
          <legend>Data points</legend>
          <div class="report-data-options">
            ${dataPoints.map((point) => `
              <label>
                <input type="checkbox" name="reportDataPoint" value="${point.id}" ${state.reportDataPoints.includes(point.id) ? "checked" : ""} />
                <span><strong>${escapeHtml(point.label)}</strong><small>${escapeHtml(point.description)}</small></span>
              </label>
            `).join("")}
          </div>
        </fieldset>
      </section>
      <section class="panel report-output-panel">
        <div class="panel-heading">
          <div>
            <h2>${escapeHtml(reportTitle())}</h2>
            <p class="muted">${escapeHtml(reportSubtitle())}</p>
          </div>
          <button class="secondary-button" type="button" id="copyReportButton"><i data-lucide="copy"></i><span>Copy</span></button>
        </div>
        <div id="reportOutput" class="report-output">
          ${reportOutputHtml()}
        </div>
      </section>
    </div>
  `;
  $("#reportFocus").addEventListener("change", (event) => {
    state.reportFocus = event.target.value;
    renderReports();
  });
  $("#reportOwnerFilter").addEventListener("change", (event) => {
    state.reportOwnerFilter = event.target.value;
    renderReports();
  });
  $$('input[name="reportDataPoint"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.reportDataPoints = $$('input[name="reportDataPoint"]:checked').map((checkbox) => checkbox.value);
      renderReports();
    });
  });
  $("#copyReportButton").addEventListener("click", copyReportText);
  bindTicketDetailButtons();
}

function reportDataPointOptions() {
  return [
    { id: "summary", label: "Executive summary", description: "A short status statement for the selected scope." },
    { id: "blocked", label: "Active blockers", description: "Blocked tickets, blocker reason, owner, customer, and age." },
    { id: "overdue", label: "Overdue work", description: "Tickets and customer actions past due." },
    { id: "dueSoon", label: "Due next 7 days", description: "Upcoming ticket deadlines that need attention." },
    { id: "readiness", label: "Readiness score", description: "Average readiness and low-readiness tickets." },
    { id: "customerActions", label: "Customer actions", description: "Open customer-owned follow-ups and stale actions." },
    { id: "ownerLoad", label: "Owner workload", description: "Active work distribution by owner." },
  ];
}

function reportTickets() {
  const currentPerson = getCurrentPerson();
  return state.tickets.filter((ticket) => {
    if (isDoneTicket(ticket)) return false;
    if (state.reportOwnerFilter === "all") return true;
    if (state.reportOwnerFilter === "me") {
      return currentPerson && (ticket.work_owner_id === currentPerson.id || ticket.work_owner_name === currentPerson.display_name || ticket.owner_name === currentPerson.display_name);
    }
    return ticket.work_owner_id === state.reportOwnerFilter || ticket.work_owner_name === state.reportOwnerFilter;
  });
}

function reportActions() {
  const tickets = reportTickets();
  const ticketCustomers = new Set(tickets.map((ticket) => ticket.customer_name).filter(Boolean));
  if (state.reportOwnerFilter === "all") {
    return state.customerActions.filter((action) => !["done", "cancelled"].includes(action.status));
  }
  return state.customerActions.filter((action) => !["done", "cancelled"].includes(action.status) && ticketCustomers.has(action.customer_name));
}

function reportTitle() {
  return {
    delivery: "Delivery Status Report",
    blockers: "Blocker Escalation Report",
    customer: "Customer Follow-Up Report",
    owner: "My Work Report",
    readiness: "Readiness Review Report",
  }[state.reportFocus] || "Operational Report";
}

function reportSubtitle() {
  const scope = labelFor([["me", "my work"], ["all", "all owners"], ...state.people.map((person) => [person.id, person.display_name])], state.reportOwnerFilter);
  return `Generated from live TRNAWL data for ${scope}.`;
}

function reportOutputHtml() {
  const sections = reportSections();
  return sections.length ? sections.map((section) => `
    <article class="report-section">
      <h3>${escapeHtml(section.title)}</h3>
      ${section.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      ${section.items?.length ? `<div class="mini-list">${section.items.map((item) => `<button class="report-link ticket-detail-button" type="button" data-ticket-id="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div>` : ""}
    </article>
  `).join("") : `<div class="empty-state">Select at least one data point.</div>`;
}

function reportSections() {
  const tickets = reportTickets();
  const actions = reportActions();
  const blocked = tickets.filter((ticket) => ticket.blocked_reason);
  const overdueTickets = tickets.filter(isOverdue);
  const overdueActions = actions.filter(isOverdue);
  const dueSoon = tickets.filter((ticket) => daysUntil(ticket.due_date) >= 0 && daysUntil(ticket.due_date) <= 7);
  const avgReadiness = tickets.length ? Math.round(tickets.reduce((sum, ticket) => sum + (ticket.readiness_score || 0), 0) / tickets.length) : 0;
  const sections = [];

  if (state.reportDataPoints.includes("summary")) {
    sections.push({
      title: "What we want to say",
      lines: [reportNarrative(tickets, blocked, overdueTickets, overdueActions, avgReadiness)],
    });
  }
  if (state.reportDataPoints.includes("blocked")) {
    sections.push({
      title: `Active blockers (${blocked.length})`,
      lines: [blocked.length ? "These items need a decision, input, or owner action before progress can continue." : "No active blockers in the selected scope."],
      items: blocked.map((ticket) => ({ id: ticket.id, label: `${ticket.title} - ${labelFor(blockedReasons, ticket.blocked_reason)} - ${ticket.work_owner_name || "Unassigned"} - ${blockedAgeLabel(ticket)}` })),
    });
  }
  if (state.reportDataPoints.includes("overdue")) {
    sections.push({
      title: `Overdue work (${overdueTickets.length + overdueActions.length})`,
      lines: [
        `${overdueTickets.length} ticket(s) are past due.`,
        `${overdueActions.length} customer action(s) are past due.`,
      ],
      items: overdueTickets.map((ticket) => ({ id: ticket.id, label: `${ticket.title} - due ${formatDate(ticket.due_date)} - ${ticket.work_owner_name || "Unassigned"}` })),
    });
  }
  if (state.reportDataPoints.includes("dueSoon")) {
    sections.push({
      title: `Due next 7 days (${dueSoon.length})`,
      lines: [dueSoon.length ? "These deadlines are coming up and should be reviewed before they become overdue." : "No ticket deadlines in the next 7 days."],
      items: dueSoon.map((ticket) => ({ id: ticket.id, label: `${ticket.title} - due ${formatDate(ticket.due_date)} - ${ticket.work_owner_name || "Unassigned"}` })),
    });
  }
  if (state.reportDataPoints.includes("readiness")) {
    const lowReadiness = tickets.filter((ticket) => (ticket.readiness_score || 0) > 0 && (ticket.readiness_score || 0) < 70);
    sections.push({
      title: `Readiness (${avgReadiness}%)`,
      lines: [`Average readiness is ${avgReadiness}% across ${tickets.length} active ticket(s).`, `${lowReadiness.length} ticket(s) are below 70% readiness.`],
      items: lowReadiness.map((ticket) => ({ id: ticket.id, label: `${ticket.title} - ${ticket.readiness_score || 0}% ready` })),
    });
  }
  if (state.reportDataPoints.includes("customerActions")) {
    sections.push({
      title: `Customer actions (${actions.length})`,
      lines: [actions.length ? "Customer-owned follow-ups are still open and should be tracked until closed." : "No open customer actions in the selected scope."],
    });
  }
  if (state.reportDataPoints.includes("ownerLoad")) {
    sections.push({
      title: "Owner workload",
      lines: ownerLoadLines(tickets),
    });
  }
  return sections;
}

function reportNarrative(tickets, blocked, overdueTickets, overdueActions, avgReadiness) {
  if (state.reportFocus === "blockers") {
    return blocked.length ? `${blocked.length} active blocker(s) are stopping progress. The main ask is to clear dependencies and ownership decisions.` : "No active blockers need escalation right now.";
  }
  if (state.reportFocus === "customer") {
    return overdueActions.length ? `${overdueActions.length} customer action(s) are stale. The main ask is customer follow-up and impact confirmation.` : "Customer follow-ups are under control for the selected scope.";
  }
  if (state.reportFocus === "owner") {
    return `The selected owner scope has ${tickets.length} active ticket(s), ${blocked.length} blocker(s), and ${overdueTickets.length} overdue item(s).`;
  }
  if (state.reportFocus === "readiness") {
    return `Readiness is currently ${avgReadiness}%. The main ask is to close missing readiness checks before work reaches final review.`;
  }
  return `Delivery has ${tickets.length} active ticket(s), ${blocked.length} blocker(s), and ${overdueTickets.length} overdue ticket(s).`;
}

function ownerLoadLines(tickets) {
  const counts = tickets.reduce((acc, ticket) => {
    const owner = ticket.work_owner_name || ticket.owner_name || "Unassigned";
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {});
  const lines = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([owner, count]) => `${owner}: ${count} active ticket(s).`);
  return lines.length ? lines : ["No active owner workload in the selected scope."];
}

async function copyReportText() {
  const text = reportSections()
    .map((section) => [section.title, ...section.lines, ...(section.items || []).map((item) => `- ${item.label}`)].join("\n"))
    .join("\n\n");
  await navigator.clipboard?.writeText(text);
}

function mailRuleDefinitions() {
  return [
    {
      id: "assignedToOwner",
      title: "Task assigned",
      description: "Send an email to the assigned owner when a ticket is created or reassigned to them.",
    },
    {
      id: "dueApproachingOwner",
      title: "Due date approaching",
      description: "Send an email to the owner when an active ticket is due within the next 2 days.",
    },
    {
      id: "overdueEscalation",
      title: "Due date past",
      description: "Send an email to the owner, their manager, and the Sales Lead when an active ticket becomes overdue.",
    },
    {
      id: "completedSales",
      title: "Task completed",
      description: "Send an email to the Sales Lead when a ticket is completed.",
    },
  ];
}

function mailRuleEnabled(ruleId) {
  return state.mailSettings[ruleId] !== false;
}

function saveMailSettings() {
  localStorage.setItem("trnawl.mailSettings", JSON.stringify(state.mailSettings));
}

function saveSentMailKeys() {
  localStorage.setItem("trnawl.sentMailKeys", JSON.stringify(state.sentMailKeys));
}

function mailAlreadySent(key) {
  return Boolean(state.sentMailKeys[key]);
}

function markMailSent(key) {
  state.sentMailKeys[key] = new Date().toISOString();
  saveSentMailKeys();
}

async function handleTicketChangeMail(previousTicket, currentTicket) {
  if (!previousTicket || !currentTicket) return;
  const ownerChanged = previousTicket.work_owner_id !== currentTicket.work_owner_id || previousTicket.work_owner_name !== currentTicket.work_owner_name;
  if (ownerChanged) {
    await sendAssignmentMail(currentTicket, "reassigned");
  }

  if (!isDoneTicket(previousTicket) && isDoneTicket(currentTicket)) {
    await sendCompletedMail(currentTicket);
  }
}

async function runScheduledMailChecks() {
  const activeTickets = state.tickets.filter((ticket) => !isDoneTicket(ticket));
  for (const ticket of activeTickets) {
    const days = daysUntil(ticket.due_date);
    if (mailRuleEnabled("dueApproachingOwner") && days >= 0 && days <= 2) {
      await sendDueApproachingMail(ticket);
    }
    if (mailRuleEnabled("overdueEscalation") && days < 0) {
      await sendOverdueMail(ticket);
    }
  }
}

async function sendAssignmentMail(ticket, reason) {
  if (!mailRuleEnabled("assignedToOwner")) return;
  const owner = personForTicketOwner(ticket);
  const key = `assigned:${ticket.id}:${ticket.work_owner_id || ticket.work_owner_name || "none"}:${reason}`;
  const mail = mailContent("assignedToOwner", ticket);
  await sendTicketMail({
    key,
    people: [owner],
    subject: mail.subject,
    intro: mail.intro,
    ticket,
  });
}

async function sendDueApproachingMail(ticket) {
  const owner = personForTicketOwner(ticket);
  const key = `due-soon:${ticket.id}:${ticket.due_date}`;
  const mail = mailContent("dueApproachingOwner", ticket);
  await sendTicketMail({
    key,
    people: [owner],
    subject: mail.subject,
    intro: mail.intro,
    ticket,
  });
}

async function sendOverdueMail(ticket) {
  const owner = personForTicketOwner(ticket);
  const manager = owner ? personForIdOrName(owner.manager_id, owner.manager_name) : null;
  const salesLead = personForIdOrName(ticket.sales_lead_id, ticket.sales_lead_name);
  const today = new Date().toISOString().slice(0, 10);
  const key = `overdue:${ticket.id}:${today}`;
  const mail = mailContent("overdueEscalation", ticket);
  await sendTicketMail({
    key,
    people: [owner, manager, salesLead],
    subject: mail.subject,
    intro: mail.intro,
    ticket,
  });
}

async function sendCompletedMail(ticket) {
  if (!mailRuleEnabled("completedSales")) return;
  const salesLead = personForIdOrName(ticket.sales_lead_id, ticket.sales_lead_name);
  const key = `completed:${ticket.id}:${ticket.status_stage_id}`;
  const mail = mailContent("completedSales", ticket);
  await sendTicketMail({
    key,
    people: [salesLead],
    subject: mail.subject,
    intro: mail.intro,
    ticket,
  });
}

async function sendTicketMail({ key, people, subject, intro, ticket }) {
  if (mailAlreadySent(key)) return;
  const recipients = uniqueEmailPeople(people);
  if (!recipients.length) return;

  const html = ticketEmailHtml(intro, ticket);
  let sent = false;
  for (const person of recipients) {
    try {
      await sendEmail(person.email, subject, html);
      sent = true;
    } catch (error) {
      console.warn(error);
    }
  }
  if (sent) {
    markMailSent(key);
  }
}

async function sendEmail(to, subject, html) {
  if (!to) return;
  const response = await fetch(EMAIL_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!response.ok) {
    throw new Error(`Email failed: ${response.status}`);
  }
}

function ticketEmailHtml(intro, ticket) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="color:#003a70;">${escapeHtml(ticket.title)}</h2>
      <p>${escapeHtml(intro)}</p>
      <table style="border-collapse: collapse; margin-top: 12px;">
        ${emailRow("Owner", ticket.work_owner_name || ticket.owner_name || "Unassigned")}
        ${emailRow("Customer", ticket.customer_name || "None")}
        ${emailRow("Due date", formatDate(ticket.due_date))}
        ${emailRow("Blocked reason", labelFor(blockedReasons, ticket.blocked_reason) || "Not blocked")}
        ${emailRow("Status", findById(state.stages, ticket.status_stage_id)?.name || "No status")}
      </table>
      <p style="margin-top:16px;"><a href="https://trnawl.feckelabs.com" style="color:#0067b1;">Open TRNAWL</a></p>
    </div>
  `;
}

function emailRow(label, value) {
  return `
    <tr>
      <td style="font-weight:700; padding:4px 16px 4px 0;">${escapeHtml(label)}</td>
      <td style="padding:4px 0;">${escapeHtml(value || "")}</td>
    </tr>
  `;
}

function uniqueEmailPeople(people) {
  return [...new Map(
    people
      .filter(personCanReceiveEmail)
      .map((person) => [person.email.trim().toLowerCase(), person])
  ).values()];
}

function personForTicketOwner(ticket) {
  return personForIdOrName(ticket.work_owner_id, ticket.work_owner_name || ticket.owner_name);
}

function personForIdOrName(id, name) {
  return state.people.find((person) => person.id === id) || state.people.find((person) => person.display_name === name) || null;
}

function mailContent(templateId, ticket) {
  const template = mailTemplate(templateId);
  return {
    subject: renderMailTemplate(template.subject, ticket),
    intro: renderMailTemplate(template.intro, ticket),
  };
}

function mailTemplate(templateId) {
  return { ...defaultMailTemplates[templateId], ...(state.mailTemplates[templateId] || {}) };
}

function renderMailTemplate(text, ticket) {
  const stage = findById(state.stages, ticket.status_stage_id);
  const values = {
    title: ticket.title || "",
    owner: ticket.work_owner_name || ticket.owner_name || "Unassigned",
    customer: ticket.customer_name || "None",
    dueDate: formatDate(ticket.due_date),
    blockedReason: labelFor(blockedReasons, ticket.blocked_reason) || "Not blocked",
    status: stage?.name || "No status",
  };
  return Object.entries(values).reduce((output, [key, value]) => output.replaceAll(`{{${key}}}`, value), text || "");
}

function saveMailTemplates() {
  localStorage.setItem("trnawl.mailTemplates", JSON.stringify(state.mailTemplates));
}

function supportedMailVariables() {
  return ["{{title}}", "{{owner}}", "{{customer}}", "{{dueDate}}", "{{blockedReason}}", "{{status}}"];
}

function mailPreviewDefinitions() {
  const sampleTicket = sampleMailTicket();
  return mailRuleDefinitions().map((rule) => {
    const content = mailContent(rule.id, sampleTicket);
    const template = mailTemplate(rule.id);
    return {
      id: rule.id,
      event: rule.title,
      subject: content.subject,
      html: ticketEmailHtml(content.intro, sampleTicket),
      templateSubject: template.subject,
      templateIntro: template.intro,
    };
  });
}

function sampleMailTicket() {
  const stage = state.stages.find((item) => item.stage_type === "ticket" && item.name === "In Progress") || state.stages.find((item) => item.stage_type === "ticket");
  return {
    title: "Acme Anvils Ltd.: Scope Boundary Review",
    work_owner_name: "Thomas",
    owner_name: "Thomas",
    customer_name: "Acme Anvils Ltd.",
    due_date: isoDateFromToday(2),
    blocked_reason: "scope_unclear",
    status_stage_id: stage?.id || null,
  };
}

function renderProjectPlan() {
  const openItems = state.projectPlanItems.filter((item) => item.status !== "done");
  const doneItems = state.projectPlanItems.filter((item) => item.status === "done");
  $("#projectPlanView").innerHTML = `
    <div class="toolbar">
      <div class="roadmap-summary">
        <span class="pill primary">${openItems.length} open</span>
        <span class="pill success">${doneItems.length} complete</span>
      </div>
      <button class="primary-button" type="button" id="addProjectPlanItemButton"><i data-lucide="plus"></i><span>Roadmap Item</span></button>
    </div>
    <div class="roadmap-grid">
      ${projectPlanStatuses.map(([status, label]) => `
        <section class="roadmap-column" data-status="${escapeHtml(status)}">
          <div class="roadmap-column-header">
            <h2>${escapeHtml(label)}</h2>
            <span class="pill">${state.projectPlanItems.filter((item) => item.status === status).length}</span>
          </div>
          <div class="roadmap-list">
            ${state.projectPlanItems.filter((item) => item.status === status).map(projectPlanCard).join("") || `<div class="empty-state">No items.</div>`}
          </div>
        </section>
      `).join("")}
    </div>
  `;
  $("#addProjectPlanItemButton").addEventListener("click", () => openProjectPlanDialog());
  $$(".project-plan-edit").forEach((button) => button.addEventListener("click", () => openProjectPlanDialog(button.dataset.itemId)));
  $$(".project-plan-complete").forEach((button) => button.addEventListener("click", () => completeProjectPlanItem(button.dataset.itemId)));
  $$(".project-plan-delete").forEach((button) => button.addEventListener("click", () => deleteProjectPlanItem(button.dataset.itemId)));
  bindProjectPlanDragAndDrop();
  refreshIcons();
}

function projectPlanCard(item) {
  return `
    <article class="roadmap-card ${item.status === "done" ? "complete" : ""}" draggable="true" data-item-id="${item.id}">
      <div class="roadmap-drag-hint"><i data-lucide="grip-vertical"></i><span>Drag to move</span></div>
      <div class="tag-row">
        <span class="pill primary">${escapeHtml(labelFor(projectPlanCategories, item.category))}</span>
        <span class="pill">${escapeHtml(labelFor(projectPlanPriorities, item.priority))}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description || "No description")}</p>
      <div class="card-actions">
        ${item.status !== "done" ? `<button class="secondary-button compact-button project-plan-complete" type="button" data-item-id="${item.id}"><i data-lucide="check"></i><span>Complete</span></button>` : ""}
        <button class="secondary-button compact-button project-plan-edit" type="button" data-item-id="${item.id}"><i data-lucide="pencil"></i><span>Edit</span></button>
        <button class="danger-button compact-button project-plan-delete" type="button" data-item-id="${item.id}"><i data-lucide="trash-2"></i><span>Delete</span></button>
      </div>
    </article>
  `;
}

function bindProjectPlanDragAndDrop() {
  $$(".roadmap-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.itemId);
    });
  });

  $$(".roadmap-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drop-target");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drop-target"));
    column.addEventListener("drop", async (event) => {
      event.preventDefault();
      column.classList.remove("drop-target");
      await moveProjectPlanItem(event.dataTransfer.getData("text/plain"), column.dataset.status);
    });
  });
}

async function moveProjectPlanItem(itemId, status) {
  const item = findById(state.projectPlanItems, itemId);
  if (!item || !status || item.status === status) return;
  try {
    setSync("Moving roadmap item");
    await api(`/project_plan_items?id=eq.${itemId}`, { method: "PATCH", body: { status } });
    await loadData();
    switchView("projectPlan");
  } catch (error) {
    setSync(error.message);
  }
}

function openProjectPlanDialog(itemId = null) {
  const item = findById(state.projectPlanItems, itemId);
  state.selectedProjectPlanItemId = item?.id || null;
  $("#projectPlanDialogTitle").textContent = item ? "Edit Roadmap Item" : "Add Roadmap Item";
  $("#projectPlanTitle").value = item?.title || "";
  $("#projectPlanDescription").value = item?.description || "";
  $("#projectPlanCategory").value = item?.category || "templates";
  $("#projectPlanStatus").value = item?.status || "planned";
  $("#projectPlanPriority").value = item?.priority || "medium";
  $("#projectPlanDialog").showModal();
}

async function saveProjectPlanItem(event) {
  event.preventDefault();
  const body = {
    title: $("#projectPlanTitle").value.trim(),
    description: $("#projectPlanDescription").value.trim() || null,
    category: $("#projectPlanCategory").value,
    status: $("#projectPlanStatus").value,
    priority: $("#projectPlanPriority").value,
  };
  if (!body.title) return;
  try {
    setSync("Saving roadmap");
    if (state.selectedProjectPlanItemId) {
      await api(`/project_plan_items?id=eq.${state.selectedProjectPlanItemId}`, { method: "PATCH", body });
    } else {
      await api("/project_plan_items", { method: "POST", body });
    }
    $("#projectPlanDialog").close();
    state.selectedProjectPlanItemId = null;
    await loadData();
    switchView("projectPlan");
  } catch (error) {
    setSync(error.message);
  }
}

async function completeProjectPlanItem(itemId) {
  try {
    setSync("Completing roadmap item");
    await api(`/project_plan_items?id=eq.${itemId}`, { method: "PATCH", body: { status: "done" } });
    await loadData();
    switchView("projectPlan");
  } catch (error) {
    setSync(error.message);
  }
}

async function deleteProjectPlanItem(itemId) {
  if (!confirm("Delete this roadmap item?")) return;
  try {
    setSync("Deleting roadmap item");
    await api(`/project_plan_items?id=eq.${itemId}`, { method: "DELETE" });
    await loadData();
    switchView("projectPlan");
  } catch (error) {
    setSync(error.message);
  }
}

function renderDevLog() {
  $("#devlogView").innerHTML = `
    <div class="report-grid">
      ${developmentLog.map((entry) => `
        <section class="panel">
          <div class="tag-row" style="margin-top: 0; margin-bottom: 10px;">
            <span class="pill primary">${escapeHtml(entry.date)}</span>
          </div>
          <h2>${escapeHtml(entry.title)}</h2>
          <p class="muted">${escapeHtml(entry.summary)}</p>
          <div class="mini-list">
            ${entry.changes.map((change) => `<div>${escapeHtml(change)}</div>`).join("")}
          </div>
          ${entry.notes.length ? `
            <div class="tag-row">
              ${entry.notes.map((note) => `<span class="pill">${escapeHtml(note)}</span>`).join("")}
            </div>
          ` : ""}
        </section>
      `).join("")}
    </div>
  `;
}

function renderAdmin() {
  $("#adminView").innerHTML = `
    <div class="admin-grid">
      <section class="panel">
        <h2>Project</h2>
        <div class="mini-list">
          <div><strong>Supabase</strong><br><span class="muted">${SUPABASE_URL}</span></div>
          <div><strong>User</strong><br><span class="muted">${escapeHtml(state.user?.email || "")}</span></div>
          <div><strong>Tables loaded</strong><br><span class="muted">tickets, customers, people, workflow templates, customer actions</span></div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Users</h2>
            <p class="muted">People available for ticket ownership, lead defaults, and calendar planning.</p>
          </div>
          <button class="primary-button" type="button" id="addPersonButton"><i data-lucide="user-plus"></i><span>Create User</span></button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Manager</th><th>Color</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${state.people.map((person) => `
                <tr>
                  <td>${escapeHtml(person.display_name)}</td>
                  <td>${escapeHtml(person.role_label)}</td>
                  <td>${personCanReceiveEmail(person) ? escapeHtml(person.email) : `<span class="muted">No email</span>`}</td>
                  <td>${escapeHtml(person.manager_name || "None")}</td>
                  <td><span class="color-chip" style="--person-color: ${escapeHtml(person.color || "#0067b1")}"></span></td>
                  <td>${person.is_current_user ? `<span class="pill primary">Default user</span>` : `<span class="pill">Demo user</span>`}</td>
                  <td><button class="secondary-button compact-button edit-person-button" type="button" data-person-id="${person.id}"><i data-lucide="pencil"></i><span>Edit</span></button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Mail Settings</h2>
            <p class="muted">Choose which ticket events send email through the TRNAWL email Worker.</p>
          </div>
        </div>
        <div class="mail-rule-list">
          ${mailRuleDefinitions().map((rule) => `
            <label class="mail-rule">
              <input type="checkbox" name="mailRule" value="${escapeHtml(rule.id)}" ${mailRuleEnabled(rule.id) ? "checked" : ""} />
              <span>
                <strong>${escapeHtml(rule.title)}</strong>
                <small>${escapeHtml(rule.description)}</small>
              </span>
            </label>
          `).join("")}
        </div>
        <section class="mail-preview-panel">
          <h3>Mail Preview</h3>
          <p class="muted">This is the body TRNAWL sends for each event. Live emails use the actual ticket values.</p>
          <div class="mail-preview-grid">
            ${mailPreviewDefinitions().map((preview) => `
              <article class="mail-preview-card" data-template-id="${escapeHtml(preview.id)}">
                <div class="mail-preview-header">
                  <span class="pill primary">${escapeHtml(preview.event)}</span>
                  <button class="secondary-button compact-button edit-mail-template-button" type="button" data-template-id="${escapeHtml(preview.id)}"><i data-lucide="pencil"></i><span>Edit</span></button>
                </div>
                <h4>${escapeHtml(preview.subject)}</h4>
                <div class="mail-template-editor hidden" id="mailTemplateEditor-${escapeHtml(preview.id)}">
                  <label>Subject<input class="mail-template-subject" data-template-id="${escapeHtml(preview.id)}" value="${escapeHtml(preview.templateSubject)}" /></label>
                  <label>Body intro<textarea class="mail-template-intro" data-template-id="${escapeHtml(preview.id)}" rows="3">${escapeHtml(preview.templateIntro)}</textarea></label>
                  <div class="tag-row">
                    ${supportedMailVariables().map((variable) => `<span class="pill">${escapeHtml(variable)}</span>`).join("")}
                  </div>
                  <div class="card-actions">
                    <button class="primary-button compact-button save-mail-template-button" type="button" data-template-id="${escapeHtml(preview.id)}">Save Template</button>
                    <button class="secondary-button compact-button reset-mail-template-button" type="button" data-template-id="${escapeHtml(preview.id)}">Reset</button>
                  </div>
                </div>
                <div class="mail-preview-body">${preview.html}</div>
              </article>
            `).join("")}
          </div>
        </section>
        <div class="mini-list mail-settings-meta">
          <div><strong>Email endpoint</strong><br><span class="muted">${escapeHtml(EMAIL_WORKER_URL)}</span></div>
          <div><strong>Recipient rule</strong><br><span class="muted">Users without an email address are skipped automatically.</span></div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>AI Settings</h2>
            <p class="muted">Define what Improve with AI should optimize for.</p>
          </div>
        </div>
        <label>AI instruction<textarea id="aiInstructionInput" rows="5">${escapeHtml(state.aiInstruction)}</textarea></label>
        <div class="tag-row">
          <span class="pill">Translate to English</span>
          <span class="pill">Fix typos</span>
          <span class="pill">Preserve intent</span>
          <span class="pill">Do not invent facts</span>
        </div>
        <div class="card-actions">
          <button class="primary-button compact-button" type="button" id="saveAiInstructionButton">Save AI Instruction</button>
          <button class="secondary-button compact-button" type="button" id="resetAiInstructionButton">Reset</button>
        </div>
      </section>
      <section class="panel danger-zone">
        <h2>Danger Zone</h2>
        <p class="muted">For MVP cleanup only. This permanently deletes every ticket, including ticket updates and workflow links.</p>
        <button class="danger-button" type="button" id="deleteAllTicketsButton">Delete All Tickets</button>
      </section>
    </div>
  `;
  $("#addPersonButton").addEventListener("click", openPersonDialog);
  bindMailTemplateEditors();
  $("#saveAiInstructionButton").addEventListener("click", saveAiInstruction);
  $("#resetAiInstructionButton").addEventListener("click", resetAiInstruction);
  $$(".edit-person-button").forEach((button) => {
    button.addEventListener("click", () => openPersonDialog(button.dataset.personId));
  });
  $$('input[name="mailRule"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.mailSettings[input.value] = input.checked;
      saveMailSettings();
    });
  });
  $("#deleteAllTicketsButton").addEventListener("click", deleteAllTickets);
}

function openPersonDialog(personId = null) {
  const person = findById(state.people, personId);
  state.selectedPersonId = person?.id || null;
  $("#personForm").reset();
  syncObjectSelects();
  $("#personDialogTitle").textContent = person ? "Edit User" : "Create User";
  $("#personDialogSubtitle").textContent = person ? "Update user details used for assignment, notifications, and planning." : "Add a selectable team member for ticket ownership, lead defaults, and calendar planning.";
  $("#personSubmitButton").textContent = person ? "Save User" : "Create User";
  $("#personName").value = person?.display_name || "";
  $("#personRole").value = person?.role_label || "";
  $("#personEmail").value = person?.email || "";
  $("#personManager").value = person?.manager_id || "";
  $("#personColor").value = person?.color || "#0067b1";
  $("#personDialog").showModal();
}

function personCanReceiveEmail(person) {
  return Boolean(person?.email?.trim());
}

function bindMailTemplateEditors() {
  $$(".edit-mail-template-button").forEach((button) => {
    button.addEventListener("click", () => {
      $(`#mailTemplateEditor-${button.dataset.templateId}`)?.classList.toggle("hidden");
    });
  });
  $$(".save-mail-template-button").forEach((button) => {
    button.addEventListener("click", () => {
      const templateId = button.dataset.templateId;
      state.mailTemplates[templateId] = {
        subject: $(`.mail-template-subject[data-template-id="${templateId}"]`).value,
        intro: $(`.mail-template-intro[data-template-id="${templateId}"]`).value,
      };
      saveMailTemplates();
      renderAdmin();
    });
  });
  $$(".reset-mail-template-button").forEach((button) => {
    button.addEventListener("click", () => {
      delete state.mailTemplates[button.dataset.templateId];
      saveMailTemplates();
      renderAdmin();
    });
  });
}

function saveAiInstruction() {
  state.aiInstruction = $("#aiInstructionInput").value.trim() || defaultAiInstruction;
  localStorage.setItem("trnawl.aiInstruction", state.aiInstruction);
  renderAdmin();
}

function resetAiInstruction() {
  state.aiInstruction = defaultAiInstruction;
  localStorage.setItem("trnawl.aiInstruction", state.aiInstruction);
  renderAdmin();
}

function labelFor(options, value) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || value || "";
}

function findById(items, id) {
  return items.find((item) => item.id === id);
}

function getCurrentPerson() {
  return state.people.find((person) => person.is_current_user) || state.people[0];
}

function isDoneTicket(ticket) {
  const stage = findById(state.stages, ticket.status_stage_id);
  return Boolean(stage?.is_done || stage?.name?.toLowerCase() === "done");
}

function uniqueTickets(tickets) {
  return [...new Map(tickets.map((ticket) => [ticket.id, ticket])).values()];
}

function blockedAgeLabel(ticket) {
  if (!ticket.blocked_since) return "Blocked";
  const blockedAt = new Date(ticket.blocked_since);
  if (Number.isNaN(blockedAt.getTime())) return "Blocked";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  blockedAt.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today - blockedAt) / 86400000));
  if (days === 0) return "Blocked today";
  return `Blocked ${days}d`;
}

function colorForPersonName(name) {
  return state.people.find((person) => person.display_name === name)?.color || "#0067b1";
}

function initials(name) {
  return String(name || "?").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function daysUntil(dateString) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateString}T00:00:00`);
  return Math.ceil((date - today) / 86400000);
}

function isOverdue(item) {
  return daysUntil(item.due_date) < 0;
}

function formatDate(dateString) {
  if (!dateString) return "No date";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isoDateFromToday(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", init);
