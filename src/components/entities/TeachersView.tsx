import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EntityTable } from "./EntityTable";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { TeacherDialog } from "./TeacherDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

// Преобразование объекта преподавателя из/в camelCase (для совместимости с backend)
function toCamel(obj) {
  if (!obj) return {
    id: '',
    fullName: '',
    specialization: '',
    experience: '',
    contactInfo: '',
  };
  return {
    id: obj.id ?? '',
    fullName: obj.full_name ?? obj.fullName ?? '', // ФИО преподавателя
    specialization: obj.specialization ?? '', // Специализация
    experience: obj.experience ?? '', // Опыт работы
    contactInfo: obj.contact_info ?? obj.contactInfo ?? '', // Контактная информация
  };
}
function toSnake(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    full_name: obj.fullName,
    specialization: obj.specialization,
    experience: obj.experience,
    contact_info: obj.contactInfo,
  };
}

export function TeachersView() {
  // Состояния для списка преподавателей, поиска и диалогов
  const [teachers, setTeachers] = useState([]); // Все преподаватели
  const [searchQuery, setSearchQuery] = useState(""); // Поисковый запрос
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Открыт ли диалог добавления
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Открыт ли диалог редактирования
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Открыт ли диалог удаления
  const [currentTeacher, setCurrentTeacher] = useState(null); // Текущий выбранный преподаватель

  // Загрузка преподавателей с сервера и подписка на обновления через WebSocket
  useEffect(() => {
    const fetchTeachers = () => {
      fetch("/api/teachers/")
        .then((res) => res.json())
        .then((data) => setTeachers(data.map(toCamel)))
        .catch(() => toast.error("Оқытушыларды жүктеу қатесі"));
    };
    fetchTeachers(); // Загружаем при старте
    const ws = new window.WebSocket(`ws://${window.location.host}`); // Подключаемся к WebSocket
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "update" && msg.entity === "teachers") {
        fetchTeachers(); // Обновляем список при изменениях
      }
    };
    return () => ws.close(); // Отключаем WebSocket при размонтировании
  }, []);

  // Описание столбцов таблицы преподавателей
  const columns = [
    { header: "Аты-жөні", accessor: "fullName" }, // ФИО
    { header: "Мамандығы", accessor: "specialization" }, // Специализация
    { header: "Еңбек өтілі", accessor: "experience" }, // Опыт работы
    { header: "Байланыс ақпараты", accessor: "contactInfo" }, // Контакты
  ];

  // Фильтрация преподавателей по поисковому запросу
  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    return (
      (teacher.fullName || '').toLowerCase().includes(query) ||
      (teacher.specialization || '').toLowerCase().includes(query) ||
      (teacher.experience || '').toLowerCase().includes(query) ||
      (teacher.contactInfo || '').toLowerCase().includes(query)
    );
  });

  // Добавление нового преподавателя
  const handleAddTeacher = async (data) => {
    try {
      const res = await fetch("/api/teachers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(data)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Оқытушыны қосу қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newTeacher = await res.json();
      setTeachers((prev) => [...prev, newTeacher]); // Добавляем в список
      toast.success(`"${data.fullName}" оқытушысы қосылды`);
    } catch (e) {
      toast.error("Оқытушыны қосу қатесі: " + (e?.message || e));
    }
  };

  // Открытие диалога редактирования преподавателя
  const handleEdit = (id) => {
    const teacherToEdit = teachers.find((teacher) => teacher.id === id);
    if (teacherToEdit) {
      setCurrentTeacher(toCamel(teacherToEdit));
      setIsEditDialogOpen(true);
    } else {
      toast.error("Оқытушы табылмады");
    }
  };

  // Сохранение изменений преподавателя
  const handleUpdateTeacher = async (updatedTeacher) => {
    try {
      const res = await fetch(`/api/teachers/${updatedTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(updatedTeacher)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Оқытушыны жаңарту қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newTeacher = await res.json();
      setTeachers((prev) => prev.map((t) => (t.id === newTeacher.id ? newTeacher : t)));
      toast.success(`"${newTeacher.fullName}" оқытушысы жаңартылды`);
    } catch (e) {
      toast.error("Оқытушыны жаңарту қатесі: " + (e?.message || e));
    }
  };

  // Открытие диалога удаления преподавателя
  const handleDelete = (id) => {
    const teacherToDelete = teachers.find((teacher) => teacher.id === id);
    if (teacherToDelete) {
      setCurrentTeacher(teacherToDelete);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("Оқытушы табылмады");
    }
  };

  // Подтверждение удаления преподавателя
  const confirmDelete = async () => {
    try {
      if (currentTeacher) {
        const res = await fetch(`/api/teachers/${currentTeacher.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setTeachers((prev) => prev.filter((t) => t.id !== currentTeacher.id));
        toast.success(`"${currentTeacher.fullName}" оқытушысы жойылды`);
      }
      setIsDeleteDialogOpen(false);
      setCurrentTeacher(null);
    } catch {
      toast.error("Оқытушыны жою қатесі");
    }
  };

  // Основной рендер компонента: заголовок, поиск, таблица, диалоги
  return (
    <div className="space-y-4">
      {/* Заголовок и кнопка добавления */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Оқытушылар</h1>
          <p className="text-muted-foreground">
            Оқытушылар тізімін басқару
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Оқытушы қосу
        </Button>
      </div>

      {/* Карточка с таблицей преподавателей */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Оқытушылар тізімі</CardTitle>
          <CardDescription>
            Барлық оқытушылар саны: {teachers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Поиск по преподавателям */}
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Оқытушылар бойынша іздеу..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Таблица преподавателей */}
          <EntityTable
            columns={columns}
            data={filteredTeachers}
            title="Оқытушылар"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Диалог добавления преподавателя */}
      <TeacherDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTeacher}
        defaultValues={{ fullName: "", specialization: "", experience: "", contactInfo: "" }}
      />
      
      {/* Диалог редактирования преподавателя */}
      {currentTeacher && (
        <TeacherDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateTeacher}
          defaultValues={currentTeacher}
          isEditing={true}
        />
      )}
      
      {/* Диалог подтверждения удаления */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Оқытушыны жою"
        description={currentTeacher ? `Сіз шынымен ${currentTeacher.fullName} оқытушысын жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.` : "Оқытушыны жоюды растаңыз"}
      />
    </div>
  );
}
