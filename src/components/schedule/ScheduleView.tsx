import { useState, useEffect } from "react";
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
import { Download, Filter, Printer, Plus, Users, User, Building2, Book, ChevronDown } from "lucide-react";
import { ScheduleCreator } from "@/components/schedule/ScheduleCreator";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const FILTER_CATEGORIES = [
  { value: "group", label: "Группы", icon: <Users size={16} className="mr-2" /> },
  { value: "teacher", label: "Преподаватели", icon: <User size={16} className="mr-2" /> },
  { value: "room", label: "Аудитории", icon: <Building2 size={16} className="mr-2" /> },
  { value: "subject", label: "Предметы", icon: <Book size={16} className="mr-2" /> },
];

function exportScheduleToCSV(schedule, filterType, filterValue) {
  const filtered = schedule.filter(lesson => {
    if (!filterType || !filterValue) return true;
    return lesson[filterType] === filterValue;
  });
  const header = ["Группа","Предмет","Преподаватель","Аудитория","День","Начало","Окончание"];
  const rows = filtered.map(l => [l.group, l.subject, l.teacher, l.room, l.dayOfWeek, l.timeStart, l.timeEnd]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "schedule.csv");
}

function exportScheduleToExcel(schedule, filterType, filterValue) {
  const filtered = schedule.filter(lesson => {
    if (!filterType || !filterValue) return true;
    return lesson[filterType] === filterValue;
  });
  const header = ["Группа","Предмет","Преподаватель","Аудитория","День","Начало","Окончание"];
  const rows = filtered.map(l => [l.group, l.subject, l.teacher, l.room, l.dayOfWeek, l.timeStart, l.timeEnd]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Расписание");
  XLSX.writeFile(wb, "schedule.xlsx");
}

export function ScheduleView() {
  const [filterType, setFilterType] = useState("group");
  const [filterValue, setFilterValue] = useState("");
  const [showScheduleCreator, setShowScheduleCreator] = useState(false);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Загрузка всех сущностей для фильтра
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

  useEffect(() => {
    fetch("/api/schedule/")
      .then(res => res.json())
      .then(data => setScheduleData(Array.isArray(data) ? data : []));
  }, []);

  // Опции для второго фильтра
  let filterOptions = [];
  if (filterType === "group") filterOptions = groups.map(g => g.name);
  if (filterType === "teacher") filterOptions = teachers.map(t => t.fullName);
  if (filterType === "room") filterOptions = rooms.map(r => r.number);
  if (filterType === "subject") filterOptions = subjects.map(s => s.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Расписание занятий</h1>
          <p className="text-muted-foreground">
            Просмотр и экспорт текущего расписания
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Печать
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
          <Button onClick={() => setShowScheduleCreator(true)}>
            <Plus size={16} className="mr-2" />
            Создать расписание
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Расписание на неделю</CardTitle>
          <CardDescription>
            1 семестр, 2025-2026 учебный год
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
            <div className="flex flex-row gap-4 w-full md:w-auto items-center bg-muted/40 border rounded-lg p-3 shadow-sm">
              <Select value={filterType} onValueChange={v => { setFilterType(v); setFilterValue(""); }}>
                <SelectTrigger className="w-44 font-medium focus:ring-2 focus:ring-primary/50">
                  <SelectValue placeholder="Категория" />
                  <ChevronDown className="ml-auto h-4 w-4 opacity-60" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="flex items-center">
                      {cat.icon}{cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-56 font-medium focus:ring-2 focus:ring-primary/50">
                  <SelectValue placeholder={
                    filterType === "group" ? "Выбрать группу" :
                    filterType === "teacher" ? "Выбрать преподавателя" :
                    filterType === "room" ? "Выбрать аудиторию" :
                    filterType === "subject" ? "Выбрать предмет" : "Выбрать"
                  } />
                  <ChevronDown className="ml-auto h-4 w-4 opacity-60" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions
                    .filter((item) => item && item !== "")
                    .map((item) => (
                      <SelectItem key={item} value={item} className="truncate">
                        {item}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="rounded-full border-primary/30 hover:bg-primary/10">
                <Filter size={18} />
              </Button>
            </div>
          </div>

          <div className="mt-4 border rounded-md overflow-hidden">
            <SchedulePreview filterType={filterType as any} filterValue={filterValue} />
          </div>
        </CardContent>
      </Card>
      {showScheduleCreator && (
        <ScheduleCreator onClose={() => setShowScheduleCreator(false)} />
      )}
    </div>
  );
}
