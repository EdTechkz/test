/*
  ScheduleView.tsx — основной компонент для просмотра, фильтрации и экспорта расписания.
  Позволяет пользователю выбирать фильтры, экспортировать расписание, создавать новые записи.
  Используется для работы с расписанием всех групп, преподавателей, аудиторий и предметов.
*/
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchedulePreview } from "./SchedulePreview";
import { Download, Filter, Printer, Plus, Users, User, Building2, Book, ChevronDown, Bot as BotIcon, Trash2 } from "lucide-react";
import { ScheduleCreator } from "@/components/schedule/ScheduleCreator";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// FILTER_CATEGORIES — категории для фильтрации расписания
// Используются для выбора типа фильтра (группа, преподаватель, аудитория, предмет)
const FILTER_CATEGORIES = [
  { value: "group", label: "Топтар", icon: <Users size={16} className="mr-2" /> },
  { value: "teacher", label: "Оқытушылар", icon: <User size={16} className="mr-2" /> },
  { value: "room", label: "Аудиториялар", icon: <Building2 size={16} className="mr-2" /> },
  { value: "subject", label: "Пәндер", icon: <Book size={16} className="mr-2" /> },
];

// exportScheduleToCSV — экспортирует расписание в CSV-файл
function exportScheduleToCSV(schedule) {
  // Формируем заголовки и строки для CSV
  const header = ["Топ","Пән","Оқытушы","Аудитория","Күн","Басталуы","Аяқталуы"];
  const rows = schedule.map(l => [l.group, l.subject, l.teacher, l.room, l.dayOfWeek, l.timeStart, l.timeEnd]);
  // Собираем CSV-строку
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  // Создаём Blob и сохраняем файл
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "schedule.csv");
}

// exportScheduleToExcel — экспортирует расписание в Excel (xlsx)
function exportScheduleToExcel(schedule) {
  // Создаём лист и книгу Excel
  const ws = XLSX.utils.aoa_to_sheet([
    ["Топ","Пән","Оқытушы","Аудитория","Күн","Басталуы","Аяқталуы"],
    ...schedule.map(l => [l.group, l.subject, l.teacher, l.room, l.dayOfWeek, l.timeStart, l.timeEnd])
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Кесте");
  // Сохраняем файл
  XLSX.writeFile(wb, "schedule.xlsx");
}

function ScheduleChat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("scheduleChatHistory");
    return saved ? JSON.parse(saved) : [
      { sender: "bot", text: "Сәлем! Мен кесте-ботпын. Жаңа сабақ үшін команданы жазыңыз: \nМысалы: ИС-302, Математика, Иванов, 6 сағат" }
    ];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  // Для отображения кнопок после последнего сообщения бота
  const [showBotActions, setShowBotActions] = useState(false);

  // Быстрые команды
  const quickCommands = [
    { label: "Кестені тексеру", cmd: "Кестені тексеру", tip: "Жарамсыз жазбаларды көрсету" },
    { label: "Дубликаттарды тексеру", cmd: "Дубликаттарды тексеру", tip: "Қайталанатын сабақтарды көрсету" },
    { label: "Қақтығыстарды тексеру", cmd: "Қақтығыстарды тексеру", tip: "Уақыт бойынша қақтығыстарды көрсету" },
    { label: "Тарих", cmd: "Тарих", tip: "Соңғы командаларды көрсету" },
    { label: "Көмек", cmd: "Көмек", tip: "Барлық командалар тізімі" },
    { label: "Хабарлама", cmd: 'Хабарлама "Ертең сабақ болмайды!"', tip: 'Басты беттегі хабарламаны орнату. Мысалы: Хабарлама "Ертең сабақ болмайды!"' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("scheduleChatHistory", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (msg) => {
    const text = typeof msg === "string" ? msg : input;
    if (!text.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "admin", text }]);
    setInput("");
    setShowBotActions(false);
    // Отправка на сервер
    try {
      const res = await fetch("/api/schedule-bot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: "bot", text: data.reply }]);
      // Toast уведомления по ключевым словам
      if (data.reply) {
        if (data.reply.toLowerCase().includes("ошибка") || data.reply.toLowerCase().includes("қате")) {
          toast.error(data.reply);
        } else if (data.reply.toLowerCase().includes("успешно") || data.reply.toLowerCase().includes("қосылды") || data.reply.toLowerCase().includes("удалено")) {
          toast.success(data.reply);
        } else if (data.reply.toLowerCase().includes("внимание") || data.reply.toLowerCase().includes("подтвердите")) {
          toast.warning(data.reply);
        }
      }
      // Если бот предлагает действия, показываем кнопки
      if (data.reply && data.reply.includes("[Принять]") && data.reply.includes("[Отклонить]")) {
        setShowBotActions(true);
      } else {
        setShowBotActions(false);
      }
    } catch {
      setMessages((msgs) => [...msgs, { sender: "bot", text: "Кешіріңіз, техникалық ақау пайда болды. Бірнеше секундтан кейін қайталап көріңіз немесе нақты сұрақ қойыңыз. Егер қате қайталанса, әкімшіге хабарласыңыз." }]);
      toast.error("Кешіріңіз, техникалық ақау пайда болды. Бірнеше секундтан кейін қайталап көріңіз немесе нақты сұрақ қойыңыз. Егер қате қайталанса, әкімшіге хабарласыңыз.");
      setShowBotActions(false);
    }
  };

  // Очистить чат
  const clearChat = () => {
    setMessages([
      { sender: "bot", text: "Сәлем! Мен кесте-ботпын. Жаңа сабақ үшін команданы жазыңыз: \nМысалы: ИС-302, Математика, Иванов, 6 сағат" }
    ]);
    setInput("");
    setShowBotActions(false);
    toast("Чат очищен!");
  };

  return (
    <div className="border rounded-md p-4 mb-4 bg-white w-full shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-lg flex items-center gap-2"><BotIcon size={20} className="text-blue-600" /> Чат бот</div>
        <button className="text-gray-400 hover:text-red-600 transition" title="Очистить чат" onClick={clearChat}><Trash2 size={20} /></button>
      </div>
      <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded mb-2 flex flex-col gap-2" style={{ fontSize: 15 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 animate-fadein ${msg.sender === "bot" ? "justify-start" : "justify-end"}`} style={{ animationDelay: `${i * 40}ms` }}>
            {msg.sender === "bot" && <BotIcon size={28} className="text-blue-600 bg-blue-100 rounded-full p-1" />}
            <div className={`px-3 py-2 rounded-2xl shadow-sm max-w-[80%] whitespace-pre-line ${msg.sender === "bot" ? "bg-blue-100 text-blue-900" : "bg-gray-200 text-gray-800"}`}>{msg.text}</div>
            {msg.sender === "admin" && <User size={28} className="text-gray-500 bg-gray-200 rounded-full p-1" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Быстрые кнопки команд */}
      <TooltipProvider>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickCommands.map(qc => (
            <Tooltip key={qc.cmd}>
              <TooltipTrigger asChild>
                <button
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded px-3 py-1 text-sm transition"
                  onClick={() => {
                    sendMessage(qc.cmd);
                  }}
                >{qc.label}</button>
              </TooltipTrigger>
              <TooltipContent>{qc.tip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
          placeholder="Жаңа сабақ үшін команданы жазыңыз..."
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => sendMessage(input)}>Жіберу</button>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 0.4s; }
      `}</style>
    </div>
  );
}

// ScheduleView — основной компонент для просмотра и фильтрации расписания
export function ScheduleView() {
  // showScheduleCreator — флаг для отображения модального окна создания расписания
  const [showScheduleCreator, setShowScheduleCreator] = useState(false);
  // Списки всех сущностей для фильтрации
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // scheduleData — все записи расписания
  const [scheduleData, setScheduleData] = useState([]);
  // exportMenuOpen — флаг для отображения меню экспорта
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // useEffect: загрузка всех сущностей для фильтрации (группы, преподаватели, аудитории, предметы)
  useEffect(() => {
    // Функция для параллельной загрузки всех данных
    const fetchAll = () => {
      Promise.all([
        fetch("/api/groups/").then(r => r.ok ? r.json() : []),
        fetch("/api/teachers/").then(r => r.ok ? r.json() : []),
        fetch("/api/rooms/").then(r => r.ok ? r.json() : []),
        fetch("/api/subjects/").then(r => r.ok ? r.json() : []),
      ]).then(([groups, teachers, rooms, subjects]) => {
        setGroups(groups);
        setTeachers(teachers);
        setRooms(rooms);
        setSubjects(subjects);
      });
    };
    fetchAll(); // Загружаем данные при монтировании
    // WebSocket для автообновления данных при изменениях на сервере
    let ws = null;
    try {
      ws = new window.WebSocket(`ws://${window.location.host}`);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Если изменились сущности — перезагружаем списки
          if (msg.type === "update" && ["groups","teachers","rooms","subjects"].includes(msg.entity)) {
            fetchAll();
          }
        } catch {}
      };
    } catch {}
    // Очищаем WebSocket при размонтировании
    return () => { if (ws) ws.close(); };
  }, []);

  // useEffect: загрузка расписания с backend
  useEffect(() => {
    fetch("/api/schedule/")
      .then(res => res.json())
      .then(data => setScheduleData(Array.isArray(data) ? data : []));
  }, []);

  // Основной return — разметка страницы расписания
  return (
    <div className="space-y-4">
      {/* Верхняя панель с заголовком, кнопками экспорта и создания расписания */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Кесте</h1>
          <p className="text-muted-foreground">
            Ағымдағы кестені қарау және экспорттау
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Кнопка печати */}
          <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Басып шығару
          </Button>
          {/* Кнопка и меню экспорта */}
          <div className="relative">
            <Button className="flex-1 sm:flex-initial" onClick={() => setExportMenuOpen(v => !v)}>
              <Download size={16} className="mr-2" />
              Экспорт
            </Button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 z-10 bg-white border rounded shadow-lg min-w-[160px]">
                <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { exportScheduleToCSV(scheduleData); setExportMenuOpen(false); }}>Экспорт в CSV</button>
                <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { exportScheduleToExcel(scheduleData); setExportMenuOpen(false); }}>Экспорт в Excel</button>
              </div>
            )}
          </div>
          {/* Кнопка создания нового расписания */}
          <Button onClick={() => setShowScheduleCreator(true)}>
            <Plus size={16} className="mr-2" />
            Кесте құру
          </Button>
        </div>
      </div>

      {/* Карточка с фильтрами и превью расписания */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Апталық кесте</CardTitle>
          <CardDescription>
            1 семестр, 2025-2026 оқу жылы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 border rounded-md overflow-hidden">
            <SchedulePreview allowDelete />
          </div>
        </CardContent>
      </Card>
      {/* Модальное окно создания расписания */}
      {showScheduleCreator && (
        <ScheduleCreator onClose={() => setShowScheduleCreator(false)} />
      )}
      <ScheduleChat />
    </div>
  );
}
