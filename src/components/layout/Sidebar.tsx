import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  UserSquare,
  GraduationCap,
  Home,
  Settings2,
} from "lucide-react";

export function Sidebar() {
  const menuItems = [
    { title: "Главная", icon: <Home size={20} />, path: "/" },
    { title: "Расписание", icon: <Calendar size={20} />, path: "/schedule" },
    { title: "Группы", icon: <Users size={20} />, path: "/groups" },
    { title: "Преподаватели", icon: <UserSquare size={20} />, path: "/teachers" },
    { title: "Аудитории", icon: <Home size={20} />, path: "/rooms" },
    { title: "Предметы", icon: <GraduationCap size={20} />, path: "/subjects" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b bg-primary">
        <h2 className="text-xl font-bold text-white">Расписание Колледжа</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-normal"
                >
                  {item.icon}
                  {item.title}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Администратор</p>
            <p className="text-xs text-gray-500">admin@college.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
