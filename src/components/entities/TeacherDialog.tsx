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
  // ФИО преподавателя (обязательное поле)
  fullName: z.string().min(1, { message: "Оқытушының аты-жөні міндетті" }),
  // Специализация (обязательное поле)
  specialization: z.string().min(1, { message: "Мамандығы міндетті" }),
  // Стаж работы (обязательное поле)
  experience: z.string().min(1, { message: "Еңбек өтілі міндетті" }),
  // Контактная информация (обязательное поле)
  contactInfo: z.string().min(1, { message: "Байланыс ақпараты міндетті" }),
});

type TeacherFormValues = z.infer<typeof formSchema>;

// Интерфейс пропсов для диалога добавления/редактирования преподавателя
interface TeacherDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для открытия/закрытия диалога
  onSave: (data: any) => void; // Функция сохранения данных
  defaultValues?: {
    id?: number;
    fullName: string;
    specialization: string;
    experience: string;
    contactInfo: string;
  };
  isEditing?: boolean; // Режим редактирования
}

export function TeacherDialog({
  open,
  onOpenChange,
  onSave,
  defaultValues = {
    fullName: "",
    specialization: "",
    experience: "",
    contactInfo: "",
  },
  isEditing = false,
}: TeacherDialogProps) {
  // Инициализация формы с помощью react-hook-form и zod для валидации
  const form = useForm<TeacherFormValues>({
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
  const onSubmit = (data: TeacherFormValues) => {
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
          <DialogTitle>{isEditing ? "Оқытушыны өңдеу" : "Оқытушы қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Оқытушы деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа оқытушы туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        {/* Форма для ввода данных преподавателя */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Поле: ФИО преподавателя */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Аты-жөні</FormLabel>
                  <Input placeholder="Айдосов Айдос Айдынұлы" {...field} />
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
                  <Input placeholder="Математика" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: стаж работы */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Еңбек өтілі</FormLabel>
                  <Input placeholder="10 жыл" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Поле: контактная информация */}
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Байланыс ақпараты</FormLabel>
                  <Input placeholder="aidosov@college.edu" {...field} />
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