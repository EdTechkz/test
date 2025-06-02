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
  const rooms = [
    { id: 1, number: "201", type: "Лекционная" },
    { id: 2, number: "301", type: "Лингафонный кабинет" },
    { id: 3, number: "302", type: "Лекционная" },
    { id: 4, number: "311", type: "Компьютерный класс" },
    { id: 5, number: "404", type: "Лекционная" },
    { id: 6, number: "405", type: "Лаборатория" },
    { id: 7, number: "408", type: "Лаборатория" },
    { id: 8, number: "Спортзал", type: "Спортивный зал" },
  ];

  const subjects = [
    "Математика", 
    "Литература", 
    "История", 
    "Физика", 
    "Информатика", 
    "Химия", 
    "Физкультура", 
    "Иностранный язык"
  ];

  return (
    <div className="space-y-6">
      <div className="border rounded">
        <div className="p-4 bg-muted rounded-t border-b">
          <h4 className="font-medium">Соответствие предметов типам аудиторий</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Укажите, в каких типах аудиторий могут проводиться занятия
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Предмет</TableHead>
                <TableHead>Лекционная</TableHead>
                <TableHead>Компьютерный класс</TableHead>
                <TableHead>Лаборатория</TableHead>
                <TableHead>Лингафонный кабинет</TableHead>
                <TableHead>Спортивный зал</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject}>
                  <TableCell>{subject}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      defaultChecked={
                        subject !== "Информатика" && 
                        subject !== "Физкультура" && 
                        subject !== "Иностранный язык" &&
                        subject !== "Химия"
                      } 
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox defaultChecked={subject === "Информатика"} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox defaultChecked={subject === "Физика" || subject === "Химия"} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox defaultChecked={subject === "Иностранный язык"} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox defaultChecked={subject === "Физкультура"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border rounded">
        <div className="p-4 bg-muted rounded-t border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Фиксированные назначения аудиторий</h4>
            <Button variant="outline" size="sm">Добавить</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Предмет</TableHead>
                <TableHead>Преподаватель</TableHead>
                <TableHead>Группа</TableHead>
                <TableHead>Аудитория</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Select defaultValue="math">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Математика</SelectItem>
                      <SelectItem value="lit">Литература</SelectItem>
                      <SelectItem value="phys">Физика</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue="ivanova">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Преподаватель" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ivanova">Иванова Н.П.</SelectItem>
                      <SelectItem value="petrova">Петрова М.А.</SelectItem>
                      <SelectItem value="sidorov">Сидоров К.В.</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue="is11">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Группа" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is11">ИС-11</SelectItem>
                      <SelectItem value="is12">ИС-12</SelectItem>
                      <SelectItem value="ps11">ПС-11</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue="302">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Аудитория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="201">201</SelectItem>
                      <SelectItem value="301">301</SelectItem>
                      <SelectItem value="302">302</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Удалить</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Select defaultValue="pe">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Математика</SelectItem>
                      <SelectItem value="lit">Литература</SelectItem>
                      <SelectItem value="pe">Физкультура</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue="volkov">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Преподаватель" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ivanova">Иванова Н.П.</SelectItem>
                      <SelectItem value="volkov">Волков С.Д.</SelectItem>
                      <SelectItem value="sidorov">Сидоров К.В.</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Группа" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все группы</SelectItem>
                      <SelectItem value="is11">ИС-11</SelectItem>
                      <SelectItem value="is12">ИС-12</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue="gym">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Аудитория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gym">Спортзал</SelectItem>
                      <SelectItem value="201">201</SelectItem>
                      <SelectItem value="301">301</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Удалить</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox id="distance" defaultChecked />
        <Label htmlFor="distance">Минимизировать расстояние между аудиториями для последовательных занятий</Label>
      </div>
    </div>
  );
}
