/* TaskFlow — vanilla JavaScript application */
(() => {
  "use strict";

  const STORAGE_KEY = "taskflow.tasks.v1";
  const PROFILE_KEY = "taskflow.profile.v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const todayISO = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const dateOffset = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const makeId = () => `task-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

  const seedTasks = [
    {id:"seed-1",name:"Finalize portfolio website",description:"Polish the project layout and prepare the portfolio for review.",category:"Work",priority:"High",deadline:dateOffset(2),status:"progress",createdAt:new Date(Date.now()-86400000*2).toISOString()},
    {id:"seed-2",name:"Review database design notes",description:"Revisit normalization and prepare questions for the next discussion.",category:"Study",priority:"Medium",deadline:dateOffset(1),status:"todo",createdAt:new Date(Date.now()-86400000).toISOString()},
    {id:"seed-3",name:"Plan weekly study schedule",description:"Set aside focused time for lectures, assignments, and practice.",category:"Personal",priority:"Low",deadline:dateOffset(4),status:"todo",createdAt:new Date(Date.now()-3600000*18).toISOString()},
    {id:"seed-4",name:"Submit UI/UX assignment",description:"Check the final prototype and submit the assignment.",category:"Study",priority:"High",deadline:dateOffset(-1),status:"completed",createdAt:new Date(Date.now()-86400000*4).toISOString()},
    {id:"seed-5",name:"Organize project references",description:"Collect useful documentation and links in one place.",category:"Other",priority:"Low",deadline:dateOffset(6),status:"progress",createdAt:new Date(Date.now()-3600000*8).toISOString()}
  ];

  let tasks = loadTasks();
  let profile = loadProfile();
  let currentPage = "dashboard";
  let selectedDetailId = null;

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));
        return [...seedTasks];
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(isValidTask) : [...seedTasks];
    } catch (error) {
      console.warn("TaskFlow could not read saved tasks. Starting with sample data.", error);
      return [...seedTasks];
    }
  }
  function isValidTask(task) {
    return task && typeof task.id === "string" && typeof task.name === "string" &&
      typeof task.deadline === "string" && ["todo","progress","completed"].includes(task.status);
  }
  function loadProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      return saved && typeof saved.name === "string" ? saved : {name:"Diana Fitri"};
    } catch { return {name:"Diana Fitri"}; }
  }
  function persistTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch { showToast("Unable to save data. Check your browser storage.", "error"); }
  }
  function persistProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
    catch { showToast("Unable to save profile.", "error"); }
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function formatDate(value) {
    if (!value) return "No deadline";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"});
  }
  function statusLabel(status) {
    return ({todo:"To Do",progress:"In Progress",completed:"Completed"})[status] || "To Do";
  }
  function isOverdue(task) {
    return task.status !== "completed" && task.deadline < todayISO();
  }
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
    const mark = document.createElement("span");
    mark.className = "toast-mark";
    mark.textContent = type === "error" ? "!" : "✓";
    const text = document.createElement("span");
    text.textContent = message;
    toast.append(mark, text);
    $("#toastRegion").append(toast);
    window.setTimeout(() => toast.remove(), 3000);
  }

  function renderAll() {
    renderProfile();
    renderDashboard();
    renderTaskList();
    $("#allCount").textContent = tasks.length;
    $("#settingsTaskCount").textContent = tasks.length;
    $("#todayLabel").textContent = new Date().toLocaleDateString("en-US", {weekday:"short", month:"short", day:"numeric"});
  }
  function renderProfile() {
    const name = profile.name.trim() || "Diana Fitri";
    const initials = name.split(/\s+/).slice(0,2).map(part => part[0]).join("").toUpperCase();
    $("#welcomeName").textContent = name.split(/\s+/)[0];
    $("#sidebarUserName").textContent = name;
    $("#topAvatar").textContent = initials;
    $(".profile-mini .avatar").textContent = initials;
    $("#nameSetting").value = name;
    $("#welcomeDate").textContent = new Date().toLocaleDateString("en-US", {weekday:"long", month:"long", day:"numeric"}).toUpperCase();
  }
  function renderDashboard() {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === "todo").length;
    const progress = tasks.filter(t => t.status === "progress").length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const rate = total ? Math.round(completed / total * 100) : 0;
    $("#totalStat").textContent = total;
    $("#todoStat").textContent = todo;
    $("#progressStat").textContent = progress;
    $("#completedStat").textContent = completed;
    $("#completionRate").textContent = `${rate}%`;
    $("#legendTodo").textContent = todo;
    $("#legendProgress").textContent = progress;
    $("#legendCompleted").textContent = completed;
    const todoDeg = total ? todo / total * 360 : 0;
    const progressDeg = total ? progress / total * 360 : 0;
    const doneDeg = total ? completed / total * 360 : 0;
    $("#progressDonut").style.background = total
      ? `conic-gradient(#8a79ed 0deg ${doneDeg}deg, #69a5e8 ${doneDeg}deg ${doneDeg+progressDeg}deg, #e9ad61 ${doneDeg+progressDeg}deg 360deg)`
      : "conic-gradient(#e9ebf3 0deg 360deg)";
    $("#progressSummary").textContent = total ? `${completed} of ${total} tasks completed. ${rate >= 70 ? "You're doing great!" : "Keep making steady progress."}` : "Add your first task to start tracking your progress.";
    $("#tipProgressText").textContent = total ? `${rate}% of your tasks completed` : "Your progress is waiting";
    $(".tip-progress span").style.width = `${rate}%`;

    const categories = ["Work","Personal","Study","Other"];
    const categoryClasses = ["bar-work","bar-personal","bar-study","bar-other"];
    $("#categoryBars").replaceChildren();
    categories.forEach((category, index) => {
      const count = tasks.filter(t => t.category === category).length;
      const percent = total ? Math.round(count / total * 100) : 0;
      const row = document.createElement("div");
      row.className = "category-row";
      const label = document.createElement("span"); label.textContent = category;
      const track = document.createElement("div"); track.className = "bar-track";
      const fill = document.createElement("div"); fill.className = `bar-fill ${categoryClasses[index]}`; fill.style.width = `${percent}%`; track.append(fill);
      const value = document.createElement("strong"); value.textContent = count;
      row.append(label, track, value); $("#categoryBars").append(row);
    });

    const recent = [...tasks].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0,5);
    renderRows(recent, $("#recentTasksBody"), false);
    $("#recentEmpty").classList.toggle("hidden", recent.length > 0);
    $(".recent-panel .table-wrap").classList.toggle("hidden", recent.length === 0);
  }

  function renderRows(items, tbody, showActions = true) {
    tbody.replaceChildren();
    items.forEach(task => {
      const tr = document.createElement("tr");
      const nameCell = document.createElement("td");
      const nameWrap = document.createElement("div"); nameWrap.className = "task-name-cell";
      const check = document.createElement("button");
      check.className = `task-check ${task.status === "completed" ? "checked" : ""}`;
      check.type = "button"; check.setAttribute("aria-label", task.status === "completed" ? "Mark task as to do" : "Mark task completed");
      check.textContent = task.status === "completed" ? "✓" : "";
      check.addEventListener("click", () => toggleTask(task.id));
      const nameText = document.createElement("div");
      const title = document.createElement("div"); title.className = "task-title"; title.textContent = task.name;
      nameText.append(title);
      if (task.description) { const desc = document.createElement("div"); desc.className = "task-description-mini"; desc.textContent = task.description; nameText.append(desc); }
      nameWrap.append(check, nameText); nameCell.append(nameWrap);
      const category = document.createElement("td"); category.innerHTML = `<span class="category-chip">${escapeHTML(task.category)}</span>`;
      const priority = document.createElement("td"); priority.innerHTML = `<span class="priority-badge ${task.priority.toLowerCase()}">${escapeHTML(task.priority)}</span>`;
      const deadline = document.createElement("td"); deadline.textContent = formatDate(task.deadline); if (isOverdue(task)) deadline.className = "deadline-overdue";
      const status = document.createElement("td"); status.innerHTML = `<span class="status-badge ${task.status}">${statusLabel(task.status)}</span>`;
      const actions = document.createElement("td");
      if (showActions) {
        const wrap = document.createElement("div"); wrap.className = "row-actions";
        const view = makeActionButton("View task", "↗", () => openDetails(task.id));
        const edit = makeActionButton("Edit task", "✎", () => openTaskModal(task.id));
        const del = makeActionButton("Delete task", "×", () => deleteTask(task.id));
        wrap.append(view, edit, del); actions.append(wrap);
      } else {
        const view = makeActionButton("View task", "↗", () => openDetails(task.id)); actions.append(view);
      }
      tr.append(nameCell, category, priority, deadline, status, actions);
      tbody.append(tr);
    });
  }
  function makeActionButton(label, symbol, callback) {
    const button = document.createElement("button"); button.type = "button"; button.className = "action-button";
    button.textContent = symbol; button.title = label; button.setAttribute("aria-label", label); button.addEventListener("click", callback); return button;
  }

  function getVisibleTasks() {
    const query = $("#searchInput").value.trim().toLowerCase();
    const category = $("#categoryFilter").value;
    const priority = $("#priorityFilter").value;
    const status = $("#statusFilter").value;
    const sort = $("#sortFilter").value;
    let filtered = tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(query) || (task.description || "").toLowerCase().includes(query);
      return matchesSearch && (category === "all" || task.category === category) &&
        (priority === "all" || task.priority === priority) && (status === "all" || task.status === status);
    });
    if (currentPage === "mine") filtered = filtered.filter(task => task.status !== "completed");
    if (currentPage === "completed") filtered = filtered.filter(task => task.status === "completed");
    filtered.sort((a,b) => {
      if (sort === "created") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sort === "created-asc") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sort === "deadline-desc") return b.deadline.localeCompare(a.deadline);
      return a.deadline.localeCompare(b.deadline);
    });
    return filtered;
  }
  function renderTaskList() {
    if (currentPage === "dashboard" || currentPage === "settings") return;
    const filtered = getVisibleTasks();
    renderRows(filtered, $("#tasksTableBody"), true);
    $("#taskCountLabel").textContent = `Showing ${filtered.length} of ${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
    $("#tasksEmpty").classList.toggle("hidden", filtered.length > 0);
    $(".tasks-panel .table-wrap").classList.toggle("hidden", filtered.length === 0);
    $(".table-footer").classList.toggle("hidden", filtered.length === 0);
    const isFiltered = $("#searchInput").value || $("#categoryFilter").value !== "all" || $("#priorityFilter").value !== "all" || $("#statusFilter").value !== "all";
    $("#tasksEmptyTitle").textContent = isFiltered ? "No matching tasks" : "Nothing here yet";
    $("#tasksEmptyText").textContent = isFiltered ? "Try changing your search or filters." : "Create a task to get started.";
    $("#clearFiltersButton").classList.toggle("hidden", !isFiltered);
  }

  function navigate(page) {
    currentPage = page;
    $$(".page-view").forEach(view => view.classList.remove("active"));
    const target = page === "dashboard" ? "#dashboardPage" : page === "settings" ? "#settingsPage" : "#tasksPage";
    $(target).classList.add("active");
    $$(".nav-link[data-page]").forEach(link => link.classList.toggle("active", link.dataset.page === page));
    const labels = {dashboard:"Dashboard",all:"All Tasks",mine:"My Tasks",completed:"Completed",settings:"Settings"};
    $("#breadcrumbPage").textContent = labels[page];
    if (page !== "dashboard" && page !== "settings") {
      $("#tasksHeading").textContent = labels[page];
      $("#tasksSubheading").textContent = page === "completed" ? "A record of everything you’ve accomplished." : page === "mine" ? "Your active tasks, ready for the next step." : "Keep everything organized and moving forward.";
      renderTaskList();
    }
    closeSidebar();
  }
  function openTaskModal(id = null) {
    const task = id ? tasks.find(item => item.id === id) : null;
    $("#taskForm").reset();
    $("#taskId").value = task ? task.id : "";
    $("#modalTitle").textContent = task ? "Edit task" : "Create a new task";
    $("#submitTaskButton").textContent = task ? "Save changes" : "Create task";
    $("#taskName").value = task?.name || "";
    $("#taskDescription").value = task?.description || "";
    $("#taskCategory").value = task?.category || "Study";
    $("#taskPriority").value = task?.priority || "Medium";
    $("#taskDeadline").value = task?.deadline || todayISO();
    $("#taskDeadline").min = todayISO();
    $("#taskStatus").value = task?.status || "todo";
    $("#formError").classList.add("hidden");
    $("#taskModal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#taskName").focus(), 50);
  }
  function closeModal() { $("#taskModal").classList.add("hidden"); document.body.style.overflow = ""; }
  function saveTask(event) {
    event.preventDefault();
    const name = $("#taskName").value.trim();
    const deadline = $("#taskDeadline").value;
    const error = $("#formError");
    if (!name) { error.textContent = "Please enter a task name."; error.classList.remove("hidden"); $("#taskName").focus(); return; }
    if (!deadline || Number.isNaN(new Date(`${deadline}T00:00:00`).getTime())) { error.textContent = "Please choose a valid deadline."; error.classList.remove("hidden"); $("#taskDeadline").focus(); return; }
    if (deadline < todayISO() && $("#taskStatus").value !== "completed") { error.textContent = "Deadline cannot be in the past for an active task."; error.classList.remove("hidden"); $("#taskDeadline").focus(); return; }
    const id = $("#taskId").value;
    const existing = tasks.find(task => task.id === id);
    const task = {id:id || makeId(),name,description:$("#taskDescription").value.trim(),category:$("#taskCategory").value,priority:$("#taskPriority").value,deadline,status:$("#taskStatus").value,createdAt:existing?.createdAt || new Date().toISOString()};
    if (existing) {
      tasks = tasks.map(item => item.id === id ? task : item);
      showToast("Task updated successfully.");
    } else {
      tasks.unshift(task);
      showToast("New task added successfully.");
    }
    persistTasks(); closeModal(); renderAll();
    if (currentPage !== "dashboard" && currentPage !== "settings") renderTaskList();
  }
  function toggleTask(id) {
    tasks = tasks.map(task => task.id === id ? {...task,status:task.status === "completed" ? "todo" : "completed"} : task);
    persistTasks(); renderAll(); showToast("Task status updated.");
  }
  function deleteTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    if (!window.confirm(`Delete "${task.name}"? This action cannot be undone.`)) return;
    tasks = tasks.filter(item => item.id !== id);
    persistTasks(); renderAll(); if (currentPage !== "dashboard" && currentPage !== "settings") renderTaskList();
    if (selectedDetailId === id) closeDetails();
    showToast("Task deleted.");
  }
  function openDetails(id) {
    const task = tasks.find(item => item.id === id); if (!task) return;
    selectedDetailId = id;
    $("#detailTitle").textContent = task.name;
    const content = $("#detailContent"); content.replaceChildren();
    const description = document.createElement("p"); description.className = "detail-description"; description.textContent = task.description || "No description provided.";
    const meta = document.createElement("div"); meta.className = "detail-meta";
    [["Category",task.category],["Priority",task.priority],["Deadline",formatDate(task.deadline)],["Status",statusLabel(task.status)],["Created",new Date(task.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})]].forEach(([label,value]) => {
      const item = document.createElement("div"); const key = document.createElement("span"); key.textContent = label; const val = document.createElement("strong"); val.textContent = value; item.append(key,val); meta.append(item);
    });
    content.append(description,meta);
    $("#detailDoneButton").textContent = task.status === "completed" ? "Mark as to do" : "Mark completed";
    $("#detailModal").classList.remove("hidden"); document.body.style.overflow = "hidden";
  }
  function closeDetails() { $("#detailModal").classList.add("hidden"); document.body.style.overflow = ""; selectedDetailId = null; }
  function closeSidebar() { $("#sidebar").classList.remove("open"); $("#sidebarScrim").classList.add("hidden"); }

  // Navigation and page controls
  $$(".nav-link[data-page], .text-button[data-page]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
  $$("[data-open-modal]").forEach(button => button.addEventListener("click", () => openTaskModal()));
  $("#addTaskButton").addEventListener("click", () => openTaskModal());
  $("#topAddButton").addEventListener("click", () => openTaskModal());
  $("#taskForm").addEventListener("submit", saveTask);
  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);
  $("#taskModal").addEventListener("click", event => { if (event.target === $("#taskModal")) closeModal(); });
  $("#closeDetail").addEventListener("click", closeDetails);
  $("#detailModal").addEventListener("click", event => { if (event.target === $("#detailModal")) closeDetails(); });
  $("#detailEditButton").addEventListener("click", () => { const id = selectedDetailId; closeDetails(); openTaskModal(id); });
  $("#detailDoneButton").addEventListener("click", () => { if (selectedDetailId) { toggleTask(selectedDetailId); closeDetails(); } });
  ["searchInput","categoryFilter","priorityFilter","statusFilter","sortFilter"].forEach(id => $(`#${id}`).addEventListener("input", renderTaskList));
  $("#clearFiltersButton").addEventListener("click", () => {
    $("#searchInput").value = ""; $("#categoryFilter").value = "all"; $("#priorityFilter").value = "all"; $("#statusFilter").value = "all"; $("#sortFilter").value = "deadline"; renderTaskList();
  });
  $("#saveProfileButton").addEventListener("click", () => {
    const name = $("#nameSetting").value.trim();
    if (!name) { showToast("Display name cannot be empty.", "error"); return; }
    profile = {name}; persistProfile(); renderProfile(); showToast("Profile updated.");
  });
  $("#clearAllButton").addEventListener("click", () => {
    if (!tasks.length) { showToast("There are no tasks to delete.", "error"); return; }
    if (!window.confirm("Delete all tasks? This will permanently remove every task stored in this browser.")) return;
    tasks = []; persistTasks(); renderAll(); showToast("All tasks have been deleted.");
  });
  $("#mobileMenu").addEventListener("click", () => { $("#sidebar").classList.add("open"); $("#sidebarScrim").classList.remove("hidden"); });
  $("#sidebarScrim").addEventListener("click", closeSidebar);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeModal(); closeDetails(); closeSidebar(); }
  });

  renderAll();
})();
