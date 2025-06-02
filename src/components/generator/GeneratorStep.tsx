
import { Check, Loader2 } from "lucide-react";

interface GeneratorStepProps {
  name: string;
  description: string;
  status: "pending" | "current" | "complete";
}

export function GeneratorStep({ name, description, status }: GeneratorStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {status === "complete" ? (
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        ) : status === "current" ? (
          <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
        )}
      </div>
      <div>
        <p className={`font-medium ${status === "pending" ? "text-muted-foreground" : ""}`}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
