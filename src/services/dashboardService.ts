/*
  dashboardService.ts — сервис для получения данных для дашборда (главной панели).
  Содержит функции для получения статистики, уведомлений, превью расписания и ближайших уроков.
  В реальном проекте эти функции должны обращаться к backend API.
*/
// dashboardService — сервис для получения данных для дашборда (статистика, уведомления, расписание)
// Здесь определяются функции для работы с backend API

export function getDashboardStats() {
  return [
    { title: "Барлық топтар", value: "12", icon: "Users", description: "Активті топтар" },
    { title: "Мұғалімдер", value: "24", icon: "GraduationCap", description: "Сабақтарды ведут" },
    { title: "Аудиториялар", value: "18", icon: "Calendar", description: "Қолжетімді" },
    { title: "Бүгін сабақтар", value: "45", icon: "Clock", description: "Расписание бойынша" }
  ];
}

export function getSchedulePreview() {
  return [];
}

export function getUpcomingLessons() {
  return [
    { subject: "Математика", group: "ИС-11", teacher: "Айдосов А.А.", time: "08:00", room: "Ауд. 302" },
    { subject: "Әдебиет", group: "ИС-11", teacher: "Серікқызы М.А.", time: "09:00", room: "Ауд. 404" },
    { subject: "Тарих", group: "ИС-11", teacher: "Сұлтанов К.В.", time: "10:00", room: "Ауд. 201" }
  ];
}

export function getNotifications() {
  return [
    { title: "Кестеге өзгеріс енгізілді", text: "Физика сабағы 14:00-ден 15:00-ге ауыстырылды", color: "border-blue-500", bg: "bg-blue-50" },
    { title: "Жаңа аудитория", text: "420-шы компьютерлік аудитория ашылды", color: "border-green-500", bg: "bg-green-50" },
    { title: "Демалыс", text: "Қысқы демалыс 25 желтоқсаннан 8 қаңтарға дейін", color: "border-orange-500", bg: "bg-orange-50" }
  ];
} 