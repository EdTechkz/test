import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchedulePreview } from "@/components/schedule/SchedulePreview";
import { Calendar, Clock, Users, GraduationCap, Download, Filter, Printer } from "lucide-react";
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

export function DashboardView() {
  const [stats, setStats] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("group");
  const [filterValue, setFilterValue] = useState("");

  // Пример данных для фильтра
  const groups = ["ИС-11", "ИС-12", "ПС-11", "ПС-12"];
  const teachers = ["Иванова Н.П.", "Петрова М.А.", "Сидоров К.В.", "Николаев П.С."];
  const rooms = ["302", "404", "201", "405", "311", "408"];

  // Определяем значения для второго фильтра
  const filterOptions = useMemo(() => {
    if (filterType === "group") return groups;
    if (filterType === "teacher") return teachers;
    if (filterType === "room") return rooms;
    return [];
  }, [filterType]);

  useEffect(() => {
    setStats(getDashboardStats());
    setSchedule(getSchedulePreview());
    setUpcomingLessons(getUpcomingLessons());
    setNotifications(getNotifications());
  }, []);

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Расписание занятий</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Вид расписания" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group">По группам</SelectItem>
              <SelectItem value="teacher">По преподавателям</SelectItem>
              <SelectItem value="room">По аудиториям</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger>
              <SelectValue placeholder={
                filterType === "group" ? "Выбрать группу" :
                filterType === "teacher" ? "Выбрать преподавателя" :
                filterType === "room" ? "Выбрать аудиторию" : "Выбрать"
              } />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <Printer size={16} className="mr-2" />
            Печать
          </Button>
          <Button className="flex-1 sm:flex-initial">
            <Download size={16} className="mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Расписание на неделю
          </CardTitle>
          <CardDescription>
            Актуальное расписание занятий для всех групп
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <SchedulePreview filterType={filterType} filterValue={filterValue} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
