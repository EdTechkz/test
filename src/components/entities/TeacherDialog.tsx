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

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Оқытушының аты-жөні міндетті" }),
  specialization: z.string().min(1, { message: "Мамандығы міндетті" }),
  experience: z.string().min(1, { message: "Еңбек өтілі міндетті" }),
  contactInfo: z.string().min(1, { message: "Байланыс ақпараты міндетті" }),
});

type TeacherFormValues = z.infer<typeof formSchema>;

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  defaultValues?: {
    id?: number;
    fullName: string;
    specialization: string;
    experience: string;
    contactInfo: string;
  };
  isEditing?: boolean;
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
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const onSubmit = (data: TeacherFormValues) => {
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
          <DialogTitle>{isEditing ? "Оқытушыны өңдеу" : "Оқытушы қосу"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Оқытушы деректерін өзгертіп, сақтау түймесін басыңыз"
              : "Жаңа оқытушы туралы ақпаратты толтырыңыз"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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