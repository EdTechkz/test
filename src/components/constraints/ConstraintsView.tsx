
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralConstraints } from "./GeneralConstraints";
import { TeacherConstraints } from "./TeacherConstraints";
import { TimeConstraints } from "./TimeConstraints";
import { RoomConstraints } from "./RoomConstraints";
import { ScheduleGenerator } from "../generator/ScheduleGenerator";
import { useState } from "react";

export function ConstraintsView() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ограничения расписания</h1>
          <p className="text-muted-foreground">
            Настройка ограничений для генерации оптимального расписания
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Параметры ограничений</CardTitle>
          <CardDescription>
            Задайте ограничения для составления расписания
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Общие</TabsTrigger>
              <TabsTrigger value="teachers">Преподаватели</TabsTrigger>
              <TabsTrigger value="time">Временные слоты</TabsTrigger>
              <TabsTrigger value="rooms">Аудитории</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <GeneralConstraints />
            </TabsContent>
            <TabsContent value="teachers">
              <TeacherConstraints />
            </TabsContent>
            <TabsContent value="time">
              <TimeConstraints />
            </TabsContent>
            <TabsContent value="rooms">
              <RoomConstraints />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="outline">Сбросить настройки</Button>
          <Button onClick={() => setIsGeneratorOpen(true)}>Сгенерировать расписание</Button>
        </CardFooter>
      </Card>

      {isGeneratorOpen && <ScheduleGenerator onClose={() => setIsGeneratorOpen(false)} />}
    </div>
  );
}
