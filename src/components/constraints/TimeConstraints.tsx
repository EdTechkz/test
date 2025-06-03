/*
  TimeConstraints.tsx — компонент для настройки временных ограничений расписания.
  Позволяет задать время начала/окончания занятий, длительность, перерывы и правила последовательности.
  Используется для глобальных временных настроек.
*/
// TimeConstraints — компонент для настройки временных ограничений (начало/конец занятий, длительность, перерывы, правила последовательности)
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
import { Input } from "@/components/ui/input";

export function TimeConstraints() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">Сабақ басталуы</label>
          <Input type="time" defaultValue="08:00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Сабақ аяқталуы</label>
          <Input type="time" defaultValue="17:00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Сабақ ұзақтығы</label>
          <Input type="number" defaultValue="90" />
          <p className="text-xs text-muted-foreground mt-1">Минутпен</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Сабақ арасындағы үзіліс</label>
          <Input type="number" defaultValue="15" />
          <p className="text-xs text-muted-foreground mt-1">Минутпен</p>
        </div>
      </div>

      <div className="border rounded p-4">
        <h4 className="font-medium mb-2">Сабақтардың реттілігі</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="seq1" defaultChecked />
            <label htmlFor="seq1" className="text-sm">Практика/зертханадан кейін лекция қойылмасын</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="seq2" defaultChecked />
            <label htmlFor="seq2" className="text-sm">Лекция алдында/кейін дене шынықтыру қойылмасын</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="seq3" />
            <label htmlFor="seq3" className="text-sm">Күн ішінде сабақ түрлерін ауыстыру</label>
          </div>
        </div>
      </div>
    </div>
  );
}
