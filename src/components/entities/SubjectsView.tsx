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
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { SubjectDialog } from "./SubjectDialog";

// Вспомогательные функции для преобразования
function toCamel(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    name: obj.name,
    hoursPerWeek: Number(obj.hours_per_week ?? obj.hoursPerWeek) || 0,
    type: obj.type,
    department: obj.department,
  };
}
function toSnake(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    name: obj.name,
    hours_per_week: obj.hoursPerWeek,
    type: obj.type,
    department: obj.department,
  };
}

export function SubjectsView() {
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);

  // Загрузка предметов с backend + WebSocket подписка
  useEffect(() => {
    const fetchSubjects = () => {
      fetch("/api/subjects/")
        .then((res) => res.json())
        .then((data) => {
          const camelSubjects = data.map(toCamel);
          setSubjects(camelSubjects);
          console.log("[SubjectsView] subjects after fetch:", camelSubjects);
        })
        .catch(() => toast.error("Пәндерді жүктеу қатесі"));
    };
    fetchSubjects();
    const ws = new window.WebSocket(`ws://${window.location.host}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "update" && msg.entity === "subjects") {
        fetchSubjects();
        setTimeout(() => {
          console.log("[SubjectsView] subjects after WS update:", subjects);
        }, 500);
      }
    };
    return () => ws.close();
  }, []);

  const columns = [
    { header: "Пән атауы", accessor: "name" },
    { header: "Аптасына сағат", accessor: "hoursPerWeek" },
    { header: "Түрі", accessor: "type" },
    { header: "Бөлімі", accessor: "department" },
  ];

  const filteredSubjects = subjects.filter((subject) => {
    const query = searchQuery.toLowerCase();
    return (
      subject.name.toLowerCase().includes(query) ||
      subject.type.toLowerCase().includes(query) ||
      subject.department.toLowerCase().includes(query) ||
      subject.hoursPerWeek.toString().includes(query)
    );
  });

  const handleAddSubject = async (data) => {
    try {
      const res = await fetch("/api/subjects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(data)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Пәнді қосу қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newSubject = await res.json();
      setSubjects((prev) => [...prev, toCamel(newSubject)]);
      toast.success(`"${data.name}" пәні қосылды`);
    } catch (e) {
      toast.error("Пәнді қосу қатесі: " + (e?.message || e));
    }
  };

  const handleEdit = (id) => {
    const subjectToEdit = subjects.find((subject) => subject.id === id);
    if (subjectToEdit) {
      setCurrentSubject(toCamel(subjectToEdit));
      setIsEditDialogOpen(true);
    } else {
      toast.error("Пән табылмады");
    }
  };

  const handleUpdateSubject = async (updatedSubject) => {
    try {
      const res = await fetch(`/api/subjects/${updatedSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(updatedSubject)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Пәнді жаңарту қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newSubject = await res.json();
      setSubjects((prev) => prev.map((s) => (s.id === newSubject.id ? toCamel(newSubject) : s)));
      toast.success(`"${newSubject.name}" пәні жаңартылды`);
    } catch (e) {
      toast.error("Пәнді жаңарту қатесі: " + (e?.message || e));
    }
  };

  const handleDelete = (id) => {
    const subjectToDelete = subjects.find((subject) => subject.id === id);
    if (subjectToDelete) {
      setCurrentSubject(subjectToDelete);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("Пән табылмады");
    }
  };

  const confirmDelete = async () => {
    try {
      if (currentSubject) {
        const res = await fetch(`/api/subjects/${currentSubject.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setSubjects((prev) => prev.filter((s) => s.id !== currentSubject.id));
        toast.success(`"${currentSubject.name}" пәні жойылды`);
      }
      setIsDeleteDialogOpen(false);
      setCurrentSubject(null);
    } catch {
      toast.error("Пәнді жою қатесі");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Оқу пәндері</h1>
          <p className="text-muted-foreground">
            Оқу пәндерін басқару
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Пән қосу
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Пәндер тізімі</CardTitle>
          <CardDescription>Барлық пәндер саны: {subjects.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Пәндер бойынша іздеу..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <EntityTable
            columns={columns}
            data={filteredSubjects}
            title="Оқу пәндері"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Add Subject Dialog */}
      <SubjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddSubject}
        defaultValues={{ name: "", hoursPerWeek: 1, type: "", department: "" }}
      />

      {/* Edit Subject Dialog */}
      {currentSubject && (
        <SubjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateSubject}
          defaultValues={currentSubject}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Пәнді жою"
        description={currentSubject ? `Сіз шынымен ${currentSubject.name} пәнін жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.` : "Пәнді жоюды растаңыз"}
      />
    </div>
  );
}
