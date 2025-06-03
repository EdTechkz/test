/*
  TeacherConstraints.tsx — компонент для настройки ограничений по преподавателям.
  Используется для задания индивидуальных ограничений, доступности по времени и т.д.
  В будущем здесь будет логика работы с реальными данными.
*/
// TeacherConstraints — компонент для отображения и настройки ограничений по преподавателям (например, доступность по времени, индивидуальные ограничения)
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TeacherConstraints() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Оқытушылардың шектеулері</h3>
        </div>
      </div>
    </div>
  );
}
