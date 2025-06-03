/*
  ScheduleView.tsx — основной компонент для просмотра, фильтрации и экспорта расписания.
  Позволяет пользователю выбирать фильтры, экспортировать расписание, создавать новые записи.
  Используется для работы с расписанием всех групп, преподавателей, аудиторий и предметов.
*/
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
    </div>
  );
}
