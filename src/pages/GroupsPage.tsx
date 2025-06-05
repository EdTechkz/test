// GroupsPage.tsx — страница управления группами студентов
// Использует основной макет приложения и компонент для работы с группами
import { GroupsView } from "@/components/entities/GroupsView";
import { AppLayout } from "@/components/layout/AppLayout";

export default function GroupsPage() {
  return (
    // Оборачиваем страницу в основной макет приложения (с меню и верхней панелью)
    <AppLayout>
      {/* Основной компонент для работы с группами */}
      <GroupsView />
    </AppLayout>
  );
}
