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
    { name: "Деректерді тексеру", description: "Деректердің толықтығы мен дұрыстығын тексеру" },
    { name: "Шектеулерді тексеру", description: "Барлық шектеулердің үйлесімділігін тексеру" },
    { name: "Бастапқы шешімдерді генерациялау", description: "Бастапқы шешімдер популяциясын құру" },
    { name: "Оптимизация", description: "Кестені оңтайландыру әдісімен жақсарту" },
    { name: "Сапаны тексеру", description: "Кестенің оңтайлылық критерийлерін тексеру" },
    { name: "Нәтижелерді сақтау", description: "Оңтайлы кестені сақтау" },
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
          <DialogTitle>Кестені генерациялау</DialogTitle>
          <DialogDescription>
            Оңтайлы кестені автоматты түрде генерациялау жүріп жатыр
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center">
              {progress < 100 
                ? `Орындалды ${Math.round(progress)}%`
                : success 
                  ? "Кесте сәтті генерацияланды!"
                  : "Оңтайлы кестені генерациялау мүмкін болмады"
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
                    <h4 className="font-medium">Кесте сәтті генерацияланды</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Кесте қақтығыстарсыз құрылды. Оңтайлылық: 87%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Қақтығыстар анықталды</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Кейбір шектеулерді қанағаттандыру мүмкін болмады. Параметрлерді түзету ұсынылады.
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
                Жабу
              </Button>
              <Button onClick={handleViewSchedule}>
                Кестені қарау
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Бас тарту
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
