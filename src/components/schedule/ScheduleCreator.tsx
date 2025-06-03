import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ScheduleCreatorProps {
  onClose: () => void;
}

export function ScheduleCreator({ onClose }: ScheduleCreatorProps) {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  const form = useForm();

  // Временные интервалы с 8:00 до 18:00
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const daysOfWeek = [
    { value: "monday", label: "Понедельник" },
    { value: "tuesday", label: "Вторник" },
    { value: "wednesday", label: "Среда" },
    { value: "thursday", label: "Четверг" },
    { value: "friday", label: "Пятница" },
    { value: "saturday", label: "Суббота" }
  ];

  // --- NEW: State for actual data ---
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    let ws: WebSocket | null = null;
    const fetchAll = () => {
      Promise.all([
        fetch("/api/groups/").then(r => r.ok ? r.json() : []),
        fetch("/api/teachers/").then(r => r.ok ? r.json() : []),
        fetch("/api/rooms/").then(r => r.ok ? r.json() : []),
        fetch("/api/subjects/").then(r => r.ok ? r.json() : []),
      ]).then(([groups, teachers, rooms, subjects]) => {
        setGroups(groups);
        setTeachers(teachers);
        setRooms(rooms);
        setSubjects(subjects);
        setLoading(false);
      }).catch((e) => {
        setError("Ошибка загрузки данных для расписания");
        setLoading(false);
      });
    };
    fetchAll();
    // --- WebSocket подписка ---
    try {
      ws = new window.WebSocket(`ws://${window.location.host}`);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "update") {
            if (["groups", "teachers", "rooms", "subjects"].includes(msg.entity)) {
              fetchAll();
            }
          }
        } catch {}
      };
    } catch {}
    return () => { if (ws) ws.close(); };
  }, []);

  const mockSchedule = [
    // Пример уже существующих занятий для проверки занятости аудитории
    { dayOfWeek: "monday", room: "302", timeStart: "08:00", timeEnd: "09:00" },
    { dayOfWeek: "saturday", room: "311", timeStart: "10:00", timeEnd: "11:00" },
  ];

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const parseTime = (t: string) => parseInt(t.replace(":", ""), 10);

  const onSubmit = async (data: any) => {
    // Проверка времени
    if (parseTime(data.timeEnd) <= parseTime(data.timeStart)) {
      toast({
        title: "Уақыт қатесі",
        description: "Аяқталу уақыты басталу уақытынан кейін болуы керек!",
        variant: "destructive",
      });
      return;
    }

    // Проверка занятости аудитории (по mockSchedule)
    const conflict = mockSchedule.some(
      (item) =>
        item.dayOfWeek === data.dayOfWeek &&
        item.room === data.room &&
        ((parseTime(data.timeStart) >= parseTime(item.timeStart) && parseTime(data.timeStart) < parseTime(item.timeEnd)) ||
          (parseTime(data.timeEnd) > parseTime(item.timeStart) && parseTime(data.timeEnd) <= parseTime(item.timeEnd)) ||
          (parseTime(data.timeStart) <= parseTime(item.timeStart) && parseTime(data.timeEnd) >= parseTime(item.timeEnd)))
    );
    if (conflict) {
      toast({
        title: "Аудитория бос емес",
        description: "Таңдалған уақытта аудитория бос емес. Басқа уақытты немесе аудиторияны таңдаңыз.",
        variant: "destructive",
      });
      return;
    }

    // --- Новый код: отправка на сервер ---
    try {
      const res = await fetch("/api/schedule/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast({
          title: "Қате",
          description: "Сабақты құру мүмкін болмады. Қайталап көріңіз.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Кесте құрылды",
        description: `"${data.subject}" сабағы кестеге сәтті қосылды`,
      });
      handleClose();
    } catch (e) {
      toast({
        title: "Қате",
        description: "Сабақты сақтау кезінде қате: " + (e?.message || e),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Кесте құру</DialogTitle>
          <DialogDescription>
            Жаңа сабақты кестеге қосу үшін форманы толтырыңыз
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-center py-8">Жүктелуде...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Топ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Топты таңдаңыз" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.filter(g => g && g !== "").map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пән</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Пәнді таңдаңыз" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.filter(s => s && s !== "").map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Оқытушы</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Оқытушыны таңдаңыз" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.filter(t => t && t !== "").map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аудитория</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Аудиторияны таңдаңыз" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.filter(r => r && r !== "").map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>День недели</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите день" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время начала</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="08:00" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время окончания</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="09:00" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Бас тарту
              </Button>
              <Button type="submit">
                Құру
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
