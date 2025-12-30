const $ = (id) => document.getElementById(id);
const els = {
  f: $("f"),
  t: $("t"),
  c: $("c"),
  a: $("a"),
  todo: $("todo"),
  done: $("done"),
  emptyTodo: $("emptyTodo"),
  emptyDone: $("emptyDone"),
  avatar: $("avatar"),
  userPopover: $("userPopover"),
  meName: $("meName"),
  logoutBtn: $("logoutBtn"),
  userMenu: $("userMenu"),
};

let USERS = {};
let tasks = [];

init();

async function init() {
  const r = await fetch("/api/me");
  if (!r.ok) {
    location.href = "/login.html";
    return;
  }
  const me = await r.json();

  const initials = me.initials || initialsOf(me.name);
  els.avatar.textContent = initials;
  els.avatar.style.background = me.color || "#666";
  els.meName.textContent = me.name;

  await loadUsers();
  populateSelects();
  await safeLoadTasks();
  render();
  wireDnD();
  wireUserMenu();

  const filterUser = $("filterUser");
  filterUser.innerHTML =
    `<option value="">-- All --</option>` +
    Object.values(USERS)
      .map((u) => `<option value="${u.id}">${u.name}</option>`)
      .join("");

  filterUser.addEventListener("change", render);
}

function wireUserMenu() {
  els.avatar.addEventListener("click", () => {
    const isOpen = !els.userPopover.hidden;
    els.userPopover.hidden = isOpen;
    els.avatar.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      els.userPopover.hidden = true;
      els.avatar.setAttribute("aria-expanded", "false");
    }
  });

  els.logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      location.href = "/login.html";
    }
  });
}

async function loadUsers() {
  const r = await fetch("/api/users", { cache: "no-store" });
  USERS = Object.fromEntries((await r.json()).map((u) => [u.id, u]));
}
async function safeLoadTasks() {
  try {
    const r = await fetch("/api/tasks", { cache: "no-store" });
    tasks = r.ok ? await r.json() : [];
  } catch {
    tasks = [];
  }
}
async function saveTasks() {
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tasks),
  });
}

function populateSelects() {
  const toOpt = (u) => `<option value="${u.id}">${u.name}</option>`;
  const list = Object.values(USERS);
  els.c.innerHTML = `<option value="" disabled selected>Creator</option>` + list.map(toOpt).join("");
  els.a.innerHTML = `<option value="" disabled selected>Assigned to</option>` + list.map(toOpt).join("");
}

function uid() {
  return "t_" + Math.random().toString(36).slice(2, 9);
}
function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function userById(id) {
  return USERS[id] || { name: "—", color: "#999", initials: "—" };
}
function initialsOf(name) {
  const p = String(name).trim().split(/\s+/);
  return (p[0]?.[0] || "").toUpperCase() + (p[1]?.[0] || "").toUpperCase();
}

function makeItem(t) {
  const assignee = userById(t.assigneeId);
  const creator = userById(t.creatorId);
  const initials = creator.initials || initialsOf(creator.name);

  const assigneeColor = assignee.color || "#000";

  const div = document.createElement("div");
  div.className = "item drag";
  div.draggable = true;
  div.dataset.id = t.id;
  div.dataset.done = t.done ? "1" : "0";

  div.innerHTML = `
    <span class="title">${esc(t.title)}</span>
    <span class="meta">
      Asignado:
      <span class="assignee-name" style="color:${assigneeColor}; font-weight:600;">
        ${esc(assignee.name)}
      </span>
    </span>

    <div class="badge" title="Creator: ${esc(creator.name)}"
         style="background:${creator.color}">${esc(initials)}</div>

    <div class="actions">
      <button class="toggle" type="button">${t.done ? "Mark pending" : "Mark done"}</button>
      <button class="del" type="button">Delete</button>
    </div>
  `;
  return div;
}

function render() {
  const selectedUser = $("filterUser").value;
  let pending = tasks.filter((t) => !t.done);
  let done = tasks.filter((t) => t.done);
  if (selectedUser) {
    pending = pending.filter((t) => t.assigneeId === selectedUser);
    done = done.filter((t) => t.assigneeId === selectedUser);
  }

  els.todo.innerHTML = "";
  els.done.innerHTML = "";
  for (const t of pending) els.todo.appendChild(makeItem(t));
  for (const t of done) els.done.appendChild(makeItem(t));
  els.emptyTodo.hidden = pending.length !== 0;
  els.emptyDone.hidden = done.length !== 0;
  $("countPending").textContent = pending.length;
  $("countDone").textContent = done.length;
}

els.f.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = els.t.value.trim();
  const creatorId = els.c.value;
  const assigneeId = els.a.value;
  if (!title || !creatorId || !assigneeId) return;
  tasks.push({ id: uid(), title, creatorId, assigneeId, done: false });
  await saveTasks();
  els.f.reset();
  render();
});

function onListClick(e) {
  const item = e.target.closest(".item");
  if (!item) return;
  const id = item.dataset.id;
  if (e.target.classList.contains("del")) {
    tasks = tasks.filter((x) => x.id !== id);
    saveTasks().then(render);
    return;
  }
  if (e.target.classList.contains("toggle")) {
    const t = tasks.find((x) => x.id === id);
    if (t) {
      t.done = !t.done;
      saveTasks().then(render);
    }
  }
}
els.todo.addEventListener("click", onListClick);
els.done.addEventListener("click", onListClick);

let drag = null;
function wireDnD() {
  for (const container of [els.todo, els.done]) {
    container.addEventListener("dragstart", (e) => {
      const it = e.target.closest(".item");
      if (!it) return;
      drag = { id: it.dataset.id, from: it.dataset.done === "1" ? "done" : "todo" };
      e.dataTransfer.setData("text/plain", drag.id);
      e.dataTransfer.effectAllowed = "move";
    });
    container.addEventListener("dragover", (e) => {
      if (e.target.closest(".item") || e.currentTarget.classList.contains("list")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }
    });
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!drag) return;
      const dest = e.currentTarget.id;
      const beforeEl = e.target.closest(".item");
      const pending = tasks.filter((t) => !t.done);
      const done = tasks.filter((t) => t.done);
      const fromArr = drag.from === "done" ? done : pending;
      const toArr = dest === "done" ? done : pending;
      const idxFrom = fromArr.findIndex((t) => t.id === drag.id);
      if (idxFrom < 0) return;
      const [moved] = fromArr.splice(idxFrom, 1);
      moved.done = dest === "done";
      let insertAt = toArr.length;
      if (beforeEl) {
        const idsOrder = Array.from(e.currentTarget.children).map((el) => el.dataset.id);
        const beforeId = beforeEl.dataset.id;
        if (beforeId && idsOrder.includes(beforeId)) {
          insertAt = idsOrder.indexOf(beforeId);
        }
      }
      toArr.splice(insertAt, 0, moved);
      tasks = pending.concat(done);
      saveTasks().then(render);
      drag = null;
    });
  }
}
