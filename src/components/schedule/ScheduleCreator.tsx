import { useState } from "react";
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

  const mockGroups = ["ИС-11", "ИС-12", "ПС-11", "ПС-12"];
  const mockTeachers = ["Иванова Н.П.", "Петрова М.А.", "Сидоров К.В.", "Николаев П.С."];
  const mockRooms = ["302", "404", "201", "405", "311", "408"];
  const mockSubjects = ["Математика", "Литература", "История", "Физика", "Информатика", "Химия"];

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

  const onSubmit = (data: any) => {
    // Проверка времени
    if (parseTime(data.timeEnd) <= parseTime(data.timeStart)) {
      toast({
        title: "Ошибка времени",
        description: "Время окончания должно быть позже времени начала!",
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
        title: "Аудитория занята",
        description: "В выбранное время аудитория уже используется. Выберите другое время или аудиторию.",
        variant: "destructive",
      });
      return;
    }

    // Можно добавить другие рекомендации и ограничения здесь

    toast({
      title: "Расписание создано",
      description: `Занятие по предмету "${data.subject}" успешно добавлено в расписание`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать расписание</DialogTitle>
          <DialogDescription>
            Заполните форму для создания нового занятия в расписании
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Группа</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите группу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Предмет</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
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
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Преподаватель</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите преподавателя" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockTeachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
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
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аудитория</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите аудиторию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockRooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          Аудитория {room}
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
                Отмена
              </Button>
              <Button type="submit">
                Создать
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
