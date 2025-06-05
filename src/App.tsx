// App.tsx — основной файл приложения
// Здесь настраивается маршрутизация (переходы между страницами) и глобальные провайдеры
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Импортируем страницы приложения
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SchedulePage from "./pages/SchedulePage";
import GroupsPage from "./pages/GroupsPage";
import TeachersPage from "./pages/TeachersPage";
import RoomsPage from "./pages/RoomsPage";
import SubjectsPage from "./pages/SubjectsPage";

// Создаем клиент для работы с запросами (кэширование и т.д.)
const queryClient = new QueryClient();

const App = () => (
  // ErrorBoundary — ловит ошибки и показывает сообщение, если что-то пошло не так
  <ErrorBoundary>
    {/* Провайдер для работы с запросами */}
    <QueryClientProvider client={queryClient}>
      {/* Провайдер для всплывающих подсказок */}
      <TooltipProvider>
        {/* Компоненты для показа уведомлений */}
        <Toaster />
        <Sonner />
        {/* Настройка маршрутов приложения */}
        <BrowserRouter>
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<Index />} />
            {/* Страница расписания */}
            <Route path="/schedule" element={<SchedulePage />} />
            {/* Страница групп */}
            <Route path="/groups" element={<GroupsPage />} />
            {/* Страница преподавателей */}
            <Route path="/teachers" element={<TeachersPage />} />
            {/* Страница аудиторий */}
            <Route path="/rooms" element={<RoomsPage />} />
            {/* Страница предметов */}
            <Route path="/subjects" element={<SubjectsPage />} />
            {/* Страница для несуществующих маршрутов (404) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
