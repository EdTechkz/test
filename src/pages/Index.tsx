// Index.tsx — главная страница приложения (дашборд)
// Здесь отображается основная информация и сводка по расписанию
import { DashboardView } from "@/components/dashboard/DashboardView";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Index() {
  return (
    // Оборачиваем страницу в основной макет приложения (с меню и верхней панелью)
    <AppLayout>
      {/* Основной компонент дашборда */}
      <DashboardView />
    </AppLayout>
  );
}
