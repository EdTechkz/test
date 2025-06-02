
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

// Define schema for form validation
const formSchema = z.object({
  algorithm: z.string().default("genetic"),
  maxGenerationTime: z.number().min(30).default(180),
  checkConflicts: z.boolean().default(true),
  allowWindows: z.boolean().default(true),
  windowsWeight: z.number().default(50),
  preferenceWeight: z.number().default(30),
  loadBalanceWeight: z.number().default(20),
});

export type GeneralConstraintsFormValues = z.infer<typeof formSchema>;

export function GeneralConstraints() {
  // Create form with default values
  const form = useForm<GeneralConstraintsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithm: "genetic",
      maxGenerationTime: 180,
      checkConflicts: true,
      allowWindows: true,
      windowsWeight: 50,
      preferenceWeight: 30,
      loadBalanceWeight: 20,
    },
  });

  // Handler for form submission
  const onSubmit = (data: GeneralConstraintsFormValues) => {
    console.log("Form submitted with values:", data);
  };

  const [windowsWeight, setWindowsWeight] = useState(50);
  const [preferenceWeight, setPreferenceWeight] = useState(30);
  const [loadBalanceWeight, setLoadBalanceWeight] = useState(20);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="algorithm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Алгоритм генерации</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Выберите алгоритм" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="genetic">Генетический алгоритм</SelectItem>
                    <SelectItem value="csp">Удовлетворение ограничений (CSP)</SelectItem>
                    <SelectItem value="greedy">Жадный алгоритм</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Метод оптимизации для составления расписания
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxGenerationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Максимальное время генерации</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="180"
                    className="mt-1.5"
                    min={30}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Максимальное время в секундах
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkConflicts"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Проверять конфликты</FormLabel>
                  <FormDescription>
                    Жёсткие ограничения, которые не могут быть нарушены
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowWindows"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Разрешить окна в расписании</FormLabel>
                  <FormDescription>
                    Разрешить свободные часы между занятиями
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Весовые коэффициенты</h3>
          <p className="text-sm text-muted-foreground">
            Настройте значимость различных критериев оптимизации
          </p>

          <div className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="windowsWeight"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between mb-2">
                    <FormLabel>Минимизация окон</FormLabel>
                    <span className="text-sm">{windowsWeight}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[windowsWeight]}
                      onValueChange={(value) => {
                        setWindowsWeight(value[0]);
                        field.onChange(value[0]);
                      }}
                      max={100}
                      step={5}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferenceWeight"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between mb-2">
                    <FormLabel>Учёт предпочтений преподавателей</FormLabel>
                    <span className="text-sm">{preferenceWeight}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[preferenceWeight]}
                      onValueChange={(value) => {
                        setPreferenceWeight(value[0]);
                        field.onChange(value[0]);
                      }}
                      max={100}
                      step={5}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loadBalanceWeight"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between mb-2">
                    <FormLabel>Баланс нагрузки</FormLabel>
                    <span className="text-sm">{loadBalanceWeight}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[loadBalanceWeight]}
                      onValueChange={(value) => {
                        setLoadBalanceWeight(value[0]);
                        field.onChange(value[0]);
                      }}
                      max={100}
                      step={5}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
