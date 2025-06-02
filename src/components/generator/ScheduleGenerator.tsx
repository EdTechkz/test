
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GeneratorStep } from "./GeneratorStep";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ScheduleGeneratorProps {
  onClose: () => void;
}

export function ScheduleGenerator({ onClose }: ScheduleGeneratorProps) {
  const [open, setOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  const steps = [
    { name: "Проверка данных", description: "Проверка данных на полноту и корректность" },
    { name: "Валидация ограничений", description: "Проверка совместимости всех ограничений" },
    { name: "Генерация начальных решений", description: "Создание исходной популяции решений" },
    { name: "Оптимизация", description: "Улучшение расписания методом оптимизации" },
    { name: "Проверка качества", description: "Проверка критериев оптимальности расписания" },
    { name: "Сохранение результатов", description: "Сохранение оптимального расписания" },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (open) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const increment = Math.random() * 10;
          const newProgress = prev + increment;
          
          // Update current step based on progress
          if (newProgress > 15 && currentStep === 0) setCurrentStep(1);
          else if (newProgress > 35 && currentStep === 1) setCurrentStep(2);
          else if (newProgress > 55 && currentStep === 2) setCurrentStep(3);
          else if (newProgress > 75 && currentStep === 3) setCurrentStep(4);
          else if (newProgress > 90 && currentStep === 4) setCurrentStep(5);
          
          if (newProgress >= 100) {
            // Simulate a successful generation with 90% probability
            setSuccess(Math.random() > 0.1);
          }
          
          return Math.min(newProgress, 100);
        });
      }, 600);
    }

    return () => clearInterval(interval);
  }, [open, currentStep]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleViewSchedule = () => {
    setOpen(false);
    onClose();
    navigate("/schedule");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Генерация расписания</DialogTitle>
          <DialogDescription>
            Идёт процесс автоматической генерации оптимального расписания
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center">
              {progress < 100 
                ? `Выполнено ${Math.round(progress)}%`
                : success 
                  ? "Расписание успешно сгенерировано!"
                  : "Не удалось сгенерировать оптимальное расписание"
              }
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            {steps.map((step, index) => (
              <GeneratorStep
                key={index}
                name={step.name}
                description={step.description}
                status={
                  index < currentStep ? "complete" :
                  index === currentStep ? "current" :
                  "pending"
                }
              />
            ))}
          </div>
          
          {progress === 100 && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
              {success ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Расписание успешно сгенерировано</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Расписание создано без конфликтов. Оптимальность: 87%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Обнаружены конфликты</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Некоторые ограничения не удалось удовлетворить. Рекомендуется скорректировать параметры.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {progress === 100 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Закрыть
              </Button>
              <Button onClick={handleViewSchedule}>
                Просмотр расписания
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Отменить
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
