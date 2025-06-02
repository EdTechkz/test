export function getDashboardStats() {
  return [
    { title: "Всего групп", value: "12", icon: "Users", description: "Активных групп" },
    { title: "Преподавателей", value: "24", icon: "GraduationCap", description: "Ведут занятия" },
    { title: "Аудиторий", value: "18", icon: "Calendar", description: "Доступных" },
    { title: "Занятий сегодня", value: "45", icon: "Clock", description: "По расписанию" }
  ];
}

export function getSchedulePreview() {
  return [];
}

export function getUpcomingLessons() {
  return [
    { subject: "Математика", group: "ИС-11", teacher: "Иванова Н.П.", time: "08:00", room: "Ауд. 302" },
    { subject: "Литература", group: "ИС-11", teacher: "Петрова М.А.", time: "09:00", room: "Ауд. 404" },
    { subject: "История", group: "ИС-11", teacher: "Сидоров К.В.", time: "10:00", room: "Ауд. 201" }
  ];
}

export function getNotifications() {
  return [
    { title: "Изменение в расписании", text: "Занятие по физике перенесено с 14:00 на 15:00", color: "border-blue-500", bg: "bg-blue-50" },
    { title: "Новая аудитория", text: "Открыта компьютерная аудитория №420", color: "border-green-500", bg: "bg-green-50" },
    { title: "Каникулы", text: "Зимние каникулы с 25 декабря по 8 января", color: "border-orange-500", bg: "bg-orange-50" }
  ];
} 