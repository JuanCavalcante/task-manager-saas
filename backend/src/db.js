const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('todo','in_progress','done')),
  priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
  due_date TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (board_id) REFERENCES boards(id)
);
`);

const statements = {
  createUser: db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"),
  findUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  findUserById: db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?"),

  findBoardByUser: db.prepare("SELECT * FROM boards WHERE user_id = ? LIMIT 1"),
  createBoard: db.prepare("INSERT INTO boards (user_id, name) VALUES (?, ?)"),
  findBoardByIdAndUser: db.prepare("SELECT * FROM boards WHERE id = ? AND user_id = ?"),

  listTasksByBoard: db.prepare("SELECT * FROM tasks WHERE board_id = ? ORDER BY status, position, created_at"),
  maxPositionByStatus: db.prepare("SELECT COALESCE(MAX(position), -1) AS max_position FROM tasks WHERE board_id = ? AND status = ?"),
  createTask: db.prepare("INSERT INTO tasks (board_id, title, description, status, priority, due_date, position) VALUES (?, ?, ?, ?, ?, ?, ?)"),
  findTaskById: db.prepare("SELECT * FROM tasks WHERE id = ?"),
  updateTask: db.prepare("UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, position = ?, updated_at = datetime('now') WHERE id = ?"),
  deleteTask: db.prepare("DELETE FROM tasks WHERE id = ?"),
};

function ensureDefaultBoard(userId) {
  let board = statements.findBoardByUser.get(userId);
  if (!board) {
    const info = statements.createBoard.run(userId, "Meu Kanban");
    board = statements.findBoardByIdAndUser.get(info.lastInsertRowid, userId);
  }
  return board;
}

module.exports = {
  db,
  statements,
  ensureDefaultBoard,
};
