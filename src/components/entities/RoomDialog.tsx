import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// Описание схемы валидации формы с помощью библиотеки zod
const formSchema = z.object({
  // Номер аудитории (обязательное поле)
  number: z.string().min(1, { message: "Аудитория нөірі міндетті" }),
  // Тип аудитории (обязательное поле)
  type: z.string().min(1, { message: "Аудитория түрі міндетті" }),
  // Вместимость аудитории (обязательное поле, число больше 0)
  capacity: z.coerce.number().min(1, { message: "Сыйымдылық 0-ден көп болуы керек" }),
  // Оборудование (необязательное поле)
  equipment: z.string().optional(),
});

type RoomFormValues = z.infer<typeof formSchema>;

// Интерфейс пропсов для диалога добавления/редактирования аудитории
interface RoomDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для открытия/закрытия диалога
  onSave: (data: any) => void; // Функция сохранения данных
  defaultValues?: {
    id?: number;
    number: string;
    type: string;
    capacity: number;
    equipment: string;
  };
  isEditing?: boolean; // Режим редактирования
}

export function RoomDialog({
  open,
  onOpenChange,
  onSave,
  defaultValues = {
    number: "",
    type: "",
    capacity: 30,
    equipment: "",
  },
  isEditing = false,
}: RoomDialogProps) {
  // Инициализация формы с помощью react-hook-form и zod для валидации
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Сброс формы при открытии диалога или изменении значений по умолчанию
  useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  // Обработчик отправки формы
  const onSubmit = (data: RoomFormValues) => {
    try {
      // Передаем данные родителю и закрываем диалог
      onSave({ ...data, id: defaultValues.id });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // В случае ошибки показываем уведомление
      console.error("Error submitting form:", error);
      toast.error("Деректерді сақтау кезінде қате пайда болды");
    }
  };

  // Основной JSX диалога
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        form.reset(); // Сброс формы при закрытии
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          {/* Заголовок диалога: редактирование или добавление */}
          <DialogTitle>{isEditing ? "Аудиторияны өңдеу" : "Аудитория қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Аудитория деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа аудитория туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        {/* Форма для ввода данных аудитории */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Поле: номер аудитории */}
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аудитория нөмірі</FormLabel>
                  <Input placeholder="201" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: тип аудитории */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аудитория түрі</FormLabel>
                  <Input placeholder="Дәрісхана" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: вместимость аудитории */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сыйымдылығы</FormLabel>
                  <Input
                    type="number"
                    placeholder="30"
                    {...field}
                    onChange={(e) => {
                      // Преобразуем строку в число
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseInt(value, 10));
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: оборудование */}
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Жабдықтары</FormLabel>
                  <Input placeholder="Проектор, компьютер" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Кнопки управления */}
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Бас тарту
              </Button>
              <Button type="submit">Сақтау</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
