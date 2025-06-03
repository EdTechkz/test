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

const formSchema = z.object({
  number: z.string().min(1, { message: "Аудитория нөірі міндетті" }),
  type: z.string().min(1, { message: "Аудитория түрі міндетті" }),
  capacity: z.coerce.number().min(1, { message: "Сыйымдылық 0-ден көп болуы керек" }),
  equipment: z.string().optional(),
});

type RoomFormValues = z.infer<typeof formSchema>;

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  defaultValues?: {
    id?: number;
    number: string;
    type: string;
    capacity: number;
    equipment: string;
  };
  isEditing?: boolean;
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
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const onSubmit = (data: RoomFormValues) => {
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
          <DialogTitle>{isEditing ? "Аудиторияны өңдеу" : "Аудитория қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Аудитория деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа аудитория туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Жабдықтары</FormLabel>
                  <Input placeholder="Проектор, компьютер" {...field} />
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
