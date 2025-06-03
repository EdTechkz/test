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

// Вспомогательные функции для преобразования
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
    fullName: obj.full_name ?? obj.fullName ?? '',
    specialization: obj.specialization ?? '',
    experience: obj.experience ?? '',
    contactInfo: obj.contact_info ?? obj.contactInfo ?? '',
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
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);

  // Загрузка преподавателей с backend + WebSocket подписка
  useEffect(() => {
    const fetchTeachers = () => {
      fetch("/api/teachers/")
        .then((res) => res.json())
        .then((data) => setTeachers(data.map(toCamel)))
        .catch(() => toast.error("Ошибка загрузки преподавателей"));
    };
    fetchTeachers();
    const ws = new window.WebSocket(`ws://${window.location.host}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "update" && msg.entity === "teachers") {
        fetchTeachers();
      }
    };
    return () => ws.close();
  }, []);

  const columns = [
    { header: "ФИО", accessor: "fullName" },
    { header: "Специализация", accessor: "specialization" },
    { header: "Стаж", accessor: "experience" },
    { header: "Контакты", accessor: "contactInfo" },
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    return (
      (teacher.fullName || '').toLowerCase().includes(query) ||
      (teacher.specialization || '').toLowerCase().includes(query) ||
      (teacher.experience || '').toLowerCase().includes(query) ||
      (teacher.contactInfo || '').toLowerCase().includes(query)
    );
  });

  const handleAddTeacher = async (data) => {
    try {
      const res = await fetch("/api/teachers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(data)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Ошибка при добавлении преподавателя: " + (err.detail || res.statusText));
        return;
      }
      const newTeacher = await res.json();
      setTeachers((prev) => [...prev, newTeacher]);
      toast.success(`Преподаватель ${data.fullName} добавлен`);
    } catch (e) {
      toast.error("Ошибка при добавлении преподавателя: " + (e?.message || e));
    }
  };

  const handleEdit = (id) => {
    const teacherToEdit = teachers.find((teacher) => teacher.id === id);
    if (teacherToEdit) {
      setCurrentTeacher(toCamel(teacherToEdit));
      setIsEditDialogOpen(true);
    } else {
      toast.error("Преподаватель не найден");
    }
  };

  const handleUpdateTeacher = async (updatedTeacher) => {
    try {
      const res = await fetch(`/api/teachers/${updatedTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(updatedTeacher)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Ошибка при обновлении преподавателя: " + (err.detail || res.statusText));
        return;
      }
      const newTeacher = await res.json();
      setTeachers((prev) => prev.map((t) => (t.id === newTeacher.id ? newTeacher : t)));
      toast.success(`Преподаватель ${newTeacher.fullName} обновлен`);
    } catch (e) {
      toast.error("Ошибка при обновлении преподавателя: " + (e?.message || e));
    }
  };

  const handleDelete = (id) => {
    const teacherToDelete = teachers.find((teacher) => teacher.id === id);
    if (teacherToDelete) {
      setCurrentTeacher(teacherToDelete);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("Преподаватель не найден");
    }
  };

  const confirmDelete = async () => {
    try {
      if (currentTeacher) {
        const res = await fetch(`/api/teachers/${currentTeacher.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setTeachers((prev) => prev.filter((t) => t.id !== currentTeacher.id));
        toast.success(`Преподаватель ${currentTeacher.fullName} удален`);
      }
      setIsDeleteDialogOpen(false);
      setCurrentTeacher(null);
    } catch {
      toast.error("Ошибка при удалении преподавателя");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Преподаватели</h1>
          <p className="text-muted-foreground">
            Управление списком преподавателей
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Добавить преподавателя
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Список преподавателей</CardTitle>
          <CardDescription>
            Всего преподавателей: {teachers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по преподавателям..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <EntityTable
            columns={columns}
            data={filteredTeachers}
            title="Преподаватели"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Add Teacher Dialog */}
      <TeacherDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTeacher}
        defaultValues={{ fullName: "", specialization: "", experience: "", contactInfo: "" }}
      />

      {/* Edit Teacher Dialog */}
      {currentTeacher && (
        <TeacherDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateTeacher}
          defaultValues={currentTeacher}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Удаление преподавателя"
        description={currentTeacher ? `Вы действительно хотите удалить преподавателя ${currentTeacher.fullName}? Это действие невозможно отменить.` : "Подтвердите удаление преподавателя"}
      />
    </div>
  );
}
