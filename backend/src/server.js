require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const { statements, ensureDefaultBoard } = require("./db");
const { signToken, requireAuth } = require("./auth");

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || `http://localhost:${PORT}`;

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "task-manager-saas" });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ error: "Dados invalidos" });
  }

  const existing = statements.findUserByEmail.get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Email ja cadastrado" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const info = statements.createUser.run(name.trim(), email.toLowerCase(), passwordHash);
  const user = statements.findUserById.get(info.lastInsertRowid);
  ensureDefaultBoard(user.id);

  const token = signToken(user);
  return res.status(201).json({ token, user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Credenciais invalidas" });
  }

  const user = statements.findUserByEmail.get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Credenciais invalidas" });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Credenciais invalidas" });
  }

  const safeUser = statements.findUserById.get(user.id);
  const token = signToken(safeUser);
  return res.json({ token, user: safeUser });
});

app.get("/api/boards/current", requireAuth, (req, res) => {
  const board = ensureDefaultBoard(req.user.id);
  const tasks = statements.listTasksByBoard.all(board.id);
  return res.json({ board, tasks });
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const { title, description = "", status = "todo", priority = "medium", dueDate = null } = req.body || {};

  if (!title || !["todo", "in_progress", "done"].includes(status)) {
    return res.status(400).json({ error: "Dados invalidos" });
  }

  const board = ensureDefaultBoard(req.user.id);
  const max = statements.maxPositionByStatus.get(board.id, status);
  const position = Number(max.max_position) + 1;

  const info = statements.createTask.run(
    board.id,
    title.trim(),
    description?.trim() || "",
    status,
    ["low", "medium", "high"].includes(priority) ? priority : "medium",
    dueDate,
    position,
  );

  const task = statements.findTaskById.get(info.lastInsertRowid);
  return res.status(201).json({ task });
});

app.patch("/api/tasks/:id", requireAuth, (req, res) => {
  const taskId = Number(req.params.id);
  const current = statements.findTaskById.get(taskId);

  if (!current) {
    return res.status(404).json({ error: "Task nao encontrada" });
  }

  const board = ensureDefaultBoard(req.user.id);
  if (current.board_id !== board.id) {
    return res.status(403).json({ error: "Sem permissao" });
  }

  const next = {
    title: req.body.title ?? current.title,
    description: req.body.description ?? current.description,
    status: req.body.status ?? current.status,
    priority: req.body.priority ?? current.priority,
    due_date: req.body.dueDate ?? current.due_date,
    position: Number.isInteger(req.body.position) ? req.body.position : current.position,
  };

  if (!next.title || !["todo", "in_progress", "done"].includes(next.status)) {
    return res.status(400).json({ error: "Dados invalidos" });
  }

  if (!["low", "medium", "high"].includes(next.priority)) {
    next.priority = "medium";
  }

  statements.updateTask.run(
    next.title.trim(),
    next.description?.trim() || "",
    next.status,
    next.priority,
    next.due_date,
    next.position,
    taskId,
  );

  return res.json({ task: statements.findTaskById.get(taskId) });
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  const taskId = Number(req.params.id);
  const current = statements.findTaskById.get(taskId);

  if (!current) {
    return res.status(404).json({ error: "Task nao encontrada" });
  }

  const board = ensureDefaultBoard(req.user.id);
  if (current.board_id !== board.id) {
    return res.status(403).json({ error: "Sem permissao" });
  }

  statements.deleteTask.run(taskId);
  return res.status(204).send();
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
