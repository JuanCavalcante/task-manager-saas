const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authForm = document.getElementById("authForm");
const toggleAuthBtn = document.getElementById("toggleAuth");
const logoutBtn = document.getElementById("logoutBtn");
const boardEl = document.getElementById("board");
const taskForm = document.getElementById("taskForm");

const state = {
  token: localStorage.getItem("token") || "",
  mode: "login",
  tasks: [],
};

const columns = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

function priorityLabel(priority) {
  if (priority === "high") return "Alta";
  if (priority === "low") return "Baixa";
  return "Media";
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro na requisicao");
  }
  if (response.status === 204) return null;
  return response.json();
}

function toggleMode() {
  state.mode = state.mode === "login" ? "register" : "login";
  document.getElementById("name").style.display = state.mode === "register" ? "block" : "none";
  authForm.querySelector("button[type='submit']").textContent =
    state.mode === "register" ? "Criar conta" : "Entrar";
  toggleAuthBtn.textContent = state.mode === "register" ? "Ja tenho conta" : "Criar conta";
}

function renderBoard() {
  boardEl.innerHTML = "";
  columns.forEach((column) => {
    const col = document.createElement("article");
    col.className = "column";
    col.innerHTML = `<h3>${column.label}</h3>`;

    const tasks = state.tasks
      .filter((task) => task.status === column.key)
      .sort((a, b) => a.position - b.position);

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task";
      card.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description || "Sem descricao"}</p>
        <div class="meta">
          <span>Prioridade: ${priorityLabel(task.priority)}</span>
          <span>${task.due_date || "Sem prazo"}</span>
        </div>
        <div class="actions">
          <button data-action="advance" data-id="${task.id}">Avancar</button>
          <button class="delete" data-action="delete" data-id="${task.id}">Excluir</button>
        </div>
      `;
      col.appendChild(card);
    });

    boardEl.appendChild(col);
  });
}

async function loadBoard() {
  const data = await api("/api/boards/current");
  state.tasks = data.tasks;
  renderBoard();
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const endpoint = state.mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const payload = state.mode === "register" ? { name, email, password } : { email, password };

  try {
    const data = await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
    state.token = data.token;
    localStorage.setItem("token", state.token);
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    await loadBoard();
  } catch (error) {
    alert(error.message);
  }
});

toggleAuthBtn.addEventListener("click", toggleMode);

logoutBtn.addEventListener("click", () => {
  state.token = "";
  state.tasks = [];
  localStorage.removeItem("token");
  appSection.classList.add("hidden");
  authSection.classList.remove("hidden");
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;
  const dueDate = document.getElementById("taskDueDate").value || null;

  try {
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description, status, priority, dueDate }),
    });

    taskForm.reset();
    await loadBoard();
  } catch (error) {
    alert(error.message);
  }
});

boardEl.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = Number(target.dataset.id);
  if (!action || !id) return;

  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  try {
    if (action === "delete") {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
    }

    if (action === "advance") {
      const flow = ["todo", "in_progress", "done"];
      const nextStatus = flow[Math.min(flow.indexOf(task.status) + 1, flow.length - 1)];
      await api(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
    }

    await loadBoard();
  } catch (error) {
    alert(error.message);
  }
});

(async function bootstrap() {
  document.getElementById("name").style.display = "none";

  if (!state.token) {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    return;
  }

  try {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    await loadBoard();
  } catch (_error) {
    localStorage.removeItem("token");
    state.token = "";
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
})();
