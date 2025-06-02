import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchedulePreview } from "./SchedulePreview";
import { Download, Filter, Printer, Plus } from "lucide-react";
import { ScheduleCreator } from "@/components/schedule/ScheduleCreator";

export function ScheduleView() {
  const [viewType, setViewType] = useState("group");
  const [showScheduleCreator, setShowScheduleCreator] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Расписание занятий</h1>
          <p className="text-muted-foreground">
            Просмотр и экспорт текущего расписания
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <Printer size={16} className="mr-2" />
            Печать
          </Button>
          <Button className="flex-1 sm:flex-initial">
            <Download size={16} className="mr-2" />
            Экспорт
          </Button>
          <Button onClick={() => setShowScheduleCreator(true)}>
            <Plus size={16} className="mr-2" />
            Создать расписание
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Расписание на неделю</CardTitle>
          <CardDescription>
            1 семестр, 2025-2026 учебный год
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
            <div className="flex flex-row gap-4 w-full md:w-auto items-center">
              <Select defaultValue="group">
                <SelectTrigger>
                  <SelectValue placeholder="Вид расписания" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">По группам</SelectItem>
                  <SelectItem value="teacher">По преподавателям</SelectItem>
                  <SelectItem value="room">По аудиториям</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать группу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is11">ИС-11</SelectItem>
                  <SelectItem value="is12">ИС-12</SelectItem>
                  <SelectItem value="ps11">ПС-11</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-4 border rounded-md overflow-hidden">
            <SchedulePreview />
          </div>
        </CardContent>
      </Card>
      {showScheduleCreator && (
        <ScheduleCreator onClose={() => setShowScheduleCreator(false)} />
      )}
    </div>
  );
}
