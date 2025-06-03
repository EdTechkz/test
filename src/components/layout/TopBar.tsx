/*
  TopBar.tsx — компонент верхней панели приложения.
  Отвечает за отображение заголовка, кнопки меню (для мобильных), а также может содержать кнопки быстрого доступа.
  Используется на всех страницах приложения.
*/
import { Button } from "@/components/ui/button";
import { Menu, Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScheduleCreator } from "@/components/schedule/ScheduleCreator";

// TopBar — компонент верхней панели приложения (заголовок, кнопка меню)
export function TopBar() {
  const [showScheduleCreator, setShowScheduleCreator] = useState(false);
  const navigate = useNavigate();

  const handleCreateSchedule = () => {
    setShowScheduleCreator(true);
  };

  return (
    <>
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" className="md:hidden">
          <Menu size={20} />
        </Button>
        <div className="md:hidden text-center flex-1">
          <h2 className="text-lg font-semibold">Колледж кестесі</h2>
        </div>
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold">Басқару панелі</h2>
        </div>
      </header>
    </>
  );
}
