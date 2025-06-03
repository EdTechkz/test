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
          <CardTitle>Шектеу параметрлері</CardTitle>
          <CardDescription>
            Кесте құру үшін шектеулерді орнатыңыз
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Жалпы</TabsTrigger>
              <TabsTrigger value="teachers">Оқытушылар</TabsTrigger>
              <TabsTrigger value="time">Уақыт слоттары</TabsTrigger>
              <TabsTrigger value="rooms">Аудиториялар</TabsTrigger>
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
          <Button variant="outline">Баптауларды тастау</Button>
          <Button onClick={() => setIsGeneratorOpen(true)}>Кестені генерациялау</Button>
        </CardFooter>
      </Card>

      {isGeneratorOpen && <ScheduleGenerator onClose={() => setIsGeneratorOpen(false)} />}
    </div>
  );
}
