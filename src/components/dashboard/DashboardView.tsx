/*
  DashboardView.tsx — компонент главной панели управления (дашборд).
  Отвечает за отображение сводной информации, фильтров, экспорта, а также превью расписания и уведомлений.
  Используется как стартовая страница для пользователя.
*/
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchedulePreview } from "@/components/schedule/SchedulePreview";
import { Calendar, Clock, Users, GraduationCap, Download, Filter, Printer, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getDashboardStats, getSchedulePreview, getUpcomingLessons, getNotifications } from "@/services/dashboardService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

function StudentNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    const fetchNotice = () => {
      fetch("/api/notice")
        .then(r => r.ok ? r.json() : { notice: null })
        .then(data => setNotice(data.notice || null))
        .catch(() => setNotice(null));
    };
    fetchNotice();
    let ws: WebSocket | null = null;
    try {
      ws = new window.WebSocket(`ws://${window.location.host}`);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "update" && msg.entity === "notice") {
            fetchNotice();
          }
        } catch {}
      };
    } catch {}
    return () => { if (ws) ws.close(); };
  }, []);
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2 flex items-center gap-2">
      <Info size={18} className="text-blue-500" />
      <span>{notice || "📢 Сабақтарда өзгерістер болуы мүмкін. Өз тобыңыздың кестесін үнемі тексеріп отырыңыз!"}</span>
    </div>
  );
}

export function DashboardView() {
  const [stats, setStats] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("group");
  const [filterValue, setFilterValue] = useState("");
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Загрузка актуальных данных для фильтров
  useEffect(() => {
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
    fetchAll();
    // WebSocket для автообновления
    let ws = null;
    try {
      ws = new window.WebSocket(`ws://${window.location.host}`);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "update" && ["groups","teachers","rooms","subjects"].includes(msg.entity)) {
            fetchAll();
          }
        } catch {}
      };
    } catch {}
    return () => { if (ws) ws.close(); };
  }, []);

  // Категории фильтра
  const FILTER_CATEGORIES = [
    { value: "all", label: "Барлығы" },
    { value: "group", label: "Топтар" },
    { value: "teacher", label: "Оқытушылар" },
    { value: "room", label: "Аудиториялар" },
    { value: "subject", label: "Пәндер" },
  ];

  // Определяем значения для второго фильтра
  const filterOptions = useMemo(() => {
    if (filterType === "group") return groups.map(g => g.name);
    if (filterType === "teacher") return teachers.map(t => t.fullName);
    if (filterType === "room") return rooms.map(r => r.number);
    if (filterType === "subject") return subjects.map(s => s.name);
    return [];
  }, [filterType, groups, teachers, rooms, subjects]);

  useEffect(() => {
    setStats(getDashboardStats());
    setSchedule(getSchedulePreview());
    setUpcomingLessons(getUpcomingLessons());
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    fetch("/api/schedule/")
      .then(res => res.json())
      .then(data => setScheduleData(Array.isArray(data) ? data : []));
  }, []);

  const currentDate = new Date().toLocaleDateString('kk-KZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  function exportScheduleToCSV(schedule, filterType, filterValue) {
    const filtered = schedule.filter(lesson => {
      if (!filterType || filterType === "all" || !filterValue) return true;
      return lesson[filterType] === filterValue;
    });
    const header = ["Топ","Пән","Оқытушы","Аудитория","Күн","Басталуы","Аяқталуы"];
    const rows = filtered.map(l => [l.group, l.subject, l.teacher, l.room, l.dayOfWeek, l.timeStart, l.timeEnd]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "schedule.csv");
  }

  function exportScheduleToExcel(schedule, filterType, filterValue) {
    const filtered = schedule.filter(lesson => {
      if (!filterType || filterType === "all" || !filterValue) return true;
      return lesson[filterType] === filterValue;
    });
    const header = ["Топ","Пән","Оқытушы","Аудитория","Күн","Басталуы","Аяқталуы"];
    const rows = filtered.map(l => [l.group, l.subject, l.teacher, l.room, l.dayOfWeek, l.timeStart, l.timeEnd]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Кесте");
    XLSX.writeFile(wb, "schedule.xlsx");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Басты бет</h1>
          <p className="text-muted-foreground mb-4">Колледжтің кестесін басқару жүйесіне қош келдіңіз!</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <Select value={filterType} onValueChange={v => { setFilterType(v); setFilterValue(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Кесте түрі" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterType !== "all" && (
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger>
                <SelectValue placeholder={
                  filterType === "group" ? "Топты таңдау" :
                  filterType === "teacher" ? "Оқытушыны таңдау" :
                  filterType === "room" ? "Аудиторияны таңдау" :
                  filterType === "subject" ? "Пәнді таңдау" : "Таңдау"
                } />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Басып шығару
          </Button>
          <div className="relative">
            <Button className="flex-1 sm:flex-initial" onClick={() => setExportMenuOpen(v => !v)}>
              <Download size={16} className="mr-2" />
              Экспорт
            </Button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 z-10 bg-white border rounded shadow-lg min-w-[160px]">
                <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { exportScheduleToCSV(scheduleData, filterType, filterValue); setExportMenuOpen(false); }}>Экспорт в CSV</button>
                <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { exportScheduleToExcel(scheduleData, filterType, filterValue); setExportMenuOpen(false); }}>Экспорт в Excel</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <StudentNotice />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Апталық кесте
          </CardTitle>
          <CardDescription>
            Барлық топтарға арналған өзекті сабақ кестесі
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <SchedulePreview filterType={filterType === "all" ? undefined : filterType} filterValue={filterValue} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
