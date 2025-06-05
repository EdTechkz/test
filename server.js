/*
  server.js — основной backend-файл приложения.
  Реализует API для всех сущностей (преподаватели, группы, аудитории, предметы, расписание),
  отдаёт статику, обеспечивает работу WebSocket для мгновенного обновления данных.
  Все данные хранятся в JSON-файлах в папке data/.
*/
import fs from "fs";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import http from "http";
import fetch from "node-fetch";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const TEACHERS_FILE = path.join(DATA_DIR, "teachers.json");
const GROUPS_FILE = path.join(DATA_DIR, "groups.json");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");
const SUBJECTS_FILE = path.join(DATA_DIR, "subjects.json");
const SCHEDULE_FILE = path.join(DATA_DIR, "schedule.json");
const NOTICE_FILE = path.join(DATA_DIR, "notice.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(TEACHERS_FILE)) fs.writeFileSync(TEACHERS_FILE, "[]", "utf-8");
  if (!fs.existsSync(GROUPS_FILE)) fs.writeFileSync(GROUPS_FILE, "[]", "utf-8");
  if (!fs.existsSync(ROOMS_FILE)) fs.writeFileSync(ROOMS_FILE, "[]", "utf-8");
  if (!fs.existsSync(SUBJECTS_FILE)) fs.writeFileSync(SUBJECTS_FILE, "[]", "utf-8");
  if (!fs.existsSync(SCHEDULE_FILE)) fs.writeFileSync(SCHEDULE_FILE, "[]", "utf-8");
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

ensureDataFiles();

app.use(express.static(path.join(__dirname, "dist"), { dotfiles: "ignore" }));
app.use(express.json());

// --- WebSocket ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
function broadcastUpdate(entity) {
  const message = JSON.stringify({ type: "update", entity });
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// --- Helpers: преобразование в camelCase ---
function teacherToCamel(t) {
  return {
    id: t.id,
    fullName: t.full_name,
    specialization: t.specialization,
    experience: t.experience,
    contactInfo: t.contact_info,
  };
}
function groupToCamel(g) {
  return {
    id: g.id,
    name: g.name,
    specialization: g.specialization,
    numberOfStudents: Number(g.number_of_students) || 0,
    curator: g.curator,
  };
}
function roomToCamel(r) {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    capacity: r.capacity,
    equipment: r.equipment,
  };
}
function subjectToCamel(s) {
  return {
    id: s.id,
    name: s.name,
    hoursPerWeek: Number(s.hours_per_week) || 0,
    type: s.type,
    department: s.department,
  };
}

// --- TEACHERS CRUD ---
app.get("/api/teachers/", (req, res) => {
  const teachers = readJson(TEACHERS_FILE);
  res.json(teachers.map(teacherToCamel));
});
app.post("/api/teachers/", (req, res) => {
  const teachers = readJson(TEACHERS_FILE);
  const newTeacher = { ...req.body, id: Date.now() };
  teachers.push(newTeacher);
  writeJson(TEACHERS_FILE, teachers);
  broadcastUpdate("teachers");
  res.json(teacherToCamel(newTeacher));
});
app.put("/api/teachers/:id", (req, res) => {
  let teachers = readJson(TEACHERS_FILE);
  const id = Number(req.params.id);
  teachers = teachers.map(t => t.id === id ? { ...t, ...req.body } : t);
  writeJson(TEACHERS_FILE, teachers);
  broadcastUpdate("teachers");
  res.json(teacherToCamel(teachers.find(t => t.id === id)));
});
app.delete("/api/teachers/:id", (req, res) => {
  let teachers = readJson(TEACHERS_FILE);
  const id = Number(req.params.id);
  teachers = teachers.filter(t => t.id !== id);
  writeJson(TEACHERS_FILE, teachers);
  broadcastUpdate("teachers");
  res.json({ success: true });
});

// --- GROUPS CRUD ---
app.get("/api/groups/", (req, res) => {
  const groups = readJson(GROUPS_FILE);
  res.json(groups.map(groupToCamel));
});
app.post("/api/groups/", (req, res) => {
  const groups = readJson(GROUPS_FILE);
  const newGroup = { ...req.body, id: Date.now() };
  if (typeof req.body.numberOfStudents !== "undefined") {
    newGroup.number_of_students = Number(req.body.numberOfStudents);
    delete newGroup.numberOfStudents;
  }
  groups.push(newGroup);
  writeJson(GROUPS_FILE, groups);
  broadcastUpdate("groups");
  res.json(groupToCamel(newGroup));
});
app.put("/api/groups/:id", (req, res) => {
  let groups = readJson(GROUPS_FILE);
  const id = Number(req.params.id);
  groups = groups.map(g => {
    if (g.id === id) {
      const updated = { ...g, ...req.body };
      if (typeof req.body.numberOfStudents !== "undefined") {
        updated.number_of_students = Number(req.body.numberOfStudents);
        delete updated.numberOfStudents;
      }
      return updated;
    }
    return g;
  });
  writeJson(GROUPS_FILE, groups);
  broadcastUpdate("groups");
  res.json(groupToCamel(groups.find(g => g.id === id)));
});
app.delete("/api/groups/:id", (req, res) => {
  let groups = readJson(GROUPS_FILE);
  const id = Number(req.params.id);
  groups = groups.filter(g => g.id !== id);
  writeJson(GROUPS_FILE, groups);
  broadcastUpdate("groups");
  res.json({ success: true });
});

// --- ROOMS CRUD ---
app.get("/api/rooms/", (req, res) => {
  const rooms = readJson(ROOMS_FILE);
  res.json(rooms.map(roomToCamel));
});
app.post("/api/rooms/", (req, res) => {
  const rooms = readJson(ROOMS_FILE);
  const newRoom = { ...req.body, id: Date.now() };
  rooms.push(newRoom);
  writeJson(ROOMS_FILE, rooms);
  broadcastUpdate("rooms");
  res.json(roomToCamel(newRoom));
});
app.put("/api/rooms/:id", (req, res) => {
  let rooms = readJson(ROOMS_FILE);
  const id = Number(req.params.id);
  rooms = rooms.map(r => r.id === id ? { ...r, ...req.body } : r);
  writeJson(ROOMS_FILE, rooms);
  broadcastUpdate("rooms");
  res.json(roomToCamel(rooms.find(r => r.id === id)));
});
app.delete("/api/rooms/:id", (req, res) => {
  let rooms = readJson(ROOMS_FILE);
  const id = Number(req.params.id);
  rooms = rooms.filter(r => r.id !== id);
  writeJson(ROOMS_FILE, rooms);
  broadcastUpdate("rooms");
  res.json({ success: true });
});

// --- SUBJECTS CRUD ---
app.get("/api/subjects/", (req, res) => {
  const subjects = readJson(SUBJECTS_FILE);
  res.json(subjects.map(subjectToCamel));
});
app.post("/api/subjects/", (req, res) => {
  const subjects = readJson(SUBJECTS_FILE);
  const newSubject = { ...req.body, id: Date.now() };
  if (typeof req.body.hoursPerWeek !== "undefined") {
    newSubject.hours_per_week = Number(req.body.hoursPerWeek);
    delete newSubject.hoursPerWeek;
  }
  subjects.push(newSubject);
  writeJson(SUBJECTS_FILE, subjects);
  broadcastUpdate("subjects");
  res.json(subjectToCamel(newSubject));
});
app.put("/api/subjects/:id", (req, res) => {
  let subjects = readJson(SUBJECTS_FILE);
  const id = Number(req.params.id);
  subjects = subjects.map(s => {
    if (s.id === id) {
      const updated = { ...s, ...req.body };
      if (typeof req.body.hoursPerWeek !== "undefined") {
        updated.hours_per_week = Number(req.body.hoursPerWeek);
        delete updated.hoursPerWeek;
      }
      return updated;
    }
    return s;
  });
  writeJson(SUBJECTS_FILE, subjects);
  broadcastUpdate("subjects");
  res.json(subjectToCamel(subjects.find(s => s.id === id)));
});
app.delete("/api/subjects/:id", (req, res) => {
  let subjects = readJson(SUBJECTS_FILE);
  const id = Number(req.params.id);
  subjects = subjects.filter(s => s.id !== id);
  writeJson(SUBJECTS_FILE, subjects);
  broadcastUpdate("subjects");
  res.json({ success: true });
});

// --- SCHEDULE CRUD ---
app.get("/api/schedule/", (req, res) => {
  const schedule = readJson(SCHEDULE_FILE);
  res.json(schedule);
});
app.post("/api/schedule/", (req, res) => {
  const schedule = readJson(SCHEDULE_FILE);
  const newLesson = { ...req.body, id: Date.now() };
  schedule.push(newLesson);
  writeJson(SCHEDULE_FILE, schedule);
  broadcastUpdate("schedule");
  res.json(newLesson);
});
app.put("/api/schedule/:id", (req, res) => {
  let schedule = readJson(SCHEDULE_FILE);
  const id = Number(req.params.id);
  schedule = schedule.map(l => l.id === id ? { ...l, ...req.body } : l);
  writeJson(SCHEDULE_FILE, schedule);
  broadcastUpdate("schedule");
  res.json(schedule.find(l => l.id === id));
});
app.delete("/api/schedule/:id", (req, res) => {
  let schedule = readJson(SCHEDULE_FILE);
  const id = Number(req.params.id);
  schedule = schedule.filter(l => l.id !== id);
  writeJson(SCHEDULE_FILE, schedule);
  broadcastUpdate("schedule");
  res.json({ success: true });
});

// --- SCHEDULE BOT ENDPOINT ---
// Храним последнее предложение в памяти (на время работы процесса)
let lastBotProposal = null;
let actionHistory = [];

// --- История команд (в памяти)
let lastCommands = [];
let pendingAction = null;

async function askOllama(prompt) {
  try {
    // Таймаут 20 секунд для запроса к Ollama
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // или ваша модель
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (data.response) return data.response;
    if (data.message) return data.message;
    return '[Ollama: пустой ответ]';
  } catch (e) {
    if (e.name === 'AbortError') {
      return '[Ошибка: LLM не ответил вовремя]';
    }
    return '[Ошибка Ollama: ' + (e.message || e) + ']';
  }
}

app.post("/api/schedule-bot/message", async (req, res) => {
  const { text } = req.body;
  try {
    const llmReply = await askOllama(text);
    // Если Ollama вернул пустой ответ, даём fallback
    if (!llmReply || llmReply.trim() === '') {
      return res.json({ reply: '[ИИ не дал ответа. Попробуйте переформулировать вопрос.]' });
    }
    return res.json({ reply: llmReply });
  } catch (e) {
    return res.json({ reply: '[Ошибка сервера: ' + (e.message || e) + ']' });
  }
});

// Мысал API endpoint
app.get("/api/data", (req, res) => {
  res.json({ message: "Бэктен сәлем!" });
});

// Endpoint для получения уведомления
app.get("/api/notice", (req, res) => {
  try {
    if (fs.existsSync(NOTICE_FILE)) {
      const data = JSON.parse(fs.readFileSync(NOTICE_FILE, "utf-8"));
      return res.json({ notice: data.notice || null });
    }
    return res.json({ notice: null });
  } catch {
    return res.json({ notice: null });
  }
});

// Для всех остальных роутов — index.html (SPA)
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 