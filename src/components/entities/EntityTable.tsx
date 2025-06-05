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

interface Column {
  header: string;
  accessor: string;
}

interface EntityTableProps {
  columns: Column[];
  data: any[];
  title: string;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

export function EntityTable({ columns, data, title, onEdit, onDelete }: EntityTableProps) {
  return (
    <div className="border rounded-md">
      <div className="bg-muted px-4 py-2 rounded-t-md border-b">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessor}>{column.header}</TableHead>
              ))}
              <TableHead className="w-[100px]">Әрекеттер</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  Деректер жоқ
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                // DEBUG: log row
                console.log('[EntityTable] row:', row),
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.accessor}`}>
                      {row[column.accessor]}
                    </TableCell>
                  ))}
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
