import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ReactNode } from "react";

// Описание структуры столбца
interface Column {
  header: string; // Название столбца
  accessor: string; // Ключ для доступа к данным
}

// Описание пропсов таблицы
interface EntityTableProps {
  columns: Column[]; // Массив столбцов
  data: any[]; // Данные для отображения
  title: string; // Заголовок таблицы
  onEdit?: (id: string | number) => void; // Функция редактирования
  onDelete?: (id: string | number) => void; // Функция удаления
}

// Основная таблица для отображения сущностей
export function EntityTable({ columns, data, title, onEdit, onDelete }: EntityTableProps) {
  return (
    <div className="border rounded-md">
      {/* Заголовок таблицы */}
      <div className="bg-muted px-4 py-2 rounded-t-md border-b">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Рендерим заголовки столбцов */}
              {columns.map((column) => (
                <TableHead key={column.accessor}>{column.header}</TableHead>
              ))}
              {/* Столбец для кнопок действий */}
              <TableHead className="w-[100px]">Әрекеттер</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Если данных нет — показываем сообщение */}
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 текст-центр"
                >
                  Деректер жоқ
                </TableCell>
              </TableRow>
            ) : (
              // Рендерим строки таблицы
              data.map((row) => (
                <TableRow key={row.id}>
                  {/* Ячейки данных */}
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.accessor}`}>
                      {row[column.accessor]}
                    </TableCell>
                  ))}
                  {/* Кнопки редактирования и удаления */}
                  <TableCell>
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(row.id)}
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(row.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
