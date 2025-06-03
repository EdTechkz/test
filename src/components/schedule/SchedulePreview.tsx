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
    if (grid[lesson.dayOfWeek] && grid[lesson.dayOfWeek][lesson.timeStart]) {
      if (!filterType || !filterValue || lesson[filterType] === filterValue) {
        grid[lesson.dayOfWeek][lesson.timeStart].push(lesson);
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
          padding: 8px;
          border-radius: 6px;
          width: 100%;
          font-size: 12px;
          line-height: 1.3;
        }
        .schedule-class.math {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
        }
        .schedule-class.literature {
          background: #dcfce7;
          border-left: 4px solid #22c55e;
        }
        .schedule-class.history {
          background: #fed7d7;
          border-left: 4px solid #ef4444;
        }
        .schedule-class.science {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
        }
        .schedule-class.art {
          background: #f3e8ff;
          border-left: 4px solid #8b5cf6;
        }
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
                {lessons.map(lesson => (
                  <div key={lesson.id} className={`schedule-class ${lesson.type || ''} flex items-center justify-between gap-2`}>
                    <span>{lesson.subject}</span>
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
                ))}
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