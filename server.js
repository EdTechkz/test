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

app.post("/api/schedule-bot/message", (req, res) => {
  const { text } = req.body;
  const cleanText = text.trim().toLowerCase();

  // --- Приветствие ---
  if (["сәлем", "салем", "привет", "hi", "hello", "сәлеметсіз бе"].includes(cleanText)) {
    const greetings = [
      "Сәлем! Мен кесте-ботпын. Сабақ кестесіне көмектесемін!",
      "Сәлеметсіз бе! Кесте бойынша сұрағыңыз бар ма?",
      "Сәлем! Сабақ қосу үшін топ, пән, оқытушы және сағатты жазыңыз."
    ];
    return res.json({ reply: greetings[Math.floor(Math.random() * greetings.length)] });
  }

  // --- Установка уведомления через бота ---
  if (text.trim().startsWith("Хабарлама")) {
    const match = text.match(/Хабарлама\s+"([^"]+)"/);
    if (match && match[1]) {
      fs.writeFileSync(NOTICE_FILE, JSON.stringify({ notice: match[1] }, null, 2), "utf-8");
      broadcastUpdate("notice");
      return res.json({ reply: `Хабарлама жаңартылды!\n\n📢 ${match[1]}` });
    } else {
      return res.json({ reply: "Қате! Формат: Хабарлама \"Мәтін\"" });
    }
  }

  // --- Обработка ошибок как у ИИ ---
  function handleServerError(e) {
    console.error("Bot error:", e);
    return res.json({ reply: "Кешіріңіз, менде техникалық ақау пайда болды. Бірнеше секундтан кейін қайталап көріңіз немесе нақты сұрақ қойыңыз. Егер қате қайталанса, әкімшіге хабарласыңыз." });
  }

  try {
    // --- Сокращённые команды ---
    const aliases = {
      "/help": "помощь",
      "/check": "проверить расписание",
      "/delbad": "удалить невалидные записи",
      "/dups": "проверить дубли",
      "/conflicts": "проверить конфликты",
      "/faq": "faq",
      "/history": "история",
      "/clear": "очистить чат",
      "/undo": "болдырмау",
      "/edit": "өзгерту"
    };
    const command = aliases[cleanText] || cleanText;

    // --- Очистить чат (frontend должен обработать, но бот может подтвердить) ---
    if (command === "очистить чат") {
      return res.json({ reply: "Чат тазаланды!" });
    }

    // --- История команд ---
    if (command === "история") {
      if (lastCommands.length === 0) return res.json({ reply: "Тарих бос." });
      const phrases = [
        "Соңғы командалар:",
        "Міне, соңғы әрекеттеріңіз:",
        "Тарихыңыздан үзінді:"
      ];
      return res.json({ reply: `${phrases[Math.floor(Math.random() * phrases.length)]}\n${lastCommands.slice(-5).reverse().join("\n")}` });
    }

    // --- FAQ ---
    if (command === "faq") {
      const faqs = [
        "Жиі қойылатын сұрақтар:",
        "Көмек керек пе? Міне, бірнеше мысал:",
        "Төменде жиі сұралатын сұрақтар:"
      ];
      return res.json({ reply: `\n${faqs[Math.floor(Math.random() * faqs.length)]}\n\n- Сабақты қалай қосамын?\n  Жай ғана жазыңыз: Топ, Пән, Оқытушы, N сағат\n- Қателерді қалай тексеремін?\n  Команда: Кестені тексеру\n- Жарамсыз жазбаларды қалай өшіремін?\n  Команда: Жарамсыз жазбаларды өшіру\n- Кестені қалай экспорттаймын?\n  Экспорт батырмасын немесе /export schedule командасын қолданыңыз (жақында іске асады)\n` });
    }

    // --- Повтор последней команды ---
    if (command === "повторить" && lastCommands.length > 0) {
      req.body.text = lastCommands[lastCommands.length - 1];
      // рекурсивно вызвать обработку
      return app._router.handle(req, res, () => {});
    }

    // --- Подтверждение опасных действий ---
    if (pendingAction && (command === "да" || command === "подтвердить" || command === "иә")) {
      if (pendingAction === "удалить невалидные записи") {
        pendingAction = null;
        // выполнить удаление
        const schedule = readJson(SCHEDULE_FILE);
        const groups = readJson(GROUPS_FILE);
        const teachers = readJson(TEACHERS_FILE);
        const subjects = readJson(SUBJECTS_FILE);
        const rooms = readJson(ROOMS_FILE);
        const groupNames = new Set(groups.map(g => g.name));
        const teacherNames = new Set(teachers.map(t => t.full_name || t.fullName));
        const subjectNames = new Set(subjects.map(s => s.name));
        const roomNumbers = new Set(rooms.map(r => r.number));
        const valid = schedule.filter(l =>
          groupNames.has(l.group) &&
          teacherNames.has(l.teacher) &&
          subjectNames.has(l.subject) &&
          roomNumbers.has(l.room)
        );
        const removed = schedule.length - valid.length;
        writeJson(SCHEDULE_FILE, valid);
        broadcastUpdate("schedule");
        const phrases = [
          `Жарамсыз жазбалар өшірілді: ${removed}`,
          `Барлық жарамсыз жазбалар сәтті өшірілді! (${removed})`,
          `Тазалау аяқталды. Өшірілген жазбалар саны: ${removed}`
        ];
        return res.json({ reply: phrases[Math.floor(Math.random() * phrases.length)] });
      }
    }
    if (command === "удалить невалидные записи") {
      pendingAction = "удалить невалидные записи";
      const confirms = [
        "Барлық жарамсыз жазбаларды өшіргіңіз келе ме? Растау үшін 'иә' деп жазыңыз.",
        "Жарамсыз жазбаларды өшіруді растайсыз ба? 'иә' деп жауап беріңіз.",
        "Бұл әрекет барлық жарамсыз жазбаларды өшіреді. Растау үшін 'иә' деп жазыңыз."
      ];
      return res.json({ reply: confirms[Math.floor(Math.random() * confirms.length)] });
    }

    // --- Добавить команду в историю (кроме подтверждений и повторов) ---
    if (!["да", "подтвердить", "повторить"].includes(command)) {
      lastCommands.push(text.trim());
      if (lastCommands.length > 10) lastCommands = lastCommands.slice(-10);
    }

    // --- Болдырмау (отмена последнего действия) ---
    if (command === "болдырмау") {
      if (actionHistory.length > 0) {
        const last = actionHistory.pop();
        if (last.type === "add" && last.lesson) {
          // Удалить последнее добавленное занятие
          let schedule = readJson(SCHEDULE_FILE);
          schedule = schedule.filter(l => l.id !== last.lesson.id);
          writeJson(SCHEDULE_FILE, schedule);
          broadcastUpdate("schedule");
          return res.json({ reply: "Соңғы қосылған сабақ өшірілді. Көмек керек болса, 'Көмек' деп жазыңыз." });
        }
        // Можно добавить другие типы действий (edit, delete)
        return res.json({ reply: "Соңғы әрекет болдырылды. Тағы не істей аламын?" });
      } else {
        return res.json({ reply: "Болдырылатын әрекет жоқ. Басқа сұрағыңыз бар ма?" });
      }
    }

    // --- Өзгерту (редактирование предложения) ---
    if (command.startsWith("өзгерту")) {
      if (!lastBotProposal || !lastBotProposal.lesson) {
        return res.json({ reply: "Өзгертуге ұсыныс жоқ. Алдымен сабақ құрыңыз немесе сұраныс жіберіңіз." });
      }
      // Пример: "өзгерту күн сейсенбі"
      const parts = text.trim().split(/\s+/);
      if (parts.length < 3) {
        return res.json({ reply: "Нені өзгерткіңіз келеді? Мысалы: 'Өзгерту күн сәрсенбі' немесе 'Өзгерту уақыт 12:00-14:00'" });
      }
      const field = parts[1];
      const value = parts.slice(2).join(" ");
      let updated = { ...lastBotProposal.lesson };
      if (field === "күн") updated.dayOfWeek = value;
      else if (field === "уақыт") {
        const [start, end] = value.split("-");
        updated.timeStart = start.trim();
        updated.timeEnd = end.trim();
      } else if (field === "аудитория") updated.room = value;
      else if (field === "оқытушы") updated.teacher = value;
      else if (field === "пән") updated.subject = value;
      else if (field === "топ") updated.group = value;
      else return res.json({ reply: "Белгісіз өріс. Өзгертуге болады: күн, уақыт, аудитория, оқытушы, пән, топ." });
      lastBotProposal.lesson = updated;
      return res.json({ reply: `Ұсыныс жаңартылды:\n${JSON.stringify(updated, null, 2)}\n[Қабылдау] [Бас тарту] [Өзгерту]` });
    }

    // --- Если команда не распознана, попытаться понять свободный текст ---
    const known = [
      "помощь", "проверить расписание", "удалить невалидные записи", "проверить дубли", "проверить конфликты", "faq", "история", "очистить чат", "повторить", "болдырмау", "өзгерту"
    ];
    if (
      !known.includes(command) &&
      !command.match(/([\w\-]+),\s*([\w\s]+),\s*([\w\s]+),\s*(\d+)\s*сағат/)
    ) {
      // Попробовать извлечь параметры из свободного текста
      const groups = readJson(GROUPS_FILE);
      const teachers = readJson(TEACHERS_FILE);
      const subjects = readJson(SUBJECTS_FILE);
      const rooms = readJson(ROOMS_FILE);
      let group = groups.find(g => text.includes(g.name));
      let subject = subjects.find(s => text.includes(s.name));
      let teacher = teachers.find(t => text.includes(t.full_name || t.fullName));
      let hoursMatch = text.match(/(\d+)\s*сағат/);
      let hours = hoursMatch ? hoursMatch[1] : null;
      let missing = [];
      if (!group) missing.push("топ");
      if (!subject) missing.push("пән");
      if (!teacher) missing.push("оқытушы");
      if (!hours) missing.push("сағат");
      if (missing.length > 0) {
        let ask = "";
        if (missing.includes("топ")) ask += "Қай топқа сабақ қосуды қалайсыз? ";
        if (missing.includes("пән")) ask += "Қай пән? ";
        if (missing.includes("оқытушы")) ask += "Қай оқытушы? ";
        if (missing.includes("сағат")) ask += "Сабақтың ұзақтығы (сағат)? ";
        ask = ask.trim();
        if (!ask) ask = "Толығырақ ақпарат беріңізші. Мысалы: ИС-302, Математика, Иванов, 6 сағат";
        return res.json({ reply: ask });
      } else {
        // Все параметры есть — сгенерировать предложение
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        const slots = ["10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00"];
        let reply = `Топ: ${group.name}\nПән: ${subject.name}\nОқытушы: ${teacher.full_name || teacher.fullName}\nАптасына: ${hours} сағат\n`;
        reply += "\nҰсынылған кесте:\n";
        const lessons = [];
        for (let i = 0; i < Number(hours); i += 2) {
          const day = days[i/2 % days.length];
          const slot = slots[i/2 % slots.length];
          reply += `- ${day} ${slot}\n`;
          lessons.push({ group: group.name, subject: subject.name, teacher: teacher.full_name || teacher.fullName, dayOfWeek: day, timeStart: slot.split("-")[0], timeEnd: slot.split("-")[1], room: "?" });
        }
        lastBotProposal = { lesson: lessons[0] };
        reply += "\n[Қабылдау] [Бас тарту] [Өзгерту]";
        return res.json({ reply });
      }
    }

    // --- Помощь ---
    if (command === "помощь") {
      const helps = [
        "Қол жетімді командалар:",
        "Мен келесі командаларды түсінемін:",
        "Міне, қолжетімді функциялар:"
      ];
      return res.json({ reply: `${helps[Math.floor(Math.random() * helps.length)]}\n\n- Кестені тексеру — жарамсыз жазбаларды табу\n- Жарамсыз жазбаларды өшіру — барлық жарамсыз жазбаларды өшіру\n- Дубликаттарды тексеру — қайталанатын сабақтарды табу\n- Қақтығыстарды тексеру — уақыт бойынша қақтығыстарды табу\n- Хабарлама \"Мәтін\" — басты беттегі хабарламаны орнатады. Мысалы: Хабарлама \"Ертең сабақ болмайды!\"\n- Көмек — командалар тізімі` });
    }
    // --- Проверить дубли ---
    if (command === "проверить дубли") {
      const schedule = readJson(SCHEDULE_FILE);
      const seen = new Set();
      const dups = [];
      schedule.forEach((l, idx) => {
        const key = `${l.group}|${l.subject}|${l.teacher}|${l.dayOfWeek}|${l.timeStart}|${l.timeEnd}|${l.room}`;
        if (seen.has(key)) {
          dups.push(`Қайталанатын жазба: ${l.group}, ${l.subject}, ${l.teacher}, ${l.dayOfWeek}, ${l.timeStart}-${l.timeEnd}, ${l.room}`);
        } else {
          seen.add(key);
        }
      });
      if (dups.length === 0) {
        const noDups = [
          "Қайталанатын жазбалар табылмады!",
          "Дубликаттар жоқ!",
          "Барлығы жақсы, қайталанатын сабақтар жоқ."
        ];
        return res.json({ reply: noDups[Math.floor(Math.random() * noDups.length)] });
      } else {
        return res.json({ reply: `Табылған қайталанатын жазбалар:\n${dups.join("\n")}` });
      }
    }
    // --- Проверить конфликты ---
    if (command === "проверить конфликты") {
      const schedule = readJson(SCHEDULE_FILE);
      const conflicts = [];
      // Проверка по группе, преподавателю, аудитории
      for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
          const a = schedule[i], b = schedule[j];
          if (a.dayOfWeek === b.dayOfWeek && a.timeStart === b.timeStart && a.timeEnd === b.timeEnd) {
            if (a.group === b.group) conflicts.push(`Топ ${a.group} үшін қақтығыс: ${a.dayOfWeek} ${a.timeStart}-${a.timeEnd}`);
            if (a.teacher === b.teacher) conflicts.push(`Оқытушы ${a.teacher} үшін қақтығыс: ${a.dayOfWeek} ${a.timeStart}-${a.timeEnd}`);
            if (a.room === b.room) conflicts.push(`Аудитория ${a.room} үшін қақтығыс: ${a.dayOfWeek} ${a.timeStart}-${a.timeEnd}`);
          }
        }
      }
      if (conflicts.length === 0) {
        const noConf = [
          "Қақтығыстар табылмады!",
          "Барлығы жақсы, қақтығыстар жоқ.",
          "Кестеде қақтығыстар анықталмады."
        ];
        return res.json({ reply: noConf[Math.floor(Math.random() * noConf.length)] });
      } else {
        return res.json({ reply: `Табылған қақтығыстар:\n${[...new Set(conflicts)].join("\n")}` });
      }
    }
    // Проверка расписания на невалидные записи
    if (command === "проверить расписание") {
      const schedule = readJson(SCHEDULE_FILE);
      const groups = readJson(GROUPS_FILE);
      const teachers = readJson(TEACHERS_FILE);
      const subjects = readJson(SUBJECTS_FILE);
      const rooms = readJson(ROOMS_FILE);
      const groupNames = new Set(groups.map(g => g.name));
      const teacherNames = new Set(teachers.map(t => t.full_name || t.fullName));
      const subjectNames = new Set(subjects.map(s => s.name));
      const roomNumbers = new Set(rooms.map(r => r.number));
      let errors = [];
      schedule.forEach((l, idx) => {
        let err = [];
        if (l.group && !groupNames.has(l.group)) err.push(`топ '${l.group}'`);
        if (l.teacher && !teacherNames.has(l.teacher)) err.push(`оқытушы '${l.teacher}'`);
        if (l.subject && !subjectNames.has(l.subject)) err.push(`пән '${l.subject}'`);
        if (l.room && !roomNumbers.has(l.room)) err.push(`аудитория '${l.room}'`);
        if (err.length) {
          errors.push(`Жазба #${idx + 1}: ${err.join(", ")} анықталмады.`);
        }
      });
      if (errors.length === 0) {
        const ok = [
          "Барлық кесте жазбалары жарамды!",
          "Кестеде қателер жоқ, бәрі дұрыс.",
          "Кесте толықтай дұрыс!"
        ];
        return res.json({ reply: ok[Math.floor(Math.random() * ok.length)] });
      } else {
        return res.json({ reply: `Кестеде қателер табылды:\n${errors.join("\n")}` });
      }
    }
    // Если пользователь отправил команду "принять"
    if (command === "принять" || command === "қабылдау") {
      if (lastBotProposal && lastBotProposal.lesson) {
        // Добавляем в расписание
        const schedule = readJson(SCHEDULE_FILE);
        const newLesson = { ...lastBotProposal.lesson, id: Date.now() };
        schedule.push(newLesson);
        writeJson(SCHEDULE_FILE, schedule);
        broadcastUpdate("schedule");
        actionHistory.push({ type: "add", lesson: newLesson });
        lastBotProposal = null;
        const accepts = [
          "Сабақ кестеге қосылды! Жаңа команданы жазыңыз.",
          "Сабақ сәтті қосылды! Тағы не көмектесе аламын?",
          "Сабақ енгізілді. Кестені көру үшін 'Кестені тексеру' деп жазыңыз."
        ];
        return res.json({ reply: accepts[Math.floor(Math.random() * accepts.length)] });
      } else {
        return res.json({ reply: "Қосатын ұсыныс жоқ. Алдымен команданы жазыңыз." });
      }
    }
    // Если пользователь отправил команду "Отклонить"
    if (command === "отклонить" || command === "бас тарту") {
      lastBotProposal = null;
      const declines = [
        "Ұсыныс жойылды. Жаңа команданы жазыңыз.",
        "Сабақ қосу ұсынысы жойылды.",
        "Ұсыныс өшірілді. Тағы не көмектесе аламын?"
      ];
      return res.json({ reply: declines[Math.floor(Math.random() * declines.length)] });
    }
    // Примитивный парсер: ИС-302, Математика, Иванов, 6 сағат
    const match = command.match(/([\w\-]+),\s*([\w\s]+),\s*([\w\s]+),\s*(\d+)\s*сағат/);
    if (!match) {
      const unknowns = [
        "Формат қате! Мысалы: ИС-302, Ағылшын тілі, Искакова Нургүл, 6 сағат",
        "Түсініксіз сұраныс. Мысалы: ИС-302, Математика, Иванов, 6 сағат",
        "Қате формат. Мысал: ИС-302, Математика, Иванов, 6 сағат"
      ];
      return res.json({ reply: unknowns[Math.floor(Math.random() * unknowns.length)] });
    }
    const [_, group, subject, teacher, hours] = match;
    // Проверка наличия группы, предмета, преподавателя в справочниках
    const groups = readJson(GROUPS_FILE);
    const teachers = readJson(TEACHERS_FILE);
    const subjects = readJson(SUBJECTS_FILE);
    const groupExists = groups.some(g => g.name === group);
    const teacherExists = teachers.some(t => t.full_name === teacher || t.fullName === teacher);
    const subjectExists = subjects.some(s => s.name === subject);
    let errorMsg = "";
    if (!groupExists) errorMsg += `Топ '${group}' табылмады!\n`;
    if (!subjectExists) errorMsg += `Пән '${subject}' табылмады!\n`;
    if (!teacherExists) errorMsg += `Оқытушы '${teacher}' табылмады!\n`;
    if (errorMsg) {
      return res.json({ reply: `Қате!\n${errorMsg}` });
    }
    // Пример генерации расписания (равномерно по дням)
    const days = ["дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма"];
    const slots = ["10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00"];
    let reply = `Топ: ${group}\nПән: ${subject}\nОқытушы: ${teacher}\nАптасына: ${hours} сағат\n`;
    reply += "\nҰсынылған кесте:\n";
    const lessons = [];
    for (let i = 0; i < Number(hours); i += 2) {
      const day = days[i/2 % days.length];
      const slot = slots[i/2 % slots.length];
      reply += `- ${day} ${slot}\n`;
      // Сохраняем предложение для добавления
      lessons.push({ group, subject, teacher, dayOfWeek: day, timeStart: slot.split("-")[0], timeEnd: slot.split("-")[1], room: "?" });
    }
    // Для MVP — только первое занятие добавляем по кнопке "Қабылдау"
    lastBotProposal = { lesson: lessons[0] };
    reply += "\n[Қабылдау] [Бас тарту] [Өзгерту]";
    res.json({ reply });
  } catch (e) {
    return handleServerError(e);
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