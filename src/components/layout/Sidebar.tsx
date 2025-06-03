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

/*
  Sidebar.tsx — компонент бокового меню (навигация).
  Отвечает за отображение пунктов меню для перехода между основными разделами приложения.
  Используется на всех страницах как постоянная навигация.
*/

// Sidebar — компонент бокового меню навигации по разделам приложения
export function Sidebar() {
  const menuItems = [
    { title: "Басты бет", icon: <Home size={20} />, path: "/" },
    { title: "Кесте", icon: <Calendar size={20} />, path: "/schedule" },
    { title: "Топтар", icon: <Users size={20} />, path: "/groups" },
    { title: "Оқытушылар", icon: <UserSquare size={20} />, path: "/teachers" },
    { title: "Аудиториялар", icon: <Home size={20} />, path: "/rooms" },
    { title: "Пәндер", icon: <GraduationCap size={20} />, path: "/subjects" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b bg-primary">
        <h2 className="text-xl font-bold text-white">Колледж кестесі</h2>
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
    </aside>
  );
}
