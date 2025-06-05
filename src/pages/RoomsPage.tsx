// RoomsPage.tsx — страница управления аудиториями
// Использует основной макет приложения и компонент для работы с аудиториями
import { RoomsView } from "@/components/entities/RoomsView";
import { AppLayout } from "@/components/layout/AppLayout";

export default function RoomsPage() {
  return (
    // Оборачиваем страницу в основной макет приложения (с меню и верхней панелью)
    <AppLayout>
      {/* Основной компонент для работы с аудиториями */}
      <RoomsView />
    </AppLayout>
  );
}
