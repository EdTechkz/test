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
import { GroupDialog } from "./GroupDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

// Вспомогательные функции для преобразования
function toCamel(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    name: obj.name,
    specialization: obj.specialization,
    numberOfStudents: Number(obj.number_of_students ?? obj.numberOfStudents) || 0,
    curator: obj.curator,
  };
}
function toSnake(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    name: obj.name,
    specialization: obj.specialization,
    number_of_students: obj.numberOfStudents,
    curator: obj.curator,
  };
}

export function GroupsView() {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);

  // Загрузка групп с backend + WebSocket подписка
  useEffect(() => {
    const fetchGroups = () => {
      fetch("/api/groups/")
        .then((res) => res.json())
        .then((data) => {
          const camelGroups = data.map(toCamel);
          setGroups(camelGroups);
          console.log("[GroupsView] groups after fetch:", camelGroups);
        })
        .catch(() => toast.error("Топтарды жүктеу қатесі"));
    };
    fetchGroups();
    const ws = new window.WebSocket(`ws://${window.location.host}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "update" && msg.entity === "groups") {
        fetchGroups();
        setTimeout(() => {
          console.log("[GroupsView] groups after WS update:", groups);
        }, 500);
      }
    };
    return () => ws.close();
  }, []);

  const columns = [
    { header: "Топ атауы", accessor: "name" },
    { header: "Мамандығы", accessor: "specialization" },
    { header: "Студенттер саны", accessor: "numberOfStudents" },
    { header: "Куратор", accessor: "curator" },
  ];

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(query) ||
      group.specialization.toLowerCase().includes(query) ||
      group.curator.toLowerCase().includes(query) ||
      group.numberOfStudents.toString().includes(query)
    );
  });

  const handleAddGroup = async (data) => {
    try {
      const res = await fetch("/api/groups/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(data)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Топты қосу қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newGroup = await res.json();
      setGroups((prev) => [...prev, toCamel(newGroup)]);
      toast.success(`"${data.name}" тобы қосылды`);
    } catch (e) {
      toast.error("Топты қосу қатесі: " + (e?.message || e));
    }
  };

  const handleEdit = (id) => {
    const groupToEdit = groups.find((group) => group.id === id);
    if (groupToEdit) {
      setCurrentGroup(toCamel(groupToEdit));
      setIsEditDialogOpen(true);
    } else {
      toast.error("Топ табылмады");
    }
  };

  const handleUpdateGroup = async (updatedGroup) => {
    try {
      const res = await fetch(`/api/groups/${updatedGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(updatedGroup)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Топты жаңарту қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newGroup = await res.json();
      setGroups((prev) => prev.map((g) => (g.id === newGroup.id ? toCamel(newGroup) : g)));
      toast.success(`"${newGroup.name}" тобы жаңартылды`);
    } catch (e) {
      toast.error("Топты жаңарту қатесі: " + (e?.message || e));
    }
  };

  const handleDelete = (id) => {
    const groupToDelete = groups.find((group) => group.id === id);
    if (groupToDelete) {
      setCurrentGroup(groupToDelete);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("Топ табылмады");
    }
  };

  const confirmDelete = async () => {
    try {
      if (currentGroup) {
        const res = await fetch(`/api/groups/${currentGroup.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setGroups((prev) => prev.filter((g) => g.id !== currentGroup.id));
        toast.success(`"${currentGroup.name}" тобы жойылды`);
      }
      setIsDeleteDialogOpen(false);
      setCurrentGroup(null);
    } catch {
      toast.error("Топты жою қатесі");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Топтар</h1>
          <p className="text-muted-foreground">
            Оқу топтарын басқару
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Топ қосу
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Топтар тізімі</CardTitle>
          <CardDescription>Барлық топтар саны: {groups.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Топтар бойынша іздеу..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <EntityTable
            columns={columns}
            data={filteredGroups}
            title="Оқу топтары"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Add Group Dialog */}
      <GroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddGroup}
        defaultValues={{ name: "", specialization: "", numberOfStudents: 25, curator: "" }}
      />

      {/* Edit Group Dialog */}
      {currentGroup && (
        <GroupDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateGroup}
          defaultValues={currentGroup}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Топты жою"
        description={currentGroup ? `Сіз шынымен ${currentGroup.name} тобын жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.` : "Топты жоюды растаңыз"}
      />
    </div>
  );
}
