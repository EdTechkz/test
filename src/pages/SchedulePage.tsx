// SchedulePage.tsx — страница просмотра и управления расписанием
// Использует основной макет приложения и компонент просмотра расписания
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { AppLayout } from "@/components/layout/AppLayout";

export default function SchedulePage() {
  return (
    // Оборачиваем страницу в основной макет приложения (с меню и верхней панелью)
    <AppLayout>
      {/* Основной компонент для работы с расписанием */}
      <ScheduleView />
    </AppLayout>
  );
}
