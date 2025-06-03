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

const formSchema = z.object({
  name: z.string().min(1, { message: "Топ атауы міндетті" }),
  specialization: z.string().optional(),
  numberOfStudents: z.coerce.number().min(1, { message: "Студенттер саны 0-ден көп болуы керек" }),
  curator: z.string().optional(),
});

type GroupFormValues = z.infer<typeof formSchema>;

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  defaultValues?: {
    id?: number;
    name: string;
    specialization?: string;
    numberOfStudents: number;
    curator?: string;
  };
  isEditing?: boolean;
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
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const onSubmit = (data: GroupFormValues) => {
    try {
      onSave({ ...data, id: defaultValues.id });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Деректерді сақтау кезінде қате пайда болды");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        form.reset();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Топты өңдеу" : "Топ қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Топ деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа топ туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseInt(value, 10));
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
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