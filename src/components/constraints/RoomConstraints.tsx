// RoomConstraints — компонент для отображения и настройки ограничений по аудиториям (например, типы аудиторий, доступность и т.д.)
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RoomConstraints() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Аудитория шектеулері</h3>
      {/* Здесь будет логика работы с реальными данными */}
    </div>
  );
}
