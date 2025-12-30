import express from "express";
import fs from "fs/promises";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "supersecret"));

const DATA_DIR = process.env.DATA_DIR || "./data";
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, "[]");
  }
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]");
  }
}
await ensureFiles();

function requireAuth(req, res, next) {
  const uid = req.signedCookies?.uid;
  if (!uid) return res.status(401).json({ error: "Not authenticated" });
  req.uid = uid;
  next();
}

app.get("/", (req, res, next) => {
  const uid = req.signedCookies?.uid;
  if (!uid) return res.redirect("/login.html");
  next();
});

app.use(express.static("public"));

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Credentials are missing" });

  const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
  const u = users.find((x) => x.username === username);
  if (!u || u.password !== password) return res.status(401).json({ error: "Invalid user or password" });

  res.cookie("uid", u.id, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("uid");
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
  const me = users.find((x) => x.id === req.uid);
  if (!me) return res.status(401).json({ error: "Not authenticated" });
  const { password, ...safe } = me;
  res.json(safe);
});

app.get("/api/users", async (_req, res) => {
  const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
  res.json(users.map(({ password, ...rest }) => rest));
});

app.get("/api/tasks", requireAuth, async (_req, res) => {
  const tasks = JSON.parse(await fs.readFile(TASKS_FILE, "utf8"));
  res.json(tasks);
});

app.post("/api/tasks", requireAuth, async (req, res) => {
  const tasks = req.body;
  if (!Array.isArray(tasks)) return res.status(400).json({ error: "Invalid format" });
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  res.json({ ok: true });
});

app.post("/api/create-user", async (req, res) => {
  const { username, password, name, color, initials } = req.body || {};
  const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));

  if (
    users.some((u) => (u.username || "").toLowerCase() === username) ||
    users.some((u) => (u.name || "").toLowerCase() === name) ||
    users.some((u) => (u.color || "").toLowerCase() === color)
  ) {
    return res.status(409).json({ error: "User alredy exists." });
  }

  const id = "u_" + Math.random().toString(36).slice(2, 9);
  users.push({ id, username, name, color, initials, password });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ ok: true });
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
