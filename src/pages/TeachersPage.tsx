// TeachersPage.tsx — страница управления преподавателями
// Использует основной макет приложения и компонент для работы с преподавателями
import { TeachersView } from "@/components/entities/TeachersView";
import { AppLayout } from "@/components/layout/AppLayout";

export default function TeachersPage() {
  return (
    // Оборачиваем страницу в основной макет приложения (с меню и верхней панелью)
    <AppLayout>
      {/* Основной компонент для работы с преподавателями */}
      <TeachersView />
    </AppLayout>
  );
}
