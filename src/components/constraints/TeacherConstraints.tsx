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
  const teachers = [
    { id: 1, name: "Иванова Н.П." },
    { id: 2, name: "Петрова М.А." },
    { id: 3, name: "Сидоров К.В." },
    { id: 4, name: "Николаев П.С." },
    { id: 5, name: "Морозова А.В." },
  ];

  const timeSlots = ["8:00", "9:45", "11:30", "13:30", "15:15"];
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Ограничения преподавателей</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Доступен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Недоступен</span>
            </div>
          </div>
        </div>

        <div className="border rounded">
          <div className="p-4 bg-muted rounded-t border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Выбор доступности преподавателей</h4>
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
                  <TableHead className="w-[150px]">Преподаватель</TableHead>
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
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.name}</TableCell>
                    {days.map((day) => (
                      timeSlots.map((time) => (
                        <TableCell key={`${teacher.id}-${day}-${time}`} className="text-center p-1">
                          <Checkbox defaultChecked={Math.random() > 0.2} />
                        </TableCell>
                      ))
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border rounded p-4 bg-muted">
          <h4 className="font-medium mb-2">Дополнительные ограничения</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Иванова Н.П. - не более 4 пар в день</Badge>
            <Badge variant="outline">Петрова М.А. - не ставить в среду</Badge>
            <Badge variant="outline">Сидоров К.В. - макс. 2 пары подряд</Badge>
            <Badge variant="outline">Добавить ограничение + </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
