const SUPABASE_URL = "https://ofwwpmnjbbojdznnbxpl.supabase.co";
const SUPABASE_KEY = "sb_publishable_kcTEx8ODCrU3tO7LpeVxVw_ytPxlDRA";

const state = {
  session: JSON.parse(localStorage.getItem("trnawl.session") || "null"),
  user: null,
  activeView: "dashboard",
  tickets: [],
  stages: [],
  templates: [],
  templateTasks: [],
  customerActions: [],
  people: [],
  customers: [],
  selectedCustomerId: null,
  search: "",
  typeFilter: "all",
};

const viewMeta = {
  dashboard: ["Dashboard", "Operational health, blockers, and work needing attention."],
  tickets: ["Tickets", "Move work through simple stages with ownership and due dates."],
  workflows: ["Workflows", "Start repeatable operational review paths."],
  customers: ["Customers", "Customer tiles, contacts, related tickets, and open actions."],
  actions: ["Customer Actions", "External dependencies with internal accountability."],
  calendar: ["Calendar", "Upcoming work, due dates, and customer follow-ups."],
  reports: ["Reports", "Blocked work, aging, readiness, and customer action visibility."],
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
      "Renamed responsibility fields to Delivery Lead and Opportunity Lead.",
      "Removed pricing, delivery-reviewed, and owner-assigned readiness checks.",
    ],
    notes: ["Ticket responsibility is now object-based instead of free text."],
  },
  {
    date: "2026-05-22",
    title: "Corporate design refresh",
    summary: "Restyled the MVP toward a modern corporate assurance platform.",
    changes: [
      "Reworked the color system around business blue, white surfaces, and restrained yellow accents.",
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
    notes: ["Delivery Lead, Sales Lead, and Opportunity Lead are now separate responsibilities."],
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
  renderReadinessChecks();
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
  $("#newTicketButton").addEventListener("click", () => $("#ticketDialog").showModal());
  $("#ticketForm").addEventListener("submit", createTicket);
  $("#ticketType").addEventListener("change", renderReadinessChecks);
  $("#workflowForm").addEventListener("submit", startWorkflow);
  $("#customerForm").addEventListener("submit", createCustomer);
  $("#actionForm").addEventListener("submit", createCustomerAction);

  $$(".close-dialog").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
}

function fillSelect(select, options, selected = "") {
  select.innerHTML = options.map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("");
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
    const [stages, tickets, templates, templateTasks, customerActions, people, customers] = await Promise.all([
      api("/workflow_stages?select=*&order=stage_type.asc,position.asc"),
      api("/tickets?select=*&order=created_at.desc"),
      api("/workflow_templates?select=*&order=name.asc"),
      api("/workflow_template_tasks?select=*&order=position.asc"),
      api("/customer_actions?select=*&order=created_at.desc"),
      api("/app_people?select=*&order=is_current_user.desc,display_name.asc"),
      api("/customers?select=*&order=name.asc"),
    ]);
    state.stages = stages;
    state.tickets = tickets;
    state.templates = templates;
    state.templateTasks = templateTasks;
    state.customerActions = customerActions;
    state.people = people;
    state.customers = customers;
    syncObjectSelects();
    renderAll();
    setSync("Ready");
  } catch (error) {
    setSync(error.message);
  }
}

function syncObjectSelects() {
  const personOptions = state.people.map((person) => [person.id, `${person.display_name} - ${person.role_label}`]);
  const customerOptions = state.customers.map((customer) => [customer.id, customer.name]);
  const currentUser = state.people.find((person) => person.is_current_user) || state.people[0];
  const fallbackSalesLead = state.people.find((person) => person.display_name === "Harry Dumm") || state.people.find((person) => person.role_label.includes("Sales")) || state.people[0];
  const fallbackOpportunityLead = state.people.find((person) => person.display_name === "Lola Bunny") || state.people[1] || currentUser;

  fillSelect($("#ticketOwner"), personOptions, currentUser?.id || "");
  fillSelect($("#ticketDeliveryLead"), personOptions, currentUser?.id || "");
  fillSelect($("#ticketSalesLead"), personOptions, fallbackSalesLead?.id || "");
  fillSelect($("#ticketOpportunityLead"), personOptions, fallbackOpportunityLead?.id || currentUser?.id || "");
  fillSelect($("#workflowOwner"), personOptions, currentUser?.id || "");
  fillSelect($("#workflowDeliveryLead"), personOptions, currentUser?.id || "");
  fillSelect($("#workflowSalesLead"), personOptions, fallbackSalesLead?.id || "");
  fillSelect($("#workflowOpportunityLead"), personOptions, fallbackOpportunityLead?.id || currentUser?.id || "");
  fillSelect($("#ticketCustomer"), customerOptions, state.customers[0]?.id || "");
  fillSelect($("#workflowCustomer"), customerOptions, state.customers[0]?.id || "");
  fillSelect($("#actionCustomer"), customerOptions, state.customers[0]?.id || "");
}

function setSync(message) {
  $("#syncStatus").textContent = message;
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
  const overdue = state.tickets.filter(isOverdue);
  const blocked = state.tickets.filter((ticket) => ticket.blocked_reason);
  const dueSoon = state.tickets.filter((ticket) => daysUntil(ticket.due_date) >= 0 && daysUntil(ticket.due_date) <= 7);
  const openActions = state.customerActions.filter((action) => !["done", "cancelled"].includes(action.status));

  $("#dashboardView").innerHTML = `
    <div class="metric-grid">
      ${metric("Open tickets", state.tickets.length)}
      ${metric("Overdue", overdue.length, "danger")}
      ${metric("Blocked", blocked.length, "warning")}
      ${metric("Customer actions", openActions.length)}
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>Priority Work</h2>
        ${ticketTable([...overdue, ...blocked, ...dueSoon].slice(0, 8))}
      </section>
      <section class="panel">
        <h2>Blocked Reasons</h2>
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
        <thead><tr><th>Ticket</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>
          ${tickets.map((ticket) => `
            <tr>
              <td>${escapeHtml(ticket.title)}</td>
              <td>${escapeHtml(ticket.work_owner_name || ticket.owner_name || "Unassigned")}</td>
              <td>${formatDate(ticket.due_date)}</td>
              <td>${ticketPills(ticket)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function blockedReasonList() {
  const counts = countBy(state.tickets.filter((ticket) => ticket.blocked_reason), "blocked_reason");
  const rows = Object.entries(counts);
  if (!rows.length) return `<div class="empty-state">No blocked tickets.</div>`;
  return `<div class="mini-list">${rows.map(([reason, count]) => `<div><strong>${labelFor(blockedReasons, reason)}</strong><br><span class="muted">${count} ticket${count === 1 ? "" : "s"}</span></div>`).join("")}</div>`;
}

function renderTickets() {
  const stages = state.stages.filter((stage) => stage.stage_type === "ticket");
  const filtered = state.tickets.filter((ticket) => {
    const search = state.search.toLowerCase();
    const matchesSearch = !search || [ticket.title, ticket.description, ticket.customer_name, ticket.work_owner_name, ticket.owner_name, ticket.delivery_lead_name, ticket.sales_lead_name, ticket.requester_name].filter(Boolean).join(" ").toLowerCase().includes(search);
    const matchesType = state.typeFilter === "all" || ticket.ticket_type === state.typeFilter;
    return matchesSearch && matchesType;
  });

  $("#ticketsView").innerHTML = `
    <div class="toolbar">
      <div class="auth-actions">
        <input id="ticketSearch" placeholder="Search tickets, owners, customers" value="${escapeHtml(state.search)}" />
        <select id="typeFilter">
          <option value="all">All types</option>
          ${ticketTypes.map(([value, label]) => `<option value="${value}" ${state.typeFilter === value ? "selected" : ""}>${label}</option>`).join("")}
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
  $("#boardNewTicket").addEventListener("click", () => $("#ticketDialog").showModal());
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
        ${ticket.delivery_lead_name ? `<span class="pill">Delivery: ${escapeHtml(ticket.delivery_lead_name)}</span>` : ""}
      </div>
    </article>
  `;
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

async function updateTicketStage(ticketId, stageId) {
  try {
    setSync("Saving");
    await api(`/tickets?id=eq.${ticketId}`, {
      method: "PATCH",
      body: { status_stage_id: stageId },
    });
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

async function createTicket(event) {
  event.preventDefault();
  const ticketType = $("#ticketType").value;
  const readiness = readinessPayloadForType(ticketType);
  const readinessKeys = Object.keys(readiness);
  const readinessScore = readinessKeys.length ? Math.round((Object.values(readiness).filter(Boolean).length / readinessKeys.length) * 100) : 0;
  const newStage = state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "New") || state.stages.find((stage) => stage.stage_type === "ticket");
  const owner = findById(state.people, $("#ticketOwner").value);
  const deliveryLead = findById(state.people, $("#ticketDeliveryLead").value);
  const salesLead = findById(state.people, $("#ticketSalesLead").value);
  const opportunityLead = findById(state.people, $("#ticketOpportunityLead").value);
  const customer = findById(state.customers, $("#ticketCustomer").value);
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
    opportunity_lead_id: opportunityLead?.id || null,
    customer_id: customer?.id || null,
    owner_name: owner?.display_name || null,
    requester_name: opportunityLead?.display_name || state.user.email,
    customer_name: customer?.name || null,
    due_date: $("#ticketDueDate").value || null,
    blocked_reason: $("#ticketBlockedReason").value || null,
    blocked_since: $("#ticketBlockedReason").value ? new Date().toISOString() : null,
    readiness_checks: readiness,
    readiness_score: readinessScore,
    status_stage_id: newStage?.id || null,
    requester_id: state.user.id,
  };

  try {
    setSync("Creating");
    await api("/tickets", { method: "POST", body });
    $("#ticketForm").reset();
    $("#ticketPriority").value = "medium";
    syncObjectSelects();
    renderReadinessChecks();
    $("#ticketDialog").close();
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function renderWorkflows() {
  const newSow = state.templates.find((template) => template.slug === "new-sow");
  const tasks = newSow ? state.templateTasks.filter((task) => task.template_id === newSow.id) : [];
  $("#workflowsView").innerHTML = `
    <div class="template-grid">
      ${state.templates.map((template) => `
        <article class="template-item">
          <h3>${escapeHtml(template.name)}</h3>
          <p>${escapeHtml(template.description || "")}</p>
          ${template.slug === "new-sow" ? `<button class="primary-button" type="button" id="startSowButton"><i data-lucide="play"></i><span>Start</span></button>` : `<span class="pill">Ready</span>`}
        </article>
      `).join("")}
    </div>
    <section class="panel" style="margin-top: 16px;">
      <h2>New SOW Workflow Tasks</h2>
      <div class="preview-list">
        ${tasks.map((task) => `<div><strong>${task.position}. ${escapeHtml(task.title)}</strong><br><span class="muted">${escapeHtml(task.description || "")}</span></div>`).join("")}
      </div>
    </section>
  `;
  $("#startSowButton")?.addEventListener("click", openWorkflowDialog);
}

function openWorkflowDialog() {
  const newSow = state.templates.find((template) => template.slug === "new-sow");
  const tasks = newSow ? state.templateTasks.filter((task) => task.template_id === newSow.id) : [];
  $("#workflowPreview").innerHTML = tasks.map((task) => `<div><strong>${task.position}. ${escapeHtml(task.title)}</strong><br><span class="muted">${escapeHtml(task.description || "")}</span></div>`).join("");
  $("#workflowDialog").showModal();
}

async function startWorkflow(event) {
  event.preventDefault();
  const template = state.templates.find((item) => item.slug === "new-sow");
  if (!template) return;
  const tasks = state.templateTasks.filter((task) => task.template_id === template.id);
  const newStage = state.stages.find((stage) => stage.stage_type === "ticket" && stage.name === "New") || state.stages.find((stage) => stage.stage_type === "ticket");
  const customer = findById(state.customers, $("#workflowCustomer").value);
  const owner = findById(state.people, $("#workflowOwner").value);
  const deliveryLead = findById(state.people, $("#workflowDeliveryLead").value);
  const salesLead = findById(state.people, $("#workflowSalesLead").value);
  const opportunityLead = findById(state.people, $("#workflowOpportunityLead").value);
  const baseDate = $("#workflowDueDate").value ? new Date(`${$("#workflowDueDate").value}T00:00:00`) : new Date();

  try {
    setSync("Creating workflow");
    const [run] = await api("/workflow_runs", {
      method: "POST",
      body: {
        template_id: template.id,
        name: `${customer?.name || "Customer"} New SOW Workflow`,
        customer_name: customer?.name || null,
        opportunity_reference: $("#workflowOpportunity").value.trim() || null,
        started_by: state.user.id,
      },
    });

    for (const task of tasks) {
      const dueDate = new Date(baseDate);
      dueDate.setDate(baseDate.getDate() + (task.suggested_due_offset_days || 0));
      const [ticket] = await api("/tickets", {
        method: "POST",
        body: {
          title: `${customer?.name || "Customer"}: ${task.title}`,
          description: task.description,
          ticket_type: task.default_ticket_type,
          priority: task.default_priority,
          blocked_reason: task.default_blocked_reason,
          blocked_since: task.default_blocked_reason ? new Date().toISOString() : null,
          customer_id: customer?.id || null,
          customer_name: customer?.name || null,
          work_owner_id: owner?.id || null,
          work_owner_name: owner?.display_name || null,
          delivery_lead_id: deliveryLead?.id || null,
          delivery_lead_name: deliveryLead?.display_name || null,
          sales_lead_id: salesLead?.id || null,
          sales_lead_name: salesLead?.display_name || null,
          opportunity_lead_id: opportunityLead?.id || null,
          owner_name: owner?.display_name || null,
          requester_name: opportunityLead?.display_name || state.user.email,
          due_date: dueDate.toISOString().slice(0, 10),
          status_stage_id: newStage?.id || null,
          requester_id: state.user.id,
        },
      });
      await api("/workflow_run_tickets", {
        method: "POST",
        body: {
          workflow_run_id: run.id,
          ticket_id: ticket.id,
          template_task_id: task.id,
        },
      });
    }

    $("#workflowForm").reset();
    syncObjectSelects();
    $("#workflowDialog").close();
    await loadData();
    switchView("tickets");
  } catch (error) {
    setSync(error.message);
  }
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
      </div>
      <div class="tag-row">
        <span class="pill primary">${escapeHtml(customer.segment || "No segment")}</span>
        <span class="pill ${customer.status === "active" ? "success" : ""}">${labelFor(customerStatuses, customer.status || "active")}</span>
      </div>
      <div class="customer-stats">
        <span><strong>${tickets.length}</strong> tickets</span>
        <span><strong>${openActions.length}</strong> open actions</span>
      </div>
      <button class="secondary-button customer-detail-button" type="button" data-customer-id="${customer.id}">Details</button>
    </article>
  `;
}

function renderCustomerDetail(customer) {
  const tickets = state.tickets.filter((ticket) => ticket.customer_id === customer.id || ticket.customer_name === customer.name);
  const actions = state.customerActions.filter((action) => action.customer_id === customer.id || action.customer_name === customer.name);
  $("#customersView").innerHTML = `
    <div class="detail-header">
      <button class="secondary-button" type="button" id="backToCustomers"><i data-lucide="arrow-left"></i><span>Customers</span></button>
      <button class="primary-button" type="button" id="addCustomerButton"><i data-lucide="plus"></i><span>Customer</span></button>
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>${escapeHtml(customer.name)}</h2>
        <div class="mini-list">
          <div><strong>Segment</strong><br><span class="muted">${escapeHtml(customer.segment || "Not set")}</span></div>
          <div><strong>Status</strong><br><span class="muted">${labelFor(customerStatuses, customer.status || "active")}</span></div>
          <div><strong>Primary contact</strong><br><span class="muted">${escapeHtml(customer.primary_contact || "Not set")}</span></div>
          <div><strong>Email</strong><br><span class="muted">${escapeHtml(customer.contact_email || "Not set")}</span></div>
          <div><strong>Notes</strong><br><span class="muted">${escapeHtml(customer.notes || "No notes yet")}</span></div>
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
}

async function createCustomer(event) {
  event.preventDefault();
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
  $("#addActionButton").addEventListener("click", () => $("#actionDialog").showModal());
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
    $("#actionDialog").close();
    await loadData();
  } catch (error) {
    setSync(error.message);
  }
}

function renderCalendar() {
  const days = [...Array(14)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
  $("#calendarView").innerHTML = `
    <div class="calendar-grid">
      ${days.map((date) => calendarDay(date)).join("")}
    </div>
  `;
}

function calendarDay(date) {
  const iso = date.toISOString().slice(0, 10);
  const tickets = state.tickets.filter((ticket) => ticket.due_date === iso);
  const actions = state.customerActions.filter((action) => action.due_date === iso);
  return `
    <article class="calendar-item">
      <div class="calendar-date">${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
      <div class="mini-list">
        ${tickets.map((ticket) => `<div>${escapeHtml(ticket.title)}<br><span class="muted">${escapeHtml(ticket.work_owner_name || ticket.owner_name || "Unassigned")}</span></div>`).join("")}
        ${actions.map((action) => `<div>${escapeHtml(action.action)}<br><span class="muted">${escapeHtml(action.customer_name)}</span></div>`).join("")}
      </div>
    </article>
  `;
}

function renderReports() {
  const blocked = state.tickets.filter((ticket) => ticket.blocked_reason);
  const avgReadiness = state.tickets.length ? Math.round(state.tickets.reduce((sum, ticket) => sum + (ticket.readiness_score || 0), 0) / state.tickets.length) : 0;
  const staleActions = state.customerActions.filter((action) => !["done", "cancelled"].includes(action.status) && isOverdue(action));

  $("#reportsView").innerHTML = `
    <div class="report-grid">
      <section class="panel">
        <h2>Weekly Operational Brief</h2>
        <div class="mini-list">
          <div><strong>${state.tickets.filter(isOverdue).length} overdue tickets</strong><br><span class="muted">Work past due date.</span></div>
          <div><strong>${blocked.length} blocked tickets</strong><br><span class="muted">Work waiting on another person, team, or dependency.</span></div>
          <div><strong>${staleActions.length} stale customer actions</strong><br><span class="muted">Customer-owned actions past due.</span></div>
          <div><strong>${avgReadiness}% average readiness</strong><br><span class="muted">Simple score across ticket readiness checks.</span></div>
        </div>
      </section>
      <section class="panel">
        <h2>Blocked Reason Aging</h2>
        ${blockedReasonList()}
      </section>
    </div>
  `;
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
        <h2>Users</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              ${state.people.map((person) => `
                <tr>
                  <td>${escapeHtml(person.display_name)}</td>
                  <td>${escapeHtml(person.role_label)}</td>
                  <td>${person.is_current_user ? `<span class="pill primary">Default user</span>` : `<span class="pill">Demo user</span>`}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "none";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function labelFor(options, value) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || value || "";
}

function findById(items, id) {
  return items.find((item) => item.id === id);
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
