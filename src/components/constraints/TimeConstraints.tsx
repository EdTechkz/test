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
  const timeSlots = ["8:00", "9:45", "11:30", "13:30", "15:15"];
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const groups = ["ИС-11", "ИС-12", "ПС-11", "СА-11", "ВТ-11"];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">Начало занятий</label>
          <Input type="time" defaultValue="08:00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Конец занятий</label>
          <Input type="time" defaultValue="17:00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Продолжительность пары</label>
          <Input type="number" defaultValue="90" />
          <p className="text-xs text-muted-foreground mt-1">В минутах</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Перерыв между парами</label>
          <Input type="number" defaultValue="15" />
          <p className="text-xs text-muted-foreground mt-1">В минутах</p>
        </div>
      </div>

      <div className="border rounded">
        <div className="p-4 bg-muted rounded-t border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Доступность групп по времени</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Выбрать все</Button>
              <Button variant="outline" size="sm">Очистить</Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Группа</TableHead>
                {days.map((day) => (
                  <TableHead key={day} colSpan={timeSlots.length} className="text-center border-l first:border-l-0">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                {days.map((day) => (
                  timeSlots.map((time) => (
                    <TableHead key={`${day}-${time}`} className="text-center p-1 text-xs">
                      {time}
                    </TableHead>
                  ))
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group}>
                  <TableCell>{group}</TableCell>
                  {days.map((day) => (
                    timeSlots.map((time) => (
                      <TableCell key={`${group}-${day}-${time}`} className="text-center p-1">
                        <Checkbox defaultChecked={Math.random() > 0.1} />
                      </TableCell>
                    ))
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border rounded p-4">
        <h4 className="font-medium mb-2">Последовательность занятий</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="seq1" defaultChecked />
            <label htmlFor="seq1" className="text-sm">Не ставить лекцию после практики/лабораторной</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="seq2" defaultChecked />
            <label htmlFor="seq2" className="text-sm">Не ставить физкультуру перед/после лекций</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="seq3" />
            <label htmlFor="seq3" className="text-sm">Чередовать типы занятий в течение дня</label>
          </div>
        </div>
      </div>
    </div>
  );
}
