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
import { RoomDialog } from "./RoomDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { toast } from "sonner";

interface Room {
  id: number;
  number: string;
  type: string;
  capacity: number;
  equipment: string;
}

// Вспомогательные функции для преобразования
function toCamel(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    number: obj.number,
    type: obj.type,
    capacity: obj.capacity,
    equipment: obj.equipment,
  };
}
function toSnake(obj) {
  if (!obj) return obj;
  return {
    id: obj.id,
    number: obj.number,
    type: obj.type,
    capacity: obj.capacity,
    equipment: obj.equipment,
  };
}

export function RoomsView() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Загрузка аудиторий с backend + WebSocket подписка
  useEffect(() => {
    const fetchRooms = () => {
      fetch("/api/rooms/")
        .then((res) => res.json())
        .then((data) => setRooms(data.map(toCamel)))
        .catch(() => toast.error("Ошибка загрузки аудиторий"));
    };
    fetchRooms();
    const ws = new window.WebSocket(`ws://${window.location.host}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "update" && msg.entity === "rooms") {
        fetchRooms();
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    // Filter rooms on search query change
    const filtered = rooms.filter((room) => {
      const query = searchQuery.toLowerCase();
      return (
        room.number.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        room.equipment.toLowerCase().includes(query) ||
        room.capacity.toString().includes(query)
      );
    });
    setFilteredRooms(filtered);
  }, [rooms, searchQuery]);

  const columns = [
    { header: "Номер", accessor: "number" },
    { header: "Тип", accessor: "type" },
    { header: "Вместимость", accessor: "capacity" },
    { header: "Оборудование", accessor: "equipment" },
  ];

  const handleAddRoom = async (data) => {
    try {
      const res = await fetch("/api/rooms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(data)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Ошибка при добавлении аудитории: " + (err.detail || res.statusText));
        return;
      }
      const newRoom = await res.json();
      setRooms((prev) => [...prev, newRoom]);
      toast.success(`Аудитория ${data.number} добавлена`);
    } catch (e) {
      toast.error("Ошибка при добавлении аудитории: " + (e?.message || e));
    }
  };

  const handleEdit = (id) => {
    const roomToEdit = rooms.find((room) => room.id === id);
    if (roomToEdit) {
      setCurrentRoom(toCamel(roomToEdit));
      setIsEditDialogOpen(true);
    } else {
      toast.error("Аудитория не найдена");
    }
  };

  const handleUpdateRoom = async (updatedRoom) => {
    try {
      const res = await fetch(`/api/rooms/${updatedRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSnake(updatedRoom)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Ошибка при обновлении аудитории: " + (err.detail || res.statusText));
        return;
      }
      const newRoom = await res.json();
      setRooms((prev) => prev.map((r) => (r.id === newRoom.id ? newRoom : r)));
      toast.success(`Аудитория ${newRoom.number} обновлена`);
    } catch (e) {
      toast.error("Ошибка при обновлении аудитории: " + (e?.message || e));
    }
  };

  const handleDelete = (id: string | number) => {
    const roomToDelete = rooms.find((room) => room.id === id);
    if (roomToDelete) {
      setCurrentRoom(roomToDelete);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("Аудитория не найдена");
    }
  };

  const confirmDelete = async () => {
    try {
      if (currentRoom) {
        const res = await fetch(`/api/rooms/${currentRoom.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setRooms((prev) => prev.filter((r) => r.id !== currentRoom.id));
        toast.success(`Аудитория ${currentRoom.number} удалена`);
      }
      setIsDeleteDialogOpen(false);
      setCurrentRoom(null);
    } catch {
      toast.error("Ошибка при удалении аудитории");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аудитории</h1>
          <p className="text-muted-foreground">
            Управление учебными аудиториями
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Добавить аудиторию
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Список аудиторий</CardTitle>
          <CardDescription>
            Всего аудиторий: {rooms.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по аудиториям..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <EntityTable
            columns={columns}
            data={filteredRooms}
            title="Аудитории"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <RoomDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddRoom}
        defaultValues={{ number: "", type: "", capacity: 30, equipment: "" }}
      />
      
      {/* Edit Room Dialog */}
      {currentRoom && (
        <RoomDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateRoom}
          defaultValues={currentRoom}
          isEditing={true}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Удаление аудитории"
        description={currentRoom ? `Вы действительно хотите удалить аудиторию ${currentRoom.number}? Это действие невозможно отменить.` : "Подтвердите удаление аудитории"}
      />
    </div>
  );
}
