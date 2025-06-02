import { Button } from "@/components/ui/button";
import { Menu, Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScheduleCreator } from "@/components/schedule/ScheduleCreator";

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
          <h2 className="text-lg font-semibold">Расписание Колледжа</h2>
        </div>
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold">Панель управления</h2>
        </div>
      </header>
    </>
  );
}
