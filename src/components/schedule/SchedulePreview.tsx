import React, { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

interface ScheduleLesson {
  id: number;
  group: string;
  subject: string;
  teacher: string;
  room: string;
  dayOfWeek: string; // monday, tuesday, ...
  timeStart: string; // "08:00"
  timeEnd: string;   // "09:00"
  type?: string;     // для цвета (math, science...)
}

interface SchedulePreviewProps {
  filterType?: "group" | "teacher" | "room";
  filterValue?: string;
  allowDelete?: boolean;
}

const days = [
  { value: "monday", label: "Дүйсенбі" },
  { value: "tuesday", label: "Сейсенбі" },
  { value: "wednesday", label: "Сәрсенбі" },
  { value: "thursday", label: "Бейсенбі" },
  { value: "friday", label: "Жұма" },
  { value: "saturday", label: "Сенбі" },
];
const times = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export function SchedulePreview({ filterType, filterValue, allowDelete }: SchedulePreviewProps) {
  const [schedule, setSchedule] = useState<ScheduleLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedule = useCallback(() => {
    setLoading(true);
    fetch("/api/schedule/")
      .then(res => res.json())
      .then(data => {
        setSchedule(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Кестені жүктеу қатесі");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchSchedule();
    let ws: WebSocket | null = null;
    try {
      ws = new window.WebSocket(`ws://${window.location.host}`);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "update" && msg.entity === "schedule") {
            fetchSchedule();
          }
        } catch {}
      };
    } catch {}
    return () => { if (ws) ws.close(); };
  }, [fetchSchedule]);

  // Группируем по дням и времени
  const grid: Record<string, Record<string, ScheduleLesson[]>> = {};
  for (const day of days) {
    grid[day.value] = {};
    for (const time of times) {
      grid[day.value][time] = [];
    }
  }
  schedule.forEach(lesson => {
    if (!filterType || !filterValue || lesson[filterType] === filterValue) {
      // Найти индексы начала и конца
      const startIdx = times.indexOf(lesson.timeStart);
      const endIdx = times.indexOf(lesson.timeEnd);
      if (grid[lesson.dayOfWeek]) {
        for (let i = startIdx; i < endIdx; i++) {
          const t = times[i];
          if (grid[lesson.dayOfWeek][t]) {
            grid[lesson.dayOfWeek][t].push(lesson);
          }
        }
      }
    }
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Бұл сабақты өшіргіңіз келе ме?")) return;
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
      if (res.ok) fetchSchedule();
      else alert("Өшіру кезінде қате болды");
    } catch {
      alert("Өшіру кезінде қате болды");
    }
  };

  return (
    <div className="schedule-grid overflow-x-auto">
      <style>{`
        .schedule-grid {
          display: grid;
          grid-template-columns: 100px repeat(${days.length}, 1fr);
          gap: 1px;
          background-color: #e5e7eb;
          min-width: 800px;
        }
        .schedule-header {
          background: #3b82f6;
          color: white;
          padding: 12px 8px;
          font-weight: 600;
          text-align: center;
          font-size: 14px;
        }
        .schedule-time {
          background: #f3f4f6;
          padding: 12px 8px;
          font-weight: 600;
          text-align: center;
          font-size: 13px;
          color: #374151;
        }
        .schedule-cell {
          background: white;
          padding: 4px;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .schedule-class {
          padding: 10px 10px 10px 14px;
          border-radius: 8px;
          width: 100%;
          font-size: 11.5px;
          line-height: 1.35;
          box-shadow: 0 2px 8px 0 #e0e7ef33;
          border-left: 6px solid #3b82f6;
          background: #f8fafc;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .schedule-class.math { border-left-color: #3b82f6; background: #dbeafe; }
        .schedule-class.literature { border-left-color: #22c55e; background: #dcfce7; }
        .schedule-class.history { border-left-color: #ef4444; background: #fed7d7; }
        .schedule-class.science { border-left-color: #f59e0b; background: #fef3c7; }
        .schedule-class.art { border-left-color: #8b5cf6; background: #f3e8ff; }
        .schedule-class b { font-size: 13px; font-weight: 700; color: #1e293b; }
        .schedule-class .group-room { color: #334155; font-size: 11.5px; font-weight: 500; margin-top: 2px; }
        .schedule-class .teacher { color: #64748b; font-size: 10.5px; font-style: italic; margin-top: 2px; }
      `}</style>
      <div className="schedule-cell"></div>
      {days.map((day) => (
        <div key={day.value} className="schedule-header">{day.label}</div>
      ))}
      {times.map((time) => (
        <React.Fragment key={time}>
          <div className="schedule-time">{time}</div>
          {days.map((day) => {
            const lessons = grid[day.value][time];
            return (
              <div key={`${day.value}-${time}`} className="schedule-cell">
                {lessons.map(lesson => {
                  // Преобразуем ФИО преподавателя в формат: Фамилия И.О.
                  let teacherShort = lesson.teacher;
                  if (lesson.teacher) {
                    const parts = lesson.teacher.split(" ");
                    if (parts.length >= 2) {
                      const last = parts[0];
                      const first = parts[1][0] + ".";
                      const middle = parts[2] ? parts[2][0] + "." : "";
                      teacherShort = `${last} ${first}${middle}`;
                    }
                  }
                  return (
                    <div key={lesson.id} className={`schedule-class ${lesson.type || ''}`}>
                      <div style={{ flex: 1 }}>
                        <div><b>{lesson.subject}</b></div>
                        <div className="group-room">{lesson.group} | {lesson.room}</div>
                        <div className="teacher">{teacherShort}</div>
                      </div>
                      {allowDelete && (
                        <button
                          title="Өшіру"
                          onClick={() => handleDelete(lesson.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </React.Fragment>
      ))}
      {loading && <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center bg-white/70 z-10">Жүктелуде...</div>}
      {error && <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center text-red-500 bg-white/80 z-10">{error}</div>}
    </div>
  );
}