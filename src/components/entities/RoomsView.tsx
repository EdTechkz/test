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

// Преобразование объекта из/в camelCase (для совместимости с backend)
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
  // Состояния для списка аудиторий, фильтрации, поиска и диалогов
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Загрузка аудиторий с сервера и подписка на обновления через WebSocket
  useEffect(() => {
    const fetchRooms = () => {
      fetch("/api/rooms/")
        .then((res) => res.json())
        .then((data) => setRooms(data.map(toCamel)))
        .catch(() => toast.error("Аудиторияларды жүктеу қатесі"));
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
    // Фильтрация аудиторий по поисковому запросу
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
    { header: "Аудитория нөмірі", accessor: "number" },
    { header: "Түрі", accessor: "type" },
    { header: "Сыйымдылығы", accessor: "capacity" },
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
        toast.error("Аудиторияны қосу қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newRoom = await res.json();
      setRooms((prev) => [...prev, newRoom]);
      toast.success(`"${data.number}" аудиториясы қосылды`);
    } catch (e) {
      toast.error("Аудиторияны қосу қатесі: " + (e?.message || e));
    }
  };

  const handleEdit = (id) => {
    const roomToEdit = rooms.find((room) => room.id === id);
    if (roomToEdit) {
      setCurrentRoom(toCamel(roomToEdit));
      setIsEditDialogOpen(true);
    } else {
      toast.error("Аудитория табылмады");
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
        toast.error("Аудиторияны жаңарту қатесі: " + (err.detail || res.statusText));
        return;
      }
      const newRoom = await res.json();
      setRooms((prev) => prev.map((r) => (r.id === newRoom.id ? newRoom : r)));
      toast.success(`"${newRoom.number}" аудиториясы жаңартылды`);
    } catch (e) {
      toast.error("Аудиторияны жаңарту қатесі: " + (e?.message || e));
    }
  };

  const handleDelete = (id: string | number) => {
    const roomToDelete = rooms.find((room) => room.id === id);
    if (roomToDelete) {
      setCurrentRoom(roomToDelete);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("Аудитория табылмады");
    }
  };

  const confirmDelete = async () => {
    try {
      if (currentRoom) {
        const res = await fetch(`/api/rooms/${currentRoom.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setRooms((prev) => prev.filter((r) => r.id !== currentRoom.id));
        toast.success(`"${currentRoom.number}" аудиториясы жойылды`);
      }
      setIsDeleteDialogOpen(false);
      setCurrentRoom(null);
    } catch {
      toast.error("Аудиторияны жою қатесі");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аудиториялар</h1>
          <p className="text-muted-foreground">
            Оқу аудиторияларын басқару
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Аудитория қосу
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Аудиториялар тізімі</CardTitle>
          <CardDescription>
            Барлық аудиториялар саны: {rooms.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Аудиториялар бойынша іздеу..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <EntityTable
            columns={columns}
            data={filteredRooms}
            title="Аудиториялар"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <RoomDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddRoom}
        defaultValues={{ number: "", type: "", capacity: 30, equipment: "" }}
      />
      
      {currentRoom && (
        <RoomDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateRoom}
          defaultValues={currentRoom}
          isEditing={true}
        />
      )}
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Аудиторияны жою"
        description={currentRoom ? `Сіз шынымен ${currentRoom.number} аудиториясын жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.` : "Аудиторияны жоюды растаңыз"}
      />
    </div>
  );
}
