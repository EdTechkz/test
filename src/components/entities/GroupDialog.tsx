import { useEffect } from "react";
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
  // Название группы (обязательное поле)
  name: z.string().min(1, { message: "Топ атауы міндетті" }),
  // Специализация (необязательное поле)
  specialization: z.string().optional(),
  // Количество студентов (обязательное поле, число больше 0)
  numberOfStudents: z.coerce.number().min(1, { message: "Студенттер саны 0-ден көп болуы керек" }),
  // Куратор (необязательное поле)
  curator: z.string().optional(),
});

type GroupFormValues = z.infer<typeof formSchema>;

// Интерфейс пропсов для диалога добавления/редактирования группы
interface GroupDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для открытия/закрытия диалога
  onSave: (data: any) => void; // Функция сохранения данных
  defaultValues?: {
    id?: number;
    name: string;
    specialization?: string;
    numberOfStudents: number;
    curator?: string;
  };
  isEditing?: boolean; // Режим редактирования
}

export function GroupDialog({
  open,
  onOpenChange,
  onSave,
  defaultValues = {
    name: "",
    specialization: "",
    numberOfStudents: 25,
    curator: "",
  },
  isEditing = false,
}: GroupDialogProps) {
  // Инициализация формы с помощью react-hook-form и zod для валидации
  const form = useForm<GroupFormValues>({
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
  const onSubmit = (data: GroupFormValues) => {
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
          <DialogTitle>{isEditing ? "Топты өңдеу" : "Топ қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Топ деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа топ туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        {/* Форма для ввода данных группы */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Поле: название группы */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Топ атауы</FormLabel>
                  <Input placeholder="ИС-11" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: специализация */}
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Мамандығы</FormLabel>
                  <Input placeholder="Информатика" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: количество студентов */}
            <FormField
              control={form.control}
              name="numberOfStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Студенттер саны</FormLabel>
                  <Input
                    type="number"
                    placeholder="25"
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
            {/* Поле: куратор */}
            <FormField
              control={form.control}
              name="curator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Куратор</FormLabel>
                  <Input placeholder="Иванова Н.П." {...field} />
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