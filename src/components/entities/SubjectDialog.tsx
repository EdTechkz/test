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
  // Название предмета (обязательное поле)
  name: z.string().min(1, { message: "Пән атауы міндетті" }),
  // Количество часов в неделю (обязательное поле, число больше 0)
  hoursPerWeek: z.coerce.number().min(1, { message: "Аптасына сағат саны 0-ден көп болуы керек" }),
  // Тип предмета (обязательное поле)
  type: z.string().min(1, { message: "Пән түрі міндетті" }),
  // Отделение (обязательное поле)
  department: z.string().min(1, { message: "Бөлім міндетті" }),
});

type SubjectFormValues = z.infer<typeof formSchema>;

// Интерфейс пропсов для диалога добавления/редактирования предмета
interface SubjectDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для открытия/закрытия диалога
  onSave: (data: any) => void; // Функция сохранения данных
  defaultValues?: {
    id?: number;
    name: string;
    hoursPerWeek: number;
    type: string;
    department: string;
  };
  isEditing?: boolean; // Режим редактирования
}

export function SubjectDialog({
  open,
  onOpenChange,
  onSave,
  defaultValues = {
    name: "",
    hoursPerWeek: 1,
    type: "",
    department: "",
  },
  isEditing = false,
}: SubjectDialogProps) {
  // Инициализация формы с помощью react-hook-form и zod для валидации
  const form = useForm<SubjectFormValues>({
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
  const onSubmit = (data: SubjectFormValues) => {
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
          <DialogTitle>{isEditing ? "Пәнді өңдеу" : "Пән қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Пән деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа пән туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        {/* Форма для ввода данных предмета */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Поле: название предмета */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пән атауы</FormLabel>
                  <Input placeholder="Математика" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: количество часов в неделю */}
            <FormField
              control={form.control}
              name="hoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аптасына сағат</FormLabel>
                  <Input
                    type="number"
                    placeholder="6"
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
            {/* Поле: тип предмета */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пән түрі</FormLabel>
                  <Input placeholder="Жалпы білім беру" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: отделение */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Бөлімі</FormLabel>
                  <Input placeholder="Жаратылыстану ғылымдары" {...field} />
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